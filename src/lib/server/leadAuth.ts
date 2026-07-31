import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import type { DashboardUser } from '../leads';

const COOKIE_NAME = 'kf_leads_session';
const SESSION_SECONDS = 60 * 60 * 12;
const HASH_ITERATIONS = 210_000;

interface StoredDashboardUser extends DashboardUser {
  passwordHash: string;
}

interface SessionPayload extends DashboardUser {
  exp: number;
}

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

interface CookieWriter extends CookieReader {
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete(name: string, options: Record<string, unknown>): void;
}

const getSessionSecret = () => {
  const secret = process.env.LEADS_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('LEADS_SESSION_SECRET must contain at least 32 characters.');
  return secret;
};

const getUsers = (): StoredDashboardUser[] => {
  const raw = process.env.LEADS_DASHBOARD_USERS;
  if (!raw) throw new Error('LEADS_DASHBOARD_USERS is not configured.');
  const parsed = JSON.parse(raw) as StoredDashboardUser[];
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('LEADS_DASHBOARD_USERS must contain at least one user.');
  return parsed;
};

const verifyPassword = (password: string, encoded: string): boolean => {
  const [salt, iterationsText, expectedHex] = encoded.split(':');
  const iterations = Number.parseInt(iterationsText, 10);
  if (!salt || !expectedHex || !Number.isInteger(iterations) || iterations < HASH_ITERATIONS) return false;
  const actual = pbkdf2Sync(password, salt, iterations, expectedHex.length / 2, 'sha256');
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const sign = (payload: string) =>
  createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');

export const authenticateDashboardUser = (
  usernameInput: unknown,
  passwordInput: unknown
): DashboardUser | null => {
  const username = typeof usernameInput === 'string' ? usernameInput.trim().toLowerCase() : '';
  const password = typeof passwordInput === 'string' ? passwordInput : '';
  if (!username || !password) return null;

  const stored = getUsers().find(user => user.username.toLowerCase() === username);
  if (!stored || !verifyPassword(password, stored.passwordHash)) return null;
  return { username: stored.username, name: stored.name, role: stored.role };
};

export const createSessionToken = (user: DashboardUser, now = Date.now()): string => {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(now / 1000) + SESSION_SECONDS
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
};

export const readSessionToken = (token: string | undefined, now = Date.now()): DashboardUser | null => {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (payload.exp <= Math.floor(now / 1000)) return null;
    if (!payload.username || !payload.name || !['owner', 'partner'].includes(payload.role)) return null;
    return { username: payload.username, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
};

export const getDashboardSession = (cookies: CookieReader) =>
  readSessionToken(cookies.get(COOKIE_NAME)?.value);

export const setDashboardSession = (cookies: CookieWriter, user: DashboardUser, secure: boolean) => {
  cookies.set(COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS
  });
};

export const clearDashboardSession = (cookies: CookieWriter) => {
  cookies.delete(COOKIE_NAME, { path: '/' });
};
