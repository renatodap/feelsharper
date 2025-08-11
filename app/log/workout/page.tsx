import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Workout — Feel Sharper',
};

export default function LogWorkoutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Log Workout</h1>
        <p className="mt-2 text-sm text-slate-600">Strength or cardio. Forms coming in Step 5.</p>
      </header>
      <div className="card p-4">
        <p className="text-sm text-slate-600">Quick templates and rest timer will be added later.</p>
      </div>
    </section>
  );
}
