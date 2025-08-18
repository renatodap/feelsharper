"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Minus, 
  Timer, 
  CheckCircle, 
  Play, 
  Pause,
  RotateCcw,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds: number;
  muscleGroup: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimatedMinutes: number;
}

const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push',
    name: 'Push Day',
    description: 'Chest, Shoulders, Triceps',
    estimatedMinutes: 45,
    exercises: [
      { id: 'bench-press', name: 'Bench Press', sets: 4, reps: 8, weight: 60, restSeconds: 90, muscleGroup: 'chest' },
      { id: 'shoulder-press', name: 'Shoulder Press', sets: 3, reps: 10, weight: 30, restSeconds: 60, muscleGroup: 'shoulders' },
      { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: 20, restSeconds: 60, muscleGroup: 'chest' },
      { id: 'lateral-raises', name: 'Lateral Raises', sets: 3, reps: 15, weight: 8, restSeconds: 45, muscleGroup: 'shoulders' },
      { id: 'tricep-dips', name: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'triceps' },
    ]
  },
  {
    id: 'pull',
    name: 'Pull Day',
    description: 'Back, Biceps',
    estimatedMinutes: 45,
    exercises: [
      { id: 'deadlift', name: 'Deadlift', sets: 4, reps: 6, weight: 80, restSeconds: 120, muscleGroup: 'back' },
      { id: 'pull-ups', name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 90, muscleGroup: 'back' },
      { id: 'barbell-row', name: 'Barbell Row', sets: 3, reps: 10, weight: 50, restSeconds: 60, muscleGroup: 'back' },
      { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: 15, weight: 15, restSeconds: 45, muscleGroup: 'back' },
      { id: 'bicep-curls', name: 'Bicep Curls', sets: 3, reps: 12, weight: 12, restSeconds: 45, muscleGroup: 'biceps' },
    ]
  },
  {
    id: 'legs',
    name: 'Leg Day',
    description: 'Quads, Hamstrings, Glutes',
    estimatedMinutes: 50,
    exercises: [
      { id: 'squat', name: 'Squat', sets: 4, reps: 8, weight: 70, restSeconds: 120, muscleGroup: 'legs' },
      { id: 'leg-press', name: 'Leg Press', sets: 3, reps: 12, weight: 100, restSeconds: 90, muscleGroup: 'legs' },
      { id: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 50, restSeconds: 60, muscleGroup: 'hamstrings' },
      { id: 'leg-curls', name: 'Leg Curls', sets: 3, reps: 15, weight: 30, restSeconds: 45, muscleGroup: 'hamstrings' },
      { id: 'calf-raises', name: 'Calf Raises', sets: 4, reps: 20, weight: 40, restSeconds: 30, muscleGroup: 'calves' },
    ]
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Complete workout for all muscle groups',
    estimatedMinutes: 40,
    exercises: [
      { id: 'squat-fb', name: 'Squat', sets: 3, reps: 10, weight: 60, restSeconds: 90, muscleGroup: 'legs' },
      { id: 'bench-fb', name: 'Bench Press', sets: 3, reps: 10, weight: 50, restSeconds: 90, muscleGroup: 'chest' },
      { id: 'row-fb', name: 'Barbell Row', sets: 3, reps: 10, weight: 40, restSeconds: 60, muscleGroup: 'back' },
      { id: 'ohp-fb', name: 'Overhead Press', sets: 3, reps: 10, weight: 30, restSeconds: 60, muscleGroup: 'shoulders' },
      { id: 'plank', name: 'Plank', sets: 3, reps: 60, restSeconds: 30, muscleGroup: 'core' },
    ]
  }
];

interface SetLog {
  reps: number;
  weight?: number;
  completed: boolean;
}

interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  startTime?: Date;
  endTime?: Date;
}

