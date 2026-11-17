import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { hashPassword } from './auth.ts';

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Rejected',
];

export interface ProjectEnquiryRecord {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  service_required: string;
  status: EnquiryStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEnquiryInput {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  service_required: string;
}

export interface EnquiryListFilter {
  search?: string;
  status?: string;
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EnquiryStats {
  total: number;
  newCount: number;
  contactedCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
}

export interface AdminUserRecord {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSessionRecord {
  token_hash: string;
  admin_id: number;
  csrf_token: string;
  expires_at: string;
  created_at: string;
}

export interface DatabaseClient {
  driver: 'mysql' | 'sqlite';
  init(): Promise<void>;
  createEnquiry(input: CreateEnquiryInput): Promise<ProjectEnquiryRecord>;
  listEnquiries(filter: EnquiryListFilter): Promise<{
    enquiries: ProjectEnquiryRecord[];
    stats: EnquiryStats;
  }>;
  getEnquiryById(id: number): Promise<ProjectEnquiryRecord | null>;
  updateEnquiry(
    id: number,
    updates: { status?: EnquiryStatus; admin_notes?: string }
  ): Promise<ProjectEnquiryRecord | null>;
  deleteEnquiry(id: number): Promise<boolean>;
  findAdminByIdentifier(identifier: string): Promise<AdminUserRecord | null>;
  createSession(session: AdminSessionRecord): Promise<void>;
  getSessionWithAdmin(tokenHash: string): Promise<{
    session: AdminSessionRecord;
    admin: Omit<AdminUserRecord, 'password_hash'>;
  } | null>;
  deleteSession(tokenHash: string): Promise<void>;
  purgeExpiredSessions(): Promise<void>;
}

function getDefaultAdminCredentials() {
  const email = (
    process.env.ADMIN_EMAIL || 'admin@qubextech.com'
  ).trim().toLowerCase();
  const username = (process.env.ADMIN_USERNAME || 'qubexadmin').trim();
  const password = process.env.ADMIN_PASSWORD?.trim() || 'QubexAdmin@2026';
  const usingFallbackPassword = !process.env.ADMIN_PASSWORD?.trim();
  return { email, username, password, usingFallbackPassword };
}

function toIsoDateString(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'string') {
    const parsed = new Date(val.includes('T') ? val : `${val.replace(' ', 'T')}Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return val;
  }
  return new Date().toISOString();
}

function mapEnquiryRow(row: Record<string, unknown>): ProjectEnquiryRecord {
  return {
    id: Number(row.id),
    full_name: String(row.full_name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    company_name: String(row.company_name || ''),
    service_required: String(row.service_required || ''),
    status: (ENQUIRY_STATUSES.includes(row.status as EnquiryStatus)
      ? row.status
      : 'New') as EnquiryStatus,
    admin_notes: String(row.admin_notes || ''),
    created_at: toIsoDateString(row.created_at),
    updated_at: toIsoDateString(row.updated_at),
  };
}

function createSqliteDatabase(): DatabaseClient {
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'qubex_enquiries.db');
  const db = new DatabaseSync(dbPath);

  return {
    driver: 'sqlite',
    async init() {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA foreign_keys = ON;');

      db.exec(`
        CREATE TABLE IF NOT EXISTS project_enquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company_name TEXT NOT NULL DEFAULT '',
          service_required TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Completed', 'Rejected')),
          admin_notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_enquiries_status ON project_enquiries(status);
        CREATE INDEX IF NOT EXISTS idx_enquiries_service ON project_enquiries(service_required);
        CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON project_enquiries(created_at DESC);

        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS admin_sessions (
          token_hash TEXT PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          csrf_token TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
        );
      `);

      const existingColumns = db
        .prepare('PRAGMA table_info(project_enquiries)')
        .all() as Array<{ name: string }>;
      const colNames = new Set(existingColumns.map((c) => c.name));
      if (colNames.has('project_budget')) {
        db.exec('ALTER TABLE project_enquiries DROP COLUMN project_budget;');
      }
      if (colNames.has('project_description')) {
        db.exec('ALTER TABLE project_enquiries DROP COLUMN project_description;');
      }

      const countRow = db
        .prepare('SELECT COUNT(*) AS count FROM admin_users')
        .get() as { count: number };

      if (countRow.count === 0) {
        const creds = getDefaultAdminCredentials();
        const now = new Date().toISOString();
        db.prepare(
          `INSERT INTO admin_users (username, email, password_hash, role, created_at, updated_at)
           VALUES (?, ?, ?, 'admin', ?, ?)`
        ).run(
          creds.username,
          creds.email,
          hashPassword(creds.password),
          now,
          now
        );
        if (creds.usingFallbackPassword) {
          console.warn(
            `[Qubex Auth] Seeded default development admin (${creds.email}). Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables in production.`
          );
        }
      }
    },

    async createEnquiry(input) {
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO project_enquiries (
          full_name, email, phone, company_name, service_required,
          status, admin_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'New', '', ?, ?)
      `);
      const result = stmt.run(
        input.full_name,
        input.email,
        input.phone,
        input.company_name,
        input.service_required,
        now,
        now
      );
      const inserted = db
        .prepare('SELECT * FROM project_enquiries WHERE id = ?')
        .get(Number(result.lastInsertRowid)) as Record<string, unknown>;
      return mapEnquiryRow(inserted);
    },

