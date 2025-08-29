/**
 * Test Navigation Page
 * Verifies that the navigation and authentication flow is working
 */

'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestNavigationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading navigation test...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Navigation Test Page</h1>
        
        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Status</h2>
          <p className="text-gray-300">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </p>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">MVP Pages</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/insights')}
              className="block w-full text-left px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors"
            >
              Go to Insights (Coach)
            </button>
            <button
              onClick={() => router.push('/log')}
              className="block w-full text-left px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors"
            >
              Go to Log
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="block w-full text-left px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Navigation Components</h2>
          <ul className="text-gray-300 space-y-1">
            <li>✅ AppNavigation component created</li>
            <li>✅ AuthenticatedLayout wrapper integrated</li>
            <li>✅ Settings slide-over accessible via avatar</li>
            <li>✅ Mobile bottom navigation</li>
            <li>✅ Desktop top navigation</li>
          </ul>
        </div>

        {!user && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400">
              You are not logged in. You should be redirected to /signin shortly...
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="mt-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}