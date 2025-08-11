import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar — Feel Sharper',
};

export default function CalendarPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="mt-2 text-sm text-slate-600">Plan view for workouts, meals, and notes. Calendar UI coming in Step 6.</p>
      </header>

      <div className="card p-4">
        <p className="text-sm text-slate-600">Weekly and monthly views will be implemented here.</p>
      </div>
    </section>
  );
}
