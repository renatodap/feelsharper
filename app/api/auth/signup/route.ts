import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, invite } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // Check invite code if required
    if (process.env.REQUIRE_INVITE_CODE === '1') {
      if (!invite || invite !== process.env.INVITE_CODE) {
        return NextResponse.json(
          { error: 'Valid invite code required for beta access' },
          { status: 403 }
        );
      }
    }
    
    const supabase = await createClient();
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (data.user) {
      // Check if email confirmation is required
      if (data.user.identities?.length === 0) {
        return NextResponse.json({
          success: true,
          requiresEmailConfirmation: true,
          message: 'Check your email to confirm your account'
        });
      }
      
      // If no email confirmation needed, create session
      if (data.session) {
        const response = NextResponse.json({
          success: true,
          user: data.user,
          redirectTo: '/today'
        });
        
        response.cookies.set('auth-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        
        return response;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account created. Please sign in.'
    });
    
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Sign up failed' },
      { status: 500 }
    );
  }
}