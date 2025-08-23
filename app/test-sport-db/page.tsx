'use client';

import { useState } from 'react';

export default function TestSportDatabase() {
  const [input, setInput] = useState('played tennis for 2 hours');
  const [parseResult, setParseResult] = useState<any>(null);
  const [dbSimulation, setDbSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sportExamples = [
    'played tennis for 2 hours',
    'basketball practice for 90 minutes',
    'soccer game lasted 1 hour',
    'golf 18 holes in 4 hours',
    'volleyball match for 45 minutes',
    'swimming laps for 30 minutes',
    'ran 5k in 25 minutes',
    'bench pressed 225 lbs for 5 reps'
  ];

  const testParser = async () => {
    setLoading(true);
    setParseResult(null);
    setDbSimulation(null);
    
    try {
      // Test the parser
      const response = await fetch('/api/test/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, context: 'fitness' })
      });
      
      const data = await response.json();
      
      if (data.success && data.parse_result) {
        setParseResult(data.parse_result);
        
        // Simulate what would be stored in database
        const structuredData = data.parse_result.data?.structured_data || {};
        const simulatedDbEntry = {
          user_id: 'test-user-id',
          type: structuredData.activity_type || data.parse_result.data?.intent || 'unknown',
          raw_text: input,
          confidence: (data.parse_result.confidence || 0) / 100,
          data: {
            ...structuredData,
            sport_name: structuredData.sport_name,
            exercise_name: structuredData.exercise_name
          },
          metadata: {
            source: 'test',
            subjective_notes: data.parse_result.data?.subjective_notes,
            sport_name: structuredData.sport_name,
            exercise_name: structuredData.exercise_name
          },
          timestamp: new Date().toISOString()
        };
        
        setDbSimulation(simulatedDbEntry);
      }
    } catch (error) {
      console.error('Test error:', error);
    }
    
    setLoading(false);
  };

  const getSportName = () => {
    if (!parseResult) return null;
    const data = parseResult.data?.structured_data || {};
    return data.sport_name || data.exercise_name || null;
  };

  const isSpecificSport = () => {
    const sportName = getSportName();
    return sportName && sportName !== '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">🎾 Sport-Specific Database Test</h1>
          <p className="text-gray-600 mb-6">Test if sports are differentiated when stored in database</p>
          
          {/* Quick Examples */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Quick tests:</p>
            <div className="flex flex-wrap gap-2">
              {sportExamples.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setInput(example);
                    setParseResult(null);
                    setDbSimulation(null);
                  }}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Input */}
          <div className="mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something like: played tennis for 2 hours"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg"
            />
          </div>
          
          {/* Test Button */}
          <button
            onClick={testParser}
            disabled={loading || !input}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Testing...' : '🔍 Test Parser & Database Storage'}
          </button>
        </div>

        {/* Parse Result */}
        {parseResult && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              ✅ Parse Result
              <span className="ml-auto text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {parseResult.confidence}% confidence
              </span>
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Intent:</span>
                <span>{parseResult.data?.intent || 'unknown'}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Activity Type:</span>
                <span>{parseResult.data?.structured_data?.activity_type || 'unknown'}</span>
              </div>
              
              {getSportName() && (
                <div className="flex justify-between py-2 border-b bg-yellow-50 px-2 rounded">
                  <span className="font-semibold">🎯 Specific Activity:</span>
                  <span className="font-bold text-purple-600">{getSportName()}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Value:</span>
                <span>
                  {parseResult.data?.structured_data?.value || 'N/A'} {parseResult.data?.structured_data?.unit || ''}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Service Used:</span>
                <span>{parseResult.serviceUsed || 'unknown'}</span>
              </div>
            </div>
            
            {!isSpecificSport() && parseResult.data?.structured_data?.activity_type === 'sport' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">
                  ⚠️ Warning: Sport type was not preserved!
                </p>
                <p className="text-red-600 text-sm mt-1">
                  The parser detected a sport but didn&apos;t identify which specific sport.
                </p>
              </div>
            )}
            
            {isSpecificSport() && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">
                  ✅ Success: Sport type preserved!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The specific sport &ldquo;{getSportName()}&rdquo; will be stored in the database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Database Simulation */}
        {dbSimulation && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-xl font-bold mb-4">💾 What Gets Stored in Database</h2>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(dbSimulation, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-semibold mb-2">Database Storage Analysis:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Type field: <strong>{dbSimulation.type}</strong></li>
                <li>• Sport/Exercise in data: <strong>{dbSimulation.data.sport_name || dbSimulation.data.exercise_name || 'Not preserved'}</strong></li>
                <li>• Sport/Exercise in metadata: <strong>{dbSimulation.metadata.sport_name || dbSimulation.metadata.exercise_name || 'Not preserved'}</strong></li>
                <li>• Can differentiate sports: <strong>{isSpecificSport() ? 'YES ✅' : 'NO ❌'}</strong></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}