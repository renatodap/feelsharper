-- Comprehensive Workout System with Multiple Modes
-- Supports: Weights, Cardio (Run/Bike/Swim), Sports, Yoga, HIIT, etc.

-- Workout modes enum
CREATE TYPE workout_mode AS ENUM (
  'weights',      -- Traditional weight training
  'run',          -- Running/jogging
  'bike',         -- Cycling
  'swim',         -- Swimming
  'sport',        -- Sports (tennis, basketball, etc.)
  'yoga',         -- Yoga/stretching
  'hiit',         -- High-intensity interval training
  'cardio',       -- General cardio
  'crossfit',     -- CrossFit workouts
  'calisthenics', -- Bodyweight exercises
  'other'         -- Other activities
);

-- Main workout sessions table (enhanced)
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS mode workout_mode DEFAULT 'weights',
ADD COLUMN IF NOT EXISTS sport_type TEXT,
ADD COLUMN IF NOT EXISTS calories_burned INTEGER,
ADD COLUMN IF NOT EXISTS heart_rate_avg INTEGER,
ADD COLUMN IF NOT EXISTS heart_rate_max INTEGER,
ADD COLUMN IF NOT EXISTS perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10);

-- Weight training specific data
CREATE TABLE IF NOT EXISTS public.workout_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(10, 2),
  weight_lbs DECIMAL(10, 2),
  rest_seconds INTEGER,
  tempo TEXT, -- e.g., "2-0-2-0" for eccentric-pause-concentric-pause
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cardio workouts (run, bike, swim, etc.)
CREATE TABLE IF NOT EXISTS public.workout_cardio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'run', 'bike', 'swim', 'row', 'elliptical'
  distance_km DECIMAL(10, 3),
  distance_miles DECIMAL(10, 3),
  duration_seconds INTEGER NOT NULL,
  pace_per_km INTERVAL,
  pace_per_mile INTERVAL,
  speed_avg_kmh DECIMAL(10, 2),
  speed_max_kmh DECIMAL(10, 2),
  elevation_gain_m INTEGER,
  elevation_loss_m INTEGER,
  cadence_avg INTEGER, -- Steps/min for running, RPM for cycling
  power_avg_watts INTEGER, -- For cycling
  stroke_count INTEGER, -- For swimming
  lap_count INTEGER,
  heart_rate_zones JSONB, -- Time in each HR zone
  splits JSONB, -- Array of split times
  route_name TEXT,
  weather_conditions TEXT,
  temperature_c INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports activities
CREATE TABLE IF NOT EXISTS public.workout_sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL, -- 'tennis', 'basketball', 'soccer', etc.
  duration_minutes INTEGER NOT NULL,
  score_user INTEGER,
  score_opponent INTEGER,
  sets_played INTEGER,
  games_played INTEGER,
  points_scored INTEGER,
  shots_taken INTEGER,
  shots_made INTEGER,
  serves_total INTEGER,
  serves_in INTEGER,
  aces INTEGER,
  errors INTEGER,
  winners INTEGER,
  opponent_name TEXT,
  venue TEXT,
  competition_level TEXT, -- 'casual', 'practice', 'league', 'tournament'
  match_result TEXT, -- 'win', 'loss', 'draw'
  stats JSONB, -- Sport-specific statistics
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HIIT/Interval training
CREATE TABLE IF NOT EXISTS public.workout_intervals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interval_number INTEGER NOT NULL,
  interval_type TEXT NOT NULL, -- 'work', 'rest', 'warmup', 'cooldown'
  exercise_name TEXT,
  duration_seconds INTEGER,
  intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10),
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  reps INTEGER,
  distance_m DECIMAL(10, 2),
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yoga/Flexibility sessions
CREATE TABLE IF NOT EXISTS public.workout_yoga (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style TEXT, -- 'vinyasa', 'hatha', 'yin', 'power', etc.
  instructor TEXT,
  class_name TEXT,
  poses_count INTEGER,
  poses_list TEXT[],
  focus_areas TEXT[], -- 'flexibility', 'balance', 'strength', 'relaxation'
  duration_minutes INTEGER NOT NULL,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  mindfulness_minutes INTEGER,
  breathing_exercises BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick workout templates for easy logging
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode workout_mode NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT,
  exercises JSONB NOT NULL, -- Structured exercise data
  typical_duration INTEGER, -- in minutes
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  equipment_needed TEXT[],
  tags TEXT[],
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal records tracking
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL, -- 'max_weight', 'max_reps', 'fastest_time', 'longest_distance'
  value DECIMAL(10, 3) NOT NULL,
  unit TEXT NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ NOT NULL,
  previous_value DECIMAL(10, 3),
  improvement_percent DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_name, record_type)
);

