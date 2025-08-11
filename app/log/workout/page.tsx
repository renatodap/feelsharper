import type { Metadata } from 'next';
import { WorkoutLogger } from '@/components/workout/WorkoutLogger';

export const metadata: Metadata = {
  title: 'Log Workout — Feel Sharper',
  description: 'Log your strength training and cardio sessions with AI-powered coaching insights.',
};

export default function LogWorkoutPage() {
  return <WorkoutLogger />;
}
