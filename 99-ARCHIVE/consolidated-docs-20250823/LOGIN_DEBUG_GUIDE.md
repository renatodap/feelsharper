# 🔐 FeelSharper Login Debug Guide

## ✅ CHANGES IMPLEMENTED (Ready for Testing)

### Fixed Issues:
1. **✅ Database Table References** - Updated all `user_profiles` → `profiles`
2. **✅ Removed Dynamic Imports** - Sign-in now uses direct imports for better reliability
3. **✅ Added Debug Logging** - Comprehensive console logs for auth flow tracking
4. **✅ Created Test Scripts** - Direct Supabase connection and login testing

### Files Modified:
- `app/api/ai/parse-workout/route.ts` - Updated table reference
- `lib/ai/core/AIOrchestrator.ts` - Fixed all profile queries  
- `lib/ai/coach/EnhancedSmartCoach.ts` - Updated table reference
- `app/api/coach/route.ts` - Fixed profile query
- `app/(auth)/sign-in/page.tsx` - Removed dynamic import + added debug logs
- `components/auth/AuthProvider.tsx` - Added comprehensive debug logging

### New Test Files:
- `test-login.mjs` - Complete login flow testing
- `test-supabase-connection.mjs` - Database connectivity testing (already existed)

---

## 🚀 IMMEDIATE ACTIONS NEEDED FROM YOU

### Step 1: Test Database Connectivity
```bash
node test-supabase-connection.mjs
```
**Expected**: Should show all tables exist and no errors

### Step 2: Test Direct Login
```bash
node test-login.mjs
```
**Expected**: Should successfully sign up → sign in → access profile → sign out

### Step 3: Test Web Interface
```bash
npm run dev
```
1. Go to `http://localhost:3000/sign-in`
2. Open browser DevTools → Console tab
3. Try signing in with test credentials
4. **Watch the console logs** - you'll see detailed debug info like:
   ```
   🔐 Attempting sign in with: { email: "test@example.com", hasPassword: true }
   🔧 Environment check: { hasSupabaseUrl: true, hasAnonKey: true }
   🔐 Sign in result: { success: true, hasUser: true, hasSession: true }
   ✅ Sign in successful, redirecting to: /today
   ```

### Step 4: Check Specific Errors
If login fails, look for these console messages:
- **🔴 Sign in error:** - Shows the exact Supabase auth error
- **🔄 AuthProvider:** - Shows auth state changes and session handling
- Any network errors in the Network tab

### Step 5: Verify Profile Creation
After successful login, the test script will try to create a profile if none exists. This should fix any remaining profile-related issues.

### Step 6: Report Results
After testing, report back:
- What errors you see (copy exact error messages)
- Which step failed (database test, direct login, web interface)
- Screenshots of browser console if web interface fails

---

## 🧹 CLEANUP (Do This After Login Works)

Once login is working properly, you can remove the debug logs:

### Remove Debug Logs From:
1. `app/(auth)/sign-in/page.tsx` - Remove all `console.log` statements
2. `components/auth/AuthProvider.tsx` - Remove all `console.log` statements

### Keep These Files:
- `test-login.mjs` - Useful for future testing
- `test-supabase-connection.mjs` - Useful for database debugging

---

## 📋 Quick Checklist - Test These First

1. **Environment Variables** ✅
   - [x] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
   - [x] `SUPABASE_SERVICE_ROLE_KEY` is set for server operations

2. **Database Tables** ⚠️ ISSUE FOUND
   - [x] `activity_logs` table exists
   - [ ] ❌ `user_profiles` table MISSING
   - [x] `users` table exists
   - [x] `profiles` table exists (might be the correct one instead of user_profiles)
   - [x] `workouts` table exists
   - [x] `foods` table exists

3. **Authentication Flow**
   - [ ] Test email/password sign-in
   - [ ] Test Google OAuth sign-in
   - [ ] Test sign-up flow
   - [ ] Test password reset flow

## ✅ ISSUES FIXED

### ~~Issue 1: Missing Database Table~~ **FIXED**
**Problem**: The code referenced `user_profiles` table but it doesn't exist. Instead, there's a `profiles` table.
**Solution**: ✅ **Updated all code to use `profiles` table**

### ~~Issue 2: Dynamic Import in Auth~~ **FIXED** 
**Problem**: Sign-in page used dynamic imports which could cause build/runtime issues
**Solution**: ✅ **Replaced with direct import and added debug logging**

### Issue 2: Middleware Cookie Handling
**Location**: `middleware.ts`
**Problem**: Complex cookie handling that might not properly persist auth state

### Issue 3: Multiple Auth Entry Points
**Problem**: Inconsistent auth implementations across different files:
- `/app/(auth)/sign-in/page.tsx` - Uses dynamic import
- `/components/auth/AuthProvider.tsx` - Main auth context
- `/components/auth/GoogleAuthButton.tsx` - OAuth flow
- `/app/auth/callback/route.ts` - Callback handler

