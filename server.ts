import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  checkLoginRateLimit,
  clearSessionCookie,
  createSignedCsrfToken,
  generateRandomToken,
  getClientIp,
  getCookieOptions,
  getSessionExpiryIso,
  hashToken,
  parseCookies,
  recordFailedLogin,
  requireDoubleSubmitCsrf,
  resetLoginAttempts,
  safeTimingCompare,
  setSessionCookie,
  verifyPassword,
} from './server/auth.ts';
import {
  ENQUIRY_STATUSES,
  getDatabase,
  type AdminUserRecord,
  type EnquiryStatus,
  type ProjectEnquiryRecord,
} from './server/db.ts';
import { sendAdminEnquiryNotification } from './server/email.ts';

interface AuthenticatedRequest extends Request {
  adminUser?: Omit<AdminUserRecord, 'password_hash'>;
  adminCsrfToken?: string;
  sessionTokenHash?: string;
}

function sanitizeCsvCell(value: string): string {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatReferenceId(id: number): string {
  return `QB-${String(id).padStart(5, '0')}`;
}

function formatDateTimeDisplay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function validateEnquiryInput(body: Record<string, unknown>) {
  const fullName = String(body.full_name ?? body.fullName ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const companyName = String(body.company_name ?? body.companyName ?? '').trim();
  const serviceRequired = String(
    body.service_required ?? body.serviceRequired ?? ''
  ).trim();

  const errors: Record<string, string> = {};

  if (fullName.length < 2 || fullName.length > 150) {
    errors.fullName = 'Please enter your full name (2 to 150 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 255 || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const cleanedPhone = phone.replace(/[\s\-().+]/g, '');
  if (
    !phone ||
    phone.length > 50 ||
    cleanedPhone.length < 7 ||
    cleanedPhone.length > 18 ||
    !/^\d+$/.test(cleanedPhone)
  ) {
    errors.phone = 'Please enter a valid phone number (at least 7 digits).';
  }

  if (companyName.length > 150) {
    errors.companyName = 'Company name must be 150 characters or fewer.';
  }

  if (!serviceRequired || serviceRequired.length > 150) {
    errors.serviceRequired = 'Please select the service you require.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      service_required: serviceRequired,
    },
  };
}

async function startServer() {
  const db = getDatabase();
  await db.init();
  console.log(`[Qubex DB] Initialized persistent storage using ${db.driver.toUpperCase()}`);

  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '100kb' }));

  function extractSessionToken(req: Request): string | undefined {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[SESSION_COOKIE_NAME]) {
      return cookies[SESSION_COOKIE_NAME];
    }
    const authHeader = req.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) return token;
    }
    return undefined;
  }

  const requireAdminAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rawSession = extractSessionToken(req);
      if (!rawSession) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const tokenHash = hashToken(rawSession);
      const record = await db.getSessionWithAdmin(tokenHash);
      if (!record || record.admin.role !== 'admin') {
        clearSessionCookie(req, res);
        res.status(401).json({ error: 'Invalid or expired admin session.' });
        return;
      }

      req.adminUser = record.admin;
      req.adminCsrfToken = record.session.csrf_token;
      req.sessionTokenHash = tokenHash;
      next();
    } catch (err) {
      console.error('[Qubex Auth Error]:', err);
      res.status(500).json({ error: 'Authentication verification failed.' });
    }
  };

  const requireSessionCsrf = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const headerToken = req.get('x-csrf-token') || '';
    const sessionCsrf = req.adminCsrfToken || '';
    if (!headerToken || !sessionCsrf || !safeTimingCompare(headerToken, sessionCsrf)) {
      res.status(403).json({
        error: 'Invalid CSRF token for this admin session.',
      });
      return;
    }
    next();
  };

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: db.driver });
  });

  // Public CSRF token bootstrap for login & customer enquiry form
  app.get('/api/csrf-token', (req, res) => {
    const token = createSignedCsrfToken();
    res.cookie(
      CSRF_COOKIE_NAME,
      token,
      getCookieOptions(req, false, 1000 * 60 * 60 * 2)
    );
    res.json({ csrfToken: token });
  });

  // Public customer project enquiry submission
  app.post('/api/enquiries', async (req, res) => {
    if (req.get('x-csrf-token')) {
      requireDoubleSubmitCsrf(req, res, () => {
        void handleCreateEnquiry(req, res);
      });
      return;
    }
    await handleCreateEnquiry(req, res);
  });

  async function handleCreateEnquiry(req: Request, res: Response) {
    try {
      const validation = validateEnquiryInput(
        (req.body || {}) as Record<string, unknown>
      );

      if (!validation.valid) {
        res.status(400).json({
          error: 'Please correct the highlighted fields and try again.',
          fieldErrors: validation.errors,
        });
        return;
      }

      const saved = await db.createEnquiry(validation.data);
      const emailResult = await sendAdminEnquiryNotification(saved);

      res.status(201).json({
        success: true,
        referenceId: formatReferenceId(saved.id),
        submittedAt: saved.created_at,
        emailNotificationSent: emailResult.sent,
        message:
          'Your project enquiry has been saved securely. Our team will review your requirements and contact you shortly.',
        enquiry: {
          id: saved.id,
          fullName: saved.full_name,
          serviceRequired: saved.service_required,
          createdAt: saved.created_at,
        },
      });
    } catch (err) {
      console.error('[Qubex Enquiry Save Error]:', err);
      res.status(500).json({
        error:
          'We could not save your project enquiry right now due to a server error. Please try again or reach us via WhatsApp.',
      });
    }
  }

  // Admin Login
  app.post(
    '/api/admin/auth/login',
    requireDoubleSubmitCsrf,
    async (req, res) => {
      try {
        const ip = getClientIp(req);
        const limitCheck = checkLoginRateLimit(ip);
        if (!limitCheck.allowed) {
          res.status(429).json({
            error: `Too many login attempts. Please wait ${limitCheck.retryAfterSec} seconds before trying again.`,
          });
          return;
        }

        const identifier = String(
          req.body?.email ?? req.body?.username ?? ''
        ).trim();
        const password = String(req.body?.password ?? '');

        if (!identifier || !password) {
          res.status(400).json({
            error: 'Please enter both your admin email/username and password.',
          });
          return;
        }

        const admin = await db.findAdminByIdentifier(identifier);
        if (!admin || !verifyPassword(password, admin.password_hash)) {
          recordFailedLogin(ip);
          res.status(401).json({
            error: 'Invalid administrator credentials.',
          });
          return;
        }

        if (admin.role !== 'admin') {
          res.status(403).json({
            error: 'Access denied. Administrator privileges required.',
          });
          return;
        }

        resetLoginAttempts(ip);
        await db.purgeExpiredSessions();

        const rawToken = generateRandomToken(32);
        const tokenHash = hashToken(rawToken);
        const csrfToken = generateRandomToken(24);
        const now = new Date().toISOString();
        const expiresAt = getSessionExpiryIso();

        await db.createSession({
          token_hash: tokenHash,
          admin_id: admin.id,
          csrf_token: csrfToken,
          expires_at: expiresAt,
          created_at: now,
        });

        setSessionCookie(req, res, rawToken);

        res.json({
          authenticated: true,
          csrfToken,
          sessionToken: rawToken,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
        });
      } catch (err) {
        console.error('[Qubex Admin Login Error]:', err);
        res.status(500).json({
          error: 'Unable to complete sign-in due to a server error.',
        });
      }
    }
  );

  // Admin Session Check (returns { authenticated: false } cleanly when not signed in)
  app.get('/api/admin/auth/me', async (req: Request, res: Response) => {
    try {
      const rawSession = extractSessionToken(req);
      if (!rawSession) {
        res.json({ authenticated: false });
        return;
      }
      const tokenHash = hashToken(rawSession);
      const record = await db.getSessionWithAdmin(tokenHash);
      if (!record || record.admin.role !== 'admin') {
        clearSessionCookie(req, res);
        res.json({ authenticated: false });
        return;
      }
      res.json({
        authenticated: true,
        csrfToken: record.session.csrf_token,
        admin: record.admin,
      });
    } catch {
      res.json({ authenticated: false });
    }
  });

  // Admin Logout
  app.post(
    '/api/admin/auth/logout',
    requireAdminAuth,
    requireSessionCsrf,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (req.sessionTokenHash) {
          await db.deleteSession(req.sessionTokenHash);
        }
        clearSessionCookie(req, res);
        res.json({ success: true });
      } catch (err) {
        console.error('[Qubex Logout Error]:', err);
        res.status(500).json({ error: 'Unable to sign out cleanly.' });
      }
    }
  );

  // Admin: List Enquiries + Stats + Filters
  app.get('/api/admin/enquiries', requireAdminAuth, async (req, res) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const status = typeof req.query.status === 'string' ? req.query.status : 'All';
      const service = typeof req.query.service === 'string' ? req.query.service : 'All';
      const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : '';
      const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : '';

      const result = await db.listEnquiries({
        search,
        status,
        service,
        dateFrom,
        dateTo,
      });

      res.json(result);
    } catch (err) {
      console.error('[Qubex List Enquiries Error]:', err);
      res.status(500).json({ error: 'Failed to load enquiries from database.' });
    }
  });

  // Admin: Export Enquiries (CSV or Excel .xlsx)
  app.get('/api/admin/enquiries/export', requireAdminAuth, async (req, res) => {
    try {
      const format = String(req.query.format || 'csv').toLowerCase();
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const status = typeof req.query.status === 'string' ? req.query.status : 'All';
      const service = typeof req.query.service === 'string' ? req.query.service : 'All';
      const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : '';
      const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : '';

      const { enquiries } = await db.listEnquiries({
        search,
        status,
        service,
        dateFrom,
        dateTo,
      });

      const dateSlug = new Date().toISOString().slice(0, 10);

      if (format === 'xlsx' || format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Qubex Tech Solutions';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Project Enquiries', {
          views: [{ state: 'frozen', ySplit: 1 }],
        });

        sheet.columns = [
          { header: 'Reference ID', key: 'reference', width: 14 },
          { header: 'Full Name', key: 'full_name', width: 22 },
          { header: 'Email', key: 'email', width: 28 },
          { header: 'Phone', key: 'phone', width: 18 },
          { header: 'Company Name', key: 'company_name', width: 22 },
          { header: 'Service Required', key: 'service_required', width: 28 },
          { header: 'Status', key: 'status', width: 14 },
          { header: 'Admin Notes', key: 'admin_notes', width: 36 },
          { header: 'Submitted At', key: 'created_at', width: 22 },
          { header: 'Updated At', key: 'updated_at', width: 22 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
        headerRow.height = 24;

        for (const item of enquiries) {
          sheet.addRow({
            reference: formatReferenceId(item.id),
            full_name: item.full_name,
            email: item.email,
            phone: item.phone,
            company_name: item.company_name || '-',
            service_required: item.service_required,
            status: item.status,
            admin_notes: item.admin_notes,
            created_at: formatDateTimeDisplay(item.created_at),
            updated_at: formatDateTimeDisplay(item.updated_at),
          });
        }

        sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            row.alignment = { vertical: 'top', wrapText: true };
          }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="qubex-enquiries-${dateSlug}.xlsx"`
        );
        res.send(Buffer.from(buffer));
        return;
      }

      const headers = [
        'Reference ID',
        'Full Name',
        'Email',
        'Phone',
        'Company Name',
        'Service Required',
        'Status',
        'Admin Notes',
        'Submitted At',
        'Updated At',
      ];

      const lines = [
        headers.map(sanitizeCsvCell).join(','),
        ...enquiries.map((item: ProjectEnquiryRecord) =>
          [
            formatReferenceId(item.id),
            item.full_name,
            item.email,
            item.phone,
            item.company_name,
            item.service_required,
            item.status,
            item.admin_notes,
            formatDateTimeDisplay(item.created_at),
            formatDateTimeDisplay(item.updated_at),
          ]
            .map(sanitizeCsvCell)
            .join(',')
        ),
      ];

      const csvContent = '\uFEFF' + lines.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="qubex-enquiries-${dateSlug}.csv"`
      );
      res.send(csvContent);
    } catch (err) {
      console.error('[Qubex Export Error]:', err);
      res.status(500).json({ error: 'Failed to export enquiries.' });
    }
  });

  // Admin: Get Single Enquiry
  app.get('/api/admin/enquiries/:id', requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid enquiry ID.' });
      return;
    }
    const enquiry = await db.getEnquiryById(id);
    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }
    res.json({ enquiry });
  });

  // Admin: Update Status / Internal Notes
  app.patch(
    '/api/admin/enquiries/:id',
    requireAdminAuth,
    requireSessionCsrf,
    async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          res.status(400).json({ error: 'Invalid enquiry ID.' });
          return;
        }

        const updates: { status?: EnquiryStatus; admin_notes?: string } = {};

        if (req.body?.status !== undefined) {
          const nextStatus = String(req.body.status).trim() as EnquiryStatus;
          if (!ENQUIRY_STATUSES.includes(nextStatus)) {
            res.status(400).json({
              error: `Invalid status. Allowed values: ${ENQUIRY_STATUSES.join(', ')}.`,
            });
            return;
          }
          updates.status = nextStatus;
        }

        if (req.body?.admin_notes !== undefined || req.body?.adminNotes !== undefined) {
          const rawNotes = String(
            req.body.admin_notes ?? req.body.adminNotes ?? ''
          );
          if (rawNotes.length > 5000) {
            res.status(400).json({
              error: 'Admin notes must be 5000 characters or fewer.',
            });
            return;
          }
          updates.admin_notes = rawNotes;
        }

        if (updates.status === undefined && updates.admin_notes === undefined) {
          res.status(400).json({
            error: 'Provide status or admin_notes to update.',
          });
          return;
        }

        const updated = await db.updateEnquiry(id, updates);
        if (!updated) {
          res.status(404).json({ error: 'Enquiry not found.' });
          return;
        }

        res.json({ enquiry: updated });
      } catch (err) {
        console.error('[Qubex Update Enquiry Error]:', err);
        res.status(500).json({ error: 'Failed to update enquiry.' });
      }
    }
  );

  // Admin: Delete Enquiry
  app.delete(
    '/api/admin/enquiries/:id',
    requireAdminAuth,
    requireSessionCsrf,
    async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          res.status(400).json({ error: 'Invalid enquiry ID.' });
          return;
        }
        const deleted = await db.deleteEnquiry(id);
        if (!deleted) {
          res.status(404).json({ error: 'Enquiry not found.' });
          return;
        }
        res.json({ success: true });
      } catch (err) {
        console.error('[Qubex Delete Enquiry Error]:', err);
        res.status(500).json({ error: 'Failed to delete enquiry.' });
      }
    }
  );

  // Return JSON 404 for unknown API paths
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Qubex Server] Running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`
    );
  });
}

startServer().catch((err) => {
  console.error('[Qubex Server Fatal Error]:', err);
  process.exit(1);
});
