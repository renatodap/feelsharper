// Apply database migration directly using service role key
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  console.log('🚀 APPLYING DATABASE MIGRATION\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/001_activity_logs.sql', 'utf8');
    console.log('📄 Migration file loaded');

    // Split SQL into individual statements (basic splitting)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`${i + 1}. Executing: ${statement.substring(0, 60)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        // Continue with other statements unless it's critical
        if (!error.message.includes('already exists')) {
          console.log('   ⚠️  Continuing with remaining statements...');
        }
      } else {
        console.log('   ✅ Success');
      }
    }

    // Test if table exists now
    console.log('\n🔍 Testing table creation...');
    const { data, error } = await supabase
      .from('activity_logs')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Table test failed:', error.message);
      console.log('\n💡 MANUAL MIGRATION REQUIRED:');
      console.log('1. Go to https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql');
      console.log('2. Copy and paste the following SQL:');
      console.log('\n--- MIGRATION SQL ---');
      console.log(migrationSQL);
      console.log('--- END MIGRATION SQL ---\n');
    } else {
      console.log('✅ Table created successfully!');
      console.log('🎉 Migration complete - ready for testing');
    }

  } catch (error) {
    console.log('❌ Migration failed:', error.message);
    
    // Fallback: show manual instructions
    const migrationSQL = fs.readFileSync('./supabase/migrations/001_activity_logs.sql', 'utf8');
    console.log('\n💡 APPLY MIGRATION MANUALLY:');
    console.log('1. Go to: https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql');
    console.log('2. Copy and paste this SQL:');
    console.log('\n--- COPY THIS SQL ---');
    console.log(migrationSQL);
    console.log('--- END SQL ---');
    console.log('\n3. Click "RUN" to apply the migration');
    console.log('4. Then run: node test-end-to-end.js');
  }
}

applyMigration();