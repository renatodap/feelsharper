-- Migration: Phase 5 AI Coaching Complete System
-- All tables required for Phase 5 AI coaching implementation
-- Including behavioral science, training data, and safety systems

-- ============================================================================
-- SAFETY SYSTEM TABLES (Phase 5.8)
-- ============================================================================

-- Safety assessments for medical red flag detection
CREATE TABLE IF NOT EXISTS safety_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input text NOT NULL,
  flags_detected text[] DEFAULT '{}',
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  recommended_action text NOT NULL CHECK (recommended_action IN ('continue', 'caution', 'stop_and_refer', 'emergency')),
  safety_response text,
  assessed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Emergency protocol activations
CREATE TABLE IF NOT EXISTS emergency_protocol_activations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id text NOT NULL,
  trigger_flags text[] DEFAULT '{}',
  activated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolution_notes text
);

-- Chronic condition safety assessments
CREATE TABLE IF NOT EXISTS chronic_condition_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conditions text[] DEFAULT '{}',
  proposed_activity text NOT NULL,
  assessment_result jsonb NOT NULL,
  assessed_at timestamp with time zone DEFAULT now()
);

-- Medication interaction checks
CREATE TABLE IF NOT EXISTS medication_interaction_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medications text[] DEFAULT '{}',
  proposed_nutrition text,
  proposed_exercise text,
  interaction_result jsonb NOT NULL,
  checked_at timestamp with time zone DEFAULT now()
);

-- Injury assessments and RICE protocol tracking
CREATE TABLE IF NOT EXISTS injury_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms text[] DEFAULT '{}',
  activity_context text NOT NULL,
  assessment_result jsonb NOT NULL,
  assessed_at timestamp with time zone DEFAULT now(),
  follow_up_needed boolean DEFAULT false,
  follow_up_completed_at timestamp with time zone
);

-- Overtraining monitoring
CREATE TABLE IF NOT EXISTS overtraining_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recent_activity_count integer NOT NULL,
  symptoms text[] DEFAULT '{}',
  assessment_result jsonb NOT NULL,
  assessed_at timestamp with time zone DEFAULT now()
);

-- Special population safety assessments
CREATE TABLE IF NOT EXISTS special_population_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  population_type text NOT NULL,
  age integer,
  conditions text[] DEFAULT '{}',
  proposed_activity text NOT NULL,
  safety_rating text NOT NULL CHECK (safety_rating IN ('safe', 'caution', 'unsafe', 'requires_clearance')),
  modifications text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  clearance_needed boolean DEFAULT false,
  monitoring_required text[] DEFAULT '{}',
  assessed_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- HABIT FORMATION TRACKING SYSTEM (Phase 5.6.1)
-- ============================================================================

-- Core habit tracking with streak management
CREATE TABLE IF NOT EXISTS habit_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  habit_category text NOT NULL,
  completion_date date NOT NULL,
  completion_time time,
  context jsonb,
  difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  enjoyment_rating integer CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 10),
  confidence_level integer CHECK (confidence_level >= 0 AND confidence_level <= 100),
  cue_strength integer CHECK (cue_strength >= 1 AND cue_strength <= 10),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habit streak tracking
CREATE TABLE IF NOT EXISTS habit_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  streak_start_date date,
  last_completion_date date,
  total_completions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, habit_name)
);

-- Habit lapse tracking for recovery analysis
CREATE TABLE IF NOT EXISTS habit_lapses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  lapse_date date NOT NULL,
  lapse_reason text,
  recovery_strategy text,
  days_to_recovery integer,
  emotional_state text,
  lessons_learned text,
  created_at timestamp with time zone DEFAULT now()
);

-- Identity-based habit tracking
CREATE TABLE IF NOT EXISTS habit_identity_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  identity_statement text NOT NULL,
  identity_strength integer CHECK (identity_strength >= 1 AND identity_strength <= 10),
  recorded_at timestamp with time zone DEFAULT now()
);

-- Habit routines and stacking
CREATE TABLE IF NOT EXISTS habit_routines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_name text NOT NULL,
  habit_stack text[] DEFAULT '{}',
  trigger_cue text NOT NULL,
  location text,
  time_of_day text,
  success_rate numeric(5,2) DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- BEHAVIOR CHANGE TECHNIQUES SYSTEM (Phase 5.6.2)
