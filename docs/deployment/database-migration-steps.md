# Database Migration Steps - MVP Schema Enhancement

## Overview
This document provides step-by-step instructions for applying the MVP schema enhancement migration following TDD methodology.

## Prerequisites
- Access to Supabase dashboard or database management tool
- Service role key configured
- Current database schema backed up
- Migration validated (✅ validation passed)

## Migration Files
- **Migration SQL**: `supabase/migrations/20240904_mvp_schema_enhancement.sql`
- **Test SQL**: `tests/database/schema_enhancement_test.sql`
- **Validation Script**: `scripts/validate-migration.js`

## Step-by-Step Application

### Step 1: Pre-Migration Backup
```sql
-- Create backup of existing data
CREATE SCHEMA backup_20240904;

-- Backup existing profiles table
CREATE TABLE backup_20240904.profiles AS SELECT * FROM public.profiles;

-- Backup existing activity_logs table  
CREATE TABLE backup_20240904.activity_logs AS SELECT * FROM public.activity_logs;
```

### Step 2: Apply Migration
Execute the entire contents of `supabase/migrations/20240904_mvp_schema_enhancement.sql` in your database management tool.

**Key changes applied:**
- Enhanced profiles table with sport_type, training_frequency, dietary_restrictions, completion_score
- Enhanced activity_logs table with structured_data, confidence_score, source
- New insights table for AI-generated recommendations
- New rule_cards table for configurable coaching logic
- Performance indexes for all new fields
- Row Level Security (RLS) policies
- Core rule cards data
- Automatic triggers for profile completion scoring

### Step 3: Verify Migration Success
Run these verification queries:

```sql
-- Check enhanced profiles columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('sport_type', 'training_frequency', 'dietary_restrictions', 'completion_score');

-- Check enhanced activity logs columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'activity_logs' 
AND column_name IN ('structured_data', 'confidence_score', 'source');

-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('insights', 'rule_cards');

-- Check core rule cards inserted
SELECT COUNT(*) as rule_count FROM public.rule_cards WHERE active = true;
-- Expected: 5 or more rule cards
```

### Step 4: Run Database Tests
Execute the test file `tests/database/schema_enhancement_test.sql` to validate all functionality.

**Test coverage includes:**
- Schema structure validation
- Constraint enforcement
- Index performance
- Data integrity
- JSONB format validation
- RLS policy verification
- Mock data testing with proper cleanup

### Step 5: Validate API Integration
After migration, test these API endpoints:

```bash
# Test enhanced parsing endpoint
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "ran 5k this morning, feeling good"}'

# Test profile endpoints (when implemented)
curl -X GET http://localhost:3000/api/user/profile

# Test insights endpoints (when implemented)  
curl -X GET http://localhost:3000/api/insights/daily
```

## Rollback Procedure (If Needed)

If issues occur, rollback using:

```sql
-- Remove new tables
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.rule_cards CASCADE;

-- Remove new columns from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS sport_type,
DROP COLUMN IF EXISTS training_frequency, 
DROP COLUMN IF EXISTS dietary_restrictions,
DROP COLUMN IF EXISTS completion_score;

-- Remove new columns from activity_logs
ALTER TABLE public.activity_logs
DROP COLUMN IF EXISTS structured_data,
DROP COLUMN IF EXISTS confidence_score,
DROP COLUMN IF EXISTS source;

-- Restore from backup if needed
-- INSERT INTO public.profiles SELECT * FROM backup_20240904.profiles;
-- INSERT INTO public.activity_logs SELECT * FROM backup_20240904.activity_logs;
```

## Performance Expectations

After migration, expect these performance improvements:
- Profile queries by sport_type: <50ms
- Activity logs by user/date: <100ms  
- Insight queries: <100ms
- Rule matching: <100ms

## Security Considerations

The migration includes:
- Row Level Security (RLS) enabled on new tables
- User-specific access policies for insights
- Read-only access for rule cards
- Proper foreign key constraints
- Check constraints for data validation

## Monitoring

Monitor these metrics post-migration:
- Query performance (should meet targets above)
- API response times (parsing should remain <500ms)
- Error rates (should be 0% for schema operations)
- Database connection counts (should not increase significantly)

## Success Criteria

Migration is successful when:
- [ ] All schema changes applied without errors
- [ ] All test cases pass
- [ ] API endpoints return expected data structure  
- [ ] Performance targets met
- [ ] No existing functionality broken
- [ ] RLS policies working correctly

## Next Steps After Migration

1. **Update TypeScript Types**: Regenerate database types to include new fields
2. **Update API Endpoints**: Modify existing endpoints to use new schema
3. **Test Frontend Integration**: Ensure UI components work with new data structure
4. **Deploy to Production**: Apply same migration to production database
5. **Monitor Performance**: Track query performance and optimize if needed

## TDD Methodology Compliance ✅

This migration follows TDD methodology:
- ✅ **Feature Design**: docs/design/database_schema.md
- ✅ **Test Design**: docs/testing/database_test.md  
- ✅ **Code Design**: Migration SQL files
- ✅ **Test Implementation**: Comprehensive test suite
- ✅ **Implementation**: Migration ready for application
- ⏳ **Validation**: ≥80% coverage (to be verified post-migration)

## Support

If issues arise during migration:
1. Check the backup tables in `backup_20240904` schema
2. Review error logs for constraint violations
3. Use rollback procedure if critical issues occur
4. Validate each step individually rather than running entire migration at once