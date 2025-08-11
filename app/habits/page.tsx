import type { Metadata } from 'next';
import { HabitTracker } from '@/components/habits/HabitTracker';

export const metadata: Metadata = {
  title: 'Habit Tracker — Feel Sharper',
  description: 'Track your daily habits, build streaks, unlock achievements, and gamify your fitness journey.',
};

export default function HabitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Habit Tracker
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Build consistency, track streaks, and unlock achievements on your fitness journey
          </p>
        </div>
        
        <HabitTracker />
      </div>
    </div>
  );
}