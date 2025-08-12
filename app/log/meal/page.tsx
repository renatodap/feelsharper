import type { Metadata } from 'next';
import NutritionTracker from '@/components/nutrition/NutritionTracker';

export const metadata: Metadata = {
  title: 'Log Meal — Feel Sharper',
  description: 'Track your nutrition and hit your macro targets',
};

export default function LogMealPage() {
  return <NutritionTracker />;
}
