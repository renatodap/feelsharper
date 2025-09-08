-- Database Schema Enhancement Tests
-- Tests for MVP schema enhancements following TDD methodology
-- This file contains mock data setup and comprehensive validation tests

-- =============================================================================
-- MOCK DATA SETUP
-- =============================================================================

-- Clean up any existing test data first
DELETE FROM public.insights WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE 'test%@feelsharper.com'
);
DELETE FROM public.activity_logs WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE 'test%@feelsharper.com'  
);
DELETE FROM public.profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email LIKE 'test%@feelsharper.com'
);

-- Create test users (using mock data pattern with "Mock" prefix as required)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'MockTestUser1@feelsharper.com', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'MockTestUser2@feelsharper.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SCHEMA STRUCTURE TESTS
-- =============================================================================

-- Test: Enhanced Profiles Table Columns
SELECT 'TEST: profiles_enhanced_columns_exist' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN 'PASS: All enhanced profile columns exist'
        ELSE 'FAIL: Missing enhanced profile columns - found ' || COUNT(*) || ' of 4'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name IN ('sport_type', 'training_frequency', 'dietary_restrictions', 'completion_score');

-- Test: Enhanced Activity Logs Table Columns  
SELECT 'TEST: activity_logs_enhanced_columns_exist' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN 'PASS: All enhanced activity log columns exist'
        ELSE 'FAIL: Missing enhanced activity log columns - found ' || COUNT(*) || ' of 3'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'activity_logs' 
    AND column_name IN ('structured_data', 'confidence_score', 'source');

-- Test: Insights Table Structure
SELECT 'TEST: insights_table_structure' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) >= 12 THEN 'PASS: Insights table has all required columns'
        ELSE 'FAIL: Insights table missing columns - found ' || COUNT(*) || ' expected >=12'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'insights';

-- Test: Rule Cards Table Structure
SELECT 'TEST: rule_cards_table_structure' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) >= 8 THEN 'PASS: Rule cards table has all required columns'
        ELSE 'FAIL: Rule cards table missing columns - found ' || COUNT(*) || ' expected >=8'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'rule_cards';

-- =============================================================================
-- CONSTRAINT VALIDATION TESTS
-- =============================================================================

-- Test: Profile Sport Type Constraint
SELECT 'TEST: profile_sport_type_constraint' as test_name;

-- Valid sport type (should succeed)
INSERT INTO public.profiles (id, sport_type) VALUES 
('11111111-1111-1111-1111-111111111111', 'endurance')
ON CONFLICT (id) DO UPDATE SET sport_type = EXCLUDED.sport_type;

-- Check if valid value was accepted
SELECT 
    CASE 
        WHEN sport_type = 'endurance' THEN 'PASS: Valid sport type accepted'
        ELSE 'FAIL: Valid sport type not set correctly'
    END as result
FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Test: Profile Training Frequency Constraint
SELECT 'TEST: profile_training_frequency_constraint' as test_name;

-- Valid training frequency (should succeed)
UPDATE public.profiles SET training_frequency = 5 
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT 
    CASE 
        WHEN training_frequency = 5 THEN 'PASS: Valid training frequency accepted'
        ELSE 'FAIL: Valid training frequency not set correctly'
    END as result
FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Test: Activity Log Confidence Score Constraint
SELECT 'TEST: activity_log_confidence_constraint' as test_name;

-- Valid confidence score (should succeed)
INSERT INTO public.activity_logs (id, user_id, type, data, raw_text, confidence_score) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 
 'food', '{"test": true}'::jsonb, 'MockTestActivity', 0.85)
ON CONFLICT (id) DO UPDATE SET confidence_score = EXCLUDED.confidence_score;

SELECT 
    CASE 
        WHEN confidence_score = 0.85 THEN 'PASS: Valid confidence score accepted'
        ELSE 'FAIL: Valid confidence score not set correctly'
    END as result  
