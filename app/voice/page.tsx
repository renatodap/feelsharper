'use client';

import { useState, useCallback } from 'react';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Mic, Activity, Brain, TrendingUp, Zap } from 'lucide-react';

export default function VoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscript = useCallback((text: string) => {
    console.log('Voice transcript:', text);
  }, []);

  const handleParsedData = useCallback(async (data: any) => {
    if (!user) {
      alert('Please sign in to save your logs');
      router.push('/auth/signin');
      return;
    }

    setIsProcessing(true);
    try {
      // Map the parsed data to the expected API format
      let type = 'mood'; // default
      let logData: any = {};
      
      if (data.intent === 'fitness' || data.structured_data?.activity_type === 'cardio' || data.structured_data?.activity_type === 'strength' || data.structured_data?.activity_type === 'sport') {
        type = 'exercise';
        logData = {
          activity: data.structured_data?.exercise_name || data.structured_data?.sport_name || data.original_text,
          duration: data.structured_data?.duration,
          distance: data.structured_data?.distance,
          distanceUnit: data.structured_data?.distance_unit,
          notes: data.subjective_notes || data.original_text
        };
      } else if (data.intent === 'nutrition') {
        type = 'food';
        logData = {
          items: data.entities?.foods || [data.original_text],
          meal: data.structured_data?.meal_type || 'snack'
        };
      } else if (data.intent === 'measurement' && data.entities?.weight) {
        type = 'weight';
        logData = {
          weight: data.entities.weight.value,
          unit: data.entities.weight.unit || 'lbs'
        };
      } else {
        type = 'mood';
        logData = {
          mood: data.structured_data?.mood || data.subjective_notes || data.original_text
        };
      }

      const response = await fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: logData,
          confidence: data.confidence / 100, // Convert to 0-1 scale
          rawText: data.original_text
        })
      });

      if (!response.ok) throw new Error('Failed to save log');
      
      const result = await response.json();
      if (result.success) {
        setLogs(prev => [{
          ...result.activity,
          original_text: data.original_text,
          confidence_level: data.confidence
        }, ...prev]);
      }
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save your log. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to use voice logging
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Voice Logging</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Speak naturally to log your activities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Workouts</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">"I ran 5k"</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <Brain className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-green-900 dark:text-green-300">Nutrition</p>
            <p className="text-xs text-green-700 dark:text-green-400">"Had eggs"</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Measurements</p>
            <p className="text-xs text-purple-700 dark:text-purple-400">"Weight 175"</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Wellness</p>
            <p className="text-xs text-orange-700 dark:text-orange-400">"Feeling great"</p>
          </Card>
        </div>
      </div>

      <VoiceInput 
        onTranscript={handleTranscript}
        onParsedData={handleParsedData}
      />

      {isProcessing && (
        <Card className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Saving your log...
          </p>
        </Card>
      )}

      {logs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Voice Logs</h2>
          <div className="space-y-3">
            {logs.map((log, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{log.original_text}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Type: {log.activity_type}</span>
                      <span>Confidence: {log.confidence_level}%</span>
                      <span>Source: Voice</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
        <h3 className="font-semibold mb-3">Tips for Better Voice Recognition</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Speak clearly and at a normal pace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Use simple, natural language like "I ran 5k" or "bench pressed 200 pounds"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Wait for the microphone to stop before starting a new recording</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>In noisy environments, hold your phone closer to your mouth</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Use the quick commands for common activities</span>
          </li>
        </ul>
      </div>
    </div>
  );
}