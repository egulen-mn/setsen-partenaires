import { NextResponse } from 'next/server';

// Matches the refresh token lifetime on the API side (7 days)
const MAX_AGE = 60 * 60 * 24 * 7;

const COOKIE_OPTS = {
  name: 'b2b_session',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * POST /api/auth/session
 * Called after a successful login. Sets a lightweight presence flag cookie
 * on the b2b.tengerly.com origin so the middleware can gate /dashboard routes
 * without needing access to the API-origin auth cookies.
 *
 * This cookie carries NO sensitive data — it is a presence signal only.
 * The real auth boundary is the API, which validates the JWT on every request.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...COOKIE_OPTS, value: '1', maxAge: MAX_AGE });
  return res;
}

/**
 * DELETE /api/auth/session
 * Called on logout. Clears the session flag cookie.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...COOKIE_OPTS, value: '', maxAge: 0 });
  return res;
}
