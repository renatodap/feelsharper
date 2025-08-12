'use client';

import React, { useState, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/TypographyWrapper';
import Button from '@/components/ui/Button';
import { 
  Mic, 
  MicOff, 
  Check, 
  X, 
  Utensils, 
  Dumbbell, 
  Moon, 
  Heart,
  MessageSquare
} from 'lucide-react';

interface VoiceLogEntry {
  id: string;
  type: 'workout' | 'meal' | 'sleep' | 'mood' | 'general';
  transcript: string;
  parsedData: any;
  timestamp: Date;
  confidence: number;
}

interface ParsedWorkout {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

interface ParsedMeal {
  food: string;
  quantity?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export default function VoiceLogger() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recentEntries, setRecentEntries] = useState<VoiceLogEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          processTranscript(transcript);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    try {
      // Start audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      monitorAudioLevel();

      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice logging');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  const processTranscript = async (text: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing to parse the transcript
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const entry = parseTranscript(text);
    setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
    setTranscript('');
    setIsProcessing(false);
  };

  const parseTranscript = (text: string): VoiceLogEntry => {
    const lowerText = text.toLowerCase();
    
    // Workout detection
    if (lowerText.includes('workout') || lowerText.includes('exercise') || lowerText.includes('reps') || lowerText.includes('sets')) {
      const parsedWorkout = parseWorkoutText(text);
      return {
        id: Date.now().toString(),
        type: 'workout',
        transcript: text,
        parsedData: parsedWorkout,
        timestamp: new Date(),
        confidence: 0.85
      };
    }
    
    // Meal detection
    if (lowerText.includes('ate') || lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('breakfast') || lowerText.includes('lunch') || lowerText.includes('dinner')) {
      const parsedMeal = parseMealText(text);
      return {
        id: Date.now().toString(),
        type: 'meal',
        transcript: text,
        parsedData: parsedMeal,
        timestamp: new Date(),
        confidence: 0.80
      };
    }
    
    // Sleep detection
    if (lowerText.includes('sleep') || lowerText.includes('slept') || lowerText.includes('hours')) {
      return {
        id: Date.now().toString(),
        type: 'sleep',
        transcript: text,
        parsedData: { hours: extractNumber(text), quality: extractSleepQuality(text) },
        timestamp: new Date(),
        confidence: 0.75
      };
    }
    
    // Mood detection
    if (lowerText.includes('feel') || lowerText.includes('mood') || lowerText.includes('energy')) {
      return {
        id: Date.now().toString(),
        type: 'mood',
        transcript: text,
        parsedData: { mood: extractMood(text), energy: extractEnergy(text) },
        timestamp: new Date(),
        confidence: 0.70
      };
    }
    
    // General entry
    return {
      id: Date.now().toString(),
      type: 'general',
      transcript: text,
      parsedData: { note: text },
      timestamp: new Date(),
      confidence: 0.60
    };
  };

  const parseWorkoutText = (text: string): ParsedWorkout => {
    // Simple parsing logic - in production, this would be more sophisticated
    const exerciseMatch = text.match(/(?:did|completed|finished)\s+(\w+(?:\s+\w+)*?)(?:\s+(?:for|with))/i);
    const setsMatch = text.match(/(\d+)\s+sets?/i);
    const repsMatch = text.match(/(\d+)\s+reps?/i);
    const weightMatch = text.match(/(\d+)\s*(?:lbs?|pounds?|kg|kilograms?)/i);
    
    return {
      exercise: exerciseMatch?.[1] || 'Unknown exercise',
      sets: parseInt(setsMatch?.[1] || '0'),
      reps: parseInt(repsMatch?.[1] || '0'),
      weight: weightMatch ? parseInt(weightMatch[1]) : undefined,
      notes: text
    };
  };

  const parseMealText = (text: string): ParsedMeal => {
    // Simple meal parsing - in production, this would integrate with nutrition APIs
    const foodMatch = text.match(/(?:ate|had|consumed)\s+(.+?)(?:\s+(?:for|with|and)|$)/i);
    
    return {
      food: foodMatch?.[1] || 'Unknown food',
      quantity: extractQuantity(text),
      calories: estimateCalories(text),
      protein: estimateProtein(text),
      carbs: estimateCarbs(text),
      fat: estimateFat(text)
    };
  };

  const extractNumber = (text: string): number => {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const extractQuantity = (text: string): string | undefined => {
    const match = text.match(/(\d+(?:\.\d+)?\s*(?:cups?|oz|ounces?|grams?|g|lbs?|pounds?))/i);
    return match?.[1];
  };

  const extractSleepQuality = (text: string): number => {
    if (text.includes('great') || text.includes('excellent')) return 5;
    if (text.includes('good') || text.includes('well')) return 4;
    if (text.includes('okay') || text.includes('decent')) return 3;
    if (text.includes('poor') || text.includes('bad')) return 2;
    if (text.includes('terrible') || text.includes('awful')) return 1;
    return 3; // default
  };

  const extractMood = (text: string): number => {
    if (text.includes('amazing') || text.includes('fantastic')) return 5;
    if (text.includes('good') || text.includes('great')) return 4;
    if (text.includes('okay') || text.includes('fine')) return 3;
    if (text.includes('down') || text.includes('low')) return 2;
    if (text.includes('terrible') || text.includes('awful')) return 1;
    return 3; // default
  };

  const extractEnergy = (text: string): number => {
    if (text.includes('energized') || text.includes('pumped')) return 5;
    if (text.includes('good energy') || text.includes('alert')) return 4;
    if (text.includes('okay') || text.includes('normal')) return 3;
    if (text.includes('tired') || text.includes('low energy')) return 2;
    if (text.includes('exhausted') || text.includes('drained')) return 1;
    return 3; // default
  };

  const estimateCalories = (text: string): number | undefined => {
    // Simple estimation - in production, this would use nutrition APIs
    if (text.includes('chicken')) return 200;
    if (text.includes('rice')) return 150;
    if (text.includes('salad')) return 100;
    return undefined;
  };

  const estimateProtein = (text: string): number | undefined => {
    if (text.includes('chicken')) return 25;
    if (text.includes('eggs')) return 12;
    return undefined;
  };

  const estimateCarbs = (text: string): number | undefined => {
    if (text.includes('rice')) return 30;
    if (text.includes('bread')) return 20;
    return undefined;
  };

  const estimateFat = (text: string): number | undefined => {
    if (text.includes('avocado')) return 15;
    if (text.includes('nuts')) return 10;
    return undefined;
  };

  const confirmEntry = (entry: VoiceLogEntry) => {
    // In production, this would save to the database
    console.log('Confirmed entry:', entry);
    setRecentEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  const rejectEntry = (entryId: string) => {
    setRecentEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="w-5 h-5" />;
      case 'meal': return <Utensils className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'mood': return <Heart className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'text-blue-500';
      case 'meal': return 'text-green-500';
      case 'sleep': return 'text-purple-500';
      case 'mood': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Input Section */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <Typography variant="h3" className="text-xl font-bold mb-2">
            Voice Logger
          </Typography>
          <Typography variant="body2" className="text-slate-600">
            Just speak naturally - &quot;I did 3 sets of 10 push-ups&quot; or &quot;Had chicken and rice for lunch&quot;
          </Typography>
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Button
              size="xl"
              variant={isListening ? "secondary" : "primary"}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`rounded-full w-20 h-20 ${isListening ? 'animate-pulse' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            
            {/* Audio Level Indicator */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-50"
                   style={{
                     transform: `scale(${1 + audioLevel * 0.5})`,
                     transition: 'transform 0.1s ease-out'
                   }} />
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          {isListening && (
            <Typography variant="body2" className="text-green-600 font-medium">
              🎤 Listening... Speak now
            </Typography>
          )}
          {isProcessing && (
            <Typography variant="body2" className="text-blue-600 font-medium">
              🤖 Processing your input...
            </Typography>
          )}
          {!isListening && !isProcessing && (
            <Typography variant="body2" className="text-slate-600">
              Tap the microphone to start logging
            </Typography>
          )}
        </div>

        {/* Live Transcript */}
        {transcript && (
          <Card className="p-4 bg-slate-50 border-dashed">
            <Typography variant="body2" className="text-slate-700">
              &quot;{transcript}&quot;
            </Typography>
          </Card>
        )}
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="p-6">
          <Typography variant="h4" className="font-semibold mb-4">
            Confirm Your Entries
          </Typography>
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <Card key={entry.id} className="p-4 border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`mr-3 ${getTypeColor(entry.type)}`}>
                      {getTypeIcon(entry.type)}
                    </div>
                    <div>
                      <Typography variant="body2" className="font-medium capitalize">
                        {entry.type} Entry
                      </Typography>
                      <Typography variant="body2" className="text-slate-500 text-xs">
                        {entry.confidence * 100}% confidence
                      </Typography>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirmEntry(entry)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rejectEntry(entry.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Typography variant="body2" className="text-slate-600 mb-3 italic">
                  &quot;{entry.transcript}&quot;
                </Typography>
                
                {/* Parsed Data Display */}
                <div className="bg-slate-50 rounded p-3">
                  {entry.type === 'workout' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><strong>Exercise:</strong> {entry.parsedData.exercise}</div>
                      <div><strong>Sets:</strong> {entry.parsedData.sets}</div>
                      <div><strong>Reps:</strong> {entry.parsedData.reps}</div>
                      {entry.parsedData.weight && <div><strong>Weight:</strong> {entry.parsedData.weight}lbs</div>}
                    </div>
                  )}
                  
                  {entry.type === 'meal' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div><strong>Food:</strong> {entry.parsedData.food}</div>
                      {entry.parsedData.quantity && <div><strong>Quantity:</strong> {entry.parsedData.quantity}</div>}
                      {entry.parsedData.calories && <div><strong>Calories:</strong> {entry.parsedData.calories}</div>}
                    </div>
                  )}
                  
                  {entry.type === 'sleep' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Hours:</strong> {entry.parsedData.hours}</div>
                      <div><strong>Quality:</strong> {entry.parsedData.quality}/5</div>
                    </div>
                  )}
                  
                  {entry.type === 'mood' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Mood:</strong> {entry.parsedData.mood}/5</div>
                      <div><strong>Energy:</strong> {entry.parsedData.energy}/5</div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Examples */}
      <Card className="p-6 bg-slate-50">
        <Typography variant="h4" className="font-semibold mb-4">
          Try saying things like:
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography variant="body2" className="font-medium text-blue-600 mb-2">
              🏋️ Workouts
            </Typography>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>&quot;Did 3 sets of 10 push-ups&quot;</li>
              <li>&quot;Bench pressed 185 for 5 reps&quot;</li>
              <li>&quot;30 minute run at moderate pace&quot;</li>
            </ul>
          </div>
          <div>
            <Typography variant="body2" className="font-medium text-green-600 mb-2">
              🍽️ Meals
            </Typography>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>&quot;Had chicken and rice for lunch&quot;</li>
              <li>&quot;Ate 2 eggs and toast for breakfast&quot;</li>
              <li>&quot;Protein shake after workout&quot;</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
