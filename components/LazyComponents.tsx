'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy load heavy components with code splitting
export const LazyWorkoutLogger = dynamic(
  () => import('@/components/workouts/WorkoutLogger'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyNutritionTracker = dynamic(
  () => import('@/components/nutrition/NutritionTracker'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyProgressTracker = dynamic(
  () => import('@/components/progress/ProgressTracker'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyAICoach = dynamic(
  () => import('@/components/coach/AICoach'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyIntelligentMealPlanner = dynamic(
  () => import('@/components/nutrition/IntelligentMealPlanner'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyLeaderboardSystem = dynamic(
  () => import('@/components/social/LeaderboardSystem'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const LazyPricingExperiment = dynamic(
  () => import('@/components/pricing/PricingExperiment'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Wrapper component for lazy loading with Suspense
export function LazyLoad({ 
  component: Component, 
  fallback = <LoadingSpinner /> 
}: { 
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}