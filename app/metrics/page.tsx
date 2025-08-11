import { Metadata } from 'next';
import { BodyMetrics } from '@/components/feature/body-metrics';

export const metadata: Metadata = {
  title: 'Body Metrics - Feel Sharper',
  description: 'Track your body composition and measurements',
};

export default function MetricsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Body Metrics</h1>
        <p className="text-muted-foreground">
          Track your weight, body composition, and measurements over time.
        </p>
      </div>

      <BodyMetrics />
    </div>
  );
}