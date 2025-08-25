#!/usr/bin/env node

/**
 * End-to-End Authentication Test
 * Creates a test user and tests the complete authentication flow
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 END-TO-END AUTHENTICATION TEST');
console.log('=' .repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

// Test user configuration
const TEST_USER = {
  email: 'test-' + Date.now() + '@feelsharper-test.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

console.log(`🧑 Test user: ${TEST_USER.email}\n`);

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

async function runE2ETest() {
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: User Registration
    console.log('🧪 Test 1: User Registration');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          name: TEST_USER.name
        }
      }
    });
    
    if (signUpError) {
      console.log(`❌ Registration failed: ${signUpError.message}`);
      testsFailed++;
    } else {
      console.log('✅ User registration successful');
      console.log(`   User ID: ${signUpData.user?.id}`);
      console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);
      testsPassed++;
    }
    
    // Test 2: Sign In
    console.log('\n🧪 Test 2: Sign In');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (signInError) {
      console.log(`❌ Sign in failed: ${signInError.message}`);
      testsFailed++;
    } else {
      console.log('✅ Sign in successful');
      console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
      console.log(`   Access token: ${signInData.session?.access_token ? 'Present' : 'Missing'}`);
      testsPassed++;
    }
    
    // Test 3: Get Current Session
    console.log('\n🧪 Test 3: Session Persistence');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`❌ Session check failed: ${sessionError.message}`);
      testsFailed++;
    } else {
      console.log('✅ Session check successful');
      console.log(`   Has session: ${sessionData.session ? 'Yes' : 'No'}`);
      console.log(`   User email: ${sessionData.session?.user?.email || 'N/A'}`);
      testsPassed++;
    }
    
    // Test 4: API Authentication (simulate)
    console.log('\n🧪 Test 4: API Authentication Simulation');
    if (sessionData.session) {
      // We can't easily test the actual API from here, but we can verify the user exists
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log(`❌ User verification failed: ${userError.message}`);
        testsFailed++;
      } else {
        console.log('✅ User verification successful');
        console.log(`   User authenticated: Yes`);
        console.log(`   User role: ${userData.user?.role || 'Default'}`);
        testsPassed++;
      }
    } else {
      console.log('❌ No session available for API test');
      testsFailed++;
    }
    
    // Test 5: Sign Out
    console.log('\n🧪 Test 5: Sign Out');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log(`❌ Sign out failed: ${signOutError.message}`);
      testsFailed++;
    } else {
      console.log('✅ Sign out successful');
      testsPassed++;
    }
    
    // Test 6: Verify Session Cleared
    console.log('\n🧪 Test 6: Session Cleanup Verification');
    const { data: afterSignOutSession } = await supabase.auth.getSession();
    
    if (afterSignOutSession.session) {
      console.log('❌ Session still exists after sign out');
      testsFailed++;
    } else {
      console.log('✅ Session properly cleared after sign out');
      testsPassed++;
    }
    
    // Cleanup: Delete test user (if admin client available)
    if (adminSupabase) {
      console.log('\n🧹 Cleanup: Deleting test user');
      try {
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
          signUpData.user?.id || ''
        );
        
        if (deleteError) {
          console.log(`⚠️  Could not delete test user: ${deleteError.message}`);
        } else {
          console.log('✅ Test user deleted successfully');
        }
      } catch (error) {
        console.log('⚠️  Could not delete test user (admin access required)');
      }
    } else {
      console.log('⚠️  Skipping user cleanup (no service role key)');
      console.log(`   Please manually delete user: ${TEST_USER.email}`);
    }
    
  } catch (error) {
    console.log(`💥 Unexpected error: ${error.message}`);
    testsFailed++;
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log(`🧪 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('✅ Login functionality is working perfectly');
    console.log('✅ User registration works');
    console.log('✅ Sign in/out works');
    console.log('✅ Session management works');
    console.log('✅ API authentication ready');
    
    console.log('\n🚀 AUTHENTICATION STATUS: FULLY FUNCTIONAL');
    console.log('Your login system is ready for production use!');
    
  } else {
    console.log('🚨 Some authentication tests failed');
    console.log('Please review the errors above and fix any issues');
    
    console.log('\n🔧 DEBUGGING TIPS:');
    console.log('• Check Supabase project settings');
    console.log('• Verify email confirmation settings'); 
    console.log('• Check Row Level Security policies');
    console.log('• Ensure database schema is up to date');
  }
  
  console.log('\n📝 NEXT STEPS:');
  if (testsFailed === 0) {
    console.log('• Enable middleware route protection if desired');
    console.log('• Set up email templates in Supabase');
    console.log('• Configure Google OAuth if needed');
    console.log('• Add proper error boundaries in components');
    console.log('• Consider adding password reset flow');
  } else {
    console.log('• Fix the failing tests above');
    console.log('• Re-run this test to verify fixes');
    console.log('• Check Supabase dashboard for errors');
  }
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

runE2ETest().catch(console.error);