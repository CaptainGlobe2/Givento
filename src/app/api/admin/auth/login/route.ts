import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminPassword,
} from '../../../../../lib/adminAuth';

const loginAttempts = new Map<string, number[]>();

function isRateLimited(clientKey: string, limit = 8, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (loginAttempts.get(clientKey) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    loginAttempts.set(clientKey, recent);
    return true;
  }
  recent.push(now);
  loginAttempts.set(clientKey, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const clientKey = forwarded?.split(',')[0]?.trim() || 'local-client';

    if (isRateLimited(clientKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many sign-in attempts. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { password?: unknown };
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Admin session secret is not configured cleanly on the server.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to process sign-in request.' },
      { status: 400 }
    );
  }
}
