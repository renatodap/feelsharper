'use client';

import { useState } from 'react';

// Simple pattern matching that works
function parseInput(text: string) {
  const normalizedText = text.toLowerCase().trim();
  
  // Weight
  if (normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg)?$/i)) {
    const match = normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg)?$/i);
    return {
      type: 'weight',
      value: match?.[1],
      unit: match?.[2] || 'lbs',
      confidence: 95
    };
  }
  
  // Food keywords
  const foodWords = ['breakfast', 'lunch', 'dinner', 'eggs', 'chicken', 'salad', 'steak'];
  if (foodWords.some(word => normalizedText.includes(word))) {
    return {
      type: 'food',
      value: text,
      confidence: 85
    };
  }
  
  // Workout keywords
  const workoutWords = ['ran', 'run', 'walked', 'cycled', 'workout'];
  if (workoutWords.some(word => normalizedText.includes(word))) {
    return {
      type: 'workout', 
      value: text,
      confidence: 85
    };
  }
  
  // Energy
  if (normalizedText.includes('energy')) {
    return {
      type: 'energy',
      value: text,
      confidence: 90
    };
  }
  
  // Sleep
  if (normalizedText.includes('slept') || normalizedText.includes('sleep')) {
    return {
      type: 'sleep',
      value: text,
      confidence: 90
    };
  }
  
  // Mood
  if (normalizedText.includes('feeling') || normalizedText.includes('mood')) {
    return {
      type: 'mood',
      value: text,
      confidence: 80
    };
  }
  
  return {
    type: 'unknown',
    value: text,
    confidence: 10
  };
}

export default function NLDemo() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const parsed = parseInput(input);
    setResults([...results, { input, ...parsed }]);
    setInput('');
  };
  
  const testExamples = [
    'weight 175',
    'ran 5k in 25 minutes',
    'had eggs for breakfast',
    'feeling great today',
    'energy 8/10',
    'slept 8 hours'
  ];
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Natural Language Demo</h1>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what you did..."
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Parse
            </button>
          </div>
        </form>
        
        {/* Quick Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Try these:</h2>
          <div className="flex flex-wrap gap-2">
            {testExamples.map(example => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
        
        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Results:</h2>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="p-4 bg-gray-900 rounded">
                  <div className="text-sm text-gray-400 mb-1">Input: "{result.input}"</div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold capitalize">{result.type}</span>
                    <span className="text-sm">Confidence: {result.confidence}%</span>
                    {result.type === 'weight' && (
                      <span className="text-sm">Value: {result.value} {result.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Test Status */}
        <div className="mt-8 p-4 bg-gray-900 rounded">
          <h3 className="font-semibold mb-2">Implementation Status:</h3>
          <ul className="space-y-1 text-sm">
            <li>✅ Pattern matching: Working</li>
            <li>✅ 7 activity types: Implemented</li>
            <li>❌ API endpoint: Not loading</li>
            <li>❌ Database: Tables not created</li>
            <li>❌ TypeScript: 50+ errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}