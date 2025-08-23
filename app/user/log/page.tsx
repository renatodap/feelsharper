'use client';

import { useState, useEffect } from 'react';
import { 
  Mic,
  MicOff,
  Send,
  Clock,
  Zap,
  Plus,
  CheckCircle
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Common logs based on user habits
const commonLogs = [
  { id: 1, text: "Morning 5K run", category: "cardio", icon: "🏃", habit: "Your usual morning run" },
  { id: 2, text: "Tennis practice - 90 min", category: "sport", icon: "🎾", habit: "Tuesday tennis session" },
  { id: 3, text: "Gym - upper body", category: "strength", icon: "💪", habit: "Strength day routine" },
  { id: 4, text: "Protein shake", category: "nutrition", icon: "🥤", habit: "Post-workout nutrition" },
  { id: 5, text: "8 hours sleep", category: "wellness", icon: "😴", habit: "Recovery sleep" },
  { id: 6, text: "Weight: 175 lbs", category: "measurement", icon: "⚖️", habit: "Morning weigh-in" }
];

// Smart defaults based on time of day
const getSmartDefault = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "Morning workout - ";
  if (hour >= 11 && hour < 14) return "Lunch - ";
  if (hour >= 16 && hour < 19) return "Evening training - ";
  if (hour >= 20 && hour < 23) return "Dinner - ";
  return "";
};

export default function QuickLogPage() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoCompleteHint, setAutoCompleteHint] = useState('');

  useEffect(() => {
    // Set smart default on mount
    setInput(getSmartDefault());
  }, []);

  useEffect(() => {
    // Auto-complete based on patterns
    if (input.length > 3) {
      const matches = commonLogs.filter(log => 
        log.text.toLowerCase().startsWith(input.toLowerCase())
      );
      if (matches.length > 0) {
        setAutoCompleteHint(matches[0].text);
      } else {
        setAutoCompleteHint('');
      }
    } else {
      setAutoCompleteHint('');
    }
  }, [input]);

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const handleSubmit = (text: string) => {
    if (text.trim()) {
      setRecentLogs([text, ...recentLogs.slice(0, 2)]);
      setInput('');
      setAutoCompleteHint('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleQuickLog = (log: typeof commonLogs[0]) => {
    handleSubmit(log.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(input);
    } else if (e.key === 'Tab' && autoCompleteHint) {
      e.preventDefault();
      setInput(autoCompleteHint);
      setAutoCompleteHint('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-white mb-2">
          Quick <span className="text-feel-primary lightning-text">Log</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Frictionless tracking - just say what you did
        </p>
      </div>

      {/* Voice Input Primary */}
      <div className="mb-8">
        <div className="bg-sharpened-coal/50 backdrop-blur-sm border border-feel-primary/30 p-8"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
             }}>
          <div className="text-center mb-6">
            <button
              onClick={handleVoiceToggle}
              className={`relative w-24 h-24 mx-auto mb-4 transition-all ${
                isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-feel-primary/20 hover:bg-feel-primary/30'
              }`}
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12 text-red-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <Mic className="w-12 h-12 text-feel-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
            <p className="text-white font-heading font-bold text-lg mb-1">
              {isRecording ? 'Listening...' : 'Tap to speak'}
            </p>
            <p className="text-sharpened-gray font-body text-sm">
              One-tap voice recording for hands-free logging
            </p>
          </div>

          {/* Text Input with Auto-complete */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Or type here... (Tab to autocomplete)"
              className="w-full px-6 py-4 bg-sharpened-void/50 border border-sharpened-charcoal text-white font-body text-lg placeholder-sharpened-gray focus:outline-none focus:border-feel-primary/50 transition-colors pr-12"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
              }}
            />
            {autoCompleteHint && input && (
              <div className="absolute inset-0 px-6 py-4 pointer-events-none">
                <span className="text-sharpened-charcoal font-body text-lg">{input}</span>
                <span className="text-sharpened-charcoal/50 font-body text-lg">{autoCompleteHint.slice(input.length)}</span>
              </div>
            )}
            <button
              onClick={() => handleSubmit(input)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-feel-primary hover:text-feel-secondary transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Success Feedback */}
          {showSuccess && (
            <div className="mt-4 flex items-center gap-2 text-green-400 animate-fade-in">
              <CheckCircle className="w-5 h-5" />
              <span className="font-body">Logged successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Common Logs - Habit Signatures */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-white mb-4">Your Common Logs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonLogs.map((log) => (
            <button
              key={log.id}
              onClick={() => handleQuickLog(log)}
              className="group bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal hover:border-feel-primary/50 p-4 transition-all text-left"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{log.icon}</span>
                <div className="flex-1">
                  <div className="font-body font-semibold text-white group-hover:text-feel-primary transition-colors">
                    {log.text}
                  </div>
                  <div className="text-sm text-sharpened-gray font-body italic">
                    {log.habit}
                  </div>
                </div>
                <Plus className="w-5 h-5 text-sharpened-gray group-hover:text-feel-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Just Logged</h2>
          <div className="space-y-2">
            {recentLogs.map((log, index) => (
              <div
                key={index}
                className="bg-sharpened-coal/30 backdrop-blur-sm border border-green-400/30 p-3 flex items-center gap-3"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-body text-white">{log}</span>
                <span className="text-xs text-sharpened-gray font-body ml-auto">Just now</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Defaults Info */}
      <div className="mt-8 p-4 bg-sharpened-coal/20 border border-sharpened-charcoal"
           style={{
             clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
           }}>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-feel-primary" />
          <div>
            <p className="font-body font-semibold text-white">Smart Defaults Active</p>
            <p className="text-sm text-sharpened-gray font-body">
              Input suggestions based on your typical {new Date().getHours() >= 16 ? 'evening' : new Date().getHours() >= 12 ? 'afternoon' : 'morning'} activities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}