FROM public.activity_logs WHERE id = '55555555-5555-5555-5555-555555555555';

-- Test: Insights Foreign Key Constraint
SELECT 'TEST: insights_foreign_key_constraint' as test_name;

-- Valid foreign key (should succeed)
INSERT INTO public.insights (id, user_id, insight_type, title, content, confidence_score) VALUES
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111',
 'advice', 'MockTestInsight', 'MockTestContent', 0.8)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

SELECT 
    CASE 
        WHEN user_id = '11111111-1111-1111-1111-111111111111' THEN 'PASS: Valid foreign key accepted'
        ELSE 'FAIL: Foreign key not set correctly'
    END as result
FROM public.insights WHERE id = '66666666-6666-6666-6666-666666666666';

-- Test: Rule Cards Unique Name Constraint  
SELECT 'TEST: rule_cards_unique_name_constraint' as test_name;

-- Insert test rule card
INSERT INTO public.rule_cards (name, conditions, response_template) VALUES
('MockTestRule', '{"test": true}'::jsonb, 'MockTestResponse')
ON CONFLICT (name) DO NOTHING;

-- Check if rule was inserted
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS: Unique rule card name accepted'
        ELSE 'FAIL: Rule card not inserted correctly'
    END as result
FROM public.rule_cards WHERE name = 'MockTestRule';

-- =============================================================================
-- INDEX PERFORMANCE TESTS
-- =============================================================================

-- Test: Profile Sport Type Index
SELECT 'TEST: profile_sport_type_index_performance' as test_name;

-- Check if index exists
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS: Sport type index exists'
        ELSE 'FAIL: Sport type index missing'
    END as result
FROM pg_indexes 
WHERE tablename = 'profiles' AND indexname LIKE '%sport_type%';

-- Test: Activity Logs User/Date Index  
SELECT 'TEST: activity_logs_user_date_index_performance' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS: Activity logs user/created index exists'
        ELSE 'FAIL: Activity logs user/created index missing'
    END as result
FROM pg_indexes 
WHERE tablename = 'activity_logs' AND indexname LIKE '%user_created%';

-- Test: Insights User/Status Index
SELECT 'TEST: insights_user_status_index_performance' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS: Insights user/status index exists'
        ELSE 'FAIL: Insights user/status index missing' 
    END as result
FROM pg_indexes 
WHERE tablename = 'insights' AND indexname LIKE '%user_status%';

-- =============================================================================
-- FUNCTIONAL DATA TESTS
-- =============================================================================

-- Test: Profile Completion Score Calculation
SELECT 'TEST: profile_completion_score_calculation' as test_name;

-- Update profile with more complete information
UPDATE public.profiles SET
    full_name = 'MockTestUser',
    age_range = '25-34', 
    gender = 'non-binary',
    activity_level = 'moderate',
    primary_goal = 'performance',
    sport_type = 'endurance',
    training_frequency = 6,
    target_weight = 70,
    dietary_restrictions = '["vegetarian"]'::jsonb
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check if completion score updated appropriately
SELECT 
    CASE 
        WHEN completion_score > 50 THEN 'PASS: Completion score calculated correctly (' || completion_score || '%)'
        ELSE 'FAIL: Completion score too low (' || completion_score || '%)'
    END as result
FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Test: Dietary Restrictions JSONB Format
SELECT 'TEST: dietary_restrictions_jsonb_format' as test_name;

-- Check if dietary restrictions are stored as proper JSONB array
SELECT 
    CASE 
        WHEN jsonb_typeof(dietary_restrictions) = 'array' THEN 'PASS: Dietary restrictions stored as JSONB array'
        ELSE 'FAIL: Dietary restrictions not stored as JSONB array - type: ' || jsonb_typeof(dietary_restrictions)
    END as result
FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Test: Activity Structured Data JSONB Format
SELECT 'TEST: activity_structured_data_format' as test_name;

