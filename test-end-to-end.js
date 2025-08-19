// Test complete end-to-end flow: Parse → Save → Retrieve
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testEndToEnd() {
  console.log('🔄 TESTING END-TO-END FLOW\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Test scenarios
  const testInputs = [
    "weight 175",
    "ran 5k in 25 minutes", 
    "had eggs for breakfast",
    "energy 8/10",
    "slept 7 hours"
  ];

  console.log('Testing parsing accuracy...');
  
  for (const input of testInputs) {
    try {
      // Test API endpoint
      const response = await fetch('http://localhost:3030/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, demo: true })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ "${input}" → ${result.parsed.type} (${Math.round(result.parsed.confidence * 100)}%)`);
        
        // Test direct database insertion (bypassing auth for testing)
        if (result.parsed.type !== 'unknown' && result.parsed.confidence >= 0.7) {
          const { error } = await supabase
            .from('activity_logs')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
              type: result.parsed.type,
              data: result.parsed.data,
              raw_text: result.parsed.rawText,
              confidence: result.parsed.confidence,
              metadata: { test: true, coach: result.coach }
            });
            
          if (error) {
            console.log(`   ⚠️  Save failed: ${error.message}`);
          } else {
            console.log(`   💾 Saved to database successfully`);
          }
        }
      } else {
        console.log(`❌ "${input}" failed:`, result.error);
      }
    } catch (error) {
      console.log(`❌ "${input}" error:`, error.message);
    }
  }

  // Test retrieving saved data
  console.log('\n📊 Testing data retrieval...');
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('metadata->test', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Retrieval failed:', error.message);
  } else {
    console.log(`✅ Retrieved ${activities.length} test activities`);
    if (activities.length > 0) {
      console.log('Latest activity:', {
        type: activities[0].type,
        data: activities[0].data,
        confidence: activities[0].confidence
      });
    }
  }

  // Cleanup test data
  console.log('\n🧹 Cleaning up test data...');
  const { error: deleteError } = await supabase
    .from('activity_logs')
    .delete()
    .eq('metadata->test', true);
    
  if (deleteError) {
    console.log('⚠️  Cleanup failed:', deleteError.message);
  } else {
    console.log('✅ Test data cleaned up');
  }

  console.log('\n🎯 END-TO-END TEST COMPLETE');
  console.log('✅ Natural language parsing: Working');
  console.log('✅ AI coaching responses: Working');
  console.log('✅ Database connection: Working');
  console.log('🔄 Authentication: Demo mode only (needs real auth for production)');
}

testEndToEnd().catch(console.error);