    async listEnquiries(filter) {
      const conditions: string[] = [];
      const params: Array<string | number> = [];

      if (filter.status && filter.status !== 'All') {
        conditions.push('status = ?');
        params.push(filter.status);
      }

      if (filter.service && filter.service !== 'All') {
        conditions.push('service_required = ?');
        params.push(filter.service);
      }

      if (filter.dateFrom) {
        conditions.push('created_at >= ?');
        params.push(`${filter.dateFrom}T00:00:00.000Z`);
      }

      if (filter.dateTo) {
        conditions.push('created_at <= ?');
        params.push(`${filter.dateTo}T23:59:59.999Z`);
      }

      if (filter.search && filter.search.trim()) {
        const term = `%${filter.search.trim().toLowerCase()}%`;
        conditions.push(
          `(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(service_required) LIKE ? OR CAST(id AS TEXT) LIKE ?)`
        );
        params.push(term, term, term, term, term, term);
      }

      const whereSql =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const rows = db
        .prepare(
          `SELECT * FROM project_enquiries ${whereSql} ORDER BY created_at DESC, id DESC`
        )
        .all(...params) as Array<Record<string, unknown>>;

      const statsRow = db
        .prepare(
          `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS newCount,
            SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) AS contactedCount,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
            SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedCount
          FROM project_enquiries`
        )
        .get() as Record<string, number | null>;

      return {
        enquiries: rows.map(mapEnquiryRow),
        stats: {
          total: Number(statsRow.total || 0),
          newCount: Number(statsRow.newCount || 0),
          contactedCount: Number(statsRow.contactedCount || 0),
          inProgressCount: Number(statsRow.inProgressCount || 0),
          completedCount: Number(statsRow.completedCount || 0),
          rejectedCount: Number(statsRow.rejectedCount || 0),
        },
      };
    },

