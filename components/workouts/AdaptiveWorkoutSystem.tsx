'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  Dumbbell, 
  Target, 
  Clock, 
  Brain,
  CheckCircle,
  Play,
  SkipForward,
  Plus,
  Minus,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  muscleGroups: string[];
  equipment: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  instructions: string[];
  videoUrl?: string;
  alternatives: string[];
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  targetReps: number;
  targetWeight?: number;
  targetDuration?: number; // for time-based exercises
  actualReps?: number;
  actualWeight?: number;
  actualDuration?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  restTime: number; // seconds
  completed: boolean;
}

interface Workout {
  id: string;
  title: string;
  type: 'strength' | 'cardio' | 'hybrid' | 'recovery';
  estimatedDuration: number; // minutes
  difficulty: number; // 1-5
  sets: WorkoutSet[];
  warmup: Exercise[];
  cooldown: Exercise[];
  adaptations: WorkoutAdaptation[];
  aiGenerated: boolean;
}

interface WorkoutAdaptation {
  id: string;
  reason: 'fatigue' | 'time_constraint' | 'equipment' | 'injury' | 'plateau' | 'progression';
  description: string;
  changes: {
    exerciseSwaps?: { from: string; to: string }[];
    intensityAdjustment?: number; // -2 to +2
    volumeAdjustment?: number; // percentage change
    restAdjustment?: number; // seconds change
  };
}

interface UserProgress {
  exerciseId: string;
  personalRecords: {
    maxWeight: number;
    maxReps: number;
    bestTime?: number;
  };
  recentPerformance: {
    date: Date;
    weight: number;
    reps: number;
    rpe: number;
  }[];
  progressTrend: 'improving' | 'plateauing' | 'declining';
  lastWorkout: Date;
}

