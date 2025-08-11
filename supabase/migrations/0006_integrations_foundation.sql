-- Integration Foundation Schema
-- Supports OAuth providers, webhook ingestion, and normalized metrics

-- Integration accounts (encrypted token storage)
CREATE TABLE integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('healthkit', 'googlefit', 'strava', 'garmin', 'oura', 'fitbit', 'whoop', 'discord')),
  external_user_id TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT, -- For incremental sync
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);

-- Raw ingestion events (idempotent webhook/sync data)
CREATE TABLE ingestion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL, -- Provider's unique ID for this event
  event_type TEXT NOT NULL, -- 'workout', 'sleep', 'nutrition', 'biometric'
  occurred_at TIMESTAMPTZ NOT NULL,
  raw_data JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider, external_id) -- Prevent duplicates
);

-- Normalized workout metrics
CREATE TABLE metrics_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingestion_event_id UUID REFERENCES ingestion_events(id),
  external_id TEXT,
  provider TEXT NOT NULL,
  workout_type TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility', 'sports'
  name TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  calories_burned INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  distance_meters DECIMAL,
  elevation_gain_meters DECIMAL,
  metadata JSONB DEFAULT '{}', -- Provider-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX(user_id, started_at DESC)
);

-- Normalized sleep metrics
CREATE TABLE metrics_sleep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingestion_event_id UUID REFERENCES ingestion_events(id),
  external_id TEXT,
  provider TEXT NOT NULL,
  sleep_date DATE NOT NULL, -- Date of the sleep (not start time)
  bedtime TIMESTAMPTZ,
  sleep_start TIMESTAMPTZ,
  sleep_end TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  total_sleep_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  sleep_efficiency DECIMAL, -- Percentage
  sleep_score INTEGER, -- 0-100 if available
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, sleep_date, provider)
);

-- Normalized biometric data (HR, HRV, etc.)
CREATE TABLE metrics_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingestion_event_id UUID REFERENCES ingestion_events(id),
  external_id TEXT,
  provider TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'resting_hr', 'hrv', 'stress', 'readiness'
  value DECIMAL NOT NULL,
  unit TEXT, -- 'bpm', 'ms', 'score'
  recorded_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX(user_id, metric_type, recorded_at DESC)
);

-- Webhook delivery tracking (for Discord, etc.)
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'failed'
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX(status, next_retry_at) -- For retry jobs
);

-- Integration sync jobs tracking
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'full', 'incremental'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cursor_before TEXT,
  cursor_after TEXT,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX(user_id, provider, created_at DESC)
);

-- RLS Policies
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_sleep ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own integration data
CREATE POLICY "Users can manage their integration accounts" ON integration_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their ingestion events" ON ingestion_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their workout metrics" ON metrics_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their sleep metrics" ON metrics_sleep
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their biometric metrics" ON metrics_biometrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their sync jobs" ON sync_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for token encryption (placeholder - implement with app-level crypto)
CREATE OR REPLACE FUNCTION encrypt_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, this should use proper encryption
  -- For now, return base64 encoded (NOT SECURE)
  RETURN encode(token::bytea, 'base64');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, this should use proper decryption
  -- For now, return base64 decoded (NOT SECURE)
  RETURN convert_from(decode(encrypted_token, 'base64'), 'UTF8');
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_accounts_updated_at
  BEFORE UPDATE ON integration_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial feature flags for integrations
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, metadata) VALUES
  ('integration_healthkit', 'Apple HealthKit integration', true, 100, '{"platforms": ["ios"]}'),
  ('integration_googlefit', 'Google Fit integration', true, 100, '{"platforms": ["android"]}'),
  ('integration_strava', 'Strava integration', true, 50, '{"beta": true}'),
  ('integration_garmin', 'Garmin Connect integration', false, 0, '{"dev_access_required": true}'),
  ('integration_discord', 'Discord webhooks for squads', true, 100, '{}'),
  ('integration_oura', 'Oura Cloud integration', false, 0, '{"premium_only": true}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  metadata = EXCLUDED.metadata;
