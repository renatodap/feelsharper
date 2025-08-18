import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/today';

  console.log('Auth callback received:', { code: !!code, next });

  if (code) {
    const cookieStore = await cookies();
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

    console.log('Attempting to exchange code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Code exchange error:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&details=${encodeURIComponent(error.message)}`);
    }

    console.log('Code exchange successful, user:', data.user?.email);
    
    // Create the redirect response
    const redirectResponse = NextResponse.redirect(`${origin}${next}`);
    
    return redirectResponse;
  }

  console.log('No code provided in callback');
  // Auth failed, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&details=no_code`);
}