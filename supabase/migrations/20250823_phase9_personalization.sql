-- Phase 9: Personalization Engine Database Migration
-- Created: 2025-08-23
-- Purpose: Add tables and fields for user personalization, adaptive interventions, and dashboard configuration

-- Enable RLS
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Create enum for user persona types
CREATE TYPE user_persona_type AS ENUM (
  'endurance',
  'strength', 
  'sport',
  'professional',
  'weight_mgmt'
);

-- Create enum for intervention types
CREATE TYPE intervention_type AS ENUM (
  'motivation',
  'reminder',
  'suggestion', 
  'celebration'
);

-- Create enum for motivational preferences
CREATE TYPE motivational_preference AS ENUM (
  'data-driven',
  'emotional',
  'social',
  'competitive'
);

-- Create enum for reward types
CREATE TYPE reward_type AS ENUM (
  'immediate',
  'delayed',
  'variable'
);

-- Create enum for feedback styles
CREATE TYPE feedback_style AS ENUM (
  'gentle',
  'direct',
  'analytical'
);

-- Create enum for difficulty preferences
CREATE TYPE difficulty_preference AS ENUM (
  'tiny',
  'moderate',
  'ambitious'
);

-- Create enum for consistency patterns
CREATE TYPE consistency_pattern AS ENUM (
  'streaks',
  'flexible',
  'routine'
);

-- Create enum for recovery styles
CREATE TYPE recovery_style AS ENUM (
  'forgiveness',
  'restart',
  'gradual'
);

-- 1. User Personalization Profiles Table
CREATE TABLE user_personalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_type user_persona_type NOT NULL,
  persona_confidence INTEGER NOT NULL CHECK (persona_confidence >= 0 AND persona_confidence <= 100),
  persona_indicators JSONB NOT NULL DEFAULT '{}',
  persona_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Dashboard Configuration
  dashboard_config JSONB NOT NULL DEFAULT '{}',
  primary_widgets TEXT[] NOT NULL DEFAULT '{}',
  secondary_widgets TEXT[] NOT NULL DEFAULT '{}',
  dashboard_layout TEXT NOT NULL DEFAULT 'grid',
  default_timeframe TEXT NOT NULL DEFAULT '30d',
  
  -- Motivational Style
  motivational_preference motivational_preference NOT NULL DEFAULT 'data-driven',
  reward_type reward_type NOT NULL DEFAULT 'immediate',
  feedback_style feedback_style NOT NULL DEFAULT 'gentle',
  
  -- Habit Formation Profile
  difficulty_preference difficulty_preference NOT NULL DEFAULT 'tiny',
  consistency_pattern consistency_pattern NOT NULL DEFAULT 'streaks',
  recovery_style recovery_style NOT NULL DEFAULT 'forgiveness',
  
  -- Complete profile data as JSONB for complex queries
  profile_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- 2. Adaptive Interventions Table
CREATE TABLE adaptive_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_template_id TEXT NOT NULL,
  intervention_type intervention_type NOT NULL,
  
  -- Context
  context_data JSONB NOT NULL DEFAULT '{}',
  time_of_day TIME,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Content
  message TEXT NOT NULL,
  action_prompt TEXT,
  intensity TEXT NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  personalized_for user_persona_type NOT NULL,
  
  -- Effectiveness Tracking
  times_used INTEGER NOT NULL DEFAULT 0,
  times_engaged INTEGER NOT NULL DEFAULT 0,
  times_action_taken INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.70 CHECK (success_rate >= 0 AND success_rate <= 1),
  engagement_rate DECIMAL(3,2) NOT NULL DEFAULT 0.80 CHECK (engagement_rate >= 0 AND engagement_rate <= 1),
  effectiveness_score DECIMAL(3,2) NOT NULL DEFAULT 0.70 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  
  -- Usage Tracking
  last_used_at TIMESTAMPTZ,
  times_used_today INTEGER NOT NULL DEFAULT 0,
  cooldown_minutes INTEGER NOT NULL DEFAULT 720, -- 12 hours default
  max_daily_uses INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Intervention Outcomes Table (for learning)
CREATE TABLE intervention_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES adaptive_interventions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Outcome Data
  engaged BOOLEAN NOT NULL DEFAULT FALSE,
  action_taken BOOLEAN NOT NULL DEFAULT FALSE,
  success_conditions_met TEXT[] NOT NULL DEFAULT '{}',
  time_to_action_ms INTEGER, -- milliseconds from show to action
  user_feedback TEXT CHECK (user_feedback IN ('positive', 'neutral', 'negative')),
  
  -- Context at time of intervention
  context_snapshot JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Dashboard Interactions Table (for learning preferences)
