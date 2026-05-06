import { FastifyInstance } from 'fastify';
import type { AuthUser } from '../types';
import { clearSessionCookie, createSessionCookie, getSession } from '../lib/session';

type GoogleTokenResponse = {
  access_token: string;
};

type GoogleUserInfo = {
  sub: string;
  name: string;
  email: string;
  picture?: string;
};

const appOrigin = () => process.env.APP_ORIGIN || 'http://localhost:5173';
const googleClientId = () => process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = () => process.env.GOOGLE_CLIENT_SECRET || '';
const googleRedirectUri = () => new URL('/api/auth/google/callback', appOrigin()).toString();

const buildAllowedReturnTo = (value: unknown) => {
  if (typeof value !== 'string' || value.length === 0) return appOrigin();

  try {
    const candidate = new URL(value);
    const allowedOrigin = new URL(appOrigin());
    if (candidate.origin !== allowedOrigin.origin) return appOrigin();
    return candidate.toString();
  } catch {
    return appOrigin();
  }
};

const exchangeCodeForToken = async (code: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to exchange Google auth code');
  }

  return response.json() as Promise<GoogleTokenResponse>;
};

const loadGoogleUser = async (accessToken: string) => {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to load Google user profile');
  }

  return response.json() as Promise<GoogleUserInfo>;
};

const toUser = (profile: GoogleUserInfo): AuthUser => ({
  id: `google:${profile.sub}`,
  name: profile.name,
  email: profile.email,
  avatarUrl: profile.picture ?? null,
});

const googleAuthUrl = (returnTo: string) => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', googleClientId());
  url.searchParams.set('redirect_uri', googleRedirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', returnTo);
  return url.toString();
};

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.get('/auth/session', async (request) => {
    return getSession(request) ?? { user: null };
  });

  app.get('/auth/google/start', async (request, reply) => {
    if (!googleClientId() || !googleClientSecret()) {
      return reply.status(500).send('Google auth is not configured');
    }

    const { returnTo } = request.query as { returnTo?: unknown };
    const safeReturnTo = buildAllowedReturnTo(returnTo);
    return reply.redirect(googleAuthUrl(safeReturnTo), 302);
  });

  app.get('/auth/google/callback', async (request, reply) => {
    if (!googleClientId() || !googleClientSecret()) {
      return reply.status(500).send('Google auth is not configured');
    }

    const { code, state } = request.query as { code?: string; state?: unknown };
    if (!code) {
      return reply.status(400).send('Missing Google auth code');
    }

    const token = await exchangeCodeForToken(code);
    const profile = await loadGoogleUser(token.access_token);
    const user = toUser(profile);

    reply.header('Set-Cookie', createSessionCookie(user));
    return reply.redirect(buildAllowedReturnTo(String(state ?? '')), 302);
  });

  app.post('/auth/logout', async (_request, reply) => {
    reply.header('Set-Cookie', clearSessionCookie());
    return reply.send({ ok: true });
  });
};
