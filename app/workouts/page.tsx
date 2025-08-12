import { Metadata } from 'next';
import EnhancedWorkoutTracker from '@/components/workout/EnhancedWorkoutTracker';

export const metadata: Metadata = {
  title: 'Workouts - Feel Sharper',
  description: 'Track your workouts and monitor your progress with precision',
};

export default function WorkoutsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout Tracker</h1>
        <p className="text-muted-foreground">
          Log your exercises, track progress, and build strength consistently with our comprehensive exercise database.
        </p>
      </div>

      <EnhancedWorkoutTracker />
    </div>
  );
}