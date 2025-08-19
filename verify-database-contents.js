// Verify what's actually in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyContents() {
  console.log('🔍 VERIFYING DATABASE CONTENTS\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Admin client bypasses RLS
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Fetch all activity logs
    const { data: allActivities, error } = await adminClient
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.log('❌ Fetch failed:', error.message);
      return;
    }

    console.log(`✅ Found ${allActivities.length} total activities in database`);
    
    if (allActivities.length > 0) {
      console.log('\n📊 Recent activities:');
      allActivities.forEach((activity, i) => {
        console.log(`${i + 1}. ${activity.type} - "${activity.raw_text}" (${Math.round(activity.confidence * 100)}%)`);
        console.log(`   User: ${activity.user_id}`);
        console.log(`   Data: ${JSON.stringify(activity.data)}`);
        console.log(`   Created: ${activity.created_at}`);
        console.log('');
      });

      // Test if specific user can access their data with proper auth
      const testUserId = allActivities[0].user_id;
      console.log(`🔐 Testing RLS with user: ${testUserId}`);
      
      // Try with anon client
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data: userActivities, error: rlsError } = await anonClient
        .from('activity_logs')
        .select('*')
        .eq('user_id', testUserId);

      if (rlsError) {
        console.log('⚠️  RLS blocking access (expected):', rlsError.message);
      } else {
        console.log(`✅ RLS allows access: ${userActivities.length} activities`);
      }
    } else {
      console.log('📝 No activities found in database');
    }

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

verifyContents();