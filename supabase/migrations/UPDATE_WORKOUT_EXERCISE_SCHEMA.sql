-- ============================================
-- WORKOUT AND EXERCISE SCHEMA UPDATE
-- ============================================
-- This migration properly separates workouts from exercises
-- A workout contains multiple exercises
-- Each exercise can have multiple sets
-- ============================================

-- 1. CREATE WORKOUTS TABLE (workout session container)
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "Chest Day", "Morning Run", "Full Body"
  workout_date timestamptz NOT NULL DEFAULT now(),
  type text CHECK (type IN ('strength', 'cardio', 'flexibility', 'sports', 'mixed', 'other')),
  duration_minutes integer, -- total workout duration
  notes text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10), -- how they felt
  completed boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON public.workouts(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, workout_date DESC);

-- 2. CREATE EXERCISES TABLE (exercise definitions/library)
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- e.g., "Bench Press", "Squat", "Running"
  category text NOT NULL, -- e.g., "Chest", "Legs", "Cardio", "Back"
  equipment text, -- e.g., "Barbell", "Dumbbell", "Machine", "Bodyweight"
  muscle_group text[], -- array of muscles: ['chest', 'triceps', 'shoulders']
  is_compound boolean DEFAULT false,
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);

-- 3. CREATE WORKOUT_EXERCISES TABLE (exercises performed in a workout)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercises(id), -- can be NULL for custom exercises
  exercise_name text NOT NULL, -- store name directly for custom/quick entries
  exercise_order integer NOT NULL DEFAULT 1, -- order within workout
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);

-- 4. CREATE EXERCISE_SETS TABLE (individual sets within an exercise)
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL DEFAULT 1,
  reps integer, -- for strength training
  weight_kg numeric, -- for weighted exercises
  weight_lb numeric, -- alternative unit
  distance_km numeric, -- for cardio
  distance_miles numeric, -- alternative unit
  duration_seconds integer, -- for timed exercises
  rest_seconds integer, -- rest after this set
  rpe integer CHECK (rpe >= 1 AND rpe <= 10), -- rate of perceived exertion
  is_warmup boolean DEFAULT false,
  is_dropset boolean DEFAULT false,
  is_failure boolean DEFAULT false, -- went to failure
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id ON public.exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_set_number ON public.exercise_sets(set_number);

-- 5. MIGRATE DATA FROM OLD workout_logs TABLE
-- First, insert workouts (one per unique user_id + log_date combination)
INSERT INTO public.workouts (user_id, name, workout_date, type, notes, created_at)
SELECT DISTINCT 
  user_id,
  COALESCE(workout_type, 'Workout'), -- use workout_type as name if available
  log_date::timestamptz,
  CASE 
    WHEN workout_type ILIKE '%cardio%' OR workout_type ILIKE '%run%' THEN 'cardio'
    WHEN workout_type ILIKE '%strength%' OR workout_type ILIKE '%weight%' THEN 'strength'
    ELSE 'mixed'
  END,
  STRING_AGG(DISTINCT notes, '; '), -- combine all notes for that day
  MIN(created_at)
FROM public.workout_logs
WHERE user_id IS NOT NULL
GROUP BY user_id, log_date, workout_type;

-- Create temporary mapping table for migration
CREATE TEMP TABLE workout_mapping AS
SELECT 
  wl.id as old_log_id,
  w.id as new_workout_id,
  wl.exercise_name,
  wl.sets,
  wl.reps,
  wl.weight_kg,
  wl.duration_min,
  wl.notes
FROM public.workout_logs wl
JOIN public.workouts w ON 
  w.user_id = wl.user_id AND 
  DATE(w.workout_date) = wl.log_date AND
  (w.name = wl.workout_type OR (w.name = 'Workout' AND wl.workout_type IS NULL));

-- Insert exercises from old data
INSERT INTO public.workout_exercises (workout_id, exercise_name, exercise_order, notes)
SELECT 
  new_workout_id,
  exercise_name,
  ROW_NUMBER() OVER (PARTITION BY new_workout_id ORDER BY old_log_id),
  notes
FROM workout_mapping
WHERE exercise_name IS NOT NULL;

-- Create sets from old data
INSERT INTO public.exercise_sets (workout_exercise_id, set_number, reps, weight_kg, duration_seconds)
SELECT 
  we.id,
  generate_series(1, COALESCE(wm.sets, 1)), -- create multiple sets if specified
  wm.reps,
  wm.weight_kg,
  (wm.duration_min * 60)::integer -- convert minutes to seconds
FROM workout_mapping wm
JOIN public.workout_exercises we ON 
  we.workout_id = wm.new_workout_id AND 
  we.exercise_name = wm.exercise_name;

-- 6. SEED COMMON EXERCISES
INSERT INTO public.exercises (name, category, equipment, muscle_group, is_compound) VALUES
-- Chest
('Bench Press', 'Chest', 'Barbell', ARRAY['chest', 'triceps', 'shoulders'], true),
('Incline Dumbbell Press', 'Chest', 'Dumbbell', ARRAY['chest', 'shoulders'], true),
('Push-ups', 'Chest', 'Bodyweight', ARRAY['chest', 'triceps'], true),
('Chest Fly', 'Chest', 'Dumbbell', ARRAY['chest'], false),

-- Back
('Deadlift', 'Back', 'Barbell', ARRAY['back', 'glutes', 'hamstrings'], true),
('Pull-ups', 'Back', 'Bodyweight', ARRAY['back', 'biceps'], true),
('Bent Over Row', 'Back', 'Barbell', ARRAY['back', 'biceps'], true),
('Lat Pulldown', 'Back', 'Machine', ARRAY['back', 'biceps'], true),

