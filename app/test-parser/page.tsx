'use client';

import { useState } from 'react';

export default function TestParser() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testParse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-parse-noauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to test' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Phase 3 Parser Test (No Auth)</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Natural Language Input:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., ran 5k in 25 minutes"
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />
          <button
            onClick={testParse}
            disabled={loading || !input}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Parse & Save'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">✅ Phase 3 Working!</p>
                <p className="text-green-700 text-sm mt-1">
                  Parser confidence: {result.parsed?.confidence}%
                </p>
                <p className="text-green-700 text-sm">
                  Saved to database: {result.saved?.id}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-sm text-gray-600">
          <p className="font-semibold mb-2">Test these inputs:</p>
          <ul className="space-y-1">
            <li>• ran 5k in 25 minutes</li>
            <li>• weight 175 pounds</li>
            <li>• ate 2 eggs and toast for breakfast</li>
            <li>• bench pressed 135 lbs for 3 sets of 8</li>
            <li>• slept 7 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}