## 📝 Step-by-Step Login Testing

### Test 1: Basic Email/Password Login
```bash
# 1. Start the dev server
npm run dev

# 2. Navigate to http://localhost:3000/sign-in

# 3. Try to sign in with test credentials
# Email: test@example.com
# Password: testpassword123

# 4. Check browser console for errors
# 5. Check Network tab for failed requests
```

### Test 2: Google OAuth Login
```bash
# 1. Click "Sign in with Google" button
# 2. Check if redirect URL is correct
# 3. After Google auth, check if callback works
# 4. Verify redirect to /today page
```

### Test 3: Direct Supabase Test
Create a file `test-login.mjs`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uayxgxeueyjiokhvmjwd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs'
);

// Test sign up
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
});
console.log('Sign Up:', signUpData, signUpError);

// Test sign in
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'testpassword123'
});
console.log('Sign In:', signInData, signInError);
```

Run: `node test-login.mjs`

## 🛠️ Potential Fixes

### Fix 1: Update Database References
Search and replace all instances of `user_profiles` with `profiles`:
```bash
# Find all occurrences
grep -r "user_profiles" --include="*.ts" --include="*.tsx"

# Files that need updating:
# - Update any API routes that query user_profiles
# - Update type definitions in /lib/types/database.ts
```

### Fix 2: Simplify Auth Flow
1. Remove dynamic imports in sign-in page
2. Use consistent Supabase client creation
3. Ensure middleware properly handles cookies

### Fix 3: Add Auth Debug Logging
Add to `/app/(auth)/sign-in/page.tsx`:
```typescript
console.log('Environment vars:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});
```

### Fix 4: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Check Authentication > Users
4. Verify email confirmations are disabled for testing
5. Check if any users exist
6. Review auth policies

## 🔍 Browser Debugging

### Check These in DevTools:

1. **Console Errors**:
   - Look for CORS errors
   - Check for undefined environment variables
   - Look for network failures

2. **Network Tab**:
   - Filter by "auth" or "supabase"
   - Check status codes (401, 403, 500)
   - Inspect request/response headers
   - Look for failed preflight requests

3. **Application Tab**:
   - Check cookies for auth tokens
   - Look for localStorage items with "supabase" prefix
   - Verify session storage

4. **Sources Tab**:
   - Set breakpoints in AuthProvider.tsx
   - Step through signIn function
   - Check what errors are caught

## 📊 Common Error Messages & Solutions

| Error Message | Likely Cause | Solution |
|--------------|-------------|----------|
| "Invalid login credentials" | Wrong email/password | Check user exists in Supabase |
| "Email not confirmed" | Email verification required | Disable in Supabase settings |
| "relation does not exist" | Missing database table | Run migrations or create table |
| "Failed to fetch" | CORS or network issue | Check Supabase URL and CORS settings |
| "JWT expired" | Old session token | Clear cookies and localStorage |
| "User not found" | User doesn't exist | Sign up first or check database |

## 🚀 Quick Fix Commands

```bash
# Clear all auth data (run in browser console)
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

# Test Supabase connection
node test-supabase-connection.mjs

# Check TypeScript errors
npm run typecheck

# Restart dev server with clean cache
rm -rf .next && npm run dev
```

## 📱 Test on Different Scenarios

1. **Incognito Mode**: Test in private browsing
2. **Different Browser**: Try Chrome, Firefox, Safari
3. **Mobile View**: Test responsive login
4. **Slow Network**: Throttle to 3G in DevTools
5. **Ad Blockers**: Disable extensions

## 🎯 Most Likely Issues (Based on Code Analysis)

1. **Database Schema Mismatch** (90% probability)
   - Code expects `user_profiles` but DB has `profiles`
   
2. **Cookie/Session Persistence** (70% probability)
   - Middleware might not properly set cookies
   - AuthProvider might not maintain session

3. **Environment Variable Issues** (50% probability)
   - Missing or incorrect values
   - Not loaded properly in production

4. **OAuth Callback Issues** (40% probability)
   - Redirect URLs not matching
   - Callback route not handling errors

## 📞 Emergency Fixes

If nothing else works:

1. **Reset Supabase Project**:
   - Export any important data
   - Reset database
   - Re-run initial setup

2. **Use Supabase CLI**:
   ```bash
   npx supabase init
   npx supabase link --project-ref uayxgxeueyjiokhvmjwd
   npx supabase db reset
   ```

3. **Minimal Test**:
   - Create a simple test page
   - Use only Supabase client directly
   - Bypass all middleware and providers

---

## Next Steps:
1. Run `node test-supabase-connection.mjs` to confirm database issues
2. Check browser console when attempting login
3. Fix the `user_profiles` → `profiles` mismatch
4. Test with the direct Supabase test script above
5. Report specific error messages for targeted fixes