-- This file should be run in your Supabase SQL editor to create the missing tables

-- Create simple food_logs table for MVP
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

-- Grant access to authenticated users
GRANT ALL ON public.food_logs TO authenticated;
GRANT ALL ON public.food_logs TO service_role;

-- Create body_measurements table if not exists
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric,
  weight_lb numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  measurement_date date DEFAULT CURRENT_DATE,
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

-- Grant access
GRANT ALL ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;