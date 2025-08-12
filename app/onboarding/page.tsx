import type { Metadata } from 'next';
import { Suspense } from 'react';
import GoalFirstOnboarding from '@/components/onboarding/GoalFirstOnboarding';

export const metadata: Metadata = {
  title: 'Get Started — Feel Sharper',
  description: 'Personalized fitness journey starts here. Let\'s understand your goals and create your perfect plan.',
};

function LoadingOnboarding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading onboarding...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingOnboarding />}>
      <GoalFirstOnboarding />
    </Suspense>
  );
}