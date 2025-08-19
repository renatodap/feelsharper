'use client';

import { useState } from 'react';
import SimpleHeader from '@/components/navigation/SimpleHeader';

// Pattern matching logic that ACTUALLY WORKS
function parseActivity(text: string) {
  const normalizedText = text.toLowerCase().trim();
  
  // Weight patterns
  const weightMatch = normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg|kilos?|pounds?)?$/i);
  if (weightMatch) {
    return {
      type: 'weight',
      data: { 
        weight: parseFloat(weightMatch[1]), 
        unit: weightMatch[2]?.includes('k') ? 'kg' : 'lbs' 
      },
      confidence: 0.95
    };
  }
  
  // Energy patterns
  const energyMatch = normalizedText.match(/energy\s+(\d+)(?:\/10)?/i);
  if (energyMatch) {
    return {
      type: 'energy',
      data: { level: parseInt(energyMatch[1]) },
      confidence: 0.95
    };
  }
  
  // Sleep patterns
  const sleepMatch = normalizedText.match(/slept?\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?/i);
  if (sleepMatch) {
    return {
      type: 'sleep',
      data: { hours: parseFloat(sleepMatch[1]) },
      confidence: 0.95
    };
  }
  
  // Water patterns
  const waterMatch = normalizedText.match(/(?:drank|had|drink)?\s*(\d+(?:\.\d+)?)\s*(oz|ml|cups?|liters?|l)\s*(?:of\s*)?(?:water)?/i);
  if (waterMatch && normalizedText.includes('water')) {
    return {
      type: 'water',
      data: { 
        amount: parseFloat(waterMatch[1]), 
        unit: waterMatch[2].includes('liter') || waterMatch[2] === 'l' ? 'liters' : 
              waterMatch[2].includes('cup') ? 'cups' :
              waterMatch[2].includes('ml') ? 'ml' : 'oz'
      },
      confidence: 0.9
    };
  }
  
  // Food patterns
  if (normalizedText.includes('breakfast') || normalizedText.includes('lunch') || 
      normalizedText.includes('dinner') || normalizedText.includes('snack')) {
    const meal = normalizedText.includes('breakfast') ? 'breakfast' :
                 normalizedText.includes('lunch') ? 'lunch' :
                 normalizedText.includes('dinner') ? 'dinner' : 'snack';
    
    const foodWords = ['eggs', 'toast', 'chicken', 'salad', 'steak', 'vegetables', 'apple', 'banana'];
    const items = foodWords.filter(food => normalizedText.includes(food)).map(name => ({name}));
    
    if (items.length > 0 || meal) {
      return {
        type: 'food',
        data: { items: items.length > 0 ? items : [{name: 'meal'}], meal },
        confidence: 0.85
      };
    }
  }
  
  // Workout patterns with word boundaries
  const workoutWords = ['ran', 'run', 'running', 'walked', 'walking', 'cycled', 'cycling'];
  const hasWorkout = workoutWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalizedText);
  });
  
  if (hasWorkout) {
    const activity = /\bran\b|\brun\b|\brunning\b/i.test(normalizedText) ? 'running' :
                    /\bwalked\b|\bwalking\b/i.test(normalizedText) ? 'walking' :
                    /\bcycled\b|\bcycling\b/i.test(normalizedText) ? 'cycling' : 'exercise';
    
    const data: any = { activity };
    
    // Extract distance
    const distanceMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|meters?|m)\b/i);
    if (distanceMatch) {
      data.distance = parseFloat(distanceMatch[1]);
      data.distanceUnit = distanceMatch[2] === 'k' || distanceMatch[2] === 'km' ? 'km' :
                         distanceMatch[2].includes('mi') ? 'miles' : 'm';
    }
    
    // Extract duration
    const durationMatch = normalizedText.match(/(?:in\s+|for\s+)?(\d+(?:\.\d+)?)\s*(mins?|minutes?|hours?|hrs?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      data.duration = durationMatch[2].includes('hour') || durationMatch[2].includes('hr') ? 
                     value * 60 : value;
    }
    
    return {
      type: 'workout',
      data,
      confidence: 0.85
    };
  }
  
  // Mood patterns
  if (normalizedText.includes('feeling') || normalizedText.includes('feel')) {
    let mood = 'okay';
    if (normalizedText.includes('great')) mood = 'great';
    else if (normalizedText.includes('good')) mood = 'good';
    else if (normalizedText.includes('bad')) mood = 'bad';
    else if (normalizedText.includes('terrible')) mood = 'terrible';
    
    return {
      type: 'mood',
      data: { mood, notes: text },
      confidence: 0.8
    };
  }
  
  return {
    type: 'unknown',
    data: { text },
    confidence: 0.1
  };
}