-- Legs
('Squat', 'Legs', 'Barbell', ARRAY['quads', 'glutes', 'hamstrings'], true),
('Leg Press', 'Legs', 'Machine', ARRAY['quads', 'glutes'], true),
('Romanian Deadlift', 'Legs', 'Barbell', ARRAY['hamstrings', 'glutes'], true),
('Leg Curls', 'Legs', 'Machine', ARRAY['hamstrings'], false),
('Calf Raises', 'Legs', 'Machine', ARRAY['calves'], false),

-- Shoulders
('Overhead Press', 'Shoulders', 'Barbell', ARRAY['shoulders', 'triceps'], true),
('Lateral Raises', 'Shoulders', 'Dumbbell', ARRAY['shoulders'], false),
('Face Pulls', 'Shoulders', 'Cable', ARRAY['rear_delts', 'upper_back'], false),

-- Arms
('Bicep Curls', 'Arms', 'Dumbbell', ARRAY['biceps'], false),
('Hammer Curls', 'Arms', 'Dumbbell', ARRAY['biceps', 'forearms'], false),
('Tricep Extensions', 'Arms', 'Dumbbell', ARRAY['triceps'], false),
('Close-Grip Bench Press', 'Arms', 'Barbell', ARRAY['triceps', 'chest'], true),

-- Core
('Plank', 'Core', 'Bodyweight', ARRAY['abs', 'core'], false),
('Crunches', 'Core', 'Bodyweight', ARRAY['abs'], false),
('Russian Twists', 'Core', 'Bodyweight', ARRAY['abs', 'obliques'], false),

-- Cardio
('Running', 'Cardio', 'None', ARRAY['cardio'], false),
('Cycling', 'Cardio', 'Bike', ARRAY['cardio', 'legs'], false),
('Rowing', 'Cardio', 'Machine', ARRAY['cardio', 'back', 'legs'], true),
('Swimming', 'Cardio', 'None', ARRAY['cardio', 'full_body'], true)
ON CONFLICT (name) DO NOTHING;

-- 7. UPDATE activity_logs TYPE CONSTRAINT
-- Update to differentiate between exercise (single) and workout (session)
ALTER TABLE public.activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_type_check;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_type_check 
CHECK (type = ANY (ARRAY['weight'::text, 'food'::text, 'exercise'::text, 'workout'::text, 'mood'::text, 'energy'::text, 'sleep'::text, 'water'::text, 'unknown'::text]));

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES

-- Workouts policies
CREATE POLICY "Users can manage own workouts" ON public.workouts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exercises policies (public read, admin write)
CREATE POLICY "Anyone can read exercises" ON public.exercises
  FOR SELECT USING (true);

-- Workout exercises policies
CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Exercise sets policies
CREATE POLICY "Users can manage own exercise sets" ON public.exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = exercise_sets.workout_exercise_id 
      AND w.user_id = auth.uid()
    )
  );

-- 10. CREATE UPDATE TRIGGERS
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. CREATE HELPFUL VIEWS

-- View for complete workout details
CREATE OR REPLACE VIEW public.workout_details AS
SELECT 
  w.id as workout_id,
  w.user_id,
  w.name as workout_name,
  w.workout_date,
  w.type,
  w.duration_minutes,
  w.energy_level,
  we.id as workout_exercise_id,
  we.exercise_name,
  we.exercise_order,
  e.category as exercise_category,
  e.muscle_group,
  es.id as set_id,
  es.set_number,
  es.reps,
  es.weight_kg,
  es.weight_lb,
  es.distance_km,
  es.duration_seconds,
  es.rpe,
  es.is_warmup,
  es.is_failure
FROM public.workouts w
LEFT JOIN public.workout_exercises we ON we.workout_id = w.id
LEFT JOIN public.exercises e ON e.id = we.exercise_id
LEFT JOIN public.exercise_sets es ON es.workout_exercise_id = we.id
ORDER BY w.workout_date DESC, we.exercise_order, es.set_number;

-- Grant access to view
GRANT SELECT ON public.workout_details TO authenticated;

-- View for workout summaries
CREATE OR REPLACE VIEW public.workout_summary AS
SELECT 
  w.id,
  w.user_id,
  w.name,
  w.workout_date,
  w.type,
  w.duration_minutes,
  COUNT(DISTINCT we.id) as exercise_count,
  COUNT(DISTINCT es.id) as total_sets,
  SUM(es.reps * es.weight_kg) as total_volume_kg,
  MAX(es.weight_kg) as max_weight_kg,
  w.energy_level,
  w.notes
FROM public.workouts w
LEFT JOIN public.workout_exercises we ON we.workout_id = w.id
LEFT JOIN public.exercise_sets es ON es.workout_exercise_id = we.id
GROUP BY w.id, w.user_id, w.name, w.workout_date, w.type, w.duration_minutes, w.energy_level, w.notes;

-- Grant access to view
GRANT SELECT ON public.workout_summary TO authenticated;

-- 12. OPTIONAL: DROP OLD workout_logs TABLE
-- Uncomment after verifying migration success
-- DROP TABLE IF EXISTS public.workout_logs CASCADE;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- New structure:
-- workouts -> workout_exercises -> exercise_sets
-- 
-- Example usage:
-- 1. Create a workout session
-- 2. Add exercises to the workout
-- 3. Add sets for each exercise
-- 
-- Benefits:
-- - Proper separation of concerns
-- - Track multiple sets per exercise
-- - Track multiple exercises per workout
-- - Better analytics and progress tracking
-- ============================================