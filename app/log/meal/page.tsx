import type { Metadata } from 'next';
import { MealLogger } from '@/components/nutrition/MealLogger';

export const metadata: Metadata = {
  title: 'Log Meal — Feel Sharper',
  description: 'Track your nutrition with AI-powered meal logging and macro analysis.',
};

export default function LogMealPage() {
  return <MealLogger />;
}
