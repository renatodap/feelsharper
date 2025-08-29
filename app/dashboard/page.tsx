import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { DashboardProvider } from '@/components/dashboard/DashboardProvider';
import { PresetSelector } from '@/components/dashboard/PresetSelector';
import { StreakWidget } from '@/components/dashboard/widgets/StreakWidget';
import { WeightWidget } from '@/components/dashboard/widgets/WeightWidget';
import { VolumeWidget } from '@/components/dashboard/widgets/VolumeWidget';
import { SleepWidget } from '@/components/dashboard/widgets/SleepWidget';
import DashboardClient from './dashboard-client';

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Loading skeleton for widgets
function WidgetSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Default scope for server components
  const defaultScope = 'week';

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Header with Preset Selector */}
        <div className="bg-surface border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">FeelSharper</h1>
              <PresetSelector />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Core Dashboard Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Streak & Time to Log */}
            <Suspense fallback={<WidgetSkeleton />}>
              <StreakWidget userId={user.id} scope={defaultScope} />
            </Suspense>

            {/* Weight Trend */}
            <Suspense fallback={<WidgetSkeleton />}>
              <WeightWidget userId={user.id} scope={defaultScope} />
            </Suspense>

            {/* Training Volume */}
            <Suspense fallback={<WidgetSkeleton />}>
              <VolumeWidget userId={user.id} scope={defaultScope} />
            </Suspense>

            {/* Sleep Debt */}
            <Suspense fallback={<WidgetSkeleton />}>
              <SleepWidget userId={user.id} scope={defaultScope} />
            </Suspense>
          </div>

          {/* Client-side dashboard content (tabs, food logger, etc) */}
          <DashboardClient userId={user.id} />
        </div>
      </div>
    </DashboardProvider>
  );
}