    async getEnquiryById(id) {
      const row = db
        .prepare('SELECT * FROM project_enquiries WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined;
      return row ? mapEnquiryRow(row) : null;
    },

    async updateEnquiry(id, updates) {
      const existing = await this.getEnquiryById(id);
      if (!existing) return null;

      const nextStatus = updates.status ?? existing.status;
      const nextNotes =
        updates.admin_notes !== undefined
          ? updates.admin_notes
          : existing.admin_notes;
      const now = new Date().toISOString();

      db.prepare(
        `UPDATE project_enquiries
         SET status = ?, admin_notes = ?, updated_at = ?
         WHERE id = ?`
      ).run(nextStatus, nextNotes, now, id);

      return this.getEnquiryById(id);
    },

    async deleteEnquiry(id) {
      const result = db
        .prepare('DELETE FROM project_enquiries WHERE id = ?')
        .run(id);
      return Number(result.changes) > 0;
    },

    async findAdminByIdentifier(identifier) {
      const normalized = identifier.trim().toLowerCase();
      const row = db
        .prepare(
          `SELECT * FROM admin_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1`
        )
        .get(normalized, normalized) as Record<string, unknown> | undefined;

      if (!row) return null;
      return {
        id: Number(row.id),
        username: String(row.username),
        email: String(row.email),
        password_hash: String(row.password_hash),
        role: String(row.role),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      };
    },

    async createSession(session) {
      db.prepare(
        `INSERT INTO admin_sessions (token_hash, admin_id, csrf_token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        session.token_hash,
        session.admin_id,
        session.csrf_token,
        session.expires_at,
        session.created_at
      );
    },

    async getSessionWithAdmin(tokenHash) {
      const now = new Date().toISOString();
      const row = db
        .prepare(
          `SELECT
            s.token_hash, s.admin_id, s.csrf_token, s.expires_at, s.created_at AS session_created_at,
            u.id AS user_id, u.username, u.email, u.role, u.created_at AS user_created_at, u.updated_at AS user_updated_at
           FROM admin_sessions s
           INNER JOIN admin_users u ON u.id = s.admin_id
           WHERE s.token_hash = ? AND s.expires_at > ?
           LIMIT 1`
        )
        .get(tokenHash, now) as Record<string, unknown> | undefined;

      if (!row) return null;
      return {
        session: {
          token_hash: String(row.token_hash),
          admin_id: Number(row.admin_id),
          csrf_token: String(row.csrf_token),
          expires_at: String(row.expires_at),
          created_at: String(row.session_created_at),
        },
        admin: {
          id: Number(row.user_id),
          username: String(row.username),
          email: String(row.email),
          role: String(row.role),
          created_at: String(row.user_created_at),
          updated_at: String(row.user_updated_at),
        },
      };
    },

    async deleteSession(tokenHash) {
      db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(
        tokenHash
      );
    },

    async purgeExpiredSessions() {
      const now = new Date().toISOString();
      db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now);
    },
  };
}

function createMysqlDatabase(): DatabaseClient {
  let pool: Pool;

  if (process.env.MYSQL_URL?.trim()) {
    pool = mysql.createPool(process.env.MYSQL_URL.trim());
  } else {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'qubex_enquiries',
      waitForConnections: true,
      connectionLimit: 10,
      timezone: 'Z',
    });
  }

  return {
    driver: 'mysql',
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS project_enquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(150) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          company_name VARCHAR(150) NOT NULL DEFAULT '',
          service_required VARCHAR(150) NOT NULL,
          status ENUM('New', 'Contacted', 'In Progress', 'Completed', 'Rejected') NOT NULL DEFAULT 'New',
          admin_notes TEXT NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          INDEX idx_status (status),
          INDEX idx_service (service_required),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(30) NOT NULL DEFAULT 'admin',
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
          token_hash VARCHAR(64) PRIMARY KEY,
          admin_id INT NOT NULL,
          csrf_token VARCHAR(128) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME NOT NULL,
          CONSTRAINT fk_admin_session_user FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS count FROM admin_users'
      );
      const count = Number(rows[0]?.count || 0);
      if (count === 0) {
        const creds = getDefaultAdminCredentials();
        const now = new Date();
        await pool.query(
          `INSERT INTO admin_users (username, email, password_hash, role, created_at, updated_at)
           VALUES (?, ?, ?, 'admin', ?, ?)`,
          [creds.username, creds.email, hashPassword(creds.password), now, now]
        );
      }
    },

    async createEnquiry(input) {
      const now = new Date();
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO project_enquiries (
          full_name, email, phone, company_name, service_required,
          status, admin_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'New', '', ?, ?)`,
        [
          input.full_name,
          input.email,
          input.phone,
          input.company_name,
          input.service_required,
          now,
          now,
        ]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM project_enquiries WHERE id = ?',
        [result.insertId]
      );
      return mapEnquiryRow(rows[0] as Record<string, unknown>);
    },

    async listEnquiries(filter) {
      const conditions: string[] = [];
      const params: Array<string | number> = [];

      if (filter.status && filter.status !== 'All') {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      if (filter.service && filter.service !== 'All') {
        conditions.push('service_required = ?');
        params.push(filter.service);
      }
      if (filter.dateFrom) {
        conditions.push('created_at >= ?');
        params.push(`${filter.dateFrom} 00:00:00`);
      }
      if (filter.dateTo) {
        conditions.push('created_at <= ?');
        params.push(`${filter.dateTo} 23:59:59`);
      }
      if (filter.search && filter.search.trim()) {
        const term = `%${filter.search.trim().toLowerCase()}%`;
        conditions.push(
          `(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(service_required) LIKE ? OR CAST(id AS CHAR) LIKE ?)`
        );
        params.push(term, term, term, term, term, term);
      }

      const whereSql =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM project_enquiries ${whereSql} ORDER BY created_at DESC, id DESC`,
        params
      );

      const [statsRows] = await pool.query<RowDataPacket[]>(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS newCount,
          SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) AS contactedCount,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount,
          SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedCount
        FROM project_enquiries`
      );

      const statsRow = statsRows[0] || {};
      return {
        enquiries: rows.map((r) => mapEnquiryRow(r as Record<string, unknown>)),
        stats: {
          total: Number(statsRow.total || 0),
          newCount: Number(statsRow.newCount || 0),
          contactedCount: Number(statsRow.contactedCount || 0),
          inProgressCount: Number(statsRow.inProgressCount || 0),
          completedCount: Number(statsRow.completedCount || 0),
          rejectedCount: Number(statsRow.rejectedCount || 0),
        },
      };
    },

    async getEnquiryById(id) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM project_enquiries WHERE id = ?',
        [id]
      );
      return rows[0] ? mapEnquiryRow(rows[0] as Record<string, unknown>) : null;
    },

