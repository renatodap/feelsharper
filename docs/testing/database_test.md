# Database Schema Enhancement - Test Design

## Test Strategy Overview

Following TDD methodology, we will write comprehensive tests BEFORE implementing the database changes. This ensures the schema meets all requirements and maintains data integrity.

## Test Categories

### 1. Schema Creation Tests
Test that all database objects are created correctly with proper structure and constraints.

### 2. Data Integrity Tests
Validate that constraints, foreign keys, and check constraints work as expected.

### 3. Performance Tests
Ensure queries meet performance targets with proper indexing.

### 4. Migration Tests
Verify that existing data is preserved and new features work correctly.

## Detailed Test Cases

### Schema Creation Tests

#### Test: Enhanced Profiles Table Columns
```sql
-- Test Case: profiles_enhanced_columns_exist
-- Description: Verify new columns are added with correct types and defaults
-- Expected: All new columns exist with proper data types

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('sport_type', 'training_frequency', 'dietary_restrictions', 'completion_score');

-- Expected Results:
-- sport_type | character varying | 'general' | YES
-- training_frequency | integer | 3 | YES  
-- dietary_restrictions | jsonb | '[]' | YES
-- completion_score | integer | 0 | YES
```

#### Test: Enhanced Activity Logs Table Columns
```sql
-- Test Case: activity_logs_enhanced_columns_exist
-- Description: Verify new columns for structured data and confidence scoring
-- Expected: All new columns exist with proper constraints

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_logs' 
AND column_name IN ('structured_data', 'confidence_score', 'source');

-- Expected Results:
-- structured_data | jsonb | '{}' | NO
-- confidence_score | double precision | NULL | YES
-- source | character varying | 'manual' | YES
```

#### Test: Insights Table Creation
```sql
-- Test Case: insights_table_structure
-- Description: Verify insights table exists with all required columns
-- Expected: Complete table structure with proper data types

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'insights'
ORDER BY ordinal_position;

-- Expected Results: 10 columns with proper types and defaults
```

#### Test: Rule Cards Table Creation
```sql
-- Test Case: rule_cards_table_structure
-- Description: Verify rule_cards table exists with all required columns
-- Expected: Complete table structure for rule management

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'rule_cards'
ORDER BY ordinal_position;

-- Expected Results: 8 columns with proper types and defaults
```

### Data Integrity Tests

#### Test: Profile Constraints
```sql
-- Test Case: profile_training_frequency_constraint
-- Description: Verify training frequency accepts valid range (0-14)
-- Expected: Valid values accepted, invalid values rejected

-- Valid cases (should succeed)
INSERT INTO profiles (id, training_frequency) VALUES (gen_random_uuid(), 0);
INSERT INTO profiles (id, training_frequency) VALUES (gen_random_uuid(), 7);
INSERT INTO profiles (id, training_frequency) VALUES (gen_random_uuid(), 14);

-- Invalid cases (should fail with constraint violation)
-- INSERT INTO profiles (id, training_frequency) VALUES (gen_random_uuid(), -1);
-- INSERT INTO profiles (id, training_frequency) VALUES (gen_random_uuid(), 15);
```

#### Test: Activity Logs Confidence Score Constraint
```sql
-- Test Case: activity_logs_confidence_constraint
-- Description: Verify confidence score accepts range 0.0-1.0
-- Expected: Valid scores accepted, invalid scores rejected

-- Valid cases (should succeed)
INSERT INTO activity_logs (id, user_id, activity_type, confidence_score) 
VALUES (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'nutrition', 0.0);

INSERT INTO activity_logs (id, user_id, activity_type, confidence_score) 
VALUES (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'exercise', 1.0);

-- Invalid cases (should fail)
-- INSERT INTO activity_logs (id, user_id, activity_type, confidence_score) 
-- VALUES (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'nutrition', -0.1);
```

#### Test: Insights Foreign Key Constraints
```sql
-- Test Case: insights_user_foreign_key
-- Description: Verify insights.user_id references auth.users correctly
-- Expected: Valid user_id accepted, invalid user_id rejected

-- Valid case (should succeed)
INSERT INTO insights (user_id, insight_type, title, content, confidence_score)
VALUES ((SELECT id FROM auth.users LIMIT 1), 'advice', 'Test Insight', 'Test content', 0.8);

-- Invalid case (should fail with foreign key violation)
-- INSERT INTO insights (user_id, insight_type, title, content, confidence_score)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'advice', 'Test', 'Test', 0.8);
```

