'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Plus, 
  Trash2, 
  Copy, 
  TrendingUp, 
  Target,
  Timer,
  MoreVertical,
  Dumbbell
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
  previousBest?: {
    weight: number;
    reps: number;
    date: string;
  };
}

interface Set {
  id: string;
  weight: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  completed: boolean;
  restTime?: number;
}

interface StrengthLoggerProps {
  session: any;
  onUpdateSession: (session: any) => void;
}

export function StrengthLogger({ session, onUpdateSession }: StrengthLoggerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);

  // Common exercises database (would be fetched from DB)
  const exerciseDatabase = [
    'Bench Press', 'Squat', 'Deadlift', 'Overhead Press',
    'Barbell Row', 'Pull-ups', 'Dips', 'Incline Bench Press',
    'Romanian Deadlift', 'Bulgarian Split Squat', 'Lat Pulldown',
    'Tricep Extensions', 'Bicep Curls', 'Lateral Raises',
    'Face Pulls', 'Planks', 'Russian Twists'
  ];

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: `exercise_${Date.now()}`,
      name: exerciseName,
      sets: [],
      previousBest: getPreviousBest(exerciseName) // Mock function
    };
    
    setExercises([...exercises, newExercise]);
    setNewExerciseName('');
    setShowExerciseSearch(false);
    
    updateSession();
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSet: Set = {
          id: `set_${Date.now()}`,
          weight: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : 0,
          reps: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : 0,
          completed: false
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    }));
    updateSession();
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => 
            set.id === setId ? { ...set, [field]: value } : set
          )
        };
      }
      return exercise;
    }));
    updateSession();
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.filter(set => set.id !== setId)
        };
      }
      return exercise;
    }));
    updateSession();
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
    updateSession();
  };

  const updateSession = () => {
    onUpdateSession({
      ...session,
      exercises
    });
  };

  const getPreviousBest = (exerciseName: string) => {
    // Mock data - would query from database
    const mockBests: Record<string, { weight: number; reps: number; date: string }> = {
      'Bench Press': { weight: 80, reps: 5, date: '2024-08-05' },
      'Squat': { weight: 120, reps: 5, date: '2024-08-03' },
      'Deadlift': { weight: 140, reps: 3, date: '2024-08-01' },
    };
    return mockBests[exerciseName];
  };

  const getVolumeForExercise = (exercise: Exercise) => {
    return exercise.sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  };

  const isPersonalRecord = (exercise: Exercise, set: Set) => {
    if (!exercise.previousBest) return false;
    return set.weight > exercise.previousBest.weight || 
           (set.weight === exercise.previousBest.weight && set.reps > exercise.previousBest.reps);
  };

  return (
    <div className="space-y-6">
      {/* Add Exercise Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Add Exercise
          </h3>
        </div>
        
        {showExerciseSearch ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search exercises..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              autoFocus
            />
            <div className="max-h-40 overflow-y-auto space-y-2">
              {exerciseDatabase
                .filter(exercise => 
                  exercise.toLowerCase().includes(newExerciseName.toLowerCase())
                )
                .map(exercise => (
                  <button
                    key={exercise}
                    onClick={() => addExercise(exercise)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  >
                    {exercise}
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => newExerciseName && addExercise(newExerciseName)}
                disabled={!newExerciseName}
              >
                Add Custom
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowExerciseSearch(false);
                  setNewExerciseName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowExerciseSearch(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        )}
      </Card>

      {/* Exercise List */}
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {exercise.name}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Volume: {getVolumeForExercise(exercise).toLocaleString()}kg</span>
                </div>
                {exercise.previousBest && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>PR: {exercise.previousBest.weight}kg × {exercise.previousBest.reps}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteExercise(exercise.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Sets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-2">Set</th>
                  <th className="text-center py-2 px-2">Weight (kg)</th>
                  <th className="text-center py-2 px-2">Reps</th>
                  <th className="text-center py-2 px-2">RPE</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-center py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  <tr key={set.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-2 font-medium">
                      {index + 1}
                      {isPersonalRecord(exercise, set) && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">PR!</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                        step="0.5"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseInt(e.target.value) || undefined)}
                        className="w-16 px-2 py-1 text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                        min="1"
                        max="10"
                        placeholder="?"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          set.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-300 hover:border-green-500'
                        } flex items-center justify-center text-xs font-bold`}
                      >
                        {set.completed && '✓'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSet(exercise.id, set.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Set Button */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSet(exercise.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Set
            </Button>
            {exercise.sets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addSet(exercise.id)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Last
              </Button>
            )}
          </div>

          {/* Exercise Notes */}
          <div className="mt-4">
            <textarea
              placeholder="Exercise notes (form cues, adjustments, etc.)"
              value={exercise.notes || ''}
              onChange={(e) => {
                setExercises(exercises.map(ex => 
                  ex.id === exercise.id ? { ...ex, notes: e.target.value } : ex
                ));
                updateSession();
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              rows={2}
            />
          </div>
        </Card>
      ))}

      {exercises.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-400 mb-4">
            <Dumbbell className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No exercises added yet
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Add your first exercise to start tracking your strength training session
          </p>
        </Card>
      )}
    </div>
  );
}