import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/Login(.*)',
  '/login(.*)',
  '/Screener(.*)',
  '/screener(.*)',
  '/api/(.*)',  // make API routes public, handle auth inside the route itself
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;

  console.log('🔒 Middleware hit:', path);
  console.log('🌐 isPublic:', isPublicRoute(req));

  if (!isPublicRoute(req)) {
    console.log('🔐 Protecting route:', path);
    await auth.protect();
  }

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.com blob:;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' db.clerk.com https://img.clerk.com;
    connect-src 'self' https://*.clerk.accounts.dev https://api.the-odds-api.com; https://clerk-telemetry.com
    frame-src 'self' https://*.clerk.accounts.dev;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};