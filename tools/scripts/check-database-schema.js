// Check what tables and schemas exist in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  console.log('🔍 CHECKING DATABASE SCHEMA\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Check tables using direct SQL query
    console.log('📋 Checking existing tables...');
    const { data: tables, error: tableError } = await supabase
      .rpc('get_tables');

    if (tableError) {
      console.log('Table check failed:', tableError.message);
      
      // Alternative: Try to query information schema directly  
      const { data: altTables, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_type', 'BASE TABLE');
        
      if (altError) {
        console.log('Alternative table check failed:', altError.message);
      } else {
        console.log('Found tables:', altTables);
      }
    } else {
      console.log('Found tables:', tables);
    }

    // Try a simple schema inspection
    console.log('\n📊 Testing different approaches...');
    
    // Test 1: Try accessing activity_logs directly
    const { data: test1, error: error1 } = await supabase
      .from('activity_logs')
      .select('*')
      .limit(1);
      
    console.log('Test 1 (activity_logs):', error1 ? `❌ ${error1.message}` : `✅ Table accessible`);

    // Test 2: Try with public schema explicitly
    const { data: test2, error: error2 } = await supabase
      .from('public.activity_logs')
      .select('*')
      .limit(1);
      
    console.log('Test 2 (public.activity_logs):', error2 ? `❌ ${error2.message}` : `✅ Table accessible`);

    // Test 3: Check if there are any tables we can access
    const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: test3, error: error3 } = await publicClient
      .from('activity_logs')
      .select('*')
      .limit(1);
      
    console.log('Test 3 (anon key):', error3 ? `❌ ${error3.message}` : `✅ Table accessible via anon`);

    console.log('\n🎯 DIAGNOSIS:');
    if (error1 && error1.message.includes('does not exist')) {
      console.log('❌ The activity_logs table does not exist');
      console.log('📝 Need to apply migration manually in Supabase dashboard');
    } else if (error1 && error1.message.includes('permission')) {
      console.log('⚠️  Table exists but RLS is blocking access');
      console.log('✅ This is expected behavior - good security!');
    } else if (!error1) {
      console.log('✅ Table exists and is accessible');
    } else {
      console.log('🤔 Unknown issue:', error1.message);
    }

  } catch (error) {
    console.log('❌ Schema check failed:', error.message);
  }
}

checkSchema();