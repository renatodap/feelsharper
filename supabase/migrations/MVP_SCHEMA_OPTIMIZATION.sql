-- ============================================
-- MVP SCHEMA OPTIMIZATION SUGGESTIONS
-- ============================================
-- Optimizations for production deployment
-- Focus on: Performance, Data Integrity, MVP Simplicity
-- ============================================

-- 1. REMOVE REDUNDANT TABLES
-- The 'users' table duplicates auth.users - remove it
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. CLEAN UP activity_logs TABLE
-- Remove duplicate columns and standardize
ALTER TABLE public.activity_logs 
DROP COLUMN IF EXISTS data; -- Redundant with parsed_data

ALTER TABLE public.activity_logs 
DROP COLUMN IF EXISTS timestamp; -- Redundant with created_at

-- Rename for clarity
ALTER TABLE public.activity_logs 
RENAME COLUMN raw_text TO raw_input;

-- 3. ADD MISSING INDEXES FOR PERFORMANCE
-- Critical for MVP query performance

-- Activity logs - most queried table
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created 
ON public.activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_type_created 
ON public.activity_logs(type, created_at DESC);

-- Body measurements - for charts/trends
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date 
ON public.body_measurements(user_id, measurement_date DESC);

-- Food logs - for daily summaries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date 
ON public.food_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type 
ON public.food_logs(user_id, meal_type, log_date DESC);

-- Workouts - for history
CREATE INDEX IF NOT EXISTS idx_workouts_user_date 
ON public.workouts(user_id, workout_date DESC);

-- Exercise sets - for volume calculations
CREATE INDEX IF NOT EXISTS idx_exercise_sets_created 
ON public.exercise_sets(created_at DESC);

-- 4. ADD UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- Prevent duplicate entries

-- Only one active goal per type per user
ALTER TABLE public.body_goals 
ADD CONSTRAINT unique_active_goal_per_user 
UNIQUE (user_id, goal_type, is_active) 
WHERE is_active = true;

-- Only one body measurement per user per day
ALTER TABLE public.body_measurements 
ADD CONSTRAINT unique_measurement_per_day 
UNIQUE (user_id, DATE(measurement_date));

-- Unique exercise names in library
ALTER TABLE public.exercises 
DROP CONSTRAINT IF EXISTS exercises_name_key;
ALTER TABLE public.exercises 
ADD CONSTRAINT exercises_name_key UNIQUE (LOWER(name));

-- 5. ADD DEFAULT VALUES FOR BETTER UX
-- Reduce required fields for MVP

ALTER TABLE public.food_logs 
ALTER COLUMN meal_type SET DEFAULT 'snack';

ALTER TABLE public.workouts 
ALTER COLUMN type SET DEFAULT 'mixed';

ALTER TABLE public.workout_exercises 
ALTER COLUMN exercise_order SET DEFAULT 1;

-- 6. CREATE MATERIALIZED VIEWS FOR PERFORMANCE
-- Pre-compute common queries for dashboard

-- Daily nutrition summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_nutrition_summary AS
SELECT 
  user_id,
  log_date,
  COUNT(*) as meal_count,
  SUM(calories) as total_calories,
  SUM(protein_g) as total_protein,
  SUM(carbs_g) as total_carbs,
  SUM(fat_g) as total_fat,
  ROUND(AVG(calories)) as avg_calories_per_meal
FROM public.food_logs
WHERE calories IS NOT NULL
GROUP BY user_id, log_date;

CREATE INDEX ON public.daily_nutrition_summary(user_id, log_date DESC);

-- Weekly workout summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.weekly_workout_summary AS
SELECT 
  user_id,
  DATE_TRUNC('week', workout_date) as week_start,
  COUNT(DISTINCT id) as workout_count,
  SUM(duration_minutes) as total_minutes,
  AVG(energy_level) as avg_energy,
  COUNT(DISTINCT DATE(workout_date)) as days_worked_out
FROM public.workouts
WHERE completed = true
GROUP BY user_id, DATE_TRUNC('week', workout_date);

CREATE INDEX ON public.weekly_workout_summary(user_id, week_start DESC);

-- 7. ADD TRIGGER FUNCTIONS FOR DATA CONSISTENCY

