-- Create simple food_logs and body_weight tables for MVP
-- These are simplified versions that the current app code expects

-- Simple food logs table
CREATE TABLE IF NOT EXISTS public.food_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text DEFAULT 'g',
  meal_type text NOT NULL, -- breakfast, lunch, dinner, snack
  calories numeric DEFAULT 0,
  protein_g numeric DEFAULT 0,
  carbs_g numeric DEFAULT 0,
  fat_g numeric DEFAULT 0,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for food_logs
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, logged_at DESC);

-- RLS for food_logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own food logs" ON public.food_logs
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update body_weight table if it doesn't have the right structure
-- First check if we need to modify it
DO $$
BEGIN
  -- Add weight_kg column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'body_weight' 
    AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE public.body_weight ADD COLUMN weight_kg numeric;
  END IF;

  -- Add measured_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'body_weight' 
    AND column_name = 'measured_at'
  ) THEN
    ALTER TABLE public.body_weight ADD COLUMN measured_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create a simpler body measurements table if needed
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric,
  weight_lb numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  measured_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, measured_at DESC);

-- RLS for body_measurements
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own measurements" ON public.body_measurements
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create body_trends table for analytics
CREATE TABLE IF NOT EXISTS public.body_trends (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL, -- 'weight', 'body_fat', 'muscle_mass'
  date date NOT NULL,
  value numeric NOT NULL,
  ema_7day numeric,
  ema_30day numeric,
  trend text, -- 'increasing', 'decreasing', 'stable'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_body_trends_user_metric ON public.body_trends(user_id, metric_type, date DESC);

-- RLS for body_trends
ALTER TABLE public.body_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trends" ON public.body_trends
  FOR SELECT
  USING (user_id = auth.uid());

-- Create body_goals table
CREATE TABLE IF NOT EXISTS public.body_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  target_value numeric NOT NULL,
  target_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for body_goals
ALTER TABLE public.body_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON public.body_goals
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());