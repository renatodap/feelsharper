-- Create activity_logs table for unified activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weight', 'food', 'exercise', 'mood', 'energy', 'sleep', 'water', 'unknown')),
  raw_input TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  auto_logged BOOLEAN DEFAULT false,
  ai_response TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_type_created ON activity_logs(user_id, type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs" ON activity_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs" ON activity_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_activity_logs_updated_at
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for daily summaries
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE type = 'food') as food_count,
  COUNT(*) FILTER (WHERE type = 'workout') as workout_count,
  COUNT(*) FILTER (WHERE type = 'weight') as weight_count,
  AVG((data->>'weight')::numeric) FILTER (WHERE type = 'weight') as avg_weight,
  AVG((data->>'level')::numeric) FILTER (WHERE type = 'energy') as avg_energy,
  AVG((data->>'hours')::numeric) FILTER (WHERE type = 'sleep') as avg_sleep_hours,
  SUM((data->>'amount')::numeric) FILTER (WHERE type = 'water' AND data->>'unit' = 'oz') as total_water_oz,
  COUNT(*) as total_activities
FROM activity_logs
GROUP BY user_id, DATE(created_at);

-- Grant permissions on the view
GRANT SELECT ON daily_activity_summary TO authenticated;