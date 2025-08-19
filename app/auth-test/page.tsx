"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Activity Parsing Test Component
function ActivityParsingTest({ user }: { user: any }) {
  const [activityText, setActivityText] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleParseActivity = async () => {
    if (!activityText.trim()) {
      setMessage('Please enter some activity text');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setParseResult(null);

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: activityText,
          context: {},
          demo: false // Use real authenticated mode
        })
      });

      const result = await response.json();
      setParseResult(result);
      
      if (result.success) {
        if (result.saved) {
          setMessage(`🎉 SUCCESS! Activity "${result.parsed.type}" parsed and SAVED to database!`);
        } else {
          setMessage(`✅ Activity parsed as "${result.parsed.type}" but not saved (confidence: ${Math.round(result.parsed.confidence * 100)}%)`);
        }
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Request failed: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Natural Language Input:</label>
          <textarea
            placeholder="Tell me what you did... (e.g., 'weight 175', 'ran 5k in 25 minutes', 'had eggs for breakfast')"
            value={activityText}
            onChange={(e) => setActivityText(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white h-20"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button onClick={() => setActivityText('weight 175')} className="px-2 py-1 bg-gray-700 rounded text-xs">weight 175</button>
          <button onClick={() => setActivityText('ran 5k in 25 minutes')} className="px-2 py-1 bg-gray-700 rounded text-xs">ran 5k</button>
          <button onClick={() => setActivityText('had eggs for breakfast')} className="px-2 py-1 bg-gray-700 rounded text-xs">breakfast</button>
          <button onClick={() => setActivityText('energy 8/10')} className="px-2 py-1 bg-gray-700 rounded text-xs">energy 8/10</button>
          <button onClick={() => setActivityText('slept 7 hours')} className="px-2 py-1 bg-gray-700 rounded text-xs">slept 7h</button>
          <button onClick={() => setActivityText('drank 64 oz water')} className="px-2 py-1 bg-gray-700 rounded text-xs">water 64oz</button>
        </div>

        <button
          onClick={handleParseActivity}
          disabled={isLoading || !activityText.trim()}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {isLoading ? '🤖 Processing with AI...' : '🎯 Parse & Save Activity'}
        </button>

        {message && (
          <div className={`p-3 rounded ${message.includes('🎉') ? 'bg-green-900 text-green-100' : 
                           message.includes('✅') ? 'bg-blue-900 text-blue-100' : 
                           'bg-red-900 text-red-100'}`}>
            {message}
          </div>
        )}

        {parseResult && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <h4 className="font-semibold mb-2">📊 Parse Result:</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-blue-400">Type:</span> {parseResult.parsed?.type}</p>
              <p><span className="text-blue-400">Confidence:</span> {Math.round((parseResult.parsed?.confidence || 0) * 100)}%</p>
              <p><span className="text-blue-400">Data:</span> {JSON.stringify(parseResult.parsed?.data)}</p>
              <p><span className="text-blue-400">Saved to DB:</span> {parseResult.saved ? '✅ YES' : '❌ No'}</p>
            </div>
            
            {parseResult.coach && (
              <div className="mt-3 p-2 bg-gray-700 rounded">
                <h5 className="font-medium mb-1">🤖 AI Coach Response:</h5>
                <p className="text-sm">{parseResult.coach.message}</p>
                {parseResult.coach.motivation && (
                  <p className="text-xs italic mt-1 text-gray-300">"{parseResult.coach.motivation}"</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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

        {user && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">🎯 Test Natural Language Parsing (A+ Grade Test)</h2>
            <ActivityParsingTest user={user} />
          </div>
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