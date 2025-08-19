-- AI Usage Tracking and Cost-Based Tier System
-- Track AI token usage and enforce monthly limits per subscription tier

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('groq', 'openai', 'anthropic')),
  model TEXT NOT NULL,
  feature TEXT NOT NULL, -- 'chat', 'insights', 'meal_suggestions', etc.
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10, 6) NOT NULL DEFAULT 0, -- Cost in USD
  request_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription tiers configuration
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name TEXT UNIQUE NOT NULL CHECK (tier_name IN ('free', 'starter', 'pro')),
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  max_cost_monthly DECIMAL(10, 2) NOT NULL, -- Maximum AI cost per month
  max_queries_monthly INTEGER, -- NULL for unlimited
  features JSONB NOT NULL DEFAULT '[]',
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user usage summary table (materialized for performance)
CREATE TABLE IF NOT EXISTS public.user_usage_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 6) DEFAULT 0,
  total_queries INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, billing_period_start)
);

-- Update profiles table with tier information
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_tier CASCADE,
ADD COLUMN subscription_tier TEXT CHECK (subscription_tier IN ('free', 'starter', 'pro')) DEFAULT 'free',
ADD COLUMN billing_cycle_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_ai_usage_user ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_created ON public.ai_usage(created_at DESC);
CREATE INDEX idx_ai_usage_user_created ON public.ai_usage(user_id, created_at DESC);
CREATE INDEX idx_user_usage_summary_user_period ON public.user_usage_summary(user_id, billing_period_start);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert AI usage" ON public.ai_usage
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Users can view own usage summary" ON public.user_usage_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage summary" ON public.user_usage_summary
  FOR ALL TO service_role USING (true);

CREATE POLICY "All users can view subscription tiers" ON public.subscription_tiers
  FOR SELECT TO authenticated USING (true);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (tier_name, display_name, price_monthly, max_cost_monthly, max_queries_monthly, features, ai_provider, ai_model)
VALUES 
  ('free', 'Free', 0.00, 0.50, 100, '["basic_chat", "daily_insights"]', 'groq', 'mixtral-8x7b-32768'),
  ('starter', 'Starter', 4.99, 5.00, 1000, '["unlimited_chat", "meal_suggestions", "workout_plans", "weekly_reports"]', 'openai', 'gpt-3.5-turbo'),
  ('pro', 'Pro', 14.99, 15.00, NULL, '["coach_mode", "voice_input", "custom_programs", "priority_support", "advanced_analytics"]', 'anthropic', 'claude-3-haiku-20240307')
ON CONFLICT (tier_name) DO NOTHING;

-- Function to track AI usage
CREATE OR REPLACE FUNCTION track_ai_usage(
  p_user_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_feature TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_estimated_cost DECIMAL(10, 6),
  p_request_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
  v_billing_start DATE;
  v_total_tokens INTEGER;
BEGIN
  -- Calculate total tokens
  v_total_tokens := p_input_tokens + p_output_tokens;
  
  -- Get user's billing cycle start
  SELECT billing_cycle_start INTO v_billing_start
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Insert usage record
  INSERT INTO public.ai_usage (
    user_id, provider, model, feature, 
    input_tokens, output_tokens, total_tokens, 
    estimated_cost, request_id, metadata
  ) VALUES (
    p_user_id, p_provider, p_model, p_feature,
    p_input_tokens, p_output_tokens, v_total_tokens,
    p_estimated_cost, p_request_id, p_metadata
  ) RETURNING id INTO v_usage_id;
  
  -- Update or insert usage summary
  INSERT INTO public.user_usage_summary (
    user_id, billing_period_start, billing_period_end,
    total_tokens_used, total_cost_usd, total_queries
  ) VALUES (
    p_user_id, v_billing_start, v_billing_start + INTERVAL '1 month',
    v_total_tokens, p_estimated_cost, 1
  )
  ON CONFLICT (user_id, billing_period_start)
  DO UPDATE SET
    total_tokens_used = user_usage_summary.total_tokens_used + v_total_tokens,
    total_cost_usd = user_usage_summary.total_cost_usd + p_estimated_cost,
    total_queries = user_usage_summary.total_queries + 1,
    last_updated = NOW();
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has AI quota remaining
CREATE OR REPLACE FUNCTION check_ai_quota(
  p_user_id UUID
) RETURNS TABLE (
  has_quota BOOLEAN,
  current_cost DECIMAL(10, 6),
  max_cost DECIMAL(10, 2),
  queries_used INTEGER,
  max_queries INTEGER,
  tier_name TEXT
) AS $$
DECLARE
  v_tier TEXT;
  v_billing_start DATE;
  v_current_cost DECIMAL(10, 6);
  v_max_cost DECIMAL(10, 2);
  v_queries_used INTEGER;
  v_max_queries INTEGER;
BEGIN
  -- Get user tier and billing start
  SELECT subscription_tier, billing_cycle_start 
  INTO v_tier, v_billing_start
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get tier limits
  SELECT max_cost_monthly, max_queries_monthly
  INTO v_max_cost, v_max_queries
  FROM public.subscription_tiers
  WHERE tier_name = v_tier;
  
  -- Get current usage
  SELECT COALESCE(total_cost_usd, 0), COALESCE(total_queries, 0)
  INTO v_current_cost, v_queries_used
  FROM public.user_usage_summary
  WHERE user_id = p_user_id 
    AND billing_period_start = v_billing_start;
  
  -- Return quota check
  RETURN QUERY SELECT
    (v_current_cost < v_max_cost AND (v_max_queries IS NULL OR v_queries_used < v_max_queries)) AS has_quota,
    v_current_cost AS current_cost,
    v_max_cost AS max_cost,
    v_queries_used AS queries_used,
    v_max_queries AS max_queries,
    v_tier AS tier_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (run via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS void AS $$
BEGIN
  -- Update billing cycle start for users whose cycle has ended
  UPDATE public.profiles
  SET billing_cycle_start = CURRENT_DATE
  WHERE billing_cycle_start + INTERVAL '1 month' <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION track_ai_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_ai_quota TO authenticated;
GRANT EXECUTE ON FUNCTION reset_monthly_usage TO service_role;