    async updateEnquiry(id, updates) {
      const existing = await this.getEnquiryById(id);
      if (!existing) return null;

      const nextStatus = updates.status ?? existing.status;
      const nextNotes =
        updates.admin_notes !== undefined
          ? updates.admin_notes
          : existing.admin_notes;
      const now = new Date();

      await pool.query(
        'UPDATE project_enquiries SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?',
        [nextStatus, nextNotes, now, id]
      );

      return this.getEnquiryById(id);
    },

    async deleteEnquiry(id) {
      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM project_enquiries WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    },

    async findAdminByIdentifier(identifier) {
      const normalized = identifier.trim().toLowerCase();
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM admin_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1',
        [normalized, normalized]
      );
      const row = rows[0];
      if (!row) return null;
      return {
        id: Number(row.id),
        username: String(row.username),
        email: String(row.email),
        password_hash: String(row.password_hash),
        role: String(row.role),
        created_at: toIsoDateString(row.created_at),
        updated_at: toIsoDateString(row.updated_at),
      };
    },

    async createSession(session) {
      await pool.query(
        `INSERT INTO admin_sessions (token_hash, admin_id, csrf_token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          session.token_hash,
          session.admin_id,
          session.csrf_token,
          new Date(session.expires_at),
          new Date(session.created_at),
        ]
      );
    },

    async getSessionWithAdmin(tokenHash) {
      const now = new Date();
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          s.token_hash, s.admin_id, s.csrf_token, s.expires_at, s.created_at AS session_created_at,
          u.id AS user_id, u.username, u.email, u.role, u.created_at AS user_created_at, u.updated_at AS user_updated_at
         FROM admin_sessions s
         INNER JOIN admin_users u ON u.id = s.admin_id
         WHERE s.token_hash = ? AND s.expires_at > ?
         LIMIT 1`,
        [tokenHash, now]
      );
      const row = rows[0];
      if (!row) return null;
      return {
        session: {
          token_hash: String(row.token_hash),
          admin_id: Number(row.admin_id),
          csrf_token: String(row.csrf_token),
          expires_at: toIsoDateString(row.expires_at),
          created_at: toIsoDateString(row.session_created_at),
        },
        admin: {
          id: Number(row.user_id),
          username: String(row.username),
          email: String(row.email),
          role: String(row.role),
          created_at: toIsoDateString(row.user_created_at),
          updated_at: toIsoDateString(row.user_updated_at),
        },
      };
    },

    async deleteSession(tokenHash) {
      await pool.query('DELETE FROM admin_sessions WHERE token_hash = ?', [
        tokenHash,
      ]);
    },

    async purgeExpiredSessions() {
      await pool.query('DELETE FROM admin_sessions WHERE expires_at <= ?', [
        new Date(),
      ]);
    },
  };
}

let cachedDb: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (cachedDb) return cachedDb;
  const useMysql = Boolean(
    process.env.MYSQL_URL?.trim() ||
      (process.env.MYSQL_HOST?.trim() && process.env.MYSQL_DATABASE?.trim())
  );
  cachedDb = useMysql ? createMysqlDatabase() : createSqliteDatabase();
  return cachedDb;
}
