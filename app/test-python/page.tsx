'use client';

import { useState } from 'react';
import { parseActivityPython, checkPythonBackendHealth } from '@/lib/api/python-client';
import { Button } from '@/components/ui/button';

export default function TestPythonPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);

  const testExamples = [
    'ran 5k in 25 minutes',
    'weight 175 lbs',
    'bench press 135 lbs for 8 reps',
    'ate eggs and toast for breakfast',
    'feeling great today'
  ];

  const checkHealth = async () => {
    const isHealthy = await checkPythonBackendHealth();
    setHealthStatus(isHealthy);
  };

  const testParse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await parseActivityPython(input);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testViaNextAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/parse-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Python Backend Test</h1>
      
      {/* Health Check */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Backend Health</h2>
        <Button onClick={checkHealth} className="mb-2">Check Health</Button>
        {healthStatus !== null && (
          <p className={healthStatus ? 'text-green-600' : 'text-red-600'}>
            Python Backend: {healthStatus ? '✅ Healthy' : '❌ Not Available'}
          </p>
        )}
      </div>

      {/* Test Input */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Parser</h2>
        
        {/* Quick Examples */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {testExamples.map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setInput(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to parse..."
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={testParse} 
            disabled={loading || !input}
          >
            Test Direct (No Auth)
          </Button>
          <Button 
            onClick={testViaNextAPI} 
            disabled={loading || !input}
            variant="secondary"
          >
            Test via Next.js API (With Auth)
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">
          Loading...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          <h3 className="font-semibold">Error:</h3>
          <pre className="mt-2 text-sm">{error}</pre>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mb-4 p-4 bg-green-50 rounded">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* API Endpoints Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">API Endpoints:</h3>
        <ul className="text-sm space-y-1">
          <li>• Python Backend: <code>http://localhost:8000/api/parse</code></li>
          <li>• Next.js Proxy: <code>/api/parse-python</code></li>
          <li>• Original Parser: <code>/api/parse</code></li>
        </ul>
      </div>
    </div>
  );
}