# 🚀 MANUAL DATABASE MIGRATION REQUIRED

## Current Status
- ✅ OpenAI API integration: **WORKING** (real natural language parsing)
- ✅ Claude API coaching: **WORKING** (personalized responses)
- ✅ API endpoint: **WORKING** (`/api/ai/parse` with demo mode)
- ✅ Demo interface: **WORKING** (`/working-demo` page)
- ❌ Database persistence: **BLOCKED** (table doesn't exist)

## What You Need To Do

### Step 1: Apply Migration in Supabase Dashboard
1. **Go to:** https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd/sql
2. **Copy and paste** the SQL below into the editor
3. **Click "RUN"** to create the table and all security policies

### Step 2: Copy This SQL
```sql
-- Create activity_logs table for unified activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weight', 'food', 'workout', 'mood', 'energy', 'sleep', 'water', 'unknown')),
  data JSONB NOT NULL,
  raw_text TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_type_created ON activity_logs(user_id, type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs" ON activity_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs" ON activity_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_activity_logs_updated_at
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for daily summaries
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE type = 'food') as food_count,
  COUNT(*) FILTER (WHERE type = 'workout') as workout_count,
  COUNT(*) FILTER (WHERE type = 'weight') as weight_count,
  AVG((data->>'weight')::numeric) FILTER (WHERE type = 'weight') as avg_weight,
  AVG((data->>'level')::numeric) FILTER (WHERE type = 'energy') as avg_energy,
  AVG((data->>'hours')::numeric) FILTER (WHERE type = 'sleep') as avg_sleep_hours,
  SUM((data->>'amount')::numeric) FILTER (WHERE type = 'water' AND data->>'unit' = 'oz') as total_water_oz,
  COUNT(*) as total_activities
FROM activity_logs
GROUP BY user_id, DATE(created_at);

-- Grant permissions on the view
GRANT SELECT ON daily_activity_summary TO authenticated;
```

### Step 3: Test Database Setup
After applying the migration, run:
```bash
node test-end-to-end.js
```

You should see:
- ✅ All parsing tests pass with high confidence
- ✅ Database saves activities successfully  
- ✅ Data retrieval works
- ✅ Full end-to-end flow complete

## What Happens Next

Once the migration is applied:

1. **Demo mode will save to database** (bypasses auth for testing)
2. **Full persistence will work** with real users
3. **Days 1-2 will be 100% complete** 
4. **Ready to move to Days 3-10** (UI improvements, advanced features)

## Current API Status
The API is **fully functional** right now:

```bash
# Test weight logging (will save once DB is set up)
curl -X POST http://localhost:3030/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "weight 175", "demo": true}'

# Test workout logging
curl -X POST http://localhost:3030/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "ran 5k in 25 minutes", "demo": true}'
```

Both return real AI parsing + Claude coaching responses!

## Demo Interface
Visit: http://localhost:3030/working-demo

- Try different natural language inputs
- See real-time parsing results  
- View confidence scores
- Test all 7 activity types

**The foundation is rock-solid. Just need the database table!**