-- Phase 5.5: Confidence-Based Friction Reduction Tables
-- Migration: 20250821_phase_5_5_friction_reduction.sql
-- Adds support for tracking user interactions with friction reduction features

-- Create friction_interactions table to track user engagement with reduced friction UI
CREATE TABLE IF NOT EXISTS friction_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Coaching session context
  coaching_interaction_id UUID REFERENCES coaching_interactions(id) ON DELETE CASCADE,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  
  -- Friction reduction feature used
  feature_type TEXT NOT NULL CHECK (feature_type IN ('one_tap_action', 'smart_default', 'cognitive_load_reduction', 'adaptive_tone')),
  action_taken TEXT NOT NULL,
  action_label TEXT,
  
  -- User response metrics
  response_time_ms INTEGER, -- How quickly user responded
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  
  -- Context for analysis
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  
  -- Metadata for analysis
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_friction_interactions_user_id ON friction_interactions(user_id);
CREATE INDEX idx_friction_interactions_feature_type ON friction_interactions(feature_type);
CREATE INDEX idx_friction_interactions_confidence ON friction_interactions(confidence_level);
CREATE INDEX idx_friction_interactions_created_at ON friction_interactions(created_at);

-- Create user_tone_preferences table to store adaptive tone learning
CREATE TABLE IF NOT EXISTS user_tone_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Learned tone preferences
  preferred_style TEXT CHECK (preferred_style IN ('data_driven', 'emotional', 'competitive', 'gentle', 'coach_authoritative')),
  motivation_match_score DECIMAL(4,2) DEFAULT 70.00,
  
  -- Adaptive learning data
  tone_interactions JSONB DEFAULT '{}', -- Track responses to different tones
  personalization_data JSONB DEFAULT '{}',
  
  -- Confidence in our tone detection
  confidence_score DECIMAL(4,2) DEFAULT 50.00,
  learning_sessions_count INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create one_tap_action_usage table to track effectiveness of quick actions
CREATE TABLE IF NOT EXISTS one_tap_action_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT NOT NULL,
  action_label TEXT NOT NULL,
  confidence_boost INTEGER DEFAULT 0,
  
  -- Usage metrics
  times_presented INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Performance data
  average_response_time_ms DECIMAL(10,2),
  user_satisfaction_avg DECIMAL(3,2),
  
  -- Temporal data
  last_used_at TIMESTAMP WITH TIME ZONE,
  first_presented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create smart_defaults_effectiveness table
CREATE TABLE IF NOT EXISTS smart_defaults_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Default choice tracking
  category TEXT NOT NULL, -- 'nutrition', 'exercise', 'sleep', etc.
  default_choice TEXT NOT NULL,
  chosen_alternative TEXT,
  reasoning TEXT,
  
  -- Effectiveness metrics
  user_chose_default BOOLEAN DEFAULT FALSE,
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  outcome_success BOOLEAN, -- Did the choice lead to positive outcome?
  
  -- Context for improvement
  user_profile_data JSONB DEFAULT '{}',
  context_at_choice JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics
CREATE INDEX idx_one_tap_usage_user_id ON one_tap_action_usage(user_id);
CREATE INDEX idx_one_tap_usage_action_type ON one_tap_action_usage(action_type);
CREATE INDEX idx_smart_defaults_user_id ON smart_defaults_effectiveness(user_id);
CREATE INDEX idx_smart_defaults_category ON smart_defaults_effectiveness(category);

-- Add RLS policies for data security
ALTER TABLE friction_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_tap_action_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_defaults_effectiveness ENABLE ROW LEVEL SECURITY;

-- Users can only access their own friction interaction data
CREATE POLICY "Users can manage their own friction interactions" 
ON friction_interactions FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tone preferences" 
ON user_tone_preferences FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own action usage data" 
ON one_tap_action_usage FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own smart defaults data" 
ON smart_defaults_effectiveness FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger to update user_tone_preferences.updated_at
CREATE OR REPLACE FUNCTION update_tone_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tone_preferences_updated_at
  BEFORE UPDATE ON user_tone_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_tone_preferences_updated_at();

-- Create trigger to update one_tap_action_usage.updated_at
CREATE TRIGGER update_one_tap_usage_updated_at
  BEFORE UPDATE ON one_tap_action_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tone_preferences_updated_at();

-- Add function to calculate friction reduction effectiveness
CREATE OR REPLACE FUNCTION get_friction_reduction_stats(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_interactions', COUNT(*),
    'high_confidence_usage', COUNT(*) FILTER (WHERE confidence_level = 'high'),
    'one_tap_actions', COUNT(*) FILTER (WHERE feature_type = 'one_tap_action'),
    'smart_defaults', COUNT(*) FILTER (WHERE feature_type = 'smart_default'),
    'avg_response_time_ms', AVG(response_time_ms),
    'satisfaction_score', AVG(user_satisfaction),
    'preferred_tone', (
      SELECT preferred_style 
      FROM user_tone_preferences 
      WHERE user_id = user_id_param
      LIMIT 1
    )
  )
  INTO result
  FROM friction_interactions
  WHERE user_id = user_id_param
    AND created_at >= NOW() - INTERVAL '30 days';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;