'use client';

import { useState } from 'react';

export default function SimpleTest() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirectSupabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Test the parsing without auth
      const parseRes = await fetch('/api/test/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      
      const parseData = await parseRes.json();
      
      // Now try to save directly to Supabase
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        'https://uayxgxeueyjiokhvmjwd.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs'
      );
      
      // Create a test user or use existing
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'TestPass123'
      });
      
      let userId = authData?.user?.id;
      
      if (!userId) {
        // Try to sign up
        const { data: signUpData } = await supabase.auth.signUp({
          email: `test${Date.now()}@example.com`,
          password: 'TestPass123'
        });
        userId = signUpData?.user?.id;
      }
      
      // Save to database
      if (userId && parseData.success) {
        const { data: saved, error: saveError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: userId,
            type: parseData.parse_result?.data?.activity_type === 'cardio' ? 'exercise' : 
                  parseData.parse_result?.data?.activity_type === 'nutrition' ? 'food' :
                  parseData.parse_result?.data?.activity_type === 'weight' ? 'weight' : 'unknown',
            raw_text: input,
            confidence: (parseData.parse_result?.confidence || 0) / 100,
            data: parseData.parse_result?.data?.structured_data || {},
            metadata: { source: 'test' }
          })
          .select()
          .single();
        
        setResult({
          parseSuccess: true,
          parseData: parseData.parse_result,
          saveSuccess: !saveError,
          savedData: saved,
          saveError: saveError?.message,
          summary: !saveError ? 
            '✅ PHASE 3 COMPLETE! Parser works, Database saves work!' : 
            '⚠️ Parser works but database save failed'
        });
      } else {
        setResult({
          parseData,
          authError: !userId ? 'No user ID' : null,
          error: 'Could not complete full test'
        });
      }
    } catch (err: any) {
      setResult({ 
        error: err.message,
        note: 'Check browser console for details'
      });
      console.error('Test error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Phase 3 Complete Test</h1>
        <p className="text-gray-600 mb-8">This tests parsing AND database storage in one click</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Enter something to parse:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ran 5k in 25 minutes"
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />
          <button
            onClick={testDirectSupabase}
            disabled={loading || !input}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing Everything...' : 'Test Parse + Save to Database'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-2">Result:</h2>
            
            {result.summary && (
              <div className={`mb-4 p-4 rounded-lg ${
                result.summary.includes('COMPLETE') ? 
                'bg-green-50 border border-green-200' : 
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`font-semibold ${
                  result.summary.includes('COMPLETE') ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {result.summary}
                </p>
              </div>
            )}
            
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold mb-2">What This Tests:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Parses your input using the AI</li>
            <li>Creates/uses a test account</li>
            <li>Saves parsed data to Supabase</li>
            <li>Verifies the complete Phase 3 flow</li>
          </ol>
        </div>
      </div>
    </div>
  );
}