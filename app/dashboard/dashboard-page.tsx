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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Loading skeletons for each widget
function WidgetSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        <div className="h-8 bg-muted rounded" />
      </div>
    </Card>
  );
}

// More metrics toggle client component
function MoreMetricsToggle() {
  "use client";
  
  const { showMoreMetrics, setShowMoreMetrics } = useDashboard();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowMoreMetrics(!showMoreMetrics)}
      className="w-full mt-4"
    >
      {showMoreMetrics ? (
        <>
          <ChevronUp className="w-4 h-4 mr-2" />
          Show Less
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4 mr-2" />
          More Metrics
        </>
      )}
    </Button>
  );
}

// Main dashboard server component
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Default scope - can be overridden by client
  const defaultScope = 'week';

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <PresetSelector />
            </div>
          </div>
        </div>

        {/* Core Widgets */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* More Metrics Toggle */}
          <MoreMetricsToggle />

          {/* Additional metrics panel (hidden by default) */}
          <div className="hidden" data-show-more="true">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Placeholder for additional widgets */}
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">
                  Nutrition tracking coming soon
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">
                  Recovery metrics coming soon
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">
                  Performance trends coming soon
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">
                  Goals progress coming soon
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}