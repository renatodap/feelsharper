import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Feel Sharper',
};

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Your daily snapshot: plan, logs, and coach insights.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Today</h2>
          <p className="mt-2 text-sm text-slate-600">Workout, macros, and nudge will appear here.</p>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Weight Trend</h2>
          <p className="mt-2 text-sm text-slate-600">Mini chart placeholder.</p>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Training Load</h2>
          <p className="mt-2 text-sm text-slate-600">Mini chart placeholder.</p>
        </div>
      </div>
    </section>
  );
}
