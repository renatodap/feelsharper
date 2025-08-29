import { getSleepMetrics } from '@/lib/dashboard/metrics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Moon, BedDouble } from 'lucide-react';
import Link from 'next/link';

interface SleepWidgetProps {
  userId: string;
  scope: string;
}

export async function SleepWidget({ userId, scope }: SleepWidgetProps) {
  const metrics = await getSleepMetrics(userId, scope);

  const debtColor = metrics.debt > 10 ? 'text-red-500' : 
                   metrics.debt > 5 ? 'text-yellow-500' : 
                   'text-green-500';

  if (metrics.average === 0) {
    // Empty state CTA
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium">Sleep Debt</span>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Track your sleep to see insights
            </p>
            <Link href="/settings">
              <Button size="sm" variant="primary">
                Set Sleep Goal
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
            <Moon className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-muted-foreground">Sleep Debt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${debtColor}`}>
              {Math.abs(metrics.debt)}
            </span>
            <span className="text-xs text-muted-foreground">
              hrs {metrics.debt > 0 ? 'behind' : 'ahead'}
            </span>
          </div>
        </div>

        {/* Average sleep */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Average</span>
          <div className="flex items-center gap-1">
            <BedDouble className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm font-medium">
              {metrics.average}h / {metrics.goal}h goal
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
                height: `${60 + Math.random() * 40}%`,
                opacity: 0.3 + (i / 7) * 0.7
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}