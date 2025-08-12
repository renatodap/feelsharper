import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { OAuthState, OAUTH_CONFIGS, IntegrationAccountManager, TokenCrypto } from '@/lib/integrations/core/oauth';

// GET /api/integrations/[provider]/oauth/callback
// Handles OAuth callback and exchanges code for tokens
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`);
    }

    const { provider } = await params;
    const config = OAUTH_CONFIGS[provider];
    
    if (!config) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=invalid_provider`);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=oauth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=missing_params`);
    }

    // Verify state parameter
    if (!OAuthState.verify(state, provider, user.id)) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=invalid_state`);
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get(`oauth_verifier_${provider}`)?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=missing_verifier`);
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(config, code, codeVerifier);
    
    if (!tokenResponse.access_token) {
      throw new Error('No access token received');
    }

    // Get user info from provider (if needed)
    const externalUserId = await getExternalUserId(provider, tokenResponse.access_token);

    // Store integration account
    await IntegrationAccountManager.create({
      userId: user.id,
      provider,
      externalUserId,
      accessTokenEncrypted: await TokenCrypto.encrypt(tokenResponse.access_token),
      refreshTokenEncrypted: tokenResponse.refresh_token ? await TokenCrypto.encrypt(tokenResponse.refresh_token) : undefined,
      scope: tokenResponse.scope || config.scope,
      expiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000) : undefined,
      metadata: {
        tokenType: tokenResponse.token_type || 'Bearer',
        connectedAt: new Date().toISOString()
      }
    });

    // Clear the code verifier cookie
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=${provider}`);
    response.cookies.delete(`oauth_verifier_${provider}`);

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'integration.connected',
      properties: {
        provider,
        external_user_id: externalUserId
      }
    });

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=callback_failed`);
  }
}

async function exchangeCodeForTokens(config: any, code: string, codeVerifier: string) {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
      redirect_uri: config.redirectUri
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

async function getExternalUserId(provider: string, accessToken: string): Promise<string | undefined> {
  try {
    switch (provider) {
      case 'strava':
        const stravaResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const stravaData = await stravaResponse.json();
        return stravaData.id?.toString();

      case 'googlefit':
        // Google Fit doesn't have a simple user ID endpoint
        // We'll use the OAuth sub claim from the token if available
        return undefined;

      case 'garmin':
        // Garmin Connect user info endpoint
        const garminResponse = await fetch('https://connectapi.garmin.com/userprofile-service/userprofile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const garminData = await garminResponse.json();
        return garminData.userId?.toString();

      default:
        return undefined;
    }
  } catch (error) {
    console.error(`Failed to get external user ID for ${provider}:`, error);
    return undefined;
  }
}
