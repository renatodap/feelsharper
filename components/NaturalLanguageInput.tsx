'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface ParsedResult {
  type: string;
  data: any;
  confidence: number;
}

interface CoachResponse {
  message: string;
  motivation?: string;
  insights?: string[];
  challenge?: string;
  encouragement?: string;
  nextSteps?: string[];
}

export function NaturalLanguageInput() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastResult, setLastResult] = useState<{
    parsed?: ParsedResult;
    coach?: CoachResponse;
    saved?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setError('Speech recognition failed. Please try typing instead.');
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process input');
      }
      
      const result = await response.json();
      setLastResult(result);
      
      // Clear input on success
      if (result.saved) {
        setInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available in your browser');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput('');
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getActivityIcon = (type: string) => {
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

  const formatActivityData = (type: string, data: any) => {
    switch (type) {
      case 'weight':
        return `${data.weight} ${data.unit}`;
      case 'food':
        return `${data.meal || 'Meal'}: ${data.items?.map((i: any) => i.name).join(', ') || 'logged'}`;
      case 'workout':
        return `${data.activity}${data.distance ? ` ${data.distance}${data.distanceUnit}` : ''}${data.duration ? ` for ${data.duration} min` : ''}`;
      case 'mood':
        return `Feeling ${data.mood}`;
      case 'energy':
        return `Energy level: ${data.level}/10`;
      case 'sleep':
        return `${data.hours} hours of sleep`;
      case 'water':
        return `${data.amount} ${data.unit} of water`;
      default:
        return JSON.stringify(data);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Input Section */}
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
            placeholder="Tell me about your day... (e.g., 'weight 175', 'ran 5k', 'had eggs for breakfast')"
            className="flex-1 bg-bg text-text-primary px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading || isRecording}
          />
          
          <Button
            onClick={toggleRecording}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={`w-10 h-10 p-0 ${isRecording ? 'text-red-500' : ''}`}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="w-10 h-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {isRecording && (
          <p className="text-sm text-text-secondary mt-2 animate-pulse">
            🎤 Listening...
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {lastResult && (
        <div className="space-y-3">
          {/* Parsed Activity */}
          {lastResult.parsed && (
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getActivityIcon(lastResult.parsed.type)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {lastResult.parsed.type.charAt(0).toUpperCase() + lastResult.parsed.type.slice(1)} Logged
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    {formatActivityData(lastResult.parsed.type, lastResult.parsed.data)}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-text-muted">
                      Confidence: {Math.round(lastResult.parsed.confidence * 100)}%
                    </span>
                    {lastResult.saved && (
                      <span className="text-xs text-green-400">✓ Saved</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coach Response */}
          {lastResult.coach && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="space-y-3">
                <p className="text-text-primary">{lastResult.coach.message}</p>
                
                {lastResult.coach.motivation && (
                  <p className="text-sm text-text-secondary italic">
                    💭 {lastResult.coach.motivation}
                  </p>
                )}
                
                {lastResult.coach.insights && lastResult.coach.insights.length > 0 && (
                  <div className="text-sm text-text-secondary">
                    <p className="font-semibold mb-1">Insights:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {lastResult.coach.insights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lastResult.coach.challenge && (
                  <div className="bg-primary/10 rounded p-2">
                    <p className="text-sm text-text-primary">
                      🎯 <strong>Challenge:</strong> {lastResult.coach.challenge}
                    </p>
                  </div>
                )}
                
                {lastResult.coach.nextSteps && lastResult.coach.nextSteps.length > 0 && (
                  <div className="text-sm text-text-secondary">
                    <p className="font-semibold mb-1">Next Steps:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {lastResult.coach.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Examples */}
      <div className="text-center">
        <p className="text-xs text-text-muted mb-2">Try saying:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'weight 175',
            'ran 5k',
            'had eggs for breakfast',
            'feeling great',
            'slept 8 hours',
            'energy 7/10'
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="text-xs px-2 py-1 bg-surface rounded border border-border hover:bg-surface-hover transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}