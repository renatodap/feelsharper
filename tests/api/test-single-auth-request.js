// Test single authenticated request to debug the issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSingleRequest() {
  console.log('🔍 TESTING SINGLE AUTHENTICATED REQUEST\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Admin client for user creation
  const adminClient = createClient(supabaseUrl, serviceKey);

  // Regular client for user operations
  const userClient = createClient(
    supabaseUrl, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const testEmail = 'test@feelsharper.com';
  const testPassword = 'testpassword123';

  try {
    // Sign in to get a real token
    console.log('1. Signing in to get token...');
    const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return;
    }

    console.log('✅ Signed in successfully');
    console.log(`   User ID: ${signInData.user.id}`);
    console.log(`   Token (first 20 chars): ${signInData.session.access_token.substring(0, 20)}...`);

    // Test API call with real token
    console.log('\n2. Testing API call with real token...');
    
    const response = await fetch('http://localhost:3030/api/ai/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signInData.session.access_token}`
      },
      body: JSON.stringify({
        text: 'weight 175',
        context: {},
        demo: false
      })
    });

    const result = await response.json();
    
    console.log('📊 API Response:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Error: ${result.error || 'none'}`);
    
    if (result.success) {
      console.log(`   Parsed Type: ${result.parsed?.type}`);
      console.log(`   Confidence: ${Math.round((result.parsed?.confidence || 0) * 100)}%`);
      console.log(`   Attempted Save: ${result.attempted_save}`);
      console.log(`   Actually Saved: ${result.saved}`);
      console.log(`   User ID in Response: ${result.user_id}`);
    }

    // Check if anything was saved
    console.log('\n3. Checking database...');
    const { data: activities, error: fetchError } = await adminClient
      .from('activity_logs')
      .select('*')
      .eq('user_id', signInData.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.log('❌ Database fetch failed:', fetchError.message);
    } else {
      console.log(`✅ Found ${activities.length} activities for this user`);
      if (activities.length > 0) {
        const latest = activities[0];
        console.log(`   Latest: ${latest.type} - "${latest.raw_text}" (${Math.round(latest.confidence * 100)}%)`);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testSingleRequest();