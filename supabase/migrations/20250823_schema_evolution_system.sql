-- Schema Evolution System Tables
-- Phase 10.1: Dynamic Database Schema Evolution

-- Table to track schema evolution requests
CREATE TABLE IF NOT EXISTS schema_evolution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestions JSONB NOT NULL, -- Array of suggestions
  migration_script TEXT NOT NULL, -- Generated SQL
  confidence_scores NUMERIC[] NOT NULL, -- Confidence per suggestion
  total_affected_users INT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'executed')) DEFAULT 'pending',
  auto_approve BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by TEXT,
  executed_at TIMESTAMP,
  execution_error TEXT
);

-- Table to track schema versions for rollback capability
CREATE TABLE IF NOT EXISTS schema_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL, -- e.g., 'v1234567890'
  migration_script TEXT NOT NULL,
  backup_schema JSONB, -- Schema state before migration
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,
  rollback_script TEXT,
  applied_patterns JSONB -- Patterns that triggered this version
);

-- Table to track detected patterns over time
CREATE TABLE IF NOT EXISTS detected_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  frequency INT NOT NULL,
  data_type TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  examples JSONB,
  user_types TEXT[],
  first_detected TIMESTAMP DEFAULT NOW(),
  last_detected TIMESTAMP DEFAULT NOW(),
  times_suggested INT DEFAULT 1,
  times_approved INT DEFAULT 0,
  times_rejected INT DEFAULT 0,
  UNIQUE(pattern_name, field_name)
);

-- Table for custom fields per user type (Phase 10.1.6)
CREATE TABLE IF NOT EXISTS user_type_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL, -- 'tennis', 'bodybuilder', 'runner', etc.
  field_definitions JSONB NOT NULL, -- Custom field configurations
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_schema_requests_status ON schema_evolution_requests(status);
CREATE INDEX idx_schema_requests_created ON schema_evolution_requests(created_at DESC);
CREATE INDEX idx_schema_versions_active ON schema_versions(is_active);
CREATE INDEX idx_detected_patterns_confidence ON detected_patterns(confidence DESC);
CREATE INDEX idx_detected_patterns_frequency ON detected_patterns(frequency DESC);

-- RLS Policies (admin only)
ALTER TABLE schema_evolution_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_type_custom_fields ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables
CREATE POLICY "Admin only - schema_evolution_requests" ON schema_evolution_requests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin only - schema_versions" ON schema_versions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin only - detected_patterns" ON detected_patterns
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin only - user_type_custom_fields" ON user_type_custom_fields
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to track pattern detection
CREATE OR REPLACE FUNCTION track_detected_pattern(
  p_pattern_name TEXT,
  p_field_name TEXT,
  p_frequency INT,
  p_data_type TEXT,
  p_confidence NUMERIC,
  p_examples JSONB,
  p_user_types TEXT[]
) RETURNS void AS $$
BEGIN
  INSERT INTO detected_patterns (
    pattern_name,
    field_name,
    frequency,
    data_type,
    confidence,
    examples,
    user_types,
    first_detected,
    last_detected,
    times_suggested
  ) VALUES (
    p_pattern_name,
    p_field_name,
    p_frequency,
    p_data_type,
    p_confidence,
    p_examples,
    p_user_types,
    NOW(),
    NOW(),
    1
  )
  ON CONFLICT (pattern_name, field_name) DO UPDATE SET
    frequency = detected_patterns.frequency + EXCLUDED.frequency,
    confidence = (detected_patterns.confidence + EXCLUDED.confidence) / 2,
    examples = detected_patterns.examples || EXCLUDED.examples,
    user_types = array_distinct(detected_patterns.user_types || EXCLUDED.user_types),
    last_detected = NOW(),
    times_suggested = detected_patterns.times_suggested + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get evolution suggestions
