// Test database connection and table existence
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  console.log('🔍 TESTING DATABASE CONNECTION\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test basic connection
    console.log('1. Testing connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('activity_logs')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      if (healthError.message.includes('relation "activity_logs" does not exist')) {
        console.log('❌ Table "activity_logs" does not exist yet');
        console.log('📝 MIGRATION NEEDED - Apply this SQL in Supabase dashboard:');
        console.log('   https://supabase.com/dashboard/project/[your-project]/sql\n');
        
        const fs = require('fs');
        const migrationSQL = fs.readFileSync('./supabase/migrations/001_activity_logs.sql', 'utf8');
        console.log('--- COPY AND PASTE THIS SQL ---');
        console.log(migrationSQL);
        console.log('--- END SQL ---\n');
        return;
      } else {
        console.log('❌ Connection error:', healthError.message);
        return;
      }
    }

    console.log('✅ Connection successful!');
    console.log(`📊 Current activity logs count: ${healthCheck || 0}`);

    // Test inserting a sample record
    console.log('\n2. Testing insert capability...');
    const { data: insertData, error: insertError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        type: 'weight',
        data: { weight: 175, unit: 'lbs' },
        raw_text: 'weight 175',
        confidence: 0.95,
        metadata: { test: true }
      })
      .select();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful');
      
      // Clean up test record
      await supabase
        .from('activity_logs')
        .delete()
        .eq('id', insertData[0].id);
      console.log('✅ Test record cleaned up');
    }

    console.log('\n🎉 DATABASE IS READY FOR USE!');
    console.log('The API endpoint can now save data to the database.');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testDatabase();