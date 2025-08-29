import { getWeightMetrics } from '@/lib/dashboard/metrics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react';
import Link from 'next/link';

interface WeightWidgetProps {
  userId: string;
  scope: string;
}

export async function WeightWidget({ userId, scope }: WeightWidgetProps) {
  const metrics = await getWeightMetrics(userId, scope);

  const TrendIcon = metrics.trend === 'up' ? TrendingUp : 
                    metrics.trend === 'down' ? TrendingDown : Minus;
  
  const trendColor = metrics.trend === 'up' ? 'text-red-500' : 
                     metrics.trend === 'down' ? 'text-green-500' : 
                     'text-yellow-500';

  if (!metrics.current) {
    // Empty state CTA
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Weight Trend</span>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No weight data yet
            </p>
            <Link href="/weight">
              <Button size="sm" variant="primary">
                Log Weight
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Weight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {metrics.current?.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
        </div>

        {/* Delta and trend */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {scope === 'today' ? 'Today' : 
             scope === 'week' ? 'This week' : 
             scope === 'month' ? 'This month' : 'This year'}
          </span>
          <div className="flex items-center gap-1">
            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>
              {metrics.delta > 0 ? '+' : ''}{metrics.delta} kg
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
                height: `${40 + Math.sin(i / 2) * 30}%`,
                opacity: 0.3 + (i / 7) * 0.7
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}