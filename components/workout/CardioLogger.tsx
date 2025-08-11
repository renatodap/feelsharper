'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Clock, 
  Heart,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface CardioSession {
  id: string;
  type: 'run' | 'bike' | 'swim' | 'walk' | 'row' | 'elliptical' | 'other';
  duration: number; // seconds
  distance?: number; // km
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPace?: number; // seconds per km
  calories?: number;
  elevation?: number; // meters
  intervals?: CardioInterval[];
  notes?: string;
}

interface CardioInterval {
  id: string;
  duration: number; // seconds
  heartRate?: number;
  pace?: number;
  intensity: 'easy' | 'moderate' | 'hard' | 'max';
}

interface CardioLoggerProps {
  session: any;
  onUpdateSession: (session: any) => void;
}

export function CardioLogger({ session, onUpdateSession }: CardioLoggerProps) {
  const [cardioSession, setCardioSession] = useState<CardioSession>({
    id: `cardio_${Date.now()}`,
    type: 'run',
    duration: 0,
    intervals: []
  });

  const [isRecording, setIsRecording] = useState(false);
  const [currentInterval, setCurrentInterval] = useState<CardioInterval | null>(null);
  const [intervalTimer, setIntervalTimer] = useState(0);

  const cardioTypes = [
    { id: 'run', label: 'Running', icon: '🏃', color: 'bg-red-50 text-red-600' },
    { id: 'bike', label: 'Cycling', icon: '🚴', color: 'bg-blue-50 text-blue-600' },
    { id: 'swim', label: 'Swimming', icon: '🏊', color: 'bg-cyan-50 text-cyan-600' },
    { id: 'walk', label: 'Walking', icon: '🚶', color: 'bg-green-50 text-green-600' },
    { id: 'row', label: 'Rowing', icon: '🚣', color: 'bg-purple-50 text-purple-600' },
    { id: 'elliptical', label: 'Elliptical', icon: '⚡', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'other', label: 'Other', icon: '💪', color: 'bg-slate-50 text-slate-600' }
  ] as const;

  const intensityLevels = [
    { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800', hr: '60-70% HRMax' },
    { id: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800', hr: '70-80% HRMax' },
    { id: 'hard', label: 'Hard', color: 'bg-orange-100 text-orange-800', hr: '80-90% HRMax' },
    { id: 'max', label: 'Max', color: 'bg-red-100 text-red-800', hr: '90-100% HRMax' }
  ] as const;

  const updateCardioSession = (updates: Partial<CardioSession>) => {
    const updatedSession = { ...cardioSession, ...updates };
    setCardioSession(updatedSession);
    onUpdateSession({
      ...session,
      cardioData: updatedSession
    });
  };

  const startInterval = (intensity: CardioInterval['intensity']) => {
    if (currentInterval) {
      // Finish current interval
      const finishedInterval = {
        ...currentInterval,
        duration: intervalTimer
      };
      updateCardioSession({
        intervals: [...(cardioSession.intervals || []), finishedInterval]
      });
    }

    // Start new interval
    const newInterval: CardioInterval = {
      id: `interval_${Date.now()}`,
      duration: 0,
      intensity
    };
    setCurrentInterval(newInterval);
    setIntervalTimer(0);
    setIsRecording(true);
  };

  const finishInterval = () => {
    if (currentInterval) {
      const finishedInterval = {
        ...currentInterval,
        duration: intervalTimer
      };
      updateCardioSession({
        intervals: [...(cardioSession.intervals || []), finishedInterval]
      });
      setCurrentInterval(null);
      setIntervalTimer(0);
    }
    setIsRecording(false);
  };

  const calculatePace = (timeSeconds: number, distanceKm: number) => {
    if (!distanceKm || distanceKm === 0) return 0;
    return timeSeconds / distanceKm; // seconds per km
  };

  const formatPace = (paceSecondsPerKm: number) => {
    const minutes = Math.floor(paceSecondsPerKm / 60);
    const seconds = Math.round(paceSecondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDistance = () => {
    return cardioSession.distance || 0;
  };

  const getAveragePace = () => {
    if (cardioSession.duration && cardioSession.distance) {
      return calculatePace(cardioSession.duration, cardioSession.distance);
    }
    return 0;
  };

  const getIntensityColor = (intensity: string) => {
    const level = intensityLevels.find(l => l.id === intensity);
    return level?.color || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Activity Type Selection */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Activity Type
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cardioTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateCardioSession({ type: type.id as any })}
              className={`p-3 rounded-lg border-2 transition-all ${
                cardioSession.type === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className={`text-2xl mb-1`}>{type.icon}</div>
              <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Session Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Session Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Minutes"
                value={Math.floor(cardioSession.duration / 60) || ''}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0;
                  const seconds = cardioSession.duration % 60;
                  updateCardioSession({ duration: minutes * 60 + seconds });
                }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Distance
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={cardioSession.distance || ''}
                onChange={(e) => updateCardioSession({ distance: parseFloat(e.target.value) || undefined })}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Avg Heart Rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="BPM"
                value={cardioSession.avgHeartRate || ''}
                onChange={(e) => updateCardioSession({ avgHeartRate: parseInt(e.target.value) || undefined })}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <Heart className="h-4 w-4 text-red-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Calories
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="kcal"
                value={cardioSession.calories || ''}
                onChange={(e) => updateCardioSession({ calories: parseInt(e.target.value) || undefined })}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Calculated Metrics */}
        {cardioSession.duration > 0 && cardioSession.distance && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatPace(getAveragePace())}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Pace</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatDuration(cardioSession.duration)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Time</div>
            </div>
          </div>
        )}
      </Card>

      {/* Interval Training */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Interval Training
          </h3>
          <Badge variant="secondary" className="text-xs">
            Optional
          </Badge>
        </div>

        {/* Current Interval */}
        {currentInterval && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Recording {currentInterval.intensity} interval
                </span>
              </div>
              <Badge className={getIntensityColor(currentInterval.intensity)}>
                {currentInterval.intensity}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {formatDuration(intervalTimer)}
              </span>
              <Button size="sm" onClick={finishInterval}>
                <Square className="h-4 w-4 mr-1" />
                Finish Interval
              </Button>
            </div>
          </div>
        )}

        {/* Interval Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {intensityLevels.map((level) => (
            <Button
              key={level.id}
              variant="outline"
              size="sm"
              onClick={() => startInterval(level.id)}
              disabled={isRecording && currentInterval?.intensity === level.id}
              className={`${level.color} border-0`}
            >
              <Activity className="h-4 w-4 mr-1" />
              {level.label}
            </Button>
          ))}
        </div>

        {/* Completed Intervals */}
        {cardioSession.intervals && cardioSession.intervals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Completed Intervals
            </h4>
            <div className="space-y-2">
              {cardioSession.intervals.map((interval, index) => (
                <div key={interval.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      #{index + 1}
                    </span>
                    <Badge className={getIntensityColor(interval.intensity)}>
                      {interval.intensity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>{formatDuration(interval.duration)}</span>
                    {interval.heartRate && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{interval.heartRate} bpm</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Session Notes */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Session Notes
        </h3>
        <textarea
          placeholder="How did the session feel? Route details, weather conditions, observations..."
          value={cardioSession.notes || ''}
          onChange={(e) => updateCardioSession({ notes: e.target.value })}
          className="w-full px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          rows={4}
        />
      </Card>
    </div>
  );
}