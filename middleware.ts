import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from '@supabase/ssr';

// Protected routes that require authentication
const protectedRoutes = [
  '/today',
  '/food',
  '/weight',
  '/insights',
  '/dashboard',
  '/settings',
  '/onboarding',
  '/profile',
  '/coach',
  '/log'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/auth',
  '/about',
  '/pricing',
  '/user',
  '/font-showcase'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow all routes for now (MVP demo mode)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