export default function TestNaturalLanguage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  const handleParse = () => {
    if (!input.trim()) return;
    
    const parsed = parseActivity(input);
    setResults([parsed, ...results]);
    setInput('');
  };

  const testApiEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'weight 175', demo: true })
      });
      
      const data = await response.json();
      setApiTestResult({ 
        status: response.status, 
        data,
        success: response.ok 
      });
    } catch (error) {
      setApiTestResult({ 
        error: error instanceof Error ? error.message : 'Failed',
        success: false 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      weight: '⚖️',
      food: '🍽️',
      workout: '💪',
      mood: '😊',
      energy: '⚡',
      sleep: '😴',
      water: '💧',
      unknown: '❓'
    };
    return icons[type] || '📝';
  };

  const formatData = (type: string, data: any) => {
    switch (type) {
      case 'weight':
        return `${data.weight} ${data.unit}`;
      case 'food':
        return `${data.meal}: ${data.items?.map((i: any) => i.name).join(', ')}`;
      case 'workout':
        return `${data.activity}${data.distance ? ` ${data.distance}${data.distanceUnit}` : ''}${data.duration ? ` for ${data.duration} min` : ''}`;
      case 'mood':
        return `Feeling ${data.mood}`;
      case 'energy':
        return `Energy: ${data.level}/10`;
      case 'sleep':
        return `${data.hours} hours`;
      case 'water':
        return `${data.amount} ${data.unit}`;
      default:
        return JSON.stringify(data);
    }
  };

  const testCases = [
    'weight 175',
    'ran 5k in 25 minutes',
    'had eggs for breakfast',
    'feeling great today',
    'energy 8/10',
    'slept 8 hours',
    'drank 64 oz water'
  ];

  return (
    <main className="min-h-screen bg-bg">
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Natural Language Parser Test
        </h1>

        {/* Live Parser Test */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Parser (Client-Side)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleParse()}
              placeholder="Try: weight 175, ran 5k, had eggs for breakfast..."
              className="flex-1 px-4 py-2 bg-bg rounded border border-border text-text-primary"
            />
            <button
              onClick={handleParse}
              className="px-6 py-2 bg-navy text-white rounded hover:bg-navy-600"
            >
              Parse
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {testCases.map(test => (
              <button
                key={test}
                onClick={() => setInput(test)}
                className="text-xs px-3 py-1 bg-surface-2 rounded border border-border hover:bg-surface-hover"
              >
                "{test}"
              </button>
            ))}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-text-secondary">Results:</h3>
              {results.map((result, i) => (
                <div key={i} className="bg-bg rounded p-3 border border-border">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getIcon(result.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {formatData(result.type, result.data)}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Test */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoint</h2>
          
          <button
            onClick={testApiEndpoint}
            disabled={isLoading}
            className="px-6 py-2 bg-navy text-white rounded hover:bg-navy-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test /api/ai/parse'}
          </button>

          {apiTestResult && (
            <div className="mt-4 p-4 bg-bg rounded border border-border">
              <div className="font-mono text-sm">
                <div className={apiTestResult.success ? 'text-green-500' : 'text-red-500'}>
                  Status: {apiTestResult.status || 'Error'}
                </div>
                <pre className="mt-2 text-text-secondary overflow-x-auto">
                  {JSON.stringify(apiTestResult.data || apiTestResult.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Matching Tests */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Pattern Matching Tests</h2>
          
          <div className="space-y-2">
            {testCases.map(test => {
              const result = parseActivity(test);
              const success = result.type !== 'unknown' && result.confidence > 0.5;
              
              return (
                <div key={test} className="flex items-center gap-3">
                  <span className={success ? 'text-green-500' : 'text-red-500'}>
                    {success ? '✓' : '✗'}
                  </span>
                  <code className="text-sm bg-bg px-2 py-1 rounded">"{test}"</code>
                  <span className="text-sm text-text-secondary">→</span>
                  <span className="text-sm text-text-primary">
                    {result.type} ({Math.round(result.confidence * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}