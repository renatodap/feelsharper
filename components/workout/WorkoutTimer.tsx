'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  Coffee,
  Zap,
  Volume2
} from 'lucide-react';

interface WorkoutTimerProps {
  elapsedTime: number;
  restTimer: number;
  onSetRestTimer: (seconds: number) => void;
  isActive: boolean;
}

export function WorkoutTimer({ elapsedTime, restTimer, onSetRestTimer, isActive }: WorkoutTimerProps) {
  const [customRestTime, setCustomRestTime] = useState(90);
  const [showCustom, setShowCustom] = useState(false);

  // Common rest periods (in seconds)
  const restPresets = [
    { label: '30s', value: 30, icon: '⚡', color: 'bg-green-50 text-green-600' },
    { label: '60s', value: 60, icon: '💪', color: 'bg-blue-50 text-blue-600' },
    { label: '90s', value: 90, icon: '🔥', color: 'bg-orange-50 text-orange-600' },
    { label: '2m', value: 120, icon: '💯', color: 'bg-purple-50 text-purple-600' },
    { label: '3m', value: 180, icon: '🏋️', color: 'bg-red-50 text-red-600' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (duration: number) => {
    onSetRestTimer(duration);
    
    // Play sound notification (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      // Request notification permission on first use
    }
  };

  const resetRestTimer = () => {
    onSetRestTimer(0);
  };

  // Audio notification when rest timer ends
  useEffect(() => {
    if (restTimer === 1) { // 1 second left
      // Simple audio beep (you can replace with actual audio file)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Rest complete');
        utterance.rate = 1.5;
        utterance.volume = 0.5;
        speechSynthesis.speak(utterance);
      }
    }
  }, [restTimer]);

  const getRestTimerColor = () => {
    if (restTimer === 0) return 'text-slate-600';
    if (restTimer <= 10) return 'text-red-600 animate-pulse';
    if (restTimer <= 30) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getWorkoutPhase = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor(elapsedTime / 60);
    
    if (minutes < 10) return 'Warm-up';
    if (minutes < 45) return 'Main Sets';
    if (minutes < 60) return 'Accessories';
    return 'Cool Down';
  };

  return (
    <div className="space-y-6">
      {/* Main Timer */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Workout Timer
          </h3>
          <Badge 
            variant="secondary" 
            className={`${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
          >
            {isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>

        {/* Elapsed Time Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {getWorkoutPhase()}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-slate-600" />
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {Math.floor(elapsedTime / 60)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">minutes</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Zap className="h-4 w-4 mx-auto mb-1 text-slate-600" />
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {Math.round((elapsedTime / 60) / 45 * 100)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">complete</div>
          </div>
        </div>
      </Card>

      {/* Rest Timer */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Rest Timer
          </h3>
          {restTimer > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetRestTimer}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Rest Timer Display */}
        {restTimer > 0 ? (
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${getRestTimerColor()}`}>
              {formatTime(restTimer)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {restTimer <= 10 ? 'Almost ready!' : 'Rest in progress'}
            </div>
            {restTimer <= 5 && restTimer > 0 && (
              <div className="mt-2">
                <Badge className="bg-red-100 text-red-800 animate-bounce">
                  Get Ready! 🔥
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mb-6 text-slate-600 dark:text-slate-400">
            <Timer className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select rest duration</p>
          </div>
        )}

        {/* Rest Timer Presets */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {restPresets.slice(0, 4).map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              onClick={() => startRestTimer(preset.value)}
              className={`${preset.color} border-0 text-xs`}
              disabled={restTimer > 0}
            >
              <span className="mr-1">{preset.icon}</span>
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startRestTimer(restPresets[4].value)}
            className={`${restPresets[4].color} border-0 text-xs`}
            disabled={restTimer > 0}
          >
            <span className="mr-1">{restPresets[4].icon}</span>
            {restPresets[4].label}
          </Button>
        </div>

        {/* Custom Rest Timer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customRestTime}
              onChange={(e) => setCustomRestTime(parseInt(e.target.value) || 90)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 text-sm"
              min="5"
              max="600"
              step="5"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">sec</span>
            <Button
              size="sm"
              onClick={() => startRestTimer(customRestTime)}
              disabled={restTimer > 0}
            >
              Start
            </Button>
          </div>
        </div>
      </Card>

      {/* Session Stats */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Session Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Total Rest
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              8:30
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Active Time
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatTime(elapsedTime - 510)} {/* Mock rest time */}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Sets Completed
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              12/16
            </span>
          </div>
        </div>

        {/* Estimated Finish Time */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Estimated finish time
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {new Date(Date.now() + (15 * 60 * 1000)).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}