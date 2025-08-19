"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        setError(error.message);
      }
      setUser(user);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Sign up success:', data);
        setError('Check your email for verification link (or auto-confirm is enabled)');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Unexpected error during sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Sign in success:', data);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Unexpected error during sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Unexpected error during sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Auth Test Page</h1>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-2 rounded">
              <h2 className="font-bold">✅ Authentication Successful!</h2>
              <p>Email: {user.email}</p>
              <p>User ID: {user.id}</p>
              <p>Created: {new Date(user.created_at).toLocaleString()}</p>
            </div>
            
            <button
              onClick={signOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                placeholder="password"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={signIn}
                disabled={authLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
              >
                {authLoading ? 'Loading...' : 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={signUp}
                disabled={authLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
              >
                {authLoading ? 'Loading...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-xs text-gray-400">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>User State: {user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
        </div>
      </div>
    </div>
  );
}