-- ============================================
-- FEELSHARPER MVP SCHEMA UPDATE MIGRATION
-- ============================================
-- This script updates the existing schema to match MVP requirements
-- Run this directly in Supabase SQL Editor
-- ============================================

-- 1. UPDATE ACTIVITY_LOGS TABLE
-- Add missing columns if they don't exist
ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS parsed_data jsonb,
ADD COLUMN IF NOT EXISTS auto_logged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_response text,
ADD COLUMN IF NOT EXISTS timestamp timestamptz DEFAULT now();

-- Rename 'data' column to 'parsed_data' if needed (comment out if already renamed)
-- ALTER TABLE public.activity_logs RENAME COLUMN data TO parsed_data;

-- Update type constraint to include 'exercise' instead of 'workout'
ALTER TABLE public.activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_type_check;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_type_check 
CHECK (type = ANY (ARRAY['weight'::text, 'food'::text, 'exercise'::text, 'mood'::text, 'energy'::text, 'sleep'::text, 'water'::text, 'unknown'::text]));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_created ON public.activity_logs(user_id, type, created_at DESC);

-- 2. CREATE BODY_MEASUREMENTS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date timestamptz NOT NULL DEFAULT now(),
  weight_kg numeric,
  weight_lb numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  visceral_fat_level integer,
  water_percentage numeric,
  bone_mass_kg numeric,
  metabolic_age integer,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  hip_cm numeric,
  neck_cm numeric,
  progress_photo_front text,
  progress_photo_side text,
  progress_photo_back text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);

-- 3. CREATE BODY_GOALS TABLE
CREATE TABLE IF NOT EXISTS public.body_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'body_recomposition', 'maintenance', 'performance')),
  target_weight_kg numeric,
  target_body_fat_percentage numeric,
  target_date date,
  weekly_target_kg numeric,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goal_type) -- Only one active goal per type per user
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_body_goals_user_id ON public.body_goals(user_id);

