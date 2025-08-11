import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings — Feel Sharper',
};

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Profile, units, language, and preferences. Forms coming in Step 3/4.</p>
      </header>
      <div className="card p-4">
        <p className="text-sm text-slate-600">Theme, units, and i18n toggles will be available here.</p>
      </div>
    </section>
  );
}
