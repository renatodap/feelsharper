import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach — Feel Sharper',
};

export default function CoachPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Coach</h1>
        <p className="mt-2 text-sm text-slate-600">Conversational AI coach. Chat UI coming in Step 7.</p>
      </header>

      <div className="card p-4">
        <p className="text-sm text-slate-600">Ask questions about your plan, training, and nutrition.</p>
      </div>
    </section>
  );
}
