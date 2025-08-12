import type { Metadata } from 'next';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Feel Sharper',
  description: 'Your sharpest self, every day. Track workouts, nutrition, and recovery with AI-driven coaching.',
};

export default function DashboardPage() {
  return <Dashboard />;
}
