import crypto from 'crypto';
import { FastifyRequest } from 'fastify';
import type { AuthSession, AuthUser } from '../types';

const COOKIE_NAME = 'no_pressure_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MIN_PRODUCTION_SECRET_BYTES = 32;

export const validateSessionConfig = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < MIN_PRODUCTION_SECRET_BYTES) {
    throw new Error(
      `SESSION_SECRET must contain at least ${MIN_PRODUCTION_SECRET_BYTES} bytes in production`
    );
  }
};

const getSecret = () => {
  validateSessionConfig();
  return process.env.SESSION_SECRET || 'dev-session-secret';
};

const base64UrlEncode = (value: string) => Buffer.from(value).toString('base64url');

const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value: string) =>
  crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');

const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey || rawValue.length === 0) return acc;
    acc[rawKey] = rawValue.join('=');
    return acc;
  }, {});
};

export const createSessionCookie = (user: AuthUser) => {
  const payload = JSON.stringify({
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  const encoded = base64UrlEncode(payload);
  const isProduction = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${encoded}.${sign(encoded)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)};${isProduction ? ' Secure;' : ''}`;
};

export const clearSessionCookie = () =>
  `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;`;

export const getSession = (request: FastifyRequest): AuthSession | null => {
  const cookies = parseCookies(request.headers.cookie);
  const rawSession = cookies[COOKIE_NAME];
  if (!rawSession) return null;

  const [encoded, signature] = rawSession.split('.');
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as AuthSession & { expiresAt: number };
    if (!parsed.user || typeof parsed.expiresAt !== 'number' || parsed.expiresAt < Date.now()) {
      return null;
    }
    return { user: parsed.user };
  } catch {
    return null;
  }
};
