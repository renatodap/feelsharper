import type { Metadata } from 'next';
// import WorkoutLogger from '@/components/workouts/WorkoutLogger';

export const metadata: Metadata = {
  title: 'Log Workout — Feel Sharper',
  description: 'Track your strength training and cardio sessions',
};

export default function LogWorkoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Workout logging coming soon</p>
    </div>
  );
}
