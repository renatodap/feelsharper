import type { Metadata } from 'next';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — Feel Sharper',
  description: 'Your personalized fitness and wellness command center',
};

export default function DashboardPage() {
  return <Dashboard />;
}
