import type { Metadata } from 'next';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';

export const metadata: Metadata = {
  title: 'AI Analytics — Feel Sharper',
  description: 'Advanced predictive analytics powered by machine learning to optimize your fitness journey with data-driven insights.',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20">
      <PredictiveAnalytics />
    </div>
  );
}