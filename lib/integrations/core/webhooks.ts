import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { createSupabaseServer } from '@/lib/supabase/server';

// Webhook signature verification utilities
export class WebhookVerifier {
  static verifyStravaSignature(payload: string, signature: string): boolean {
    const secret = process.env.STRAVA_WEBHOOK_SECRET;
    if (!secret) throw new Error('STRAVA_WEBHOOK_SECRET not configured');

    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  static verifyGarminSignature(payload: string, signature: string): boolean {
    const secret = process.env.GARMIN_WEBHOOK_SECRET;
    if (!secret) throw new Error('GARMIN_WEBHOOK_SECRET not configured');

    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    return timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );
  }

  static verifyDiscordSignature(payload: string, timestamp: string, signature: string): boolean {
    const secret = process.env.DISCORD_WEBHOOK_SECRET;
    if (!secret) throw new Error('DISCORD_WEBHOOK_SECRET not configured');

    const expectedSignature = createHmac('sha256', secret)
      .update(timestamp + payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }
}

// Replay attack protection
export class ReplayGuard {
  private static readonly MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly processedNonces = new Set<string>();

  static async isValidTimestamp(timestamp: string): Promise<boolean> {
    const requestTime = parseInt(timestamp) * 1000; // Convert to milliseconds
    const now = Date.now();
    return (now - requestTime) <= this.MAX_AGE_MS;
  }

  static async checkNonce(nonce: string): Promise<boolean> {
    if (this.processedNonces.has(nonce)) {
      return false; // Replay detected
    }

    this.processedNonces.add(nonce);
    
    // Clean up old nonces periodically (simple in-memory approach)
    if (this.processedNonces.size > 10000) {
      this.processedNonces.clear();
    }

    return true;
  }

  static generateNonce(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex');
  }
}

// Idempotency key management
export class IdempotencyManager {
  static async isProcessed(provider: string, externalId: string): Promise<boolean> {
    const supabase = await createSupabaseServer();
    
    const { data } = await supabase
      .from('ingestion_events')
      .select('id')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .single();

    return !!data;
  }

  static async markProcessed(
    userId: string,
    provider: string,
    externalId: string,
    eventType: string,
    occurredAt: Date,
    rawData: any
  ): Promise<string> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('ingestion_events')
      .insert({
        user_id: userId,
        provider,
        external_id: externalId,
        event_type: eventType,
        occurred_at: occurredAt.toISOString(),
        raw_data: rawData,
        processed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}

// Webhook delivery tracking and retry logic
export interface WebhookDelivery {
  id: string;
  userId?: string;
  provider: string;
  webhookUrl: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  responseStatus?: number;
  responseBody?: string;
}

export class WebhookDeliveryManager {
  static async schedule(
    provider: string,
    webhookUrl: string,
    payload: any,
    userId?: string
  ): Promise<string> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .insert({
        user_id: userId,
        provider,
        webhook_url: webhookUrl,
        payload,
        status: 'pending',
        next_retry_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  static async markDelivered(
    id: string,
    responseStatus: number,
    responseBody?: string
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    const { error } = await supabase
      .from('webhook_deliveries')
      .update({
        status: 'delivered',
        last_attempt_at: new Date().toISOString(),
        response_status: responseStatus,
        response_body: responseBody
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async markFailed(
    id: string,
    attempts: number,
    responseStatus?: number,
    responseBody?: string
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    const maxAttempts = 5;
    const backoffMinutes = Math.min(60, Math.pow(2, attempts)); // Exponential backoff, max 1 hour
    const nextRetry = attempts < maxAttempts 
      ? new Date(Date.now() + backoffMinutes * 60 * 1000)
      : null;

    const { error } = await supabase
      .from('webhook_deliveries')
      .update({
        status: attempts >= maxAttempts ? 'failed' : 'pending',
        attempts,
        last_attempt_at: new Date().toISOString(),
        next_retry_at: nextRetry?.toISOString(),
        response_status: responseStatus,
        response_body: responseBody
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async getPendingDeliveries(): Promise<WebhookDelivery[]> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    
    return data.map(this.mapFromDb);
  }

  private static mapFromDb(data: any): WebhookDelivery {
    return {
      id: data.id,
      userId: data.user_id,
      provider: data.provider,
      webhookUrl: data.webhook_url,
      payload: data.payload,
      status: data.status,
      attempts: data.attempts,
      lastAttemptAt: data.last_attempt_at ? new Date(data.last_attempt_at) : undefined,
      nextRetryAt: data.next_retry_at ? new Date(data.next_retry_at) : undefined,
      responseStatus: data.response_status,
      responseBody: data.response_body
    };
  }
}

// Rate limiting per provider
export class RateLimiter {
  private static readonly limits: Record<string, { requests: number; windowMs: number }> = {
    strava: { requests: 600, windowMs: 15 * 60 * 1000 }, // 600 per 15 minutes
    garmin: { requests: 200, windowMs: 60 * 1000 }, // 200 per minute
    googlefit: { requests: 1000, windowMs: 24 * 60 * 60 * 1000 }, // 1000 per day
    discord: { requests: 50, windowMs: 1000 } // 50 per second
  };

  static async checkLimit(provider: string, userId: string): Promise<boolean> {
    const limit = this.limits[provider];
    if (!limit) return true; // No limit configured

    const supabase = await createSupabaseServer();
    const windowStart = new Date(Date.now() - limit.windowMs);

    // Count recent requests
    const { count } = await supabase
      .from('sync_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('provider', provider)
      .gte('created_at', windowStart.toISOString());

    return (count || 0) < limit.requests;
  }

  static async recordRequest(userId: string, provider: string): Promise<void> {
    const supabase = await createSupabaseServer();
    
    await supabase
      .from('sync_jobs')
      .insert({
        user_id: userId,
        provider,
        job_type: 'api_request',
        status: 'completed'
      });
  }
}