-- ============================================================================

-- Behavior change history for personalization
CREATE TABLE IF NOT EXISTS behavior_change_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique text NOT NULL,
  goal_context text,
  effectiveness_rating integer CHECK (effectiveness_rating >= 0 AND effectiveness_rating <= 100),
  duration_days integer,
  success_factors text[] DEFAULT '{}',
  barriers text[] DEFAULT '{}',
  used_at timestamp with time zone DEFAULT now()
);

-- Self-monitoring plans
CREATE TABLE IF NOT EXISTS self_monitoring_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_behaviors text[] DEFAULT '{}',
  monitoring_method text NOT NULL,
  frequency text NOT NULL,
  feedback_config jsonb NOT NULL,
  barriers text[] DEFAULT '{}',
  facilitators text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Goal setting plans
CREATE TABLE IF NOT EXISTS goal_setting_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_description text NOT NULL,
  timeline_days integer NOT NULL,
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Feedback plans
CREATE TABLE IF NOT EXISTS feedback_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  behaviors text[] DEFAULT '{}',
  outcomes text[] DEFAULT '{}',
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Implementation intentions (if-then plans)
CREATE TABLE IF NOT EXISTS implementation_intentions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_behavior text NOT NULL,
  intention_data jsonb NOT NULL,
  effectiveness_rating integer CHECK (effectiveness_rating >= 0 AND effectiveness_rating <= 100),
  times_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Technique effectiveness tracking
CREATE TABLE IF NOT EXISTS technique_effectiveness (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique text NOT NULL,
  goal_id text,
  adherence_rate integer CHECK (adherence_rate >= 0 AND adherence_rate <= 100),
  outcome_achievement integer CHECK (outcome_achievement >= 0 AND outcome_achievement <= 100),
  user_satisfaction integer CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  barriers text[] DEFAULT '{}',
  facilitators text[] DEFAULT '{}',
  tracked_at timestamp with time zone DEFAULT now()
);

-- User technique profiles for personalization
CREATE TABLE IF NOT EXISTS user_technique_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique text NOT NULL,
  effectiveness_score integer CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  preference_rating integer CHECK (preference_rating >= 1 AND preference_rating <= 5),
  usage_count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, technique)
);

-- User devices for monitoring integration
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type text NOT NULL,
  device_name text NOT NULL,
  integration_status text DEFAULT 'pending',
  last_sync_at timestamp with time zone,
  sync_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Monitoring challenges tracking
CREATE TABLE IF NOT EXISTS monitoring_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barrier text NOT NULL,
  frequency integer DEFAULT 1,
  solutions_tried text[] DEFAULT '{}',
  effectiveness jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- MOTIVATION MAPPING SYSTEM (Phase 5.6.3)
-- ============================================================================

-- Motivation profiles based on Self-Determination Theory
CREATE TABLE IF NOT EXISTS motivation_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data jsonb NOT NULL,
  primary_motivation_type text,
  autonomy_score integer CHECK (autonomy_score >= 0 AND autonomy_score <= 100),
  competence_score integer CHECK (competence_score >= 0 AND competence_score <= 100),
  relatedness_score integer CHECK (relatedness_score >= 0 AND relatedness_score <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Motivation interventions tracking
CREATE TABLE IF NOT EXISTS motivation_interventions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_type text NOT NULL,
  context_data jsonb,
  success_rating integer CHECK (success_rating >= 1 AND success_rating <= 5),
  effectiveness_score integer CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- FRICTION MINIMIZATION SYSTEM (Phase 5.6.4)
-- ============================================================================

-- User interactions analysis
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  completed boolean DEFAULT false,
  steps_taken integer DEFAULT 0,
  retry_count integer DEFAULT 0,
  friction_points jsonb,
  context_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Friction analyses
CREATE TABLE IF NOT EXISTS friction_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  analysis_data jsonb NOT NULL,
  total_friction_score integer CHECK (total_friction_score >= 0 AND total_friction_score <= 100),
  created_at timestamp with time zone DEFAULT now()
);

-- Auto-logging rules
CREATE TABLE IF NOT EXISTS auto_logging_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_data jsonb NOT NULL,
  active boolean DEFAULT true,
  success_rate numeric(5,2) DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Auto-logging attempts
