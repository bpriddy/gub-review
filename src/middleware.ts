import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security-header middleware for gub-review.
 *
 * This service is intentionally public (no IAP, no login). Every route is
 * reachable by anyone with the URL. Safety comes from:
 *   - URL tokens (unguessable 32-byte secrets) gate access to reviewer data
 *   - Backend (GUB) is the authoritative authorizer — we just proxy
 *   - This module serves no admin surface; it only has reviewer flows
 *
 * That makes tight security headers worth paying for — they block UI
 * redressing, clickjacking, and referrer leaks of tokenized URLs.
 */
export function middleware(_request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
