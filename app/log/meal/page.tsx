import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Meal — Feel Sharper',
};

export default function LogMealPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Log Meal</h1>
        <p className="mt-2 text-sm text-slate-600">Quick add macros and search foods via Open Food Facts (coming Step 5).</p>
      </header>
      <div className="card p-4">
        <p className="text-sm text-slate-600">Search and quick-add UI will appear here.</p>
      </div>
    </section>
  );
}
