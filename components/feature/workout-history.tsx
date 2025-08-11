'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutSet {
  id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  is_warmup: boolean;
  is_failure: boolean;
  exercises: {
    name: string;
    category: string;
  };
}

interface Workout {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume: number;
  total_sets: number;
  workout_sets: WorkoutSet[];
}

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts?limit=10');
      const data = await response.json();
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (started: string, ended: string | null) => {
    if (!ended) return 'In Progress';
    const start = new Date(started);
    const end = new Date(ended);
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const toggleExpanded = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading workouts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No workouts yet</p>
            <p className="text-sm text-muted-foreground">
              Start your first workout to see your history here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div key={workout.id} className="border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(workout.id)}
              >
                <div>
                  <h3 className="font-semibold">{workout.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(workout.started_at), 'MMM d')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {calculateDuration(workout.started_at, workout.ended_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {workout.total_volume ? `${workout.total_volume.toLocaleString()}kg` : '0kg'}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedWorkout === workout.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedWorkout === workout.id && workout.workout_sets && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Exercises ({workout.workout_sets.length} sets)
                  </div>
                  {workout.workout_sets.map((set, index) => (
                    <div key={set.id} className="flex items-center justify-between text-sm pl-4">
                      <span>{set.exercises?.name || 'Unknown Exercise'}</span>
                      <div className="flex items-center gap-2">
                        <span>{set.reps} reps</span>
                        {set.weight > 0 && <span>@ {set.weight}kg</span>}
                        {set.is_warmup && (
                          <span className="text-xs text-muted-foreground">(warmup)</span>
                        )}
                        {set.is_failure && (
                          <span className="text-xs text-orange-500">(failure)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}