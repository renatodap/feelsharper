-- MVP Schema Enhancement Migration
-- Adds support for AI insights, rule cards, and enhanced activity logging
-- Date: 2024-09-04
-- Description: Enhances existing schema with MVP features for AI coaching

-- =============================================================================
-- ENHANCED PROFILES TABLE
-- =============================================================================

-- Add sport-specific fields to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_frequency INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completion_score INTEGER DEFAULT 0;

-- Add check constraints for data validation
ALTER TABLE public.profiles ADD CONSTRAINT check_sport_type 
CHECK (sport_type IN ('general', 'endurance', 'strength', 'skill_sport'));

ALTER TABLE public.profiles ADD CONSTRAINT check_training_frequency 
CHECK (training_frequency >= 0 AND training_frequency <= 14);

ALTER TABLE public.profiles ADD CONSTRAINT check_completion_score 
CHECK (completion_score >= 0 AND completion_score <= 100);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_sport_type ON public.profiles(sport_type);
CREATE INDEX IF NOT EXISTS idx_profiles_completion_score ON public.profiles(completion_score);

-- =============================================================================
-- ENHANCED ACTIVITY LOGS TABLE  
-- =============================================================================

-- Add structured data and confidence fields to existing activity_logs table
-- Note: activity_logs already has 'confidence' field, adding new fields
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS structured_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS confidence_score FLOAT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Add check constraints
ALTER TABLE public.activity_logs ADD CONSTRAINT check_confidence_score 
CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

ALTER TABLE public.activity_logs ADD CONSTRAINT check_source
CHECK (source IN ('manual', 'voice', 'device', 'photo'));

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_confidence ON public.activity_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_activity_logs_source ON public.activity_logs(source);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.activity_logs(user_id, created_at);

