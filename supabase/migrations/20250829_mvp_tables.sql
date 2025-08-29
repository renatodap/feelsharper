-- MVP Tables Migration
-- Creates new tables needed for the MVP UI structure

-- ============================================================================
-- Insights Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_id text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  evidence_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  snoozed_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT insights_pkey PRIMARY KEY (id),
  CONSTRAINT insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_severity ON public.insights(severity);
CREATE INDEX IF NOT EXISTS idx_insights_snoozed_until ON public.insights(snoozed_until);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON public.insights(created_at DESC);

-- ============================================================================
-- User Preferences Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid NOT NULL,
  units_weight text NOT NULL DEFAULT 'lbs' CHECK (units_weight IN ('lbs', 'kg')),
  units_distance text NOT NULL DEFAULT 'mi' CHECK (units_distance IN ('mi', 'km')),
  units_volume text NOT NULL DEFAULT 'oz' CHECK (units_volume IN ('oz', 'ml')),
  time_format text NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  persona_preset text NOT NULL DEFAULT 'auto' CHECK (persona_preset IN ('auto', 'endurance', 'strength', 'tennis', 'weight', 'wellness')),
  goals_json jsonb DEFAULT '{}'::jsonb,
  coaching_style text NOT NULL DEFAULT 'direct' CHECK (coaching_style IN ('direct', 'supportive')),
  reminder_time time,
  widget_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- Common Logs Materialized View
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.common_logs AS
SELECT 
  user_id,
  raw_text AS activity,
  type,
  COUNT(*) AS frequency,
  MAX(timestamp) AS last_logged
FROM public.activity_logs
WHERE timestamp > (CURRENT_DATE - INTERVAL '30 days')
GROUP BY user_id, raw_text, type
HAVING COUNT(*) >= 3
ORDER BY frequency DESC;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_common_logs_user_id ON public.common_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_common_logs_frequency ON public.common_logs(frequency DESC);

-- ============================================================================
-- Coach Interactions Table (for tracking Q&A)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coach_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('question', 'answer', 'qa')),
  question text,
  answer text,
  related_logs jsonb DEFAULT '[]'::jsonb,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT coach_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT coach_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coach_interactions_user_id ON public.coach_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_type ON public.coach_interactions(interaction_type);

-- ============================================================================
-- Dashboard Widgets Table (for custom widget configurations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  widget_type text NOT NULL,
  title text NOT NULL,
  enabled boolean DEFAULT true,
  order_position integer NOT NULL DEFAULT 0,
  config_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id),
  CONSTRAINT dashboard_widgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT dashboard_widgets_unique_user_widget UNIQUE (user_id, widget_type)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON public.dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_enabled ON public.dashboard_widgets(enabled);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Insights policies
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" ON public.insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.insights
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Coach interactions policies
CREATE POLICY "Users can view own coach interactions" ON public.coach_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coach interactions" ON public.coach_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dashboard widgets policies
CREATE POLICY "Users can view own widgets" ON public.dashboard_widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own widgets" ON public.dashboard_widgets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to refresh common logs materialized view
CREATE OR REPLACE FUNCTION public.refresh_common_logs()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.common_logs;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Data / Defaults
-- ============================================================================

-- Insert default widget configurations for each persona
INSERT INTO public.dashboard_widgets (user_id, widget_type, title, enabled, order_position, config_json)
SELECT 
  id AS user_id,
  widget.type,
  widget.title,
  widget.enabled,
  widget.order_position,
  widget.config
FROM auth.users
CROSS JOIN (
  VALUES 
    ('streak', 'Logging Streak', true, 1, '{"show_speed": true}'::jsonb),
    ('weight', 'Weight Trend', true, 2, '{"show_sparkline": true}'::jsonb),
    ('volume', 'Training Volume', true, 3, '{"unit": "hours"}'::jsonb),
    ('recovery', 'Recovery Score', true, 4, '{"show_sleep_debt": true}'::jsonb),
    ('hydration', 'Hydration', false, 5, '{"unit": "liters"}'::jsonb),
    ('protein', 'Protein Intake', false, 6, '{"target": 100}'::jsonb),
    ('tennis', 'Tennis Stats', false, 7, '{"show_serves": true}'::jsonb),
    ('adherence', 'Goal Adherence', false, 8, '{"show_percentage": true}'::jsonb)
) AS widget(type, title, enabled, order_position, config)
ON CONFLICT (user_id, widget_type) DO NOTHING;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.insights IS 'Stores AI-generated insights based on user activity patterns';
COMMENT ON TABLE public.user_preferences IS 'User preferences for units, display, goals, and coaching style';
COMMENT ON TABLE public.coach_interactions IS 'Tracks coach Q&A interactions for context and improvement';
COMMENT ON TABLE public.dashboard_widgets IS 'Custom widget configurations per user';
COMMENT ON MATERIALIZED VIEW public.common_logs IS 'Frequently logged activities for quick access';