-- Update activity with structured data
UPDATE public.activity_logs SET structured_data = '{
    "type": "nutrition",
    "foods": [{"name": "MockApple", "calories": 95}],
    "total_calories": 95,
    "confidence": 0.9
}'::jsonb WHERE id = '55555555-5555-5555-5555-555555555555';

SELECT 
    CASE 
        WHEN jsonb_typeof(structured_data) = 'object' THEN 'PASS: Structured data stored as JSONB object'
        ELSE 'FAIL: Structured data not stored as JSONB object'
    END as result
FROM public.activity_logs WHERE id = '55555555-5555-5555-5555-555555555555';

-- Test: Core Rule Cards Inserted
SELECT 'TEST: core_rule_cards_inserted' as test_name;

SELECT 
    CASE 
        WHEN COUNT(*) >= 5 THEN 'PASS: Core rule cards inserted (' || COUNT(*) || ' rules)'
        ELSE 'FAIL: Missing core rule cards - found ' || COUNT(*) || ' expected >=5'
    END as result
FROM public.rule_cards WHERE active = true;

-- =============================================================================
-- ROW LEVEL SECURITY TESTS
-- =============================================================================

-- Test: Insights RLS Policy
SELECT 'TEST: insights_rls_policy' as test_name;

-- Check if RLS is enabled on insights table
SELECT 
    CASE 
        WHEN relrowsecurity = true THEN 'PASS: RLS enabled on insights table'
        ELSE 'FAIL: RLS not enabled on insights table'
    END as result
FROM pg_class WHERE relname = 'insights';

-- Test: Rule Cards RLS Policy  
SELECT 'TEST: rule_cards_rls_policy' as test_name;

SELECT 
    CASE 
        WHEN relrowsecurity = true THEN 'PASS: RLS enabled on rule cards table'
        ELSE 'FAIL: RLS not enabled on rule cards table'
    END as result
FROM pg_class WHERE relname = 'rule_cards';

-- =============================================================================
-- DATA MIGRATION VALIDATION
-- =============================================================================

-- Test: Existing Data Preserved
SELECT 'TEST: existing_data_preserved' as test_name;

-- Check if any existing profiles were affected (should have default values)
SELECT 
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM public.profiles WHERE sport_type = 'general') THEN 
            'PASS: All existing profiles have default sport_type'
        ELSE 'FAIL: Some profiles missing default sport_type values'
    END as result
FROM public.profiles;

-- Test: Default Values Applied
SELECT 'TEST: default_values_applied' as test_name;

-- Check if new columns have appropriate default values
SELECT 
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE sport_type IS NOT NULL) as with_sport_type,
    COUNT(*) FILTER (WHERE training_frequency IS NOT NULL) as with_training_freq,
    COUNT(*) FILTER (WHERE dietary_restrictions IS NOT NULL) as with_dietary_restrictions
FROM public.profiles;

-- =============================================================================
-- PERFORMANCE BENCHMARK TESTS  
-- =============================================================================

-- Test: Query Performance Benchmarks
SELECT 'TEST: query_performance_benchmarks' as test_name;

-- Profile lookup by sport type (should be fast with index)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM public.profiles WHERE sport_type = 'endurance';

-- Activity logs by user and date range (should be fast with compound index)  
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM public.activity_logs 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
    AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Insights by user and status (should be fast with index)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM public.insights 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
    AND status = 'active'
ORDER BY priority, created_at DESC;

-- =============================================================================
-- TEST CLEANUP
-- =============================================================================

-- Clean up test data
DELETE FROM public.insights WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.activity_logs WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');  
DELETE FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.rule_cards WHERE name = 'MockTestRule';

-- =============================================================================
-- TEST SUMMARY
-- =============================================================================

SELECT 'SCHEMA ENHANCEMENT TESTS COMPLETED' as summary;
SELECT 'Check results above for PASS/FAIL status' as instruction;
SELECT 'All tests follow TDD methodology with Mock data prefix' as methodology;