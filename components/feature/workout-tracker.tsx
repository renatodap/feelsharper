'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;
// Simplified Select components
const Select = ({ children, value, onValueChange }: any) => <div>{children}</div>;
const SelectTrigger = ({ children }: any) => <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
const SelectContent = ({ children }: any) => <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">{children}</div>;
const SelectItem = ({ children, value }: any) => <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">{children}</div>;
// Simple Textarea component
const Textarea = ({ className, ...props }: any) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} {...props} />;
import { Plus, X, Check, Timer, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
}

interface WorkoutSet {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number;
  is_warmup: boolean;
  is_failure: boolean;
  rest_seconds: number;
  completed?: boolean;
}

interface ActiveWorkout {
  id: string;
  name: string;
  started_at: string;
  sets: WorkoutSet[];
}

export function WorkoutTracker() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSet, setCurrentSet] = useState<WorkoutSet>({
    exercise_id: '',
    exercise_name: '',
    reps: 0,
    weight: 0,
    is_warmup: false,
    is_failure: false,
    rest_seconds: 90,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const startWorkout = async () => {
    if (!workoutName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workout name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workoutName }),
      });

      if (!response.ok) throw new Error('Failed to start workout');

      const data = await response.json();
      setActiveWorkout({
        id: data.workout.id,
        name: data.workout.name,
        started_at: data.workout.started_at,
        sets: [],
      });
      setWorkoutName('');
      toast({
        title: 'Workout Started!',
        description: 'Time to crush it! 💪',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start workout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSet = async () => {
    if (!activeWorkout || !currentSet.exercise_name || !currentSet.reps) {
      toast({
        title: 'Error',
        description: 'Please fill in exercise and reps',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workouts/${activeWorkout.id}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSet),
      });

      if (!response.ok) throw new Error('Failed to add set');

      const data = await response.json();
      setActiveWorkout({
        ...activeWorkout,
        sets: [...activeWorkout.sets, { ...currentSet, id: data.set.id, completed: true }],
      });

      // Keep the same exercise selected for the next set
      setCurrentSet({
        ...currentSet,
        reps: 0,
        weight: currentSet.weight, // Keep the same weight
        is_warmup: false,
        is_failure: false,
      });

      toast({
        title: 'Set Added!',
        description: `${currentSet.exercise_name}: ${currentSet.reps} reps @ ${currentSet.weight}kg`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add set',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workouts/${activeWorkout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_at: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to finish workout');

      toast({
        title: 'Workout Complete!',
        description: `Great job! You completed ${activeWorkout.sets.length} sets.`,
      });
      setActiveWorkout(null);
      setCurrentSet({
        exercise_id: '',
        exercise_name: '',
        reps: 0,
        weight: 0,
        is_warmup: false,
        is_failure: false,
        rest_seconds: 90,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to finish workout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeWorkout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start a New Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g., Push Day, Leg Day"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>
          <Button onClick={startWorkout} disabled={isLoading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{activeWorkout.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              {new Date(activeWorkout.started_at).toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exercise Selection */}
          <div>
            <Label htmlFor="exercise">Exercise</Label>
            <Input
              id="exercise"
              placeholder="Search or enter exercise name"
              value={currentSet.exercise_name}
              onChange={(e) => {
                setCurrentSet({ ...currentSet, exercise_name: e.target.value });
                setSearchTerm(e.target.value);
              }}
            />
            {searchTerm && filteredExercises.length > 0 && (
              <div className="mt-2 max-h-40 overflow-auto border rounded-md">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    className="w-full text-left p-2 hover:bg-accent"
                    onClick={() => {
                      setCurrentSet({
                        ...currentSet,
                        exercise_id: ex.id,
                        exercise_name: ex.name,
                      });
                      setSearchTerm('');
                    }}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Set Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="12"
                value={currentSet.reps || ''}
                onChange={(e) => setCurrentSet({ ...currentSet, reps: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="60"
                value={currentSet.weight || ''}
                onChange={(e) => setCurrentSet({ ...currentSet, weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Quick Options */}
          <div className="flex gap-2">
            <Button
              variant={currentSet.is_warmup ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSet({ ...currentSet, is_warmup: !currentSet.is_warmup })}
            >
              Warmup
            </Button>
            <Button
              variant={currentSet.is_failure ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSet({ ...currentSet, is_failure: !currentSet.is_failure })}
            >
              To Failure
            </Button>
          </div>

          <Button onClick={addSet} disabled={isLoading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </CardContent>
      </Card>

      {/* Completed Sets */}
      {activeWorkout.sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Sets ({activeWorkout.sets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeWorkout.sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-accent rounded-md">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{set.exercise_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{set.reps} reps</span>
                    {set.weight > 0 && <span>{set.weight}kg</span>}
                    {set.is_warmup && <span className="text-muted-foreground">(warmup)</span>}
                    {set.is_failure && <span className="text-orange-500">(failure)</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={finishWorkout} disabled={isLoading} variant="default" className="w-full">
        <Check className="mr-2 h-4 w-4" />
        Finish Workout
      </Button>
    </div>
  );
}