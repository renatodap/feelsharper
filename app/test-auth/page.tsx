'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPass123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      setResult({ 
        action: 'Sign Up',
        success: !error,
        data: data?.user ? { id: data.user.id, email: data.user.email } : null,
        error: error?.message,
        session: data?.session
      });
    } catch (err: any) {
      setResult({ action: 'Sign Up', error: err.message });
    }
    setLoading(false);
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setResult({ 
        action: 'Sign In',
        success: !error,
        data: data?.user ? { id: data.user.id, email: data.user.email } : null,
        error: error?.message,
        session: data?.session ? 'Session created' : 'No session'
      });
      
      if (data?.session) {
        // Try to fetch user to verify session works
        const { data: userData, error: userError } = await supabase.auth.getUser();
        setResult(prev => ({
          ...prev,
          currentUser: userData?.user?.email || 'No user',
          userError: userError?.message
        }));
      }
    } catch (err: any) {
      setResult({ action: 'Sign In', error: err.message });
    }
    setLoading(false);
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      setResult({
        action: 'Check Session',
        hasSession: !!session,
        hasUser: !!user,
        userEmail: user?.email,
        userId: user?.id,
        error: error?.message
      });
    } catch (err: any) {
      setResult({ action: 'Check Session', error: err.message });
    }
    setLoading(false);
  };

  const testSignOut = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { error } = await supabase.auth.signOut();
      setResult({
        action: 'Sign Out',
        success: !error,
        error: error?.message
      });
    } catch (err: any) {
      setResult({ action: 'Sign Out', error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-bold mb-4">Test Credentials:</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testSignUp}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              Test Sign Up
            </button>
            <button
              onClick={testSignIn}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Test Sign In
            </button>
            <button
              onClick={checkSession}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              Check Session
            </button>
            <button
              onClick={testSignOut}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">✅ {result.action} Successful!</p>
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">❌ Error: {result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 font-semibold mb-2">Testing Steps:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>First try "Test Sign Up" with a new email</li>
            <li>Then try "Test Sign In" with same credentials</li>
            <li>Click "Check Session" to verify you're logged in</li>
            <li>If session exists, you can test the parser!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}