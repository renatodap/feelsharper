import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const { code, next = '/today', error, error_description } = params;

  if (error) {
    // Handle OAuth error
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Authentication Failed</h1>
          <p className="text-text-secondary mb-6">
            {error_description || 'There was an error signing you in. Please try again.'}
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center justify-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (code) {
    // Exchange code for session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful authentication - redirect to next page
      return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }
  }

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-3 border-navy/30 border-t-navy rounded-full animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Signing you in...</h1>
        <p className="text-text-secondary">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}