export default function SimpleWorkoutTracker() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-progression based on last workout
  const [lastWorkoutWeights, setLastWorkoutWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load last workout weights from localStorage (or API)
    const saved = localStorage.getItem('lastWorkoutWeights');
    if (saved) {
      setLastWorkoutWeights(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      intervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            // Play notification sound
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isResting, restTimer]);

  const playNotification = () => {
    // Play a simple beep sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+0Oy9diMFl2z5pYrTjSxQxKwEO5FLhSBIptUImwAqmIpGQw1TgUBQDnECdsEAOAAAAAAAAAAAAAAAAAAABCl+0Oy9diMFl2z5pYrTjSxQxKwEO5FLhSBIptUImwAqmIpGQw1TgUBQDnECdsEAOAAAAAAAAAAAAAAAAAAABCl+0Oy9diMFl2z5pYrTjSxQxKwEO5FLhSBIptUImwAqmIpGQw1TgUBQDnECdsEAOAAAAAAAAAAAAAAAAAAABCl+0Oy9diMFl2z5pYrTjSxQxKwEO5FLhSBIptUImwAqmIpGQw1TgUBQDnECdsEAOAAAAAAAAAAAAAAAAAAA');
    audio.play().catch(() => {});
  };

  const startWorkout = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setWorkoutStartTime(new Date());
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setWorkoutCompleted(false);
    
    // Initialize exercise logs
    const logs: ExerciseLog[] = template.exercises.map(exercise => ({
      exerciseId: exercise.id,
      sets: Array(exercise.sets).fill(null).map(() => ({
        reps: exercise.reps,
        weight: lastWorkoutWeights[exercise.id] || exercise.weight,
        completed: false
      }))
    }));
    setExerciseLogs(logs);
  };

  const completeSet = () => {
    if (!selectedTemplate) return;
    
    const updatedLogs = [...exerciseLogs];
    updatedLogs[currentExerciseIndex].sets[currentSetIndex].completed = true;
    setExerciseLogs(updatedLogs);

    const currentExercise = selectedTemplate.exercises[currentExerciseIndex];
    
    // Check if this was the last set of the exercise
    if (currentSetIndex < currentExercise.sets - 1) {
      // Move to next set, start rest timer
      setCurrentSetIndex(currentSetIndex + 1);
      setRestTimer(currentExercise.restSeconds);
      setIsResting(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < selectedTemplate.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setRestTimer(90); // Rest between exercises
        setIsResting(true);
      } else {
        // Workout complete!
        completeWorkout();
      }
    }
  };

  const updateWeight = (delta: number) => {
    if (!selectedTemplate) return;
    
    const updatedLogs = [...exerciseLogs];
    const currentWeight = updatedLogs[currentExerciseIndex].sets[currentSetIndex].weight || 0;
    updatedLogs[currentExerciseIndex].sets[currentSetIndex].weight = Math.max(0, currentWeight + delta);
    setExerciseLogs(updatedLogs);
  };

  const updateReps = (delta: number) => {
    if (!selectedTemplate) return;
    
    const updatedLogs = [...exerciseLogs];
    const currentReps = updatedLogs[currentExerciseIndex].sets[currentSetIndex].reps;
    updatedLogs[currentExerciseIndex].sets[currentSetIndex].reps = Math.max(1, currentReps + delta);
    setExerciseLogs(updatedLogs);
  };

  const completeWorkout = () => {
    setWorkoutCompleted(true);
    
    // Save weights for next time
    const weights: Record<string, number> = {};
    exerciseLogs.forEach((log, index) => {
      const lastCompletedSet = log.sets.filter(s => s.completed).pop();
      if (lastCompletedSet?.weight && selectedTemplate) {
        weights[selectedTemplate.exercises[index].id] = lastCompletedSet.weight;
      }
    });
    localStorage.setItem('lastWorkoutWeights', JSON.stringify(weights));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedTemplate) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Choose Your Workout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKOUT_TEMPLATES.map((template) => (
            <Card 
              key={template.id}
              className="p-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => startWorkout(template)}
            >
              <h3 className="font-bold text-lg mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex justify-between text-sm">
                <span>{template.exercises.length} exercises</span>
                <span>{template.estimatedMinutes} min</span>
              </div>
              <Button variant="primary" className="w-full mt-4">
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (workoutCompleted) {
    const duration = workoutStartTime 
      ? Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60)
      : 0;
    
    const totalSets = exerciseLogs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).length, 0
    );
    
    const totalVolume = exerciseLogs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).reduce((setSum, set) => 
        setSum + (set.reps * (set.weight || 0)), 0
      ), 0
    );

    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
        <p className="text-muted-foreground mb-6">Great job! You crushed it!</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-2xl font-bold">{duration}</div>
            <div className="text-sm text-muted-foreground">minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalSets}</div>
            <div className="text-sm text-muted-foreground">sets</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(totalVolume)}</div>
            <div className="text-sm text-muted-foreground">kg volume</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => setSelectedTemplate(null)}
          >
            Finish
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => startWorkout(selectedTemplate)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Repeat Workout
          </Button>
        </div>
      </Card>
    );
  }

  const currentExercise = selectedTemplate.exercises[currentExerciseIndex];
  const currentLog = exerciseLogs[currentExerciseIndex];
  const currentSet = currentLog?.sets[currentSetIndex];

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ 
            width: `${((currentExerciseIndex * selectedTemplate.exercises.length + currentSetIndex) / 
              (selectedTemplate.exercises.length * currentExercise.sets)) * 100}%` 
          }}
        />
      </div>

      {/* Current Exercise */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{currentExercise.name}</h2>
          <p className="text-muted-foreground">
            Set {currentSetIndex + 1} of {currentExercise.sets}
          </p>
        </div>

        {/* Rest Timer */}
        {isResting && (
          <div className="mb-6">
            <Card className="p-8 bg-orange-500/10 border-orange-500/20">
              <div className="text-center">
                <Timer className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-4xl font-bold text-orange-500">
                  {formatTime(restTimer)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Rest Time</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsResting(false)}
                >
                  Skip Rest
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Weight and Reps Controls */}
        {!isResting && currentSet && (
          <div className="space-y-4">
            {/* Weight Control */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Weight</span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateWeight(-2.5)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-20 text-center">
                  {currentSet.weight || 0} kg
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateWeight(2.5)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Reps Control */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Reps</span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateReps(-1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-20 text-center">
                  {currentSet.reps}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateReps(1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Auto-progression hint */}
            {lastWorkoutWeights[currentExercise.id] && 
             currentSet.weight && 
             currentSet.weight > lastWorkoutWeights[currentExercise.id] && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">
                  Progressive overload! +{currentSet.weight - lastWorkoutWeights[currentExercise.id]}kg from last workout
                </span>
              </div>
            )}

            {/* Complete Set Button */}
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full py-6 text-lg"
              onClick={completeSet}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Set
            </Button>
          </div>
        )}

        {/* Previous Sets */}
        {currentSetIndex > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Previous Sets:</p>
            <div className="flex gap-2">
              {currentLog.sets.slice(0, currentSetIndex).map((set, i) => (
                <div key={i} className="text-sm bg-muted px-3 py-1 rounded">
                  {set.weight}kg × {set.reps}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Exercise List */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Workout Progress</h3>
        <div className="space-y-2">
          {selectedTemplate.exercises.map((exercise, index) => {
            const log = exerciseLogs[index];
            const completedSets = log?.sets.filter(s => s.completed).length || 0;
            const isActive = index === currentExerciseIndex;
            
            return (
              <div 
                key={exercise.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  isActive && "bg-primary/10",
                  index < currentExerciseIndex && "opacity-50"
                )}
              >
                <span className={cn(
                  "text-sm",
                  isActive && "font-medium"
                )}>
                  {exercise.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {completedSets}/{exercise.sets} sets
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}