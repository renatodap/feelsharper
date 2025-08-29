import { getStreakMetrics } from '@/lib/dashboard/metrics';
import { Card } from '@/components/ui/Card';
import { Flame, Clock } from 'lucide-react';

interface StreakWidgetProps {
  userId: string;
  scope: string;
}

export async function StreakWidget({ userId, scope }: StreakWidgetProps) {
  const metrics = await getStreakMetrics(userId, scope);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold">{metrics.currentStreak}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        {/* Time to Log */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Time to log</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold">
              {metrics.timeToLog > 0 ? formatTime(metrics.timeToLog) : '--'}
            </span>
          </div>
        </div>

        {/* Mini sparkline placeholder */}
        <div className="h-8 flex items-end gap-0.5 pt-2 border-t">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-muted rounded-t"
              style={{ 
                height: `${Math.random() * 100}%`,
                opacity: 0.3 + (i / 7) * 0.7
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}