import type { Metadata } from 'next';
import ComprehensiveDashboard from '@/components/dashboard/ComprehensiveDashboard';

export const metadata: Metadata = {
  title: 'Dashboard — Feel Sharper',
  description: 'Your personalized wellness dashboard. Track progress, get AI insights, and stay motivated on your journey.',
};

export default function DashboardPage() {
  return <ComprehensiveDashboard />;
}
