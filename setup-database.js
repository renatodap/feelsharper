// Simple script to set up database tables for Natural Language MVP
const fs = require('fs');
const path = require('path');

console.log('🗄️  DATABASE SETUP FOR NATURAL LANGUAGE MVP');
console.log('==========================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('Create .env.local with Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

// Read migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_activity_logs.sql');
if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
console.log('✅ Migration SQL loaded (', migrationSQL.length, 'characters)');

// Simple test - for now just show what would be done
console.log('\n📋 MIGRATION PREVIEW:');
console.log('- Create activity_logs table with 8 activity types');
console.log('- Add indexes for performance');
console.log('- Enable Row Level Security');
console.log('- Create daily summary view');
console.log('- Set up user permissions');

console.log('\n💡 NEXT STEPS:');
console.log('1. Apply this migration in Supabase dashboard SQL editor');
console.log('2. Or use Supabase CLI: supabase db push');
console.log('3. Test with: node test-database.js');

console.log('\n🎯 Once tables exist, the API will save activities!');