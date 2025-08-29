import { getVolumeMetrics } from '@/lib/dashboard/metrics';
import { Card } from '@/components/ui/Card';
import { Dumbbell, Activity } from 'lucide-react';

interface VolumeWidgetProps {
  userId: string;
  scope: string;
}

export async function VolumeWidget({ userId, scope }: VolumeWidgetProps) {
  const metrics = await getVolumeMetrics(userId, scope);

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-muted-foreground">Training Volume</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold">{metrics.total}</span>
            <span className="text-xs text-muted-foreground">{metrics.unit}</span>
          </div>
        </div>

        {/* Weekly average */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Weekly avg</span>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm font-medium">
              {metrics.weeklyAverage} {metrics.unit}/wk
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