# 🚨 CRITICAL SECURITY ISSUE - DATABASE RLS NOT ENABLED

**Issue ID**: SEC-001
**Severity**: CRITICAL
**Status**: AWAITING USER ACTION
**Discovered**: 2025-08-29
**Branch**: launch-mvp-hardening

## Problem
Row Level Security (RLS) is NOT enabled on critical tables, exposing ALL user data:
- `activity_logs` - ALL user activities visible to anyone
- `body_measurements` - Personal body data exposed
- `custom_foods` - User food data exposed

## Security Test Results
```
❌ activity_logs - Data accessible without auth!
❌ body_measurements - Data accessible without auth!
❌ custom_foods - Data accessible without auth!
✅ insights - Table doesn't exist yet (will be secured)
✅ user_preferences - Table doesn't exist yet (will be secured)
```

## Fix Prepared
Migration files created and ready:
- `supabase/migrations/20250829_enable_rls.sql` - Enables RLS on all tables
- `supabase/migrations/20250829_mvp_tables.sql` - Creates new tables with RLS

## ACTION REQUIRED FROM USER
You need to apply the migrations to your Supabase database:

### Option 1: Supabase CLI
```bash
npx supabase link --project-ref uayxgxeueyjiokhvmjwd
# Enter your database password when prompted
npx supabase db push
```

### Option 2: Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql/new
2. Copy contents of `supabase/migrations/20250829_enable_rls.sql`
3. Click "Run"

## Verification
After applying, run:
```bash
node test-rls-security.mjs
```

All tests should show "✅ RLS Working"

## Impact if Not Fixed
- ANY user can read ALL users' data
- Complete privacy violation
- GDPR/CCPA non-compliance
- Cannot launch to production

## Files Created
- `/supabase/migrations/20250829_enable_rls.sql` - RLS enablement
- `/supabase/migrations/20250829_mvp_tables.sql` - New tables with RLS
- `/test-rls-security.mjs` - Security verification script
- `/URGENT_SECURITY_FIX.md` - User instructions