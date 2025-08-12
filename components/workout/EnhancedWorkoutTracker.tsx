'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Timer, 
  Target, 
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  Dumbbell,
  Clock,
  Zap
} from 'lucide-react';
import { EXERCISES, Exercise, searchExercises, getExercisesByCategory } from '@/data/exercises';

const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;

interface WorkoutSet {
  id: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number;
  is_warmup: boolean;
  is_failure: boolean;
  rest_seconds: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

interface ActiveWorkout {
  id: string;
  name: string;
  started_at: string;
  sets: WorkoutSet[];
  notes?: string;
}

interface RestTimer {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
}

export default function EnhancedWorkoutTracker() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [restTimer, setRestTimer] = useState<RestTimer>({ isActive: false, timeRemaining: 0, totalTime: 0 });
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer.isActive && restTimer.timeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (restTimer.timeRemaining === 0 && restTimer.isActive) {
      setRestTimer(prev => ({ ...prev, isActive: false }));
      // Play notification sound or vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500]);
      }
    }
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.timeRemaining]);

  const startWorkout = () => {
    const newWorkout: ActiveWorkout = {
      id: Date.now().toString(),
      name: `Workout ${new Date().toLocaleDateString()}`,
      started_at: new Date().toISOString(),
      sets: []
    };
    setActiveWorkout(newWorkout);
  };

  const endWorkout = async () => {
    if (!activeWorkout) return;

    try {
      // Save workout to API
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activeWorkout,
          ended_at: new Date().toISOString(),
          duration_minutes: Math.round((Date.now() - new Date(activeWorkout.started_at).getTime()) / 60000)
        })
      });

      if (response.ok) {
        setActiveWorkout(null);
        setRestTimer({ isActive: false, timeRemaining: 0, totalTime: 0 });
        loadWorkoutHistory();
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const addSet = () => {
    if (!activeWorkout || !selectedExercise) return;

    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      exercise_id: selectedExercise.id,
      exercise_name: selectedExercise.name,
      reps: 10,
      weight: 0,
      is_warmup: false,
      is_failure: false,
      rest_seconds: 90,
      completed: false
    };

    setActiveWorkout(prev => prev ? {
      ...prev,
      sets: [...prev.sets, newSet]
    } : null);
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    setActiveWorkout(prev => prev ? {
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId ? { ...set, ...updates } : set
      )
    } : null);
  };

  const completeSet = (setId: string) => {
    updateSet(setId, { completed: true });
    
    // Start rest timer
    const set = activeWorkout?.sets.find(s => s.id === setId);
    if (set) {
      setRestTimer({
        isActive: true,
        timeRemaining: set.rest_seconds,
        totalTime: set.rest_seconds
      });
    }
  };

  const removeSet = (setId: string) => {
    setActiveWorkout(prev => prev ? {
      ...prev,
      sets: prev.sets.filter(set => set.id !== setId)
    } : null);
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer({
      isActive: true,
      timeRemaining: seconds,
      totalTime: seconds
    });
  };

  const stopRestTimer = () => {
    setRestTimer({ isActive: false, timeRemaining: 0, totalTime: 0 });
  };

  const loadWorkoutHistory = async () => {
    try {
      const response = await fetch('/api/workouts?limit=5');
      if (response.ok) {
        const data = await response.json();
        setWorkoutHistory(data.workouts || []);
      }
    } catch (error) {
      console.error('Failed to load workout history:', error);
    }
  };

  const getFilteredExercises = () => {
    let exercises = EXERCISES;
    
    if (selectedCategory !== 'all') {
      exercises = getExercisesByCategory(selectedCategory);
    }
    
    if (searchTerm) {
      exercises = searchExercises(searchTerm);
    }
    
    return exercises;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = () => {
    if (!activeWorkout) return '0:00';
    const duration = Math.floor((Date.now() - new Date(activeWorkout.started_at).getTime()) / 1000);
    return formatTime(duration);
  };

  const getLastSetData = (exerciseId: string) => {
    const lastSet = [...(activeWorkout?.sets || [])]
      .reverse()
      .find(set => set.exercise_id === exerciseId && set.completed);
    return lastSet;
  };

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  if (!activeWorkout) {
    return (
      <div className="space-y-6">
        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Start New Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to train?</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Track your sets, reps, and weights with precision
                </p>
              </div>
              <Button onClick={startWorkout} size="lg" className="w-full max-w-xs">
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        {workoutHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutHistory.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(workout.started_at).toLocaleDateString()} • {workout.duration_minutes}min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{workout.total_sets} sets</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{workout.total_volume}kg volume</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                {activeWorkout.name}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Duration: {getWorkoutDuration()} • Sets: {activeWorkout.sets.filter(s => s.completed).length}/{activeWorkout.sets.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={endWorkout}>
                <Square className="h-4 w-4 mr-2" />
                End Workout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rest Timer */}
      {restTimer.isActive && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100">Rest Timer</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {formatTime(restTimer.timeRemaining)} remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-1000 ease-linear"
                    style={{ 
                      width: `${((restTimer.totalTime - restTimer.timeRemaining) / restTimer.totalTime) * 100}%` 
                    }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={stopRestTimer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="all">All Categories</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            {/* Exercise List */}
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {getFilteredExercises().map((exercise) => {
                const lastSet = getLastSetData(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {exercise.muscle_groups.join(', ')} • {exercise.difficulty}
                        </p>
                      </div>
                      {lastSet && (
                        <div className="text-right text-sm">
                          <p className="text-slate-600 dark:text-slate-400">Last:</p>
                          <p className="font-medium">{lastSet.weight}kg × {lastSet.reps}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedExercise && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button onClick={addSet} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set: {selectedExercise.name}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseDetails(true)}
                >
                  Info
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Sets */}
      {activeWorkout.sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeWorkout.sets.map((set, index) => (
                <div
                  key={set.id}
                  className={`p-4 border rounded-lg ${
                    set.completed 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{set.exercise_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Set {index + 1}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!set.completed ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => completeSet(set.id)}
                            disabled={set.reps === 0}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSet(set.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!set.completed && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`weight-${set.id}`}>Weight (kg)</Label>
                        <Input
                          id={`weight-${set.id}`}
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(set.id, { weight: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reps-${set.id}`}>Reps</Label>
                        <Input
                          id={`reps-${set.id}`}
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(set.id, { reps: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`rest-${set.id}`}>Rest (sec)</Label>
                        <Input
                          id={`rest-${set.id}`}
                          type="number"
                          value={set.rest_seconds}
                          onChange={(e) => updateSet(set.id, { rest_seconds: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {set.completed && (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Weight:</span>
                        <p className="font-medium">{set.weight}kg</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Reps:</span>
                        <p className="font-medium">{set.reps}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Rest:</span>
                        <p className="font-medium">{set.rest_seconds}s</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Details Modal */}
      {showExerciseDetails && selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedExercise.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {selectedExercise.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedExercise.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Variations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.variations.map((variation, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm"
                    >
                      {variation}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
