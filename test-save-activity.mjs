#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uayxgxeueyjiokhvmjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSaveActivity() {
  console.log('🧪 Testing Activity Save to Supabase');
  console.log('=====================================\n');
  
  // First, we need to sign up/sign in to get a user
  console.log('1️⃣ Creating test user...');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (authError) {
    console.log('❌ Failed to create user:', authError.message);
    return;
  }
  
  const userId = authData.user?.id;
  console.log('✅ Test user created:', testEmail);
  console.log('   User ID:', userId);
  
  // Now test saving an activity
  console.log('\n2️⃣ Testing activity save...');
  const testActivity = {
    user_id: userId,
    activity_type: 'cardio',
    original_text: 'ran 5k in 25 minutes',
    confidence_level: 95,
    subjective_notes: 'felt good',
    source: 'test',
    structured_data: {
      exercise: 'running',
      distance: 5,
      unit: 'km',
      duration: 25,
      duration_unit: 'minutes'
    },
    activity_timestamp: new Date().toISOString()
  };
  
  const { data: savedActivity, error: saveError } = await supabase
    .from('activity_logs')
    .insert(testActivity)
    .select()
    .single();
  
  if (saveError) {
    console.log('❌ Failed to save activity:', saveError.message);
    console.log('   Error details:', saveError);
  } else {
    console.log('✅ Activity saved successfully!');
    console.log('   Activity ID:', savedActivity.id);
    console.log('   Saved data:', JSON.stringify(savedActivity, null, 2));
  }
  
  // Test reading it back
  console.log('\n3️⃣ Verifying saved activity...');
  const { data: retrieved, error: readError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (readError) {
    console.log('❌ Failed to read activity:', readError.message);
  } else {
    console.log('✅ Activity retrieved successfully');
    console.log('   Type:', retrieved.activity_type);
    console.log('   Text:', retrieved.original_text);
    console.log('   Confidence:', retrieved.confidence_level);
  }
  
  // Check what columns the table actually has
  console.log('\n4️⃣ Checking table schema...');
  const { data: schemaCheck, error: schemaError } = await supabase
    .from('activity_logs')
    .select('*')
    .limit(0);
  
  if (!schemaError && schemaCheck !== null) {
    console.log('✅ Table columns available');
    // The columns are in the query response metadata
  }
  
  console.log('\n=====================================');
  console.log('📊 RESULTS:');
  console.log('=====================================');
  
  if (savedActivity) {
    console.log('✅ Phase 3 database integration IS WORKING!');
    console.log('   Data is being saved to Supabase correctly.');
  } else {
    console.log('❌ Database save failed - check error messages above');
  }
}

testSaveActivity().catch(console.error);