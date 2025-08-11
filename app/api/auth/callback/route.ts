import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check if this is a new user and needs onboarding
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        // If no profile exists, redirect to onboarding
        if (!profile) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
        }
      }
      
      // Redirect to the originally requested page or dashboard
      return NextResponse.redirect(new URL(redirect, requestUrl.origin));
    }
  }

  // Return to sign-in page if there's an error
  return NextResponse.redirect(new URL('/sign-in?error=auth_callback_error', requestUrl.origin));
}