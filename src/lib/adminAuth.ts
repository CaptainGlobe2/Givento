import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'givento_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

interface SessionPayload {
  role: 'admin';
  exp: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

function safeEqualStrings(a: string, b: string): boolean {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

function signPayload(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || !candidate) {
    return false;
  }
  return safeEqualStrings(candidate, expected);
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const payload: SessionPayload = {
    role: 'admin',
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return false;

  const payloadB64 = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  if (!payloadB64 || !providedSig) return false;

  const expectedSig = signPayload(payloadB64, secret);
  if (!safeEqualStrings(providedSig, expectedSig)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    if (parsed.role !== 'admin' || typeof parsed.exp !== 'number') {
      return false;
    }
    return parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminRequestAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
