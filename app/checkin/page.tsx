import { Metadata } from 'next';
import { DailyCheckin } from '@/components/feature/daily-checkin';

export const metadata: Metadata = {
  title: 'Daily Check-in - Feel Sharper',
  description: 'Complete your daily wellness check-in',
};

export default function CheckinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Daily Check-in</h1>
        <p className="text-muted-foreground">
          Take 2 minutes to log how you&apos;re feeling today
        </p>
      </div>

      <DailyCheckin />
    </div>
  );
}