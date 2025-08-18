"use client";

import { useAuth } from './AuthProvider';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    // Note: signOut in AuthProvider already handles redirect
    setLoading(false);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-md
        text-text-secondary hover:text-text-primary 
        hover:bg-surface transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )}
      {children || (loading ? 'Signing out...' : 'Sign out')}
    </button>
  );
}