/**
 * Authenticated Layout Component
 * Wraps authenticated pages with navigation and settings
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import AppNavigation from '@/components/navigation/AppNavigation';

export default function AuthenticatedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/signin',
    '/signup',
    '/sign-in',
    '/sign-up',
    '/auth',
    '/reset-password',
    '/verify-email'
  ];

  useEffect(() => {
    // If user is logged in and on the landing page, redirect to insights
    if (!loading && user && pathname === '/') {
      router.push('/insights');
      return;
    }

    // Skip auth check for public routes
    if (publicRoutes.some(route => pathname?.startsWith(route))) {
      return;
    }

    // Redirect to signin if not authenticated
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4169E1] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes, render children without navigation
  if (publicRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>;
  }

  // For authenticated routes, wrap with AppNavigation
  if (user) {
    return <AppNavigation>{children}</AppNavigation>;
  }

  // Fallback - shouldn't reach here but just in case
  return null;
}