'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StrengthLogger } from './StrengthLogger';
import { CardioLogger } from './CardioLogger';
import { WorkoutTimer } from './WorkoutTimer';
import { WorkoutTemplates } from './WorkoutTemplates';
import { WorkoutSummary } from './WorkoutSummary';
import { 
  Dumbbell, 
  Heart, 
  Play, 
  Pause, 
  Square, 
  Save,
  Clock,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

type WorkoutType = 'strength' | 'cardio' | null;
type WorkoutState = 'selecting' | 'logging' | 'completed';

interface WorkoutSession {
  id: string;
  type: WorkoutType;
  startTime: Date;
  endTime?: Date;
  exercises: any[];
  notes: string;
  template?: string;
}

export function WorkoutLogger() {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('selecting');
  const [workoutType, setWorkoutType] = useState<WorkoutType>(null);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);

  // Check for template from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId) {
      // Load template and start workout
      startWorkoutFromTemplate(templateId);
    }
  }, []);

  const startWorkout = (type: WorkoutType) => {
    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      type,
      startTime: new Date(),
      exercises: [],
      notes: ''
    };
    
    setCurrentSession(session);
    setWorkoutType(type);
    setWorkoutState('logging');
    setIsTimerActive(true);
  };

  const startWorkoutFromTemplate = (templateId: string) => {
    // Load template data (mock for now)
    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      type: 'strength',
      startTime: new Date(),
      exercises: [],
      notes: '',
      template: templateId
    };
    
    setCurrentSession(session);
    setWorkoutType('strength');
    setWorkoutState('logging');
    setIsTimerActive(true);
  };

  const finishWorkout = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date()
      };
      setCurrentSession(updatedSession);
      setWorkoutState('completed');
      setIsTimerActive(false);
      
      // Save to database (Supabase)
      saveWorkoutToDatabase(updatedSession);
    }
  };

  const saveWorkoutToDatabase = async (session: WorkoutSession) => {
    // TODO: Implement Supabase save
    console.log('Saving workout:', session);
  };

  const resetWorkout = () => {
    setWorkoutState('selecting');
    setWorkoutType(null);
    setCurrentSession(null);
    setIsTimerActive(false);
    setElapsedTime(0);
    setRestTimer(0);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        if (restTimer > 0) {
          setRestTimer(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (workoutState === 'selecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Start Workout
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Choose your workout type or select from templates
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Workout Type Selection */}
            <div className="space-y-4">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow group" 
                    onClick={() => startWorkout('strength')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    45-75 min
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Strength Training
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Log sets, reps, weight, and RPE for compound and isolation exercises
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Track PRs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progressive Overload</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow group" 
                    onClick={() => startWorkout('cardio')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100">
                    <Heart className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    20-60 min
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Cardio Session
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Track distance, time, pace, heart rate zones, and perceived exertion
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>HR Zones</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>Intervals</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Templates */}
            <WorkoutTemplates onSelectTemplate={startWorkoutFromTemplate} />
          </div>
        </div>
      </div>
    );
  }

  if (workoutState === 'completed') {
    return (
      <WorkoutSummary 
        session={currentSession!} 
        onStartNew={resetWorkout}
        onViewProgress={() => window.location.href = '/dashboard'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header with Timer */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {workoutType === 'strength' ? 'Strength Training' : 'Cardio Session'}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {isTimerActive ? 'In Progress' : 'Paused'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTimerActive(!isTimerActive)}
            >
              {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={finishWorkout}
            >
              <Save className="h-4 w-4 mr-1" />
              Finish
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Logging Area */}
          <div className="lg:col-span-2">
            {workoutType === 'strength' ? (
              <StrengthLogger 
                session={currentSession!}
                onUpdateSession={setCurrentSession}
              />
            ) : (
              <CardioLogger 
                session={currentSession!}
                onUpdateSession={setCurrentSession}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WorkoutTimer 
              elapsedTime={elapsedTime}
              restTimer={restTimer}
              onSetRestTimer={setRestTimer}
              isActive={isTimerActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}