'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Camera, 
  Upload,
  Check,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ParsedActivity {
  type: 'food' | 'weight' | 'exercise' | 'mood' | 'unknown';
  data: any;
  confidence: number;
  rawText: string;
}

interface UnifiedInputProps {
  onActivityLogged?: (activity: ParsedActivity) => void;
  className?: string;
}

export default function UnifiedNaturalInput({ onActivityLogged, className = '' }: UnifiedInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedActivity | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process with AI (send to backend)
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/ai/parse-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success && data.text) {
        setInput(data.text);
        // Auto-submit for parsing
        await handleSubmit(data.text);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try typing instead.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (text?: string) => {
    const inputText = text || input;
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setNeedsConfirmation(false);
    setParsedResult(null);
    setAiResponse('');

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      const data = await response.json();
      
      if (data.success) {
        // Handle multiple activities
        if (data.multipleActivities && data.allActivities) {
          let successCount = 0;
          for (const activity of data.allActivities) {
            if (activity.confidence > 0.8) {
              await autoLog(activity);
              successCount++;
            }
          }
          if (successCount > 0) {
            setAiResponse(`✓ Logged ${successCount} activities: ${data.allActivities.map((a: any) => a.type).join(', ')}`);
          }
          setParsedResult(null);
        } else {
          // Single activity
          setParsedResult(data.parsed);
          setAiResponse(data.coach?.message || '');

          // Auto-log if confidence is high (>80%)
          if (data.parsed.confidence > 0.8) {
            await autoLog(data.parsed);
          } else if (data.parsed.confidence > 0.5) {
            // Need confirmation for medium confidence
            setNeedsConfirmation(true);
          } else {
            // Too uncertain, ask user to clarify
            setAiResponse("I'm not quite sure what you meant. Could you be more specific? For example: 'weight 175' or 'ran 5k' or 'ate chicken salad'");
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse input:', error);
      setAiResponse('Sorry, I had trouble understanding that. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const autoLog = async (activity: ParsedActivity) => {
    try {
      // Save to database
      const response = await fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activity, demo: true }) // Add demo flag for testing
      });

      if (response.ok) {
        onActivityLogged?.(activity);
        
        // Show success message based on type
        const messages = {
          weight: `✓ Weight logged: ${activity.data.weight} ${activity.data.unit || 'lbs'}`,
          food: `✓ Food logged: ${activity.data.items?.map((i: any) => i.name).join(', ') || activity.rawText}`,
          exercise: `✓ Exercise logged: ${activity.data.activity || activity.rawText}`,
          mood: `✓ Mood logged: ${activity.data.mood || activity.rawText}`,
          unknown: '✓ Activity logged'
        };
        
        setAiResponse(messages[activity.type] || messages.unknown);
        
        // Clear input after successful log
        setTimeout(() => {
          setInput('');
          setParsedResult(null);
          setPhotoPreview(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      setAiResponse('Failed to save. Please try again.');
    }
  };

  const handleConfirm = () => {
    if (parsedResult) {
      autoLog(parsedResult);
      setNeedsConfirmation(false);
    }
  };

  const handleReject = () => {
    setNeedsConfirmation(false);
    setParsedResult(null);
    setAiResponse("Please tell me more specifically what you'd like to log.");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'weight': return '⚖️';
      case 'food': return '🍽️';
      case 'exercise': return '💪';
      case 'mood': return '😊';
      default: return '📝';
    }
  };

  const getActivitySummary = (activity: ParsedActivity) => {
    switch (activity.type) {
      case 'weight':
        return `Weight: ${activity.data.weight} ${activity.data.unit || 'lbs'}`;
      case 'food':
        return `Food: ${activity.data.items?.map((i: any) => i.name).join(', ') || activity.rawText}`;
      case 'exercise':
        return `Exercise: ${activity.data.activity || activity.rawText}`;
      case 'mood':
        return `Mood: ${activity.data.mood || activity.rawText}`;
      default:
        return activity.rawText;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="p-4 bg-surface border-border">
        <div className="space-y-4">
          {/* AI Response */}
          {aiResponse && !needsConfirmation && (
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg animate-fade-in">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-text-primary">{aiResponse}</p>
            </div>
          )}

          {/* Confirmation UI */}
          {needsConfirmation && parsedResult && (
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Please confirm:
                  </p>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <span className="text-lg">{getActivityIcon(parsedResult.type)}</span>
                    <span>{getActivitySummary(parsedResult)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Yes, log this
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  No, try again
                </Button>
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {photoPreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={photoPreview} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Tell me anything: 'weight 175' or 'ran 5k' or 'ate chicken salad' or 'feeling great today'"
              className="flex-1 bg-bg text-text-primary px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              disabled={isProcessing || isRecording}
            />
            
            <div className="flex flex-col gap-2">
              {/* Voice Input */}
              <Button
                onClick={toggleRecording}
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                className={`w-10 h-10 p-0 ${isRecording ? 'bg-red-500/20 text-red-500' : ''}`}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              
              {/* Photo Input */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                className="w-10 h-10 p-0"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {/* Submit Button */}
              <Button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isProcessing}
                size="sm"
                className="w-10 h-10 p-0"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Input hints */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <span>{isRecording ? 'Recording...' : 'Click mic to speak'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}