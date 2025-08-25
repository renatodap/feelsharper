'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onParsedData?: (data: any) => void;
  className?: string;
}

const TOP_COMMANDS = [
  "I ran 5k today",
  "Weight 175 pounds", 
  "Bench press 3 sets of 10",
  "Feeling great today",
  "Had eggs and toast for breakfast",
  "Played tennis for 2 hours",
  "Slept 8 hours",
  "Drank 8 glasses of water",
  "Did 30 minutes of yoga",
  "Protein shake post workout"
];

export const VoiceInput: React.FC<VoiceInputProps> = React.memo(({ 
  onTranscript, 
  onParsedData,
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;
        
        recognition.onstart = () => {
          setError(null);
          setTranscript('');
          setInterimTranscript('');
          setParsedResult(null);
          
          // Mobile optimization: prevent screen timeout during recording
          if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
            navigator.wakeLock.request('screen').catch(() => {
              // WakeLock failed, ignore
            });
          }
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
              const conf = result[0].confidence || 0.9;
              setConfidence(Math.round(conf * 100));
            } else {
              interim += result[0].transcript;
            }
          }
          
          if (final) {
            setTranscript(prev => prev + ' ' + final);
            setInterimTranscript('');
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
              if (isListening) {
                stopListening();
              }
            }, 2000);
          } else {
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          switch (event.error) {
            case 'not-allowed':
              setError('Microphone permission denied. Please allow microphone access.');
              setPermissionGranted(false);
              break;
            case 'no-speech':
              setError('No speech detected. Please try again.');
              break;
            case 'audio-capture':
              setError('No microphone found. Please check your device.');
              break;
            case 'network':
              setError('Network error. Please check your connection.');
              break;
            default:
              setError('An error occurred. Please try again.');
          }
          
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      if (permissionGranted === null) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
      }

      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start listening. Please check microphone permissions.');
      setPermissionGranted(false);
    }
  }, [permissionGranted]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      const finalTranscript = (transcript + ' ' + interimTranscript).trim();
      if (finalTranscript) {
        onTranscript(finalTranscript);
        parseTranscript(finalTranscript);
      }
    }
  }, [isListening, transcript, interimTranscript, onTranscript]);

  const parseTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    setIsParsing(true);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to parse');
      
      const data = await response.json();
      setParsedResult(data);
      
      // Check if confidence is low and needs confirmation
      if (data.confidence < 60) {
        const confirmed = window.confirm(
          `I'm ${data.confidence}% confident that you said: "${text}"\n` +
          `Interpreted as: ${data.intent} - ${JSON.stringify(data.structured_data)}\n\n` +
          `Would you like to save this entry?`
        );
        
        if (!confirmed) {
          setError('Entry cancelled. Please try speaking more clearly.');
          setParsedResult(null);
          return;
        }
      }
      
      if (onParsedData) {
        onParsedData(data);
      }
    } catch (err) {
      console.error('Error parsing transcript:', err);
      setError('Failed to parse your input. Please try again.');
    } finally {
      setIsParsing(false);
    }
  }, [onParsedData]);

  const handleQuickCommand = useCallback((command: string) => {
    setTranscript(command);
    onTranscript(command);
    parseTranscript(command);
  }, [onTranscript, parseTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6">
        <div className="space-y-4">
          {permissionGranted === false && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Microphone Permission Required
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    To use voice input, please allow microphone access when prompted.
                    Your audio is processed locally and never stored.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center">
            <Button
              onClick={toggleListening}
              variant={isListening ? 'secondary' : 'primary'}
              size="lg"
              className="relative min-h-[60px] px-8 text-lg font-semibold touch-manipulation select-none"
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6 mr-3" />
                  <span>Stop Recording</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 mr-3" />
                  <span>Start Recording</span>
                </>
              )}
            </Button>
          </div>

          {(transcript || interimTranscript) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="space-y-2">
                {transcript && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Heard:
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">{transcript}</p>
                    {confidence !== null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Confidence: {confidence}%
                      </p>
                    )}
                  </div>
                )}
                {interimTranscript && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Listening...
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      {interimTranscript}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isParsing && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Processing your input...
              </span>
            </div>
          )}

          {parsedResult && !isParsing && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Successfully Logged
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Intent: {parsedResult.intent} ({parsedResult.confidence}% confidence)
                  </p>
                  {parsedResult.structured_data && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-500">
                      {parsedResult.structured_data.activity_type && (
                        <p>Type: {parsedResult.structured_data.activity_type}</p>
                      )}
                      {parsedResult.structured_data.exercise_name && (
                        <p>Exercise: {parsedResult.structured_data.exercise_name}</p>
                      )}
                      {parsedResult.structured_data.sport_name && (
                        <p>Sport: {parsedResult.structured_data.sport_name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Voice Commands
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOP_COMMANDS.map((command, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(command)}
              className="text-left text-sm md:text-xs px-4 py-4 md:py-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation min-h-[50px] md:min-h-auto"
            >
              "{command}"
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
});

VoiceInput.displayName = 'VoiceInput';