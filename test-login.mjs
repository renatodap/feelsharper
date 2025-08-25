#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uayxgxeueyjiokhvmjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing Login Functionality');
  console.log('==============================\n');
  
  const testEmail = 'test@feelsharper.com';
  const testPassword = 'TestPassword123!';
  
  // Test 1: Sign Up
  console.log('1️⃣ Testing Sign Up...');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already been registered')) {
        console.log('✅ User already exists - that\'s expected for testing');
      } else {
        console.log('❌ Sign Up Error:', signUpError.message);
        return;
      }
    } else {
      console.log('✅ Sign Up Successful');
      console.log('   User:', signUpData.user?.email);
      console.log('   Session:', !!signUpData.session);
    }
  } catch (err) {
    console.log('❌ Sign Up Failed:', err.message);
    return;
  }
  
  // Test 2: Sign In
  console.log('\n2️⃣ Testing Sign In...');
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign In Error:', signInError.message);
      console.log('   This might be the main problem!');
      
      // Check common issues
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Possible causes:');
        console.log('   • User doesn\'t exist in database');
        console.log('   • Wrong password');
        console.log('   • Email confirmation required');
        console.log('   • User account disabled');
      }
      return;
    } else {
      console.log('✅ Sign In Successful');
      console.log('   User:', signInData.user?.email);
      console.log('   Session:', !!signInData.session);
      console.log('   Access Token:', signInData.session?.access_token ? 'Present' : 'Missing');
    }
  } catch (err) {
    console.log('❌ Sign In Failed:', err.message);
    return;
  }
  
  // Test 3: Get Current User
  console.log('\n3️⃣ Testing Get Current User...');
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Get User Error:', userError.message);
    } else if (user) {
      console.log('✅ User Retrieved Successfully');
      console.log('   User ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Created:', user.created_at);
    } else {
      console.log('❌ No user found');
    }
  } catch (err) {
    console.log('❌ Get User Failed:', err.message);
  }
  
  // Test 4: Check Profile Table
  console.log('\n4️⃣ Testing Profile Access...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        if (profileError.message.includes('No rows returned')) {
          console.log('⚠️  Profile doesn\'t exist - this might be OK for new users');
          
          // Try to create profile
          console.log('   Attempting to create profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              subscription_tier: 'free',
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) {
            console.log('   ❌ Failed to create profile:', createError.message);
          } else {
            console.log('   ✅ Profile created successfully');
          }
        } else {
          console.log('❌ Profile Error:', profileError.message);
        }
      } else {
        console.log('✅ Profile Retrieved Successfully');
        console.log('   Profile ID:', profile?.id);
        console.log('   Subscription Tier:', profile?.subscription_tier || 'Not set');
      }
    }
  } catch (err) {
    console.log('❌ Profile Test Failed:', err.message);
  }
  
  // Test 5: Sign Out
  console.log('\n5️⃣ Testing Sign Out...');
  try {
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ Sign Out Error:', signOutError.message);
    } else {
      console.log('✅ Sign Out Successful');
    }
  } catch (err) {
    console.log('❌ Sign Out Failed:', err.message);
  }
  
  // Summary
  console.log('\n==============================');
  console.log('📊 SUMMARY:');
  console.log('==============================');
  console.log('\n🎯 If all tests passed, your authentication is working!');
  console.log('🎯 If sign-in failed, check the Supabase dashboard:');
  console.log('   1. Go to Authentication > Users');
  console.log('   2. Check if email confirmation is required');
  console.log('   3. Verify user exists and is active');
  console.log('   4. Check RLS policies on tables');
}

testLogin().catch(console.error);