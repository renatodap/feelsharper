import { Metadata } from 'next';
import { MealTracker } from '@/components/feature/meal-tracker';

export const metadata: Metadata = {
  title: 'Nutrition - Feel Sharper',
  description: 'Track your meals and monitor your nutrition',
};

export default function NutritionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nutrition Tracker</h1>
        <p className="text-muted-foreground">
          Log your meals, track macros, and fuel your performance.
        </p>
      </div>

      <MealTracker />
    </div>
  );
}