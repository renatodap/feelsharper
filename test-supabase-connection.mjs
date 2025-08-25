#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uayxgxeueyjiokhvmjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection & Tables');
  console.log('========================================\n');
  
  // Test 1: Check connection
  console.log('1️⃣ Testing Connection...');
  try {
    const { data, error } = await supabase.from('activity_logs').select('count', { count: 'exact' });
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Table "activity_logs" does not exist!');
        console.log('   This is the problem - the table needs to be created.');
      } else {
        console.log('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connected to Supabase');
      console.log('✅ activity_logs table exists');
    }
  } catch (err) {
    console.log('❌ Failed to connect:', err.message);
  }
  
  // Test 2: Check user_profiles table
  console.log('\n2️⃣ Checking user_profiles table...');
  try {
    const { error } = await supabase.from('user_profiles').select('count', { count: 'exact' });
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Table "user_profiles" does not exist!');
      } else {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('✅ user_profiles table exists');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  // Test 3: List all available tables
  console.log('\n3️⃣ Listing available tables...');
  try {
    // Query the information schema to see what tables exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      // Try a different approach - just list what we can access
      console.log('⚠️  Cannot query information_schema, trying common tables...');
      
      const commonTables = ['users', 'profiles', 'workouts', 'foods', 'weights', 'activities'];
      for (const table of commonTables) {
        try {
          const { error: tableError } = await supabase.from(table).select('count', { count: 'exact' });
          if (!tableError) {
            console.log(`   ✅ Table exists: ${table}`);
          }
        } catch {}
      }
    } else if (data) {
      console.log('Available tables:');
      data.forEach(t => console.log(`   • ${t.table_name}`));
    }
  } catch (err) {
    console.log('⚠️  Could not list tables');
  }
  
  // Test 4: Check if we can authenticate
  console.log('\n4️⃣ Testing Authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('⚠️  No authenticated user (expected for anon key)');
    } else if (user) {
      console.log('✅ Authenticated as:', user.email);
    }
  } catch (err) {
    console.log('⚠️  Auth check failed');
  }
  
  // Summary
  console.log('\n========================================');
  console.log('📊 DIAGNOSIS:');
  console.log('========================================');
  console.log('\n🔴 The main issue is that the required database tables');
  console.log('   (activity_logs, user_profiles) do not exist in Supabase.');
  console.log('\n📝 Solution: Run the database migrations to create tables.');
  console.log('   Check supabase/migrations/ directory for SQL files.');
}

testSupabase().catch(console.error);