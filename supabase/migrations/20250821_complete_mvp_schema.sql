-- Migration: Complete MVP Schema for Phases 5.1-5.4
-- Date: 2025-08-21
-- Purpose: Add all missing tables and fields referenced in implemented API routes

-- 1. Add missing fields to workouts table
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS logged_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_sets integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reps integer DEFAULT 0, 
ADD COLUMN IF NOT EXISTS total_weight_kg numeric DEFAULT 0;

-- 2. Create workout_sets table (referenced in workouts API)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL,
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  set_number integer NOT NULL DEFAULT 1,
  reps integer DEFAULT 0,
  weight_kg numeric DEFAULT 0,
  distance_km numeric,
  duration_seconds integer,
  notes text,
  rest_seconds integer,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workout_sets_pkey PRIMARY KEY (id),
  CONSTRAINT workout_sets_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE,
  CONSTRAINT workout_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. Create coaching_conversations table (for AI coach phase 5.1-5.4)
CREATE TABLE IF NOT EXISTS public.coaching_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_summary text,
  last_interaction timestamp with time zone DEFAULT now(),
  habit_tracking jsonb DEFAULT '{}'::jsonb,
  behavior_patterns jsonb DEFAULT '{}'::jsonb,
  motivation_style text CHECK (motivation_style IN ('analytical', 'encouraging', 'challenging', 'supportive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coaching_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT coaching_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT coaching_conversations_user_id_unique UNIQUE (user_id)
);

-- 4. Create insights table (for AI insights generation phase 5.3)
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('pattern', 'recommendation', 'achievement', 'challenge', 'habit')),
  title text NOT NULL,
  content text NOT NULL,
  confidence_score real CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_points_used integer DEFAULT 0,
  is_dismissed boolean DEFAULT false,
  is_acted_on boolean DEFAULT false,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT insights_pkey PRIMARY KEY (id),
  CONSTRAINT insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 5. Create user_achievements table (for gamification and behavioral design)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_type text NOT NULL CHECK (achievement_type IN ('streak', 'milestone', 'consistency', 'progress', 'habit_formed')),
  achievement_name text NOT NULL,
  description text,
  badge_icon text,
  points_awarded integer DEFAULT 0,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 6. Create habit_tracking table (for behavioral design phases 5.1-5.4)
CREATE TABLE IF NOT EXISTS public.habit_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_name text NOT NULL,
  habit_type text CHECK (habit_type IN ('exercise', 'nutrition', 'sleep', 'wellness', 'sport')),
  cue_pattern text, -- For habit loop tracking (cue-routine-reward)
  routine_description text,
  reward_type text,
  streak_count integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  last_completed timestamp with time zone,
  habit_strength real DEFAULT 0 CHECK (habit_strength >= 0 AND habit_strength <= 1), -- Based on BJ Fogg model
  identity_reinforcement text, -- For identity-based habits
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT habit_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT habit_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 7. Add missing common_logs field to profiles (used in parse API)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS common_logs jsonb DEFAULT '[]'::jsonb;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_user_id ON public.workout_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_user_id ON public.coaching_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id_generated_at ON public.insights(user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_user_id_active ON public.habit_tracking(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_timestamp ON public.activity_logs(user_id, timestamp DESC);

-- 9. Create RLS policies for new tables
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_tracking ENABLE ROW LEVEL SECURITY;

-- Workout sets policies
CREATE POLICY "Users can view their own workout sets" ON public.workout_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workout sets" ON public.workout_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout sets" ON public.workout_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout sets" ON public.workout_sets FOR DELETE USING (auth.uid() = user_id);

-- Coaching conversations policies
CREATE POLICY "Users can access their own coaching conversations" ON public.coaching_conversations FOR ALL USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view their own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Habit tracking policies
CREATE POLICY "Users can access their own habits" ON public.habit_tracking FOR ALL USING (auth.uid() = user_id);

-- 10. Update existing workouts to have logged_at = workout_date if null
UPDATE public.workouts 
SET logged_at = workout_date 
WHERE logged_at IS NULL;