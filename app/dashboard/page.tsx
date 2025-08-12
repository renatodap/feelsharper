import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard — Feel Sharper',
  description: 'Your personalized wellness dashboard. Track progress, get AI insights, and stay motivated on your journey.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600">
              Your personalized wellness dashboard
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-600">
              Dashboard functionality is being restored.
            </p>
            <div className="mt-4 space-x-4">
              <Link 
                href="/sign-in" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/blog" 
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