CREATE TABLE IF NOT EXISTS auto_logging_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id text NOT NULL,
  context_data jsonb,
  success boolean DEFAULT false,
  user_confirmed boolean,
  created_at timestamp with time zone DEFAULT now()
);

-- Voice interactions
CREATE TABLE IF NOT EXISTS voice_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript text NOT NULL,
  command_type text,
  parsing_success boolean DEFAULT false,
  parsing_confidence numeric(5,2),
  response_generated text,
  context_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Voice patterns optimization
CREATE TABLE IF NOT EXISTS voice_patterns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_type text NOT NULL,
  pattern_data jsonb NOT NULL,
  success_rate numeric(5,2) DEFAULT 0.0,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, command_type)
);

-- Contextual prompts
CREATE TABLE IF NOT EXISTS contextual_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type text NOT NULL,
  prompt_content text NOT NULL,
  context_data jsonb,
  effectiveness_score integer CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  user_response_rate numeric(5,2) DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now()
);

-- User preferences for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_category text NOT NULL,
  preference_data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, preference_category)
);

-- User choices tracking
CREATE TABLE IF NOT EXISTS user_choices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  choice_data jsonb NOT NULL,
  context_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- ADAPTIVE INTERVENTION TIMING (JITAI) SYSTEM (Phase 5.6.5)
-- ============================================================================

-- Intervention profiles for JITAI
CREATE TABLE IF NOT EXISTS intervention_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data jsonb NOT NULL,
  receptiveness_patterns jsonb,
  optimal_timing_windows jsonb,
  habituation_risk integer CHECK (habituation_risk >= 0 AND habituation_risk <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Adaptive interventions delivery tracking
CREATE TABLE IF NOT EXISTS adaptive_interventions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_id text NOT NULL,
  intervention_type text NOT NULL,
  content text NOT NULL,
  delivery_method text NOT NULL,
  context_data jsonb,
  timing_score integer CHECK (timing_score >= 0 AND timing_score <= 100),
  predicted_effectiveness integer CHECK (predicted_effectiveness >= 0 AND predicted_effectiveness <= 100),
  delivered_at timestamp with time zone DEFAULT now()
);

-- Intervention effectiveness tracking
CREATE TABLE IF NOT EXISTS intervention_effectiveness (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id uuid NOT NULL REFERENCES adaptive_interventions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_response text NOT NULL CHECK (user_response IN ('engaged', 'ignored', 'dismissed', 'completed')),
  behavior_change boolean DEFAULT false,
  immediate_effect integer CHECK (immediate_effect >= -100 AND immediate_effect <= 100),
  sustained_effect integer CHECK (sustained_effect >= -100 AND sustained_effect <= 100),
  user_satisfaction integer CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  context_data jsonb,
  tracked_at timestamp with time zone DEFAULT now()
);

-- Intervention patterns for learning
CREATE TABLE IF NOT EXISTS intervention_patterns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type text NOT NULL,
  pattern_data jsonb NOT NULL,
  effectiveness_score numeric(5,2) DEFAULT 0.0,
  confidence_level numeric(5,2) DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Intervention queue for scheduled delivery
CREATE TABLE IF NOT EXISTS intervention_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_data jsonb NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Effectiveness tracking queue
CREATE TABLE IF NOT EXISTS effectiveness_tracking_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_at timestamp with time zone NOT NULL,
  tracked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- AI COACHING INSIGHTS SYSTEM
-- ============================================================================

-- User goals for insight generation
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  goal_description text NOT NULL,
  target_value numeric,
  target_date date,
  current_progress numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Daily insights generated by AI coach
CREATE TABLE IF NOT EXISTS daily_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  insight_content text NOT NULL,
  supporting_data jsonb,
  confidence_score numeric(5,2),
  priority_level integer CHECK (priority_level >= 1 AND priority_level <= 5),
  viewed boolean DEFAULT false,
  helpful_rating integer CHECK (helpful_rating >= 1 AND helpful_rating <= 5),
  generated_at timestamp with time zone DEFAULT now()
);

-- Goal completions for celebration
CREATE TABLE IF NOT EXISTS goal_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  completion_date date NOT NULL,
  celebration_message text,
  shared boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Streak freezes for habit maintenance