-- Quick entry presets for common exercises
CREATE TABLE IF NOT EXISTS public.exercise_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  mode workout_mode NOT NULL,
  default_sets INTEGER,
  default_reps INTEGER,
  default_weight_kg DECIMAL(10, 2),
  default_duration_seconds INTEGER,
  default_distance_km DECIMAL(10, 3),
  last_used_at TIMESTAMPTZ,
  frequency_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_weights_workout ON public.workout_weights(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_weights_user ON public.workout_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_weights_exercise ON public.workout_weights(exercise_name);

CREATE INDEX IF NOT EXISTS idx_workout_cardio_workout ON public.workout_cardio(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_cardio_user ON public.workout_cardio(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_cardio_activity ON public.workout_cardio(activity_type);

CREATE INDEX IF NOT EXISTS idx_workout_sports_workout ON public.workout_sports(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sports_user ON public.workout_sports(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sports_sport ON public.workout_sports(sport);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(exercise_name);

-- Enable RLS
ALTER TABLE public.workout_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_cardio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_intervals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_yoga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own weight workouts" ON public.workout_weights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cardio workouts" ON public.workout_cardio
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sports workouts" ON public.workout_sports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interval workouts" ON public.workout_intervals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own yoga workouts" ON public.workout_yoga
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON public.workout_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON public.workout_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own records" ON public.personal_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own presets" ON public.exercise_presets
  FOR ALL USING (auth.uid() = user_id);

-- Helper functions for easy data entry

-- Function to log a quick workout
CREATE OR REPLACE FUNCTION log_quick_workout(
  p_user_id UUID,
  p_mode workout_mode,
  p_duration_minutes INTEGER,
  p_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_workout_id UUID;
BEGIN
  -- Create main workout entry
  INSERT INTO public.workouts (
    user_id, 
    mode, 
    duration_minutes, 
    logged_at,
    notes
  ) VALUES (
    p_user_id,
    p_mode,
    p_duration_minutes,
    NOW(),
    p_data->>'notes'
  ) RETURNING id INTO v_workout_id;
  
  -- Handle mode-specific data
  CASE p_mode
    WHEN 'weights' THEN
      -- Insert weight training data
      INSERT INTO public.workout_weights (
        workout_id, user_id, exercise_name, set_number, reps, weight_kg
      )
      SELECT 
        v_workout_id,
        p_user_id,
        exercise->>'name',
        (set_data->>'set')::INTEGER,
        (set_data->>'reps')::INTEGER,
        (set_data->>'weight')::DECIMAL
      FROM jsonb_array_elements(p_data->'exercises') AS exercise,
           jsonb_array_elements(exercise->'sets') AS set_data;
           
    WHEN 'run', 'bike', 'swim' THEN
      -- Insert cardio data
      INSERT INTO public.workout_cardio (
        workout_id, user_id, activity_type, distance_km, duration_seconds
      ) VALUES (
        v_workout_id,
        p_user_id,
        p_mode::TEXT,
        (p_data->>'distance')::DECIMAL,
        p_duration_minutes * 60
      );
      
    WHEN 'sport' THEN
      -- Insert sports data
      INSERT INTO public.workout_sports (
        workout_id, user_id, sport, duration_minutes
      ) VALUES (
        v_workout_id,
        p_user_id,
        p_data->>'sport',
        p_duration_minutes
      );
  END CASE;
  
  RETURN v_workout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for personal records
CREATE OR REPLACE FUNCTION check_personal_record(
  p_user_id UUID,
  p_exercise_name TEXT,
  p_value DECIMAL,
  p_record_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_record DECIMAL;
  v_is_new_record BOOLEAN := FALSE;
BEGIN
  -- Get current record
  SELECT value INTO v_current_record
  FROM public.personal_records
  WHERE user_id = p_user_id 
    AND exercise_name = p_exercise_name
    AND record_type = p_record_type;
  
  -- Check if new record
  IF v_current_record IS NULL OR p_value > v_current_record THEN
    -- Update or insert record
    INSERT INTO public.personal_records (
      user_id, exercise_name, record_type, value, unit, achieved_at, previous_value
    ) VALUES (
      p_user_id, p_exercise_name, p_record_type, p_value, 
      CASE 
        WHEN p_record_type LIKE '%weight%' THEN 'kg'
        WHEN p_record_type LIKE '%time%' THEN 'seconds'
        WHEN p_record_type LIKE '%distance%' THEN 'km'
        ELSE 'count'
      END,
      NOW(),
      v_current_record
    )
    ON CONFLICT (user_id, exercise_name, record_type)
    DO UPDATE SET 
      value = p_value,
      previous_value = v_current_record,
      achieved_at = NOW(),
      improvement_percent = ((p_value - v_current_record) / v_current_record * 100);
    
    v_is_new_record := TRUE;
  END IF;
  
  RETURN v_is_new_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_quick_workout TO authenticated;
GRANT EXECUTE ON FUNCTION check_personal_record TO authenticated;