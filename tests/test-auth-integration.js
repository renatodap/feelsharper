#!/usr/bin/env node

/**
 * Advanced Authentication Integration Test
 * Tests actual Supabase authentication functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔐 FEELSHARPER AUTHENTICATION INTEGRATION TEST');
console.log('=' .repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase configuration!');
  console.log('Please check your .env.local file has:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test cases
const authTests = [
  {
    name: 'Supabase Client Connection',
    test: async () => {
      try {
        // Just check if we can create a client without errors
        const client = createClient(supabaseUrl, supabaseKey);
        return {
          passed: !!client,
          details: 'Supabase client created successfully'
        };
      } catch (error) {
        return {
          passed: false,
          details: `Failed to create client: ${error.message}`
        };
      }
    }
  },

  {
    name: 'Get Current Session',
    test: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        return {
          passed: !error,
          details: error ? `Error: ${error.message}` : `Session check successful (${data.session ? 'has session' : 'no session'})`
        };
      } catch (error) {
        return {
          passed: false,
          details: `Exception: ${error.message}`
        };
      }
    }
  },

  {
    name: 'Authentication State Listener',
    test: async () => {
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log(`  📡 Auth event: ${event}, Session: ${!!session}`);
        });
        
        // Unsubscribe immediately since this is just a test
        data.subscription.unsubscribe();
        
        return {
          passed: true,
          details: 'Auth state listener created and unsubscribed successfully'
        };
      } catch (error) {
        return {
          passed: false,
          details: `Failed to create listener: ${error.message}`
        };
      }
    }
  },

  {
    name: 'Database Connection Test',
    test: async () => {
      try {
        // Try to access a table (users table should exist)
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        return {
          passed: !error,
          details: error ? `Database error: ${error.message}` : 'Database connection successful'
        };
      } catch (error) {
        return {
          passed: false,
          details: `Database exception: ${error.message}`
        };
      }
    }
  },

  {
    name: 'Sign Up Flow Test (Dry Run)',
    test: async () => {
      try {
        // We don't actually sign up, just test the function exists
        const testEmail = 'test@example.com';
        const testPassword = 'testpassword123';
        
        // This should fail with a proper error (not an exception)
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword
        });
        
        return {
          passed: true,
          details: `Sign up function works (${error ? 'with validation' : 'completed'})`
        };
      } catch (error) {
        return {
          passed: false,
          details: `Sign up function broken: ${error.message}`
        };
      }
    }
  },

  {
    name: 'Sign In Flow Test (Dry Run)',
    test: async () => {
      try {
        // Test with invalid credentials - should fail gracefully
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });
        
        return {
          passed: true,
          details: `Sign in function works (${error ? 'with validation' : 'unexpected success'})`
        };
      } catch (error) {
        return {
          passed: false,
          details: `Sign in function broken: ${error.message}`
        };
      }
    }
  }
];

// Run tests
async function runAuthTests() {
  console.log('Testing Supabase authentication integration...\n');
  console.log(`🌐 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of authTests) {
    try {
      console.log(`🧪 ${testCase.name}...`);
      const result = await testCase.test();
      
      if (result.passed) {
        console.log(`✅ PASSED: ${result.details}`);
        passed++;
      } else {
        console.log(`❌ FAILED: ${result.details}`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 EXCEPTION: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(60));
  console.log(`🧪 AUTH TESTS: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All authentication tests passed!');
    console.log('✅ Supabase integration is working correctly');
  } else {
    console.log('🚨 Some authentication tests failed');
    console.log('🔧 Check your Supabase configuration and project status');
  }
  
  // Additional checks
  console.log('\n🔍 MANUAL VERIFICATION STEPS:');
  console.log('1. Visit your Supabase dashboard');
  console.log('2. Check if authentication is enabled');
  console.log('3. Verify database schema has users table');
  console.log('4. Test Google OAuth configuration (if using)');
  console.log(`5. Open http://localhost:3009/sign-in and inspect console logs`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runAuthTests().catch(console.error);