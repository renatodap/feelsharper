"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔄 AuthProvider: Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔄 AuthProvider: Initial session result:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error: error?.message 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userEmail: session?.user?.email 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          console.log('✅ AuthProvider: User signed in, redirecting to /today');
          router.push('/today');
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 AuthProvider: User signed out, redirecting to /');
          router.push('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  // Memoize auth functions to prevent unnecessary re-renders
  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
  }, [supabase.auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 AuthProvider signIn called for:', email);
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    console.log('🔐 AuthProvider signIn result:', { 
      success: !result.error, 
      hasUser: !!result.data?.user,
      error: result.error?.message 
    });
    setLoading(false);
    return result;
  }, [supabase.auth]);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    return result;
  }, [supabase.auth]);

  const resetPassword = useCallback(async (email: string) => {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=/auth/reset-password`,
    });
    return result;
  }, [supabase.auth]);

  // Memoize context value to prevent unnecessary provider re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
    resetPassword
  }), [user, session, loading, signOut, signIn, signUp, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}