#### Test: Rule Cards Unique Name Constraint
```sql
-- Test Case: rule_cards_unique_name
-- Description: Verify rule name uniqueness is enforced
-- Expected: Duplicate names rejected

-- First insert (should succeed)
INSERT INTO rule_cards (name, conditions, response_template)
VALUES ('test_rule', '{"test": true}', 'Test response template');

-- Duplicate name (should fail with unique constraint violation)  
-- INSERT INTO rule_cards (name, conditions, response_template)
-- VALUES ('test_rule', '{"other": true}', 'Different template');
```

### Performance Tests

#### Test: Profile Query Performance
```sql
-- Test Case: profile_sport_type_index_performance
-- Description: Verify sport_type queries use index efficiently
-- Expected: Query execution time <50ms with index scan

EXPLAIN ANALYZE SELECT * FROM profiles WHERE sport_type = 'endurance';

-- Expected: Index scan on idx_profiles_sport_type
-- Expected: Execution time <50ms
```

#### Test: Activity Logs Query Performance  
```sql
-- Test Case: activity_logs_user_date_performance
-- Description: Verify user activity queries are optimized
-- Expected: Query execution time <100ms with compound index

EXPLAIN ANALYZE 
SELECT * FROM activity_logs 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Expected: Index scan on idx_activity_logs_user_created
-- Expected: Execution time <100ms
```

#### Test: Insights Generation Query Performance
```sql
-- Test Case: insights_user_active_performance
-- Description: Verify insight retrieval is optimized
-- Expected: Query execution time <100ms

EXPLAIN ANALYZE
SELECT * FROM insights 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
AND status = 'active'
ORDER BY priority, created_at DESC;

-- Expected: Index scan on idx_insights_user_status  
-- Expected: Execution time <100ms
```

### Migration Tests

#### Test: Existing Data Preservation
```sql
-- Test Case: existing_profiles_preserved
-- Description: Verify existing profile data is not affected
-- Expected: All existing profiles remain accessible with default values

-- Count profiles before migration
-- SELECT COUNT(*) as before_count FROM profiles;

-- After migration, verify same count with new defaults
SELECT 
  COUNT(*) as after_count,
  COUNT(*) FILTER (WHERE sport_type = 'general') as default_sport_type,
  COUNT(*) FILTER (WHERE training_frequency = 3) as default_frequency,
  COUNT(*) FILTER (WHERE completion_score = 0) as default_completion
FROM profiles;

-- Expected: same count, all have default values for new columns
```

#### Test: Existing Activity Logs Preserved
```sql
-- Test Case: existing_activity_logs_preserved  
-- Description: Verify existing activity logs remain intact
-- Expected: All activity logs accessible with new default values

SELECT 
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE structured_data = '{}') as default_structured,
  COUNT(*) FILTER (WHERE source = 'manual') as default_source
FROM activity_logs;

-- Expected: All existing logs have default values for new columns
```

### JSONB Schema Validation Tests

#### Test: Dietary Restrictions JSONB Format
```sql
-- Test Case: dietary_restrictions_valid_json
-- Description: Verify dietary restrictions accept valid JSON arrays
-- Expected: Valid JSON arrays accepted, invalid JSON rejected

-- Valid cases
UPDATE profiles SET dietary_restrictions = '["vegetarian", "gluten-free"]'::jsonb
WHERE id = (SELECT id FROM profiles LIMIT 1);

UPDATE profiles SET dietary_restrictions = '[]'::jsonb
WHERE id = (SELECT id FROM profiles LIMIT 1);

-- Test JSON array validation
SELECT jsonb_typeof(dietary_restrictions) as type
FROM profiles 
WHERE dietary_restrictions IS NOT NULL;
-- Expected: All return 'array'
```

#### Test: Structured Data JSONB Format
```sql
-- Test Case: structured_data_valid_format
-- Description: Verify activity structured_data accepts valid parsing results
-- Expected: Valid activity parsing JSON accepted

-- Valid nutrition parsing result
UPDATE activity_logs SET structured_data = '{
  "type": "nutrition",
  "foods": [{"name": "apple", "calories": 95}],
  "total_calories": 95,
  "confidence": 0.9
}'::jsonb WHERE id = (SELECT id FROM activity_logs LIMIT 1);

-- Valid exercise parsing result  
UPDATE activity_logs SET structured_data = '{
  "type": "exercise", 
  "activity": "running",
  "duration": 30,
  "intensity": "moderate"
}'::jsonb WHERE id = (SELECT id FROM activity_logs LIMIT 1);
```

