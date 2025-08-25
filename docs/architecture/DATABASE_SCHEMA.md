# Database Schema Status

*Last Updated: 2025-08-23*

## Current Status

### ✅ Base Schema Complete
- **File**: `supabase/migrations/current_schema_2025218_443am`
- **Coverage**: Phases 1-2 complete
- **Status**: ✅ Operational

### ⚠️ Pending Migration
- **File**: `supabase/migrations/20250821_complete_mvp_schema.sql`
- **Coverage**: Phases 5.1-5.4 requirements (AI coaching, patterns, habits)
- **Status**: ⚠️ **REQUIRES USER ACTION** - Must run on Supabase

## Core Tables

### User Management
```sql
-- User profiles with fitness preferences
profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  user_type user_type_enum,
  dashboard_config jsonb,
  common_logs jsonb,
  preferences jsonb,
  detected_patterns jsonb,
  context_cache jsonb
)

-- User achievements and gamification
user_achievements (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  achievement_type text,
  earned_at timestamptz,
  metadata jsonb
)
```

### Activity Tracking
```sql
-- Unified activity logging
activity_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  activity_type activity_type_enum,
  structured_data jsonb,
  raw_input text,
  confidence_level integer,
  subjective_notes text,
  source text,
  device_data jsonb,
  logged_at timestamptz
)

-- Detailed workout tracking
workouts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  name text,
  type workout_type_enum,
  duration_minutes integer,
  exercises jsonb,
  total_sets integer,
  total_reps integer,
  total_weight_kg numeric,
  logged_at timestamptz
)
```

### AI & Intelligence
```sql
-- AI coaching conversations
coaching_conversations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  session_id text,
  message_type text,
  content text,
  context jsonb,
  created_at timestamptz
)

-- Pattern detection and insights
insights (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  insight_type text,
  title text,
  description text,
  confidence_score integer,
  supporting_data jsonb,
  created_at timestamptz
)

-- Habit formation tracking
habit_tracking (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  habit_name text,
  streak_count integer,
  last_completed timestamptz,
  behavior_data jsonb
)
```

## Migration Status

### Phase 2 Complete ✅
- Basic user profiles and activity logging
- Authentication and authorization
- Core workout and nutrition tracking

### Phase 5 Pending ⚠️
- AI coaching infrastructure
- Pattern detection system
- Habit formation tracking
- Advanced analytics tables

### Next Steps Required
1. **User Action**: Run `20250821_complete_mvp_schema.sql` on Supabase
2. **Validation**: Verify all tables created successfully  
3. **Consolidation**: Update current_schema file post-migration
4. **Testing**: Validate API endpoints work with new schema

## Schema Validation Process

After each phase completion, automated validation checks:

```javascript
// Auto-validation workflow
function validateSchema() {
  const currentSchema = readSchemaFile();
  const apiReferences = scanApiRoutes();
  const gaps = identifyMissing(currentSchema, apiReferences);
  
  if (gaps.length > 0) {
    generateMigration(gaps);
    alertUser("Schema update required");
  }
}
```

## API Integration Points

### Critical Endpoints Requiring Schema
- `/api/parse` → `activity_logs`, `parsing_sessions`
- `/api/coach` → `coaching_conversations`, `insights`
- `/api/patterns` → `habit_tracking`, `user_patterns`
- `/api/insights` → `insights`, `user_achievements`

### Missing Tables (Current Gaps)
- `workout_sets` - Referenced in workouts API
- `coaching_conversations` - AI coach sessions
- `insights` - Daily AI insights  
- `habit_tracking` - Behavioral patterns
- `parsing_sessions` - NLP accuracy tracking

---

**Action Required**: Run pending migration before continuing development.