CREATE OR REPLACE FUNCTION get_evolution_suggestions(
  min_confidence NUMERIC DEFAULT 0.7
) RETURNS TABLE(
  field_name TEXT,
  data_type TEXT,
  frequency INT,
  confidence NUMERIC,
  user_types TEXT[],
  suggestion_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.field_name,
    dp.data_type,
    dp.frequency,
    dp.confidence,
    dp.user_types,
    dp.times_suggested
  FROM detected_patterns dp
  WHERE dp.confidence >= min_confidence
    AND dp.times_approved = 0  -- Not yet implemented
    AND dp.times_rejected < 3  -- Not repeatedly rejected
  ORDER BY dp.confidence DESC, dp.frequency DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Sample user type custom fields for tennis players
INSERT INTO user_type_custom_fields (user_type, field_definitions) VALUES
('tennis', '{
  "serve_speed": {"type": "number", "unit": "mph", "min": 0, "max": 200},
  "first_serve_percentage": {"type": "number", "unit": "%", "min": 0, "max": 100},
  "unforced_errors": {"type": "number", "min": 0},
  "winners": {"type": "number", "min": 0},
  "court_surface": {"type": "enum", "values": ["hard", "clay", "grass", "indoor"]},
  "match_duration": {"type": "duration", "unit": "minutes"},
  "opponent_rating": {"type": "number", "min": 1.0, "max": 7.0}
}'),
('bodybuilder', '{
  "body_fat_percentage": {"type": "number", "unit": "%", "min": 3, "max": 50},
  "muscle_measurements": {"type": "json", "schema": {"chest": "number", "arms": "number", "waist": "number"}},
  "training_split": {"type": "enum", "values": ["push_pull_legs", "upper_lower", "bro_split", "full_body"]},
  "peak_week": {"type": "boolean"},
  "competition_date": {"type": "date"},
  "posing_practice": {"type": "duration", "unit": "minutes"},
  "supplement_stack": {"type": "array", "items": "string"}
}'),
('runner', '{
  "cadence": {"type": "number", "unit": "spm", "min": 140, "max": 200},
  "vertical_oscillation": {"type": "number", "unit": "cm", "min": 0, "max": 20},
  "ground_contact_time": {"type": "number", "unit": "ms", "min": 150, "max": 400},
  "vo2_max": {"type": "number", "min": 20, "max": 90},
  "lactate_threshold_pace": {"type": "pace", "unit": "min/km"},
  "running_power": {"type": "number", "unit": "watts"},
  "shoe_rotation": {"type": "array", "items": {"name": "string", "mileage": "number"}}
}');

-- Helper function to apply custom fields to user data
CREATE OR REPLACE FUNCTION apply_custom_fields(
  p_user_type TEXT,
  p_activity_data JSONB
) RETURNS JSONB AS $$
DECLARE
  v_custom_fields JSONB;
  v_validated_data JSONB := '{}';
  v_field_name TEXT;
  v_field_def JSONB;
BEGIN
  -- Get custom field definitions for user type
  SELECT field_definitions INTO v_custom_fields
  FROM user_type_custom_fields
  WHERE user_type = p_user_type AND is_active = TRUE;
  
  IF v_custom_fields IS NULL THEN
    RETURN p_activity_data;
  END IF;
  
  -- Validate and apply each custom field
  FOR v_field_name, v_field_def IN SELECT * FROM jsonb_each(v_custom_fields)
  LOOP
    IF p_activity_data ? v_field_name THEN
      -- Field exists in input, validate it
      -- In production, add proper validation based on field_def
      v_validated_data := v_validated_data || jsonb_build_object(
        v_field_name, p_activity_data->v_field_name
      );
    END IF;
  END LOOP;
  
  -- Merge validated custom fields with original data
  RETURN p_activity_data || v_validated_data;
END;
$$ LANGUAGE plpgsql;

-- Notification log for admin actions
CREATE TABLE IF NOT EXISTS schema_evolution_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES schema_evolution_requests(id),
  notification_type TEXT CHECK (notification_type IN ('new_suggestion', 'auto_approved', 'needs_review', 'executed', 'failed')),
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Function for array_distinct (helper)
CREATE OR REPLACE FUNCTION array_distinct(arr TEXT[]) 
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(SELECT DISTINCT unnest(arr));
END;
$$ LANGUAGE plpgsql IMMUTABLE;