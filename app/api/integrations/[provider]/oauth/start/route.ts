import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { PKCEGenerator, OAuthState, OAUTH_CONFIGS } from '@/lib/integrations/core/oauth';

// GET /api/integrations/[provider]/oauth/start
// Initiates OAuth flow with PKCE for secure authorization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const config = OAUTH_CONFIGS[provider];
    
    if (!config) {
      return NextResponse.json({ error: 'Provider not supported' }, { status: 400 });
    }

    // Check if user already has this integration
    const { data: existingAccount } = await supabase
      .from('integration_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .is('revoked_at', null)
      .single();

    if (existingAccount) {
      return NextResponse.json({ error: 'Integration already exists' }, { status: 409 });
    }

    // Generate PKCE parameters
    const codeVerifier = PKCEGenerator.generateCodeVerifier();
    const codeChallenge = PKCEGenerator.generateCodeChallenge(codeVerifier);
    const state = OAuthState.generate(provider, user.id);

    // Store PKCE verifier in session (or secure cookie)
    const response = NextResponse.json({ 
      authUrl: buildAuthUrl(config, codeChallenge, state),
      state 
    });

    // Store code verifier securely for callback
    response.cookies.set(`oauth_verifier_${provider}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 // 10 minutes
    });

    return response;

  } catch (error) {
    console.error('OAuth start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildAuthUrl(config: any, codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${config.authUrl}?${params.toString()}`;
}
