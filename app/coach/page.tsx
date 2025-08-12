import type { Metadata } from 'next';
import { Suspense } from 'react';
import AIPersonalCoach from '@/components/coach/AIPersonalCoach';

export const metadata: Metadata = {
  title: 'AI Coach — Feel Sharper',
  description: 'Your AI-powered fitness coach. Get personalized guidance and insights based on your progress.',
};

function CoachLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your AI coach...</p>
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Personal Coach</h1>
        <p className="text-muted-foreground">
          Get personalized insights, recommendations, and guidance based on your progress and goals.
        </p>
      </div>

      <Suspense fallback={<CoachLoading />}>
        <AIPersonalCoach />
      </Suspense>
    </div>
  );
}