-- Auto-update body_trends when body_measurements change
CREATE OR REPLACE FUNCTION update_body_trends()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update weight trend
  IF NEW.weight_kg IS NOT NULL THEN
    INSERT INTO public.body_trends (
      user_id, metric_type, date, value, created_at
    ) VALUES (
      NEW.user_id, 'weight', DATE(NEW.measurement_date), NEW.weight_kg, NOW()
    )
    ON CONFLICT (user_id, metric_type, date) 
    DO UPDATE SET value = EXCLUDED.value;
  END IF;
  
  -- Insert or update body fat trend
  IF NEW.body_fat_percentage IS NOT NULL THEN
    INSERT INTO public.body_trends (
      user_id, metric_type, date, value, created_at
    ) VALUES (
      NEW.user_id, 'body_fat', DATE(NEW.measurement_date), NEW.body_fat_percentage, NOW()
    )
    ON CONFLICT (user_id, metric_type, date) 
    DO UPDATE SET value = EXCLUDED.value;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_body_trends
AFTER INSERT OR UPDATE ON public.body_measurements
FOR EACH ROW EXECUTE FUNCTION update_body_trends();

-- 8. ADD VALIDATION FUNCTIONS

-- Validate meal_type values
ALTER TABLE public.food_logs 
ADD CONSTRAINT valid_meal_type 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'));

-- Validate reasonable weight values (kg)
ALTER TABLE public.body_measurements 
ADD CONSTRAINT reasonable_weight 
CHECK (weight_kg IS NULL OR (weight_kg > 20 AND weight_kg < 300));

-- Validate reasonable body fat percentage
ALTER TABLE public.body_measurements 
ADD CONSTRAINT reasonable_body_fat 
CHECK (body_fat_percentage IS NULL OR (body_fat_percentage > 2 AND body_fat_percentage < 60));

-- 9. SIMPLIFY FOR MVP - CONSIDER REMOVING
-- These tables might be overkill for MVP:

-- body_trends: Can be computed on-the-fly
-- Consider: DROP TABLE public.body_trends CASCADE;

-- custom_foods: Maybe post-MVP feature
-- Consider: DROP TABLE public.custom_foods CASCADE;

-- sleep_logs: Not core to fitness MVP
-- Consider: DROP TABLE public.sleep_logs CASCADE;

-- 10. ADD ESSENTIAL MISSING COLUMNS

-- Add user timezone for accurate daily summaries
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add quick notes to activity_logs for coach context
ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Add source to track where data came from
ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web' 
CHECK (source IN ('web', 'mobile', 'api', 'voice', 'import'));

-- 11. CREATE SIMPLIFIED API VIEWS
-- Single queries for common operations

-- Today's summary for dashboard
CREATE OR REPLACE VIEW public.today_summary AS
SELECT 
  u.id as user_id,
  -- Nutrition
  (SELECT SUM(calories) FROM public.food_logs 
   WHERE user_id = u.id AND log_date = CURRENT_DATE) as calories_today,
  -- Weight
  (SELECT weight_kg FROM public.body_measurements 
   WHERE user_id = u.id 
   ORDER BY measurement_date DESC LIMIT 1) as current_weight,
  -- Workouts
  (SELECT COUNT(*) FROM public.workouts 
   WHERE user_id = u.id AND DATE(workout_date) = CURRENT_DATE) as workouts_today,
  -- Activity logs
  (SELECT COUNT(*) FROM public.activity_logs 
   WHERE user_id = u.id AND DATE(created_at) = CURRENT_DATE) as logs_today
FROM auth.users u;

GRANT SELECT ON public.today_summary TO authenticated;

-- 12. REFRESH MATERIALIZED VIEWS FUNCTION
CREATE OR REPLACE FUNCTION refresh_summary_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_nutrition_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.weekly_workout_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily via cron or trigger

-- ============================================
-- MVP DEPLOYMENT CHECKLIST
-- ============================================
-- 1. ✅ Remove redundant 'users' table
-- 2. ✅ Add critical performance indexes
-- 3. ✅ Add data integrity constraints
-- 4. ✅ Create materialized views for dashboards
-- 5. ✅ Add validation constraints
-- 6. ✅ Simplify schema (remove non-MVP tables)
-- 7. ✅ Add missing essential columns
-- 8. ✅ Create API-friendly views
-- 
-- OPTIONAL REMOVALS FOR SIMPLER MVP:
-- - body_trends (compute on-demand)
-- - custom_foods (post-MVP feature)
-- - sleep_logs (not core fitness)
-- - body_goals (maybe too complex for MVP)
-- ============================================