-- =============================================================================
-- NEW INSIGHTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    related_logs UUID[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    priority INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraints for insights
ALTER TABLE public.insights ADD CONSTRAINT check_insight_type
CHECK (insight_type IN ('advice', 'encouragement', 'warning', 'pattern'));

ALTER TABLE public.insights ADD CONSTRAINT check_insight_status  
CHECK (status IN ('active', 'dismissed', 'expired'));

ALTER TABLE public.insights ADD CONSTRAINT check_insight_priority
CHECK (priority >= 1 AND priority <= 5);

-- Create performance indexes for insights
CREATE INDEX IF NOT EXISTS idx_insights_user_status ON public.insights(user_id, status);
CREATE INDEX IF NOT EXISTS idx_insights_type_priority ON public.insights(insight_type, priority);
CREATE INDEX IF NOT EXISTS idx_insights_expires ON public.insights(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON public.insights(created_at);

-- =============================================================================
-- NEW RULE CARDS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rule_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    conditions JSONB NOT NULL,
    response_template TEXT NOT NULL,
    clarifying_question TEXT,
    priority INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraints for rule cards
ALTER TABLE public.rule_cards ADD CONSTRAINT check_rule_priority
CHECK (priority >= 1 AND priority <= 5);

-- Create performance indexes for rule cards
CREATE INDEX IF NOT EXISTS idx_rule_cards_active ON public.rule_cards(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_rule_cards_priority ON public.rule_cards(priority);
CREATE INDEX IF NOT EXISTS idx_rule_cards_name ON public.rule_cards(name);

-- =============================================================================
-- RLS (Row Level Security) POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_cards ENABLE ROW LEVEL SECURITY;

-- Insights policies - users can only see their own insights
CREATE POLICY "Users can view own insights" ON public.insights
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON public.insights  
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.insights
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.insights
FOR DELETE USING (auth.uid() = user_id);

-- Rule cards policies - read-only for all authenticated users
CREATE POLICY "Authenticated users can view rule cards" ON public.rule_cards
FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify rule cards
CREATE POLICY "Service role can manage rule cards" ON public.rule_cards
FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- INITIAL DATA - CORE RULE CARDS
-- =============================================================================

-- Insert core rule cards for MVP functionality
INSERT INTO public.rule_cards (name, description, conditions, response_template, clarifying_question, priority) VALUES

('pre_workout_fuel', 
 'Advise on pre-workout nutrition timing',
 '{"has_upcoming_workout": true, "time_until_workout": {"min": 1, "max": 4, "unit": "hours"}, "last_meal": {"min": 2, "unit": "hours"}}'::jsonb,
 'Fuel up 1-3h before training: moderate carbs + lean protein, low fat/fiber',
 'What type of workout are you doing?',
 2),

('post_workout_recovery',
 'Recommend post-workout recovery nutrition',
 '{"recent_workout": {"max": 2, "unit": "hours"}, "workout_intensity": "moderate_to_high", "no_post_meal": true}'::jsonb,
 'Recovery window is open: aim for carbs + protein within 2h. Examples: chocolate milk, turkey sandwich, protein smoothie with banana',
 null,
 1),

('hydration_check',
 'Remind about hydration during extended exercise',
 '{"workout_duration": {"min": 60, "unit": "minutes"}, "no_water_logged": true}'::jsonb,
 'Don\'t forget hydration: aim for 16-24oz per hour of exercise',
 'How much did you drink during your workout?',
 2),

('sleep_deficit',
 'Adjust workout intensity based on poor sleep',
 '{"sleep_hours": {"max": 6}, "has_workout_planned": true}'::jsonb,
 'With limited sleep, consider reducing workout intensity by 10-20%. Alternatives: active recovery, light stretching, or short walk instead',
 null,
 1),

('protein_optimization',
 'Optimize protein intake for strength training',
 '{"daily_protein": {"max": 0.8, "unit": "per_kg_bodyweight"}, "strength_training": true}'::jsonb,
 'Boost protein for muscle recovery: aim for 1.6-2.2g per kg bodyweight. Add protein powder, Greek yogurt, or extra lean meat',
 null,
 3)

ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update completion score based on profile completeness
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
    total_fields INTEGER := 12; -- Adjust based on important profile fields
BEGIN
    -- Basic info (30% weight = 3.6 points each)
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN score := score + 4; END IF;
    IF NEW.age_range IS NOT NULL THEN score := score + 4; END IF;
    IF NEW.gender IS NOT NULL THEN score := score + 4; END IF;
    IF NEW.activity_level IS NOT NULL THEN score := score + 4; END IF;
    
    -- Goals (40% weight = 4.8 points each) 
    IF NEW.primary_goal IS NOT NULL THEN score := score + 6; END IF;
    IF NEW.sport_type IS NOT NULL THEN score := score + 6; END IF;
    IF NEW.training_frequency IS NOT NULL THEN score := score + 6; END IF;
    IF NEW.target_weight IS NOT NULL THEN score := score + 6; END IF;
    
    -- Preferences (20% weight = 2.4 points each)
    IF NEW.dietary_restrictions IS NOT NULL AND jsonb_array_length(NEW.dietary_restrictions) > 0 THEN score := score + 3; END IF;
    IF NEW.preferred_workout_time IS NOT NULL THEN score := score + 3; END IF;
    
    -- Additional info (10% weight = 1.2 points each)
    IF NEW.current_weight IS NOT NULL THEN score := score + 2; END IF;
    IF NEW.height IS NOT NULL THEN score := score + 2; END IF;
    
    -- Cap at 100
    NEW.completion_score := LEAST(score, 100);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update completion score
DROP TRIGGER IF EXISTS trigger_update_completion_score ON public.profiles;
CREATE TRIGGER trigger_update_completion_score
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion_score();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to new tables
CREATE TRIGGER update_insights_updated_at
    BEFORE UPDATE ON public.insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rule_cards_updated_at
    BEFORE UPDATE ON public.rule_cards  
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DATA VALIDATION AND CLEANUP
-- =============================================================================

-- Update existing profiles with default values for new columns
UPDATE public.profiles 
SET 
    sport_type = 'general',
    training_frequency = 3,
    dietary_restrictions = '[]'::jsonb,
    completion_score = 0
WHERE sport_type IS NULL;

-- Update existing activity logs with default values  
UPDATE public.activity_logs
SET
    structured_data = '{}'::jsonb,
    source = 'manual'
WHERE structured_data IS NULL;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions for authenticated users on new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT SELECT ON public.rule_cards TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETION LOG
-- =============================================================================

-- Log successful migration completion
DO $$
BEGIN
    RAISE NOTICE 'MVP Schema Enhancement Migration completed successfully at %', NOW();
    RAISE NOTICE 'Added enhanced profiles fields, activity log enhancements, insights table, and rule cards table';
    RAISE NOTICE 'Inserted % rule cards for AI coaching', (SELECT COUNT(*) FROM public.rule_cards);
END $$;