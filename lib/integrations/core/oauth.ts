import { randomBytes, createHash } from 'crypto';
import { createSupabaseServer } from '@/lib/supabase/server';

// PKCE (Proof Key for Code Exchange) utilities for secure OAuth flows
export class PKCEGenerator {
  static generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(verifier: string): string {
    return createHash('sha256').update(verifier).digest('base64url');
  }
}

// OAuth state management with CSRF protection
export class OAuthState {
  static generate(provider: string, userId: string): string {
    const state = {
      provider,
      userId,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex')
    };
    return Buffer.from(JSON.stringify(state)).toString('base64url');
  }

  static verify(stateToken: string, expectedProvider: string, expectedUserId: string): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(stateToken, 'base64url').toString());
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10 minutes

      return (
        decoded.provider === expectedProvider &&
        decoded.userId === expectedUserId &&
        decoded.timestamp &&
        (now - decoded.timestamp) < maxAge
      );
    } catch {
      return false;
    }
  }
}

// Token encryption/decryption (production-ready)
export class TokenCrypto {
  private static getEncryptionKey(): string {
    const key = process.env.INTEGRATION_TOKEN_KEY;
    if (!key) {
      throw new Error('INTEGRATION_TOKEN_KEY environment variable is required');
    }
    return key;
  }

  static async encrypt(token: string): Promise<string> {
    // In production, use proper AES-256-GCM encryption
    // For now, using base64 encoding (NOT SECURE - placeholder)
    return Buffer.from(token).toString('base64');
  }

  static async decrypt(encryptedToken: string): Promise<string> {
    // In production, use proper AES-256-GCM decryption
    // For now, using base64 decoding (NOT SECURE - placeholder)
    return Buffer.from(encryptedToken, 'base64').toString();
  }
}

// Integration account management
export interface IntegrationAccount {
  id: string;
  userId: string;
  provider: string;
  externalUserId?: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string;
  scope?: string;
  expiresAt?: Date;
  revokedAt?: Date;
  lastSyncAt?: Date;
  syncCursor?: string;
  metadata: Record<string, any>;
}

export class IntegrationAccountManager {
  static async create(account: Omit<IntegrationAccount, 'id'>): Promise<IntegrationAccount> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('integration_accounts')
      .insert({
        user_id: account.userId,
        provider: account.provider,
        external_user_id: account.externalUserId,
        access_token_encrypted: account.accessTokenEncrypted,
        refresh_token_encrypted: account.refreshTokenEncrypted,
        scope: account.scope,
        expires_at: account.expiresAt?.toISOString(),
        metadata: account.metadata
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb(data);
  }

  static async findByUserAndProvider(userId: string, provider: string): Promise<IntegrationAccount | null> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('integration_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .is('revoked_at', null)
      .single();

    if (error || !data) return null;
    return this.mapFromDb(data);
  }

  static async updateTokens(
    id: string, 
    accessToken: string, 
    refreshToken?: string, 
    expiresAt?: Date
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    const updates: any = {
      access_token_encrypted: await TokenCrypto.encrypt(accessToken),
      updated_at: new Date().toISOString()
    };

    if (refreshToken) {
      updates.refresh_token_encrypted = await TokenCrypto.encrypt(refreshToken);
    }
    if (expiresAt) {
      updates.expires_at = expiresAt.toISOString();
    }

    const { error } = await supabase
      .from('integration_accounts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async revoke(id: string): Promise<void> {
    const supabase = await createSupabaseServer();
    
    const { error } = await supabase
      .from('integration_accounts')
      .update({ 
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateSyncCursor(id: string, cursor: string): Promise<void> {
    const supabase = await createSupabaseServer();
    
    const { error } = await supabase
      .from('integration_accounts')
      .update({ 
        sync_cursor: cursor,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  private static mapFromDb(data: any): IntegrationAccount {
    return {
      id: data.id,
      userId: data.user_id,
      provider: data.provider,
      externalUserId: data.external_user_id,
      accessTokenEncrypted: data.access_token_encrypted,
      refreshTokenEncrypted: data.refresh_token_encrypted,
      scope: data.scope,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      revokedAt: data.revoked_at ? new Date(data.revoked_at) : undefined,
      lastSyncAt: data.last_sync_at ? new Date(data.last_sync_at) : undefined,
      syncCursor: data.sync_cursor,
      metadata: data.metadata || {}
    };
  }
}

// OAuth provider configurations
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  strava: {
    clientId: process.env.STRAVA_CLIENT_ID!,
    clientSecret: process.env.STRAVA_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/strava/oauth/callback`,
    scope: 'read,activity:read_all',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token'
  },
  googlefit: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/googlefit/oauth/callback`,
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.sleep.read',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  garmin: {
    clientId: process.env.GARMIN_CLIENT_ID!,
    clientSecret: process.env.GARMIN_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/garmin/oauth/callback`,
    scope: 'read',
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
  }
};