CREATE TABLE dashboard_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interaction Data
  widget_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'expand', 'hide', 'click', 'hover')),
  duration_ms INTEGER, -- time spent on widget
  
  -- Context
  session_id TEXT,
  page_context TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Graduated Habit Tracking Table
CREATE TABLE graduated_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Habit Definition
  habit_type TEXT NOT NULL, -- activity type or custom habit
  current_difficulty difficulty_preference NOT NULL DEFAULT 'tiny',
  target_difficulty difficulty_preference NOT NULL DEFAULT 'moderate',
  
  -- Progression Tracking
  consecutive_successes INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 1),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Graduation Logic
  ready_for_graduation BOOLEAN NOT NULL DEFAULT FALSE,
  last_graduation_at TIMESTAMPTZ,
  graduation_threshold INTEGER NOT NULL DEFAULT 7, -- days of success before graduation
  
  -- Recovery Tracking
  lapse_count INTEGER NOT NULL DEFAULT 0,
  last_lapse_at TIMESTAMPTZ,
  recovery_time_avg_hours DECIMAL(5,2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_user_personalization_user_id ON user_personalization(user_id);
CREATE INDEX idx_user_personalization_persona_type ON user_personalization(persona_type);
CREATE INDEX idx_user_personalization_updated_at ON user_personalization(updated_at);

CREATE INDEX idx_adaptive_interventions_user_id ON adaptive_interventions(user_id);
CREATE INDEX idx_adaptive_interventions_template_id ON adaptive_interventions(intervention_template_id);
CREATE INDEX idx_adaptive_interventions_type ON adaptive_interventions(intervention_type);
CREATE INDEX idx_adaptive_interventions_last_used ON adaptive_interventions(last_used_at);
CREATE INDEX idx_adaptive_interventions_persona ON adaptive_interventions(personalized_for);

CREATE INDEX idx_intervention_outcomes_intervention_id ON intervention_outcomes(intervention_id);
CREATE INDEX idx_intervention_outcomes_user_id ON intervention_outcomes(user_id);
CREATE INDEX idx_intervention_outcomes_created_at ON intervention_outcomes(created_at);
CREATE INDEX idx_intervention_outcomes_engaged ON intervention_outcomes(engaged);
CREATE INDEX idx_intervention_outcomes_action_taken ON intervention_outcomes(action_taken);

CREATE INDEX idx_dashboard_interactions_user_id ON dashboard_interactions(user_id);
CREATE INDEX idx_dashboard_interactions_widget_id ON dashboard_interactions(widget_id);
CREATE INDEX idx_dashboard_interactions_interaction_type ON dashboard_interactions(interaction_type);
CREATE INDEX idx_dashboard_interactions_created_at ON dashboard_interactions(created_at);

CREATE INDEX idx_graduated_habits_user_id ON graduated_habits(user_id);
CREATE INDEX idx_graduated_habits_habit_type ON graduated_habits(habit_type);
CREATE INDEX idx_graduated_habits_is_active ON graduated_habits(is_active);
CREATE INDEX idx_graduated_habits_ready_for_graduation ON graduated_habits(ready_for_graduation);

-- Enable Row Level Security
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduated_habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User Personalization
CREATE POLICY \"Users can view their own personalization\" 
ON user_personalization FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own personalization\" 
ON user_personalization FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY \"Users can update their own personalization\" 
ON user_personalization FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Adaptive Interventions
CREATE POLICY \"Users can view their own interventions\" 
ON adaptive_interventions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own interventions\" 
ON adaptive_interventions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY \"Users can update their own interventions\" 
ON adaptive_interventions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Intervention Outcomes
CREATE POLICY \"Users can view their own intervention outcomes\" 
ON intervention_outcomes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own intervention outcomes\" 
ON intervention_outcomes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Dashboard Interactions
CREATE POLICY \"Users can view their own dashboard interactions\" 
ON dashboard_interactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own dashboard interactions\" 
ON dashboard_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Graduated Habits
CREATE POLICY \"Users can view their own graduated habits\" 
ON graduated_habits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own graduated habits\" 
ON graduated_habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY \"Users can update their own graduated habits\" 
ON graduated_habits FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_personalization_updated_at 
  BEFORE UPDATE ON user_personalization 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adaptive_interventions_updated_at 
  BEFORE UPDATE ON adaptive_interventions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graduated_habits_updated_at 
  BEFORE UPDATE ON graduated_habits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset daily intervention counters
CREATE OR REPLACE FUNCTION reset_daily_intervention_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE adaptive_interventions 
  SET times_used_today = 0
  WHERE last_used_at::date < CURRENT_DATE;
END;
$$;

-- Create function to calculate habit success rate
CREATE OR REPLACE FUNCTION update_habit_success_rates()
RETURNS TRIGGER AS $$
BEGIN
  NEW.success_rate = CASE 
    WHEN NEW.total_attempts > 0 
    THEN NEW.consecutive_successes::DECIMAL / NEW.total_attempts::DECIMAL
    ELSE 0 
  END;
  
  -- Check if ready for graduation
  NEW.ready_for_graduation = (
    NEW.consecutive_successes >= NEW.graduation_threshold 
    AND NEW.success_rate >= 0.8
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_graduated_habits_success_rate 
  BEFORE UPDATE ON graduated_habits 
  FOR EACH ROW EXECUTE FUNCTION update_habit_success_rates();

-- Create function to get user's current personalization profile
CREATE OR REPLACE FUNCTION get_user_personalization_profile(user_uuid UUID)
RETURNS TABLE (
  persona_type user_persona_type,
  confidence INTEGER,
  dashboard_config JSONB,
  motivational_style JSONB,
  habit_profile JSONB,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.persona_type,
    up.persona_confidence,
    up.dashboard_config,
    jsonb_build_object(
      'preference', up.motivational_preference,
      'rewardType', up.reward_type,
      'feedbackStyle', up.feedback_style
    ) as motivational_style,
    jsonb_build_object(
      'difficultyPreference', up.difficulty_preference,
      'consistencyPattern', up.consistency_pattern,
      'recoveryStyle', up.recovery_style
    ) as habit_profile,
    up.updated_at
  FROM user_personalization up
  WHERE up.user_id = user_uuid;
END;
$$;

-- Create function to record intervention outcome
CREATE OR REPLACE FUNCTION record_intervention_outcome(
  intervention_uuid UUID,
  user_uuid UUID,
  was_engaged BOOLEAN,
  was_action_taken BOOLEAN,
  success_conditions TEXT[],
  action_time_ms INTEGER DEFAULT NULL,
  feedback TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert outcome record
  INSERT INTO intervention_outcomes (
    intervention_id,
    user_id,
    engaged,
    action_taken,
    success_conditions_met,
    time_to_action_ms,
    user_feedback
  ) VALUES (
    intervention_uuid,
    user_uuid,
    was_engaged,
    was_action_taken,
    success_conditions,
    action_time_ms,
    feedback
  );
  
  -- Update intervention effectiveness
  UPDATE adaptive_interventions 
  SET 
    times_used = times_used + 1,
    times_engaged = times_engaged + (CASE WHEN was_engaged THEN 1 ELSE 0 END),
    times_action_taken = times_action_taken + (CASE WHEN was_action_taken THEN 1 ELSE 0 END),
    success_rate = (
      (success_rate * times_used + (CASE WHEN was_action_taken THEN 1 ELSE 0 END)) / (times_used + 1)
    ),
    engagement_rate = (
      (engagement_rate * times_used + (CASE WHEN was_engaged THEN 1 ELSE 0 END)) / (times_used + 1)
    ),
    last_used_at = NOW(),
    times_used_today = times_used_today + 1
  WHERE id = intervention_uuid;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_personalization IS 'Stores user persona detection results and personalization preferences';
COMMENT ON TABLE adaptive_interventions IS 'Behavioral intervention templates with effectiveness tracking';
COMMENT ON TABLE intervention_outcomes IS 'Records user responses to interventions for machine learning';
COMMENT ON TABLE dashboard_interactions IS 'Tracks user interactions with dashboard widgets for personalization';
COMMENT ON TABLE graduated_habits IS 'Tracks habit progression from tiny to ambitious difficulty levels';

COMMENT ON FUNCTION get_user_personalization_profile IS 'Retrieves complete personalization profile for a user';
COMMENT ON FUNCTION record_intervention_outcome IS 'Records intervention outcome and updates effectiveness metrics';
COMMENT ON FUNCTION reset_daily_intervention_counters IS 'Resets daily usage counters (run via cron job)';
COMMENT ON FUNCTION update_habit_success_rates IS 'Automatically calculates habit success rates and graduation readiness';