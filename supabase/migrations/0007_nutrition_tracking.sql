-- Nutrition Tracking Tables
-- Supports comprehensive meal logging and macro tracking

-- Nutrition logs for daily food intake
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT, -- Reference to food database
  food_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL,
  protein DECIMAL DEFAULT 0,
  carbs DECIMAL DEFAULT 0,
  fat DECIMAL DEFAULT 0,
  fiber DECIMAL DEFAULT 0,
  sugar DECIMAL DEFAULT 0,
  sodium DECIMAL DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User nutrition targets and preferences
CREATE TABLE nutrition_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_target INTEGER NOT NULL,
  protein_target DECIMAL NOT NULL,
  carbs_target DECIMAL NOT NULL,
  fat_target DECIMAL NOT NULL,
  fiber_target DECIMAL DEFAULT 25,
  water_target DECIMAL DEFAULT 2000, -- ml
  goal_type TEXT NOT NULL DEFAULT 'general_health',
  activity_level TEXT NOT NULL DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enhanced workout sets with RPE and rest tracking
ALTER TABLE workout_sets 
ADD COLUMN IF NOT EXISTS rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
ADD COLUMN IF NOT EXISTS rest_seconds INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS is_warmup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_failure BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tempo TEXT, -- e.g., "3-1-2-1"
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Exercise database
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'sports')),
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT[] NOT NULL,
  tips TEXT[] DEFAULT '{}',
  variations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  measurements JSONB DEFAULT '{}', -- chest, waist, arms, etc.
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  sleep_hours DECIMAL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- AI coaching insights and recommendations
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('workout', 'nutrition', 'recovery', 'goal')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  action TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, logged_at);
CREATE INDEX idx_nutrition_logs_meal_type ON nutrition_logs(user_id, meal_type, logged_at);
CREATE INDEX idx_user_progress_user_date ON user_progress(user_id, date);
CREATE INDEX idx_ai_recommendations_user_active ON ai_recommendations(user_id, status) WHERE status = 'active';
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Row Level Security
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own nutrition logs" ON nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own nutrition targets" ON nutrition_targets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI recommendations" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Exercises are readable by all authenticated users" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_targets_updated_at BEFORE UPDATE ON nutrition_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
