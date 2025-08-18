"use client";

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/sign-in',
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to sign-in with current path as redirect parameter
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectUrl);
      } else if (!requireAuth && user) {
        // If user is logged in but trying to access public-only pages (like login)
        router.push('/today');
      }
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}