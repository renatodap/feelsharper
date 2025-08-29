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
    '/reset-password',
    '/verify-email'
  ];
  
  // Auth routes that shouldn't have navigation
  const authRoutes = ['/auth'];

  useEffect(() => {
    // Skip auth check for public routes (including landing page)
    if (publicRoutes.some(route => pathname === route)) {
      return;
    }
    
    // Skip auth check for auth routes
    if (authRoutes.some(route => pathname?.startsWith(route))) {
      return;
    }

    // Redirect to signin if not authenticated on protected routes
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

  // For exact public routes (landing, signin, signup), render without navigation
  if (publicRoutes.some(route => pathname === route)) {
    return <>{children}</>;
  }
  
  // For auth callback routes, render without navigation
  if (authRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>;
  }

  // For all other routes (dashboard, insights, log, etc), wrap with AppNavigation if authenticated
  if (user) {
    return <AppNavigation>{children}</AppNavigation>;
  }

  // If not authenticated and not on a public route, don't render (redirect will happen)
  return null;
}