import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export const SESSION_COOKIE_NAME = 'qubex_admin_session';
export const CSRF_COOKIE_NAME = 'qubex_csrf_token';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours
const CSRF_SIGNING_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, salt, originalHex] = parts;
  if (!salt || !originalHex) {
    return false;
  }
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, original);
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function getSessionExpiryIso(): string {
  return new Date(Date.now() + SESSION_DURATION_MS).toISOString();
}

export function createSignedCsrfToken(): string {
  const nonce = crypto.randomBytes(24).toString('hex');
  const sig = crypto
    .createHmac('sha256', CSRF_SIGNING_SECRET)
    .update(nonce)
    .digest('hex');
  return `${nonce}.${sig}`;
}

export function verifySignedCsrfToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [nonce, sig] = parts;
  if (!nonce || !sig) return false;
  const expected = crypto
    .createHmac('sha256', CSRF_SIGNING_SECRET)
    .update(nonce)
    .digest('hex');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function safeTimingCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

export function isSecureRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string' && proto.split(',')[0].trim() === 'https') {
    return true;
  }
  const forwardedHost = req.headers['x-forwarded-host'];
  if (typeof forwardedHost === 'string' && forwardedHost.includes('.run.app')) {
    return true;
  }
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.startsWith('https://')) {
    return true;
  }
  return false;
}

export function getCookieOptions(req: Request, httpOnly: boolean, maxAge?: number) {
  const secure = isSecureRequest(req);
  const sameSite: 'none' | 'lax' = secure ? 'none' : 'lax';
  return {
    httpOnly,
    sameSite,
    secure,
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function setSessionCookie(req: Request, res: Response, rawToken: string): void {
  res.cookie(
    SESSION_COOKIE_NAME,
    rawToken,
    getCookieOptions(req, true, SESSION_DURATION_MS)
  );
}

export function clearSessionCookie(req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, getCookieOptions(req, true));
}

// In-memory sliding-window rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export function requireDoubleSubmitCsrf(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.get('x-csrf-token') || '';

  if (!headerToken || !verifySignedCsrfToken(headerToken)) {
    res.status(403).json({
      error: 'Invalid or missing CSRF security token. Please refresh the page and try again.',
    });
    return;
  }

  // Verify double-submit cookie match when third-party cookies are permitted
  if (cookieToken && !safeTimingCompare(cookieToken, headerToken)) {
    res.status(403).json({
      error: 'Security token mismatch. Please refresh the page and try again.',
    });
    return;
  }

  next();
}