## Mock Data Setup

### Test User Creation
```sql
-- Create test users for schema validation
INSERT INTO auth.users (id, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'test1@example.com'),
('22222222-2222-2222-2222-222222222222', 'test2@example.com');
```

### Sample Test Data
```sql
-- Sample profiles with new fields
INSERT INTO profiles (id, user_id, sport_type, training_frequency, dietary_restrictions, completion_score) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'endurance', 5, '["vegetarian"]'::jsonb, 75),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'strength', 4, '[]'::jsonb, 90);

-- Sample activity logs with structured data
INSERT INTO activity_logs (id, user_id, activity_type, structured_data, confidence_score, source) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'nutrition', 
 '{"foods": [{"name": "apple", "calories": 95}]}'::jsonb, 0.85, 'manual'),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'exercise',
 '{"activity": "bench_press", "sets": 3, "reps": 8}'::jsonb, 0.92, 'manual');

-- Sample insights
INSERT INTO insights (user_id, insight_type, title, content, confidence_score, related_logs) VALUES
('11111111-1111-1111-1111-111111111111', 'advice', 'Increase Protein', 
 'Based on your training, consider adding more protein to support recovery', 0.8, 
 ARRAY['55555555-5555-5555-5555-555555555555']::uuid[]);

-- Sample rule cards
INSERT INTO rule_cards (name, description, conditions, response_template, priority) VALUES
('pre_workout_fuel', 'Advise on pre-workout nutrition timing',
 '{"has_upcoming_workout": true, "time_until_workout": {"max": 4, "unit": "hours"}}'::jsonb,
 'Fuel up 1-3h before training: moderate carbs + lean protein, low fat/fiber', 2);
```

## Test Execution Strategy

### Phase 1: Schema Structure Tests
1. Run all schema creation tests
2. Verify table structures match design
3. Confirm constraint creation
4. Validate index creation

### Phase 2: Data Integrity Tests  
1. Test constraint enforcement
2. Validate foreign key relationships
3. Test JSONB schema validation
4. Verify unique constraints

### Phase 3: Performance Tests
1. Load test data (1000+ records per table)
2. Execute query performance tests
3. Verify index usage with EXPLAIN ANALYZE
4. Benchmark against targets

### Phase 4: Migration Tests
1. Test on copy of existing data
2. Verify data preservation
3. Test rollback procedures
4. Validate API compatibility

## Coverage Targets

### Test Coverage Requirements
- **Schema Creation**: 100% coverage of all DDL statements
- **Constraints**: 100% coverage of all constraint types
- **Performance**: 100% coverage of critical query paths
- **Migration**: 100% coverage of data preservation scenarios

### Success Criteria
- [ ] All schema creation tests pass
- [ ] All data integrity tests pass  
- [ ] All performance tests meet targets (<50ms profiles, <100ms activities)
- [ ] All migration tests preserve existing data
- [ ] Zero test failures in comprehensive suite
- [ ] Test coverage ≥80% of all database functionality

## Test Tools and Framework

### Database Testing Tools
- PostgreSQL native testing with SQL scripts
- Performance testing with EXPLAIN ANALYZE
- Data integrity validation with constraint tests
- Migration testing with before/after comparisons

### Automated Test Execution
```bash
# Execute all database tests
psql -d feelsharper_test -f tests/database/schema_creation_tests.sql
psql -d feelsharper_test -f tests/database/data_integrity_tests.sql
psql -d feelsharper_test -f tests/database/performance_tests.sql
psql -d feelsharper_test -f tests/database/migration_tests.sql
```

### Test Data Cleanup
```sql
-- Cleanup test data after test execution
DELETE FROM insights WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM activity_logs WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM rule_cards WHERE name LIKE 'test_%';
```

## Risk Mitigation

### Test Environment Isolation
- Use dedicated test database
- Never run destructive tests on production
- Maintain test data separation

### Rollback Testing
- Test all rollback procedures
- Verify data integrity after rollback
- Validate system functionality post-rollback

### Performance Regression Testing
- Benchmark existing queries before changes
- Compare performance after migration
- Alert on significant performance degradation