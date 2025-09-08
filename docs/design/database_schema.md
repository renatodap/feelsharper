# Database Schema Enhancement - Feature Design

## Overview
Enhance the existing FeelSharper database schema to support MVP functionality including AI insights, rule cards, enhanced user profiles, and improved activity logging.

## User Stories

### As a user, I want my profile to capture sport-specific information
- **Story**: I need to specify my sport type, training frequency, and dietary restrictions
- **Acceptance**: Profile includes sport_type, training_frequency, dietary_restrictions fields
- **Value**: Enables personalized AI insights and recommendations

### As a user, I want my activities to have structured data and confidence scores
- **Story**: When I log activities, the system should store structured data and confidence levels
- **Acceptance**: Activity logs include structured_data JSONB and confidence_score fields
- **Value**: Enables better analysis and AI insight generation

### As a user, I want to receive AI insights about my health and fitness
- **Story**: The system should generate personalized insights based on my activity data
- **Acceptance**: Insights table stores AI-generated recommendations with confidence scores
- **Value**: Provides actionable advice to improve health and performance

### As a system, I want rule-based logic for generating insights
- **Story**: Rules should be configurable and testable for generating contextual advice
- **Acceptance**: Rule cards table defines conditions and response templates
- **Value**: Ensures consistent, high-quality AI responses

## Database Requirements

### Enhanced Profiles Table
```sql
-- Add sport-specific fields to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_frequency INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_score INTEGER DEFAULT 0;
```

**Requirements**:
- sport_type: Must be valid enum value ('general', 'endurance', 'strength', 'skill_sport')
- training_frequency: Integer 0-14 (sessions per week)
- dietary_restrictions: Array of strings (vegetarian, vegan, gluten-free, etc.)
- completion_score: 0-100 percentage of profile completeness

### Enhanced Activity Logs Table
```sql
-- Add structured data fields to existing activity_logs table  
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS structured_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
```

**Requirements**:
- structured_data: JSON object with parsed activity components (nutrition, exercise, biometrics)
- confidence_score: Float 0.0-1.0 representing parsing confidence
- source: Enum ('manual', 'voice', 'device', 'photo') for tracking input method

### New Insights Table
```sql
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    insight_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    related_logs UUID[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    priority INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements**:
- insight_type: Enum ('advice', 'encouragement', 'warning', 'pattern')
- title: Short descriptive title (max 100 chars)
- content: Main insight text (max 1000 chars)  
- explanation: Optional detailed explanation
- related_logs: Array of activity log UUIDs this insight references
- status: Enum ('active', 'dismissed', 'expired')
- priority: Integer 1-5 (1=highest priority)

### New Rule Cards Table
```sql
CREATE TABLE IF NOT EXISTS rule_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    conditions JSONB NOT NULL,
    response_template TEXT NOT NULL,
    clarifying_question TEXT,
    priority INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements**:
- name: Unique identifier for the rule (snake_case)
- conditions: JSON object defining when rule applies
- response_template: Template for generating insight content
- clarifying_question: Optional question to ask user for more context
- priority: Integer 1-5 for rule precedence

## Performance Requirements

### Indexes for Query Performance
```sql
-- Profiles optimization
CREATE INDEX IF NOT EXISTS idx_profiles_sport_type ON profiles(sport_type);
CREATE INDEX IF NOT EXISTS idx_profiles_completion_score ON profiles(completion_score);

-- Activity logs optimization  
CREATE INDEX IF NOT EXISTS idx_activity_logs_confidence ON activity_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_activity_logs_source ON activity_logs(source);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at);

-- Insights optimization
CREATE INDEX IF NOT EXISTS idx_insights_user_status ON insights(user_id, status);
CREATE INDEX IF NOT EXISTS idx_insights_type_priority ON insights(insight_type, priority);
CREATE INDEX IF NOT EXISTS idx_insights_expires ON insights(expires_at) WHERE expires_at IS NOT NULL;

-- Rule cards optimization
CREATE INDEX IF NOT EXISTS idx_rule_cards_active ON rule_cards(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_rule_cards_priority ON rule_cards(priority);
```

### Query Performance Targets
- Profile queries: <50ms
- Activity log queries: <100ms (with user_id filter)
- Insight generation queries: <200ms
- Rule matching queries: <100ms

## Data Integrity Constraints

### Foreign Key Constraints
- insights.user_id → auth.users(id) with CASCADE delete
- All UUID references validated

### Check Constraints
- confidence_score between 0.0 and 1.0
- completion_score between 0 and 100
- training_frequency between 0 and 14
- priority values between 1 and 5

### JSONB Schema Validation
- dietary_restrictions: Array of valid restriction strings
- structured_data: Must contain valid activity parsing results
- conditions: Must contain valid rule logic

## Migration Strategy

### Backward Compatibility
- All changes use `ADD COLUMN IF NOT EXISTS` for safety
- Default values ensure existing data remains valid
- No breaking changes to existing API contracts

### Data Migration Steps
1. Add new columns with defaults
2. Create new tables with proper constraints
3. Add indexes for performance
4. Populate initial rule cards
5. Validate data integrity

### Rollback Plan
- All changes can be rolled back safely
- New columns can be dropped without affecting existing functionality
- New tables can be removed if needed

## Testing Strategy

### Unit Tests
- Schema creation and modification
- Constraint validation
- Index performance
- Data migration scripts

### Integration Tests  
- API endpoint compatibility
- Query performance validation
- Cross-table relationship integrity

### Data Quality Tests
- Foreign key constraint enforcement
- JSONB schema validation
- Performance benchmarking

## Success Criteria

### Functional Requirements
- [ ] All schema changes applied successfully
- [ ] Existing data remains intact and accessible
- [ ] New features can store and retrieve data
- [ ] Query performance meets targets

### Non-Functional Requirements
- [ ] Zero downtime deployment
- [ ] No data loss during migration
- [ ] Backward compatibility maintained
- [ ] Performance regression avoided

## Risk Assessment

### High Risk
- Data corruption during migration
- Performance degradation on large datasets
- Breaking existing API functionality

### Mitigation Strategies
- Full database backup before changes
- Staged rollout with rollback capability
- Comprehensive testing on copy of production data
- Performance monitoring during deployment

## Dependencies
- Supabase PostgreSQL instance
- Existing auth.users table structure
- Activity logging API endpoints
- User profile management system