import type { Metadata } from 'next';
// import NutritionTrackerV2 from '@/components/nutrition/NutritionTrackerV2';

export const metadata: Metadata = {
  title: 'Log Meal — Feel Sharper',
  description: 'Track your nutrition and hit your macro targets',
};

export default function LogMealPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Meal logging coming soon</p>
    </div>
  );
}
