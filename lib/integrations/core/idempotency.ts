import { createSupabaseServer } from '@/lib/supabase/server';

// Idempotency utilities for preventing duplicate processing
export class IdempotencyKey {
  static generate(provider: string, externalId: string, eventType: string): string {
    return `${provider}:${eventType}:${externalId}`;
  }

  static parse(key: string): { provider: string; eventType: string; externalId: string } | null {
    const parts = key.split(':');
    if (parts.length !== 3) return null;
    
    return {
      provider: parts[0],
      eventType: parts[1],
      externalId: parts[2]
    };
  }
}

// Duplicate event detection and handling
export class DuplicateEventManager {
  static async isDuplicate(
    provider: string,
    externalId: string,
    eventType: string
  ): Promise<boolean> {
    const supabase = await createSupabaseServer();
    
    const { data } = await supabase
      .from('ingestion_events')
      .select('id')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .eq('event_type', eventType)
      .single();

    return !!data;
  }

  static async recordEvent(
    userId: string,
    provider: string,
    externalId: string,
    eventType: string,
    occurredAt: Date,
    rawData: any
  ): Promise<string> {
    const supabase = await createSupabaseServer();
    
    // Use upsert to handle race conditions
    const { data, error } = await supabase
      .from('ingestion_events')
      .upsert({
        user_id: userId,
        provider,
        external_id: externalId,
        event_type: eventType,
        occurred_at: occurredAt.toISOString(),
        raw_data: rawData,
        processed_at: new Date().toISOString()
      }, {
        onConflict: 'provider,external_id',
        ignoreDuplicates: true
      })
      .select('id')
      .single();

    if (error && error.code !== '23505') { // Ignore unique constraint violations
      throw error;
    }

    return data?.id || '';
  }

  static async markProcessingError(
    eventId: string,
    error: string
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    await supabase
      .from('ingestion_events')
      .update({
        processing_error: error,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId);
  }
}

// Background job deduplication
export class JobDeduplication {
  static async isJobRunning(
    userId: string,
    provider: string,
    jobType: string
  ): Promise<boolean> {
    const supabase = await createSupabaseServer();
    
    const { data } = await supabase
      .from('sync_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('job_type', jobType)
      .eq('status', 'running')
      .single();

    return !!data;
  }

  static async startJob(
    userId: string,
    provider: string,
    jobType: string,
    metadata?: any
  ): Promise<string> {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('sync_jobs')
      .insert({
        user_id: userId,
        provider,
        job_type: jobType,
        status: 'running',
        started_at: new Date().toISOString(),
        metadata: metadata || {}
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  static async completeJob(
    jobId: string,
    recordsProcessed: number,
    cursorAfter?: string
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    await supabase
      .from('sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        cursor_after: cursorAfter
      })
      .eq('id', jobId);
  }

  static async failJob(
    jobId: string,
    errorMessage: string
  ): Promise<void> {
    const supabase = await createSupabaseServer();
    
    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', jobId);
  }
}