export default function AdaptiveWorkoutSystem() {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [adaptationSuggestions, setAdaptationSuggestions] = useState<WorkoutAdaptation[]>([]);
  const [userFeedback, setUserFeedback] = useState<{ [setId: string]: 'easy' | 'perfect' | 'hard' }>({});

  useEffect(() => {
    loadUserProgress();
    generateTodaysWorkout();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutInProgress && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && isResting) {
      setIsResting(false);
      // Auto-advance to next set
    }
    return () => clearInterval(interval);
  }, [workoutInProgress, timer, isResting]);

  const loadUserProgress = () => {
    // Mock user progress data
    const mockProgress: UserProgress[] = [
      {
        exerciseId: 'bench_press',
        personalRecords: { maxWeight: 185, maxReps: 12 },
        recentPerformance: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), weight: 175, reps: 8, rpe: 7 },
          { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), weight: 170, reps: 10, rpe: 8 },
        ],
        progressTrend: 'improving',
        lastWorkout: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        exerciseId: 'squat',
        personalRecords: { maxWeight: 225, maxReps: 15 },
        recentPerformance: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), weight: 205, reps: 8, rpe: 8 },
          { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), weight: 205, reps: 8, rpe: 8 },
        ],
        progressTrend: 'plateauing',
        lastWorkout: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    setUserProgress(mockProgress);
  };

  const generateTodaysWorkout = () => {
    // AI-powered workout generation based on user progress, recovery, and goals
    const adaptiveWorkout: Workout = {
      id: 'today_' + Date.now(),
      title: "Upper Body Power & Progression",
      type: 'strength',
      estimatedDuration: 45,
      difficulty: 3,
      aiGenerated: true,
      warmup: [],
      cooldown: [],
      adaptations: [
        {
          id: 'adapt1',
          reason: 'plateau',
          description: 'Squat plateau detected - adding pause reps for strength',
          changes: {
            exerciseSwaps: [{ from: 'squat', to: 'pause_squat' }],
            intensityAdjustment: -1,
            volumeAdjustment: 10
          }
        }
      ],
      sets: [
        {
          id: 'set1',
          exerciseId: 'bench_press',
          targetReps: 8,
          targetWeight: 180,
          restTime: 180,
          completed: false
        },
        {
          id: 'set2',
          exerciseId: 'bench_press',
          targetReps: 8,
          targetWeight: 180,
          restTime: 180,
          completed: false
        },
        {
          id: 'set3',
          exerciseId: 'bench_press',
          targetReps: 6,
          targetWeight: 185,
          restTime: 180,
          completed: false
        },
        {
          id: 'set4',
          exerciseId: 'pause_squat',
          targetReps: 6,
          targetWeight: 195,
          restTime: 240,
          completed: false
        },
        {
          id: 'set5',
          exerciseId: 'pause_squat',
          targetReps: 6,
          targetWeight: 195,
          restTime: 240,
          completed: false
        }
      ]
    };

    setCurrentWorkout(adaptiveWorkout);
  };

  const startWorkout = () => {
    setWorkoutInProgress(true);
    setCurrentSetIndex(0);
  };

  const completeSet = (actualReps: number, actualWeight: number, rpe: number) => {
    if (!currentWorkout) return;

    const updatedSets = [...currentWorkout.sets];
    updatedSets[currentSetIndex] = {
      ...updatedSets[currentSetIndex],
      actualReps,
      actualWeight,
      rpe,
      completed: true
    };

    setCurrentWorkout({
      ...currentWorkout,
      sets: updatedSets
    });

    // Start rest timer
    setTimer(updatedSets[currentSetIndex].restTime);
    setIsResting(true);

    // Auto-adapt based on RPE
    if (rpe <= 6) {
      suggestProgression(currentSetIndex);
    } else if (rpe >= 9) {
      suggestRegression(currentSetIndex);
    }
  };

  const suggestProgression = (setIndex: number) => {
    const suggestion: WorkoutAdaptation = {
      id: 'prog_' + Date.now(),
      reason: 'progression',
      description: 'Great work! That looked easy. Want to increase the weight for next set?',
      changes: {
        intensityAdjustment: 1
      }
    };

    setAdaptationSuggestions(prev => [...prev, suggestion]);
  };

  const suggestRegression = (setIndex: number) => {
    const suggestion: WorkoutAdaptation = {
      id: 'regr_' + Date.now(),
      reason: 'fatigue',
      description: 'That was tough! Let\'s reduce the weight to maintain good form.',
      changes: {
        intensityAdjustment: -1
      }
    };

    setAdaptationSuggestions(prev => [...prev, suggestion]);
  };

  const nextSet = () => {
    if (currentSetIndex < (currentWorkout?.sets.length || 0) - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setIsResting(false);
      setTimer(0);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setWorkoutInProgress(false);
    if (currentWorkout) {
      setWorkoutHistory(prev => [...prev, currentWorkout]);
    }
    // Update user progress based on performance
    updateUserProgress();
  };

  const updateUserProgress = () => {
    // Update progress tracking based on completed workout
    // This would integrate with the database in production
    console.log('Updating user progress...');
  };

  const applyAdaptation = (adaptationId: string) => {
    const adaptation = adaptationSuggestions.find(a => a.id === adaptationId);
    if (!adaptation || !currentWorkout) return;

    // Apply the adaptation to remaining sets
    const updatedSets = currentWorkout.sets.map((set, index) => {
      if (index > currentSetIndex && adaptation.changes.intensityAdjustment) {
        const weightAdjustment = adaptation.changes.intensityAdjustment * 5; // 5lbs per level
        return {
          ...set,
          targetWeight: (set.targetWeight || 0) + weightAdjustment
        };
      }
      return set;
    });

    setCurrentWorkout({
      ...currentWorkout,
      sets: updatedSets
    });

    // Remove applied suggestion
    setAdaptationSuggestions(prev => prev.filter(a => a.id !== adaptationId));
  };

  const renderWorkoutOverview = () => {
    if (!currentWorkout) return null;

    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h3" className="text-xl font-bold">
                {currentWorkout.title}
              </Typography>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {currentWorkout.estimatedDuration} min
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Difficulty {currentWorkout.difficulty}/5
                </div>
                {currentWorkout.aiGenerated && (
                  <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                    AI Generated
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {!workoutInProgress ? (
            <Button variant="primary" size="lg" onClick={startWorkout}>
              <Play className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          ) : (
            <div className="text-right">
              <Typography variant="h4" className="font-bold text-blue-600">
                Set {currentSetIndex + 1} of {currentWorkout.sets.length}
              </Typography>
              <Typography variant="body2" className="text-slate-600">
                {isResting ? `Rest: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Working'}
              </Typography>
            </div>
          )}
        </div>

        {/* Adaptations */}
        {currentWorkout.adaptations.length > 0 && (
          <div className="mb-4">
            <Typography variant="body2" className="font-medium mb-2 text-purple-700">
              🧠 AI Adaptations Applied:
            </Typography>
            {currentWorkout.adaptations.map((adaptation) => (
              <div key={adaptation.id} className="bg-purple-50 p-3 rounded-lg mb-2">
                <Typography variant="body2" className="text-purple-800">
                  {adaptation.description}
                </Typography>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="body2" className="text-slate-600">Progress</Typography>
            <Typography variant="body2" className="text-slate-600">
              {currentWorkout.sets.filter(s => s.completed).length}/{currentWorkout.sets.length} sets
            </Typography>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(currentWorkout.sets.filter(s => s.completed).length / currentWorkout.sets.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </Card>
    );
  };

  const renderCurrentSet = () => {
    if (!currentWorkout || !workoutInProgress) return null;

    const currentSet = currentWorkout.sets[currentSetIndex];
    if (!currentSet) return null;

    return (
      <Card className="p-6 mb-6 border-2 border-blue-200 bg-blue-50">
        <div className="text-center mb-6">
          <Typography variant="h2" className="text-2xl font-bold mb-2">
            Bench Press
          </Typography>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg">
              <Typography variant="body2" className="text-slate-600 mb-1">Target Weight</Typography>
              <Typography variant="h3" className="text-xl font-bold">{currentSet.targetWeight} lbs</Typography>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Typography variant="body2" className="text-slate-600 mb-1">Target Reps</Typography>
              <Typography variant="h3" className="text-xl font-bold">{currentSet.targetReps}</Typography>
            </div>
          </div>
        </div>

        {!currentSet.completed ? (
          <SetInputForm 
            set={currentSet}
            onComplete={completeSet}
          />
        ) : (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <Typography variant="h4" className="font-semibold mb-2">Set Complete!</Typography>
            <Typography variant="body2" className="text-slate-600 mb-4">
              {currentSet.actualReps} reps @ {currentSet.actualWeight} lbs (RPE: {currentSet.rpe}/10)
            </Typography>
            
            {isResting ? (
              <div className="mb-4">
                <Typography variant="h3" className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </Typography>
                <Typography variant="body2" className="text-slate-600">Rest Time Remaining</Typography>
              </div>
            ) : (
              <Button variant="primary" size="lg" onClick={nextSet}>
                {currentSetIndex < currentWorkout.sets.length - 1 ? (
                  <>
                    <SkipForward className="w-5 h-5 mr-2" />
                    Next Set
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Finish Workout
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  const SetInputForm = ({ set, onComplete }: { set: WorkoutSet; onComplete: (reps: number, weight: number, rpe: number) => void }) => {
    const [actualReps, setActualReps] = useState(set.targetReps);
    const [actualWeight, setActualWeight] = useState(set.targetWeight || 0);
    const [rpe, setRpe] = useState(7);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <Typography variant="body2" className="text-slate-600 mb-2">Actual Reps</Typography>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setActualReps(Math.max(0, actualReps - 1))}>
                <Minus className="w-4 h-4" />
              </Button>
              <Typography variant="h3" className="text-xl font-bold min-w-[3rem] text-center">
                {actualReps}
              </Typography>
              <Button variant="outline" size="sm" onClick={() => setActualReps(actualReps + 1)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <Typography variant="body2" className="text-slate-600 mb-2">Actual Weight</Typography>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setActualWeight(Math.max(0, actualWeight - 5))}>
                <Minus className="w-4 h-4" />
              </Button>
              <Typography variant="h3" className="text-xl font-bold min-w-[4rem] text-center">
                {actualWeight}
              </Typography>
              <Button variant="outline" size="sm" onClick={() => setActualWeight(actualWeight + 5)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <Typography variant="body2" className="text-slate-600 mb-2">RPE (1-10)</Typography>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  onClick={() => setRpe(level)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    rpe === level 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <Typography variant="body2" className="text-slate-500 text-xs mt-1">
              {rpe <= 6 ? 'Easy' : rpe <= 8 ? 'Moderate' : 'Hard'}
            </Typography>
          </div>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          onClick={() => onComplete(actualReps, actualWeight, rpe)}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Set
        </Button>
      </div>
    );
  };

  const renderAdaptationSuggestions = () => {
    if (adaptationSuggestions.length === 0) return null;

    return (
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-500" />
          <Typography variant="h4" className="font-semibold text-purple-900">
            Real-Time Adaptations
          </Typography>
        </div>
        
        {adaptationSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg p-4 mb-3">
            <Typography variant="body2" className="font-medium mb-2 text-purple-900">
              {suggestion.description}
            </Typography>
            <div className="flex space-x-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => applyAdaptation(suggestion.id)}
              >
                Apply
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAdaptationSuggestions(prev => prev.filter(a => a.id !== suggestion.id))}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Adaptive Workout System
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Workouts that evolve with you - no plateaus, just progress
        </Typography>
      </div>

      {/* Workout Overview */}
      {renderWorkoutOverview()}

      {/* Adaptation Suggestions */}
      {renderAdaptationSuggestions()}

      {/* Current Set */}
      {renderCurrentSet()}

      {/* Workout History Preview */}
      {!workoutInProgress && workoutHistory.length > 0 && (
        <Card className="p-6">
          <Typography variant="h4" className="font-semibold mb-4">
            Recent Workouts
          </Typography>
          <div className="space-y-3">
            {workoutHistory.slice(0, 3).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Typography variant="body2" className="font-medium">{workout.title}</Typography>
                  <Typography variant="body2" className="text-slate-600 text-sm">
                    {workout.sets.filter(s => s.completed).length} sets completed
                  </Typography>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
