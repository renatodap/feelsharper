import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uayxgxeueyjiokhvmjwd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3NTA5NywiZXhwIjoyMDY5MDUxMDk3fQ.4XSBX-Jkto9oyt7--1zQ4mcTJGuXVzJGh3TCgWMV560'

// Use service role key to bypass RLS for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔒 Applying RLS Security Fix...\n')

async function applyRLS() {
  try {
    // Read the SQL migration file
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    
    const rlsSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'migrations', '20250829_enable_rls.sql'),
      'utf8'
    )
    
    console.log('📝 Executing RLS migration...')
    
    // Execute the SQL directly using rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: rlsSQL
    })
    
    if (error) {
      // If exec_sql doesn't exist, try a different approach
      console.log('⚠️  Standard execution failed, trying alternative method...')
      
      // Split the SQL into individual statements
      const statements = rlsSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      let successCount = 0
      let errorCount = 0
      
      for (const statement of statements) {
        try {
          // Try to execute each statement
          console.log(`Executing: ${statement.substring(0, 50)}...`)
          
          // For ALTER TABLE and CREATE POLICY statements, we need to use raw SQL
          // which isn't directly supported by the client library
          // So we'll check current status instead
          
          if (statement.includes('ALTER TABLE')) {
            console.log('  ⏭️  ALTER TABLE statement - needs direct SQL access')
          } else if (statement.includes('CREATE POLICY')) {
            console.log('  ⏭️  CREATE POLICY statement - needs direct SQL access')
          }
          
          successCount++
        } catch (err) {
          console.error(`  ❌ Error: ${err.message}`)
          errorCount++
        }
      }
      
      console.log(`\n📊 Processed ${successCount} statements (${errorCount} require direct SQL access)`)
      console.log('\n⚠️  The Supabase JS client cannot directly execute DDL statements.')
      console.log('    You need to apply the migration through one of these methods:\n')
      console.log('    1. Supabase Dashboard SQL Editor:')
      console.log('       https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql/new')
      console.log('\n    2. Supabase CLI (with database password):')
      console.log('       npx supabase db push')
      console.log('\n    3. Direct PostgreSQL connection with a database client')
      
    } else {
      console.log('✅ RLS migration applied successfully!')
    }
    
  } catch (error) {
    console.error('❌ Error applying RLS:', error.message)
    console.log('\n📋 Since direct SQL execution is not available via the JS client,')
    console.log('   please apply the migration manually through the Supabase Dashboard:')
    console.log('   https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql/new')
    console.log('\n   Copy and paste the contents of:')
    console.log('   supabase/migrations/20250829_enable_rls.sql')
  }
}

// Run the migration
await applyRLS()

console.log('\n🔍 Now testing RLS status...\n')

// Test if RLS is working
const { data: testData, error: testError } = await supabase
  .from('activity_logs')
  .select('*')
  .limit(1)

if (testError && testError.message.includes('row-level security')) {
  console.log('✅ RLS appears to be enabled!')
} else if (testData && testData.length === 0) {
  console.log('⚠️  Table is empty but still accessible - RLS may not be fully enabled')
} else {
  console.log('❌ RLS is not properly configured - manual intervention required')
}

console.log('\n📝 Next step: Run "node test-rls-security.mjs" to verify all tables are secured')