import type { Metadata } from 'next';
import { Suspense } from 'react';
import UnifiedDashboardContainer from '@/components/dashboard/UnifiedDashboardContainer';

export const metadata: Metadata = {
  title: 'Dashboard — Feel Sharper',
  description: 'Your personalized wellness dashboard. Track progress, get AI insights, and stay motivated on your journey.',
};

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <UnifiedDashboardContainer />
    </Suspense>
  );
}