CREATE TABLE IF NOT EXISTS streak_freezes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  freeze_date date NOT NULL,
  reason text,
  days_frozen integer DEFAULT 1,
  used boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Safety system indexes
CREATE INDEX IF NOT EXISTS idx_safety_assessments_user_id_date ON safety_assessments(user_id, assessed_at);
CREATE INDEX IF NOT EXISTS idx_safety_assessments_risk_level ON safety_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_emergency_protocols_user_id ON emergency_protocol_activations(user_id);

-- Habit tracking indexes
CREATE INDEX IF NOT EXISTS idx_habit_tracking_user_id_date ON habit_tracking(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_habit_name ON habit_tracking(user_id, habit_name);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_user_id ON habit_streaks(user_id);

-- Behavior change indexes
CREATE INDEX IF NOT EXISTS idx_technique_effectiveness_user_id ON technique_effectiveness(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_effectiveness_technique ON technique_effectiveness(technique);

-- Motivation system indexes
CREATE INDEX IF NOT EXISTS idx_motivation_profiles_user_id ON motivation_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_motivation_interventions_user_id ON motivation_interventions(user_id);

-- JITAI system indexes
CREATE INDEX IF NOT EXISTS idx_adaptive_interventions_user_id_date ON adaptive_interventions(user_id, delivered_at);
CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_user_id ON intervention_effectiveness(user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_queue_scheduled ON intervention_queue(scheduled_for) WHERE NOT processed;

-- Friction minimization indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id_date ON user_interactions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_auto_logging_rules_user_id ON auto_logging_rules(user_id) WHERE active;

-- Insights system indexes
CREATE INDEX IF NOT EXISTS idx_daily_insights_user_id_date ON daily_insights(user_id, generated_at);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id_active ON user_goals(user_id) WHERE is_active;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE safety_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_protocol_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronic_condition_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_interaction_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtraining_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_population_assessments ENABLE ROW LEVEL SECURITY;

ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_lapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_identity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_routines ENABLE ROW LEVEL SECURITY;

ALTER TABLE behavior_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_monitoring_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_setting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_technique_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_challenges ENABLE ROW LEVEL SECURITY;

ALTER TABLE motivation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_interventions ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_logging_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_logging_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contextual_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_choices ENABLE ROW LEVEL SECURITY;

ALTER TABLE intervention_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE effectiveness_tracking_queue ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
DO $$ 
BEGIN
  -- Safety system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'safety_assessments' AND policyname = 'Users can view own safety assessments') THEN
    CREATE POLICY "Users can view own safety assessments" ON safety_assessments FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Habit tracking policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_tracking' AND policyname = 'Users can manage own habits') THEN
    CREATE POLICY "Users can manage own habits" ON habit_tracking FOR ALL USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_streaks' AND policyname = 'Users can view own streaks') THEN
    CREATE POLICY "Users can view own streaks" ON habit_streaks FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Behavior change policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'technique_effectiveness' AND policyname = 'Users can view own technique data') THEN
    CREATE POLICY "Users can view own technique data" ON technique_effectiveness FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Motivation system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'motivation_profiles' AND policyname = 'Users can manage own motivation profile') THEN
    CREATE POLICY "Users can manage own motivation profile" ON motivation_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- JITAI system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'adaptive_interventions' AND policyname = 'Users can view own interventions') THEN
    CREATE POLICY "Users can view own interventions" ON adaptive_interventions FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Friction minimization policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_interactions' AND policyname = 'Users can view own interactions') THEN
    CREATE POLICY "Users can view own interactions" ON user_interactions FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Insights system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_insights' AND policyname = 'Users can view own insights') THEN
    CREATE POLICY "Users can view own insights" ON daily_insights FOR ALL USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_goals' AND policyname = 'Users can manage own goals') THEN
    CREATE POLICY "Users can manage own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Log completion
INSERT INTO migrations (name, executed_at) VALUES 
  ('20250821_phase5_ai_coaching_complete', now())
ON CONFLICT (name) DO UPDATE SET executed_at = now();

COMMENT ON SCHEMA public IS 'Phase 5 AI Coaching System Complete - All tables for behavioral science, training data, and safety systems implemented';