-- 4. CREATE BODY_TRENDS TABLE
CREATE TABLE IF NOT EXISTS public.body_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('weight', 'body_fat', 'muscle_mass')),
  date date NOT NULL,
  value numeric NOT NULL,
  ema_7day numeric,
  ema_30day numeric,
  trend text CHECK (trend IN ('increasing', 'decreasing', 'stable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_body_trends_user_metric ON public.body_trends(user_id, metric_type, date DESC);

-- 5. UPDATE FOOD_LOGS TABLE
-- Fix the foreign key reference (should reference auth.users, not public.users)
ALTER TABLE public.food_logs 
DROP CONSTRAINT IF EXISTS food_logs_user_id_fkey;

ALTER TABLE public.food_logs 
ADD CONSTRAINT food_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns
ALTER TABLE public.food_logs
ADD COLUMN IF NOT EXISTS food_id text,
ADD COLUMN IF NOT EXISTS quantity numeric,
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'g',
ADD COLUMN IF NOT EXISTS fiber_g numeric,
ADD COLUMN IF NOT EXISTS sugar_g numeric,
ADD COLUMN IF NOT EXISTS sodium_mg numeric,
ADD COLUMN IF NOT EXISTS logged_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update log_date to timestamptz if needed
ALTER TABLE public.food_logs 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, log_date DESC);

-- 6. FIX WORKOUT_LOGS TABLE
ALTER TABLE public.workout_logs 
DROP CONSTRAINT IF EXISTS workout_logs_user_id_fkey;

ALTER TABLE public.workout_logs 
ADD CONSTRAINT workout_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.workout_logs 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- 7. FIX SLEEP_LOGS TABLE
ALTER TABLE public.sleep_logs 
DROP CONSTRAINT IF EXISTS sleep_logs_user_id_fkey;

ALTER TABLE public.sleep_logs 
ADD CONSTRAINT sleep_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.sleep_logs 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- 8. CREATE FOODS TABLE (for food database)
CREATE TABLE IF NOT EXISTS public.foods (
  id text PRIMARY KEY,
  name text NOT NULL,
  brand text,
  category text,
  serving_size numeric DEFAULT 100,
  serving_unit text DEFAULT 'g',
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  is_verified boolean DEFAULT false,
  barcode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON public.foods(barcode);

-- 9. CREATE CUSTOM FOODS TABLE
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  serving_size numeric DEFAULT 100,
  serving_unit text DEFAULT 'g',
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  barcode text,
  is_recipe boolean DEFAULT false,
  recipe_ingredients jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, brand)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_custom_foods_user_id ON public.custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON public.custom_foods(name);

-- 10. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. CREATE RLS POLICIES

-- Activity Logs Policies
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own activity logs" ON public.activity_logs;
CREATE POLICY "Users can update own activity logs" ON public.activity_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own activity logs" ON public.activity_logs;
CREATE POLICY "Users can delete own activity logs" ON public.activity_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Body Measurements Policies
DROP POLICY IF EXISTS "Users can manage own measurements" ON public.body_measurements;
CREATE POLICY "Users can manage own measurements" ON public.body_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Body Goals Policies
DROP POLICY IF EXISTS "Users can manage own goals" ON public.body_goals;
CREATE POLICY "Users can manage own goals" ON public.body_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Body Trends Policies
DROP POLICY IF EXISTS "Users can view own trends" ON public.body_trends;
CREATE POLICY "Users can view own trends" ON public.body_trends
  FOR SELECT USING (auth.uid() = user_id);

-- Food Logs Policies
DROP POLICY IF EXISTS "Users can manage own food logs" ON public.food_logs;
CREATE POLICY "Users can manage own food logs" ON public.food_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workout Logs Policies
DROP POLICY IF EXISTS "Users can manage own workout logs" ON public.workout_logs;
CREATE POLICY "Users can manage own workout logs" ON public.workout_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sleep Logs Policies
DROP POLICY IF EXISTS "Users can manage own sleep logs" ON public.sleep_logs;
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Custom Foods Policies
DROP POLICY IF EXISTS "Users can manage own custom foods" ON public.custom_foods;
CREATE POLICY "Users can manage own custom foods" ON public.custom_foods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Foods table is public read
DROP POLICY IF EXISTS "Anyone can read foods" ON public.foods;
CREATE POLICY "Anyone can read foods" ON public.foods
  FOR SELECT USING (true);

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 12. CREATE HELPER FUNCTIONS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_activity_logs_updated_at ON public.activity_logs;
CREATE TRIGGER update_activity_logs_updated_at
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_body_measurements_updated_at ON public.body_measurements;
CREATE TRIGGER update_body_measurements_updated_at
  BEFORE UPDATE ON public.body_measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_body_goals_updated_at ON public.body_goals;
CREATE TRIGGER update_body_goals_updated_at
  BEFORE UPDATE ON public.body_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_food_logs_updated_at ON public.food_logs;
CREATE TRIGGER update_food_logs_updated_at
  BEFORE UPDATE ON public.food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_foods_updated_at ON public.custom_foods;
CREATE TRIGGER update_custom_foods_updated_at
  BEFORE UPDATE ON public.custom_foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_foods_updated_at ON public.foods;
CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. CREATE VIEW FOR DAILY SUMMARIES
CREATE OR REPLACE VIEW public.daily_activity_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE type = 'food') as food_count,
  COUNT(*) FILTER (WHERE type = 'exercise') as exercise_count,
  COUNT(*) FILTER (WHERE type = 'weight') as weight_count,
  AVG((parsed_data->>'weight')::numeric) FILTER (WHERE type = 'weight') as avg_weight,
  AVG((parsed_data->>'level')::numeric) FILTER (WHERE type = 'energy') as avg_energy,
  AVG((parsed_data->>'hours')::numeric) FILTER (WHERE type = 'sleep') as avg_sleep_hours,
  SUM((parsed_data->>'amount')::numeric) FILTER (WHERE type = 'water' AND parsed_data->>'unit' = 'oz') as total_water_oz,
  COUNT(*) as total_activities
FROM public.activity_logs
GROUP BY user_id, DATE(created_at);

-- Grant permissions on the view
GRANT SELECT ON public.daily_activity_summary TO authenticated;

-- 14. CLEAN UP DUPLICATE TABLES
-- Note: The 'users' table seems redundant with auth.users
-- Only drop if you're sure it's not being used
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your schema is now updated for the MVP!
-- 
-- Key changes made:
-- 1. Fixed foreign key references to use auth.users
-- 2. Added missing columns to activity_logs
-- 3. Created body_measurements, body_goals, body_trends tables
-- 4. Created foods and custom_foods tables
-- 5. Added proper indexes for performance
-- 6. Enabled RLS and created policies
-- 7. Added update triggers for updated_at columns
-- 8. Created daily summary view
-- ============================================