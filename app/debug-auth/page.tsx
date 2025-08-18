'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createSupabaseBrowser();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Starting auth debug...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        addLog(`Session error: ${error.message}`);
      } else {
        addLog(`Session: ${session ? 'Found' : 'None'}`);
        setSession(session);
      }
    });

    // Get user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        addLog(`User error: ${error.message}`);
      } else {
        addLog(`User: ${user ? user.email : 'None'}`);
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth event: ${event}`);
      addLog(`New session: ${session ? session.user?.email : 'None'}`);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? user.email : 'None'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
              <p><strong>Session Expires:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={async () => {
                  addLog('Testing API call...');
                  try {
                    const response = await fetch('/api/food/log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: 'Test Apple',
                        quantity: 1,
                        unit: 'medium',
                        mealType: 'breakfast',
                        calories: 95,
                        protein: 0.5,
                        carbs: 25,
                        fat: 0.3
                      })
                    });
                    const result = await response.json();
                    addLog(`API Response: ${JSON.stringify(result)}`);
                  } catch (error) {
                    addLog(`API Error: ${error}`);
                  }
                }}
                className="w-full bg-navy text-white px-4 py-2 rounded hover:bg-navy-600"
              >
                Test Food Log API
              </button>

              <button
                onClick={async () => {
                  addLog('Testing sign out...');
                  await supabase.auth.signOut();
                  addLog('Sign out complete');
                }}
                className="w-full bg-error text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-surface p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black p-4 rounded text-xs font-mono text-green-400 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}