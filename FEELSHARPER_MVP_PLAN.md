# 🚀 FeelSharper MVP Implementation Plan - Phase 1
*Claude Code Execution Guide - Weeks 1-4*

## 📋 Overview

This document provides Claude Code with step-by-step instructions to implement the FeelSharper MVP. Every task follows mandatory TDD methodology and issue tracking requirements.

### Success Criteria
- ✅ Natural language parsing with 80%+ accuracy
- ✅ AI coach providing contextual insights
- ✅ Complete user interface for core flows
- ✅ 80%+ test coverage across all components
- ✅ Working authentication and data persistence

---

## 🎯 MVP Core Features

### 1. Natural Language Activity Parsing
**Input**: "eggs and toast, ran 5k, feeling great"  
**Output**: Structured data with confidence scores + insights

### 2. AI Coach Insights
**Daily**: 2-3 personalized recommendations based on user data  
**Context**: Pre/post workout, nutrition timing, recovery advice

### 3. Quick Logging Interface
**Methods**: Text input, voice transcription, quick action buttons  
**Goal**: Log any activity in <30 seconds

### 4. Dynamic Dashboard
**Personalized**: 4-6 widgets based on user goals and activity patterns  
**Real-time**: Updates as new activities are logged

### 5. User Profile System
**Customization**: Goals, sport type, dietary preferences  
**Personalization**: Drives AI advice and dashboard widgets

---

## 📂 Required Directory Structure

```
feelsharper-deploy/
├── issues/                           # MANDATORY issue tracking
│   ├── SUMMARY.md                   # Current status overview
│   ├── active.md                    # Tasks in progress  
│   ├── completed.md                 # Finished tasks
│   ├── WORK_LOG.md                  # Time and activity log
│   ├── work_history.md              # Decisions and blockers
│   └── TIME_TRACKING.md             # Time spent per task
├── docs/
│   ├── design/                      # Feature design docs
│   └── testing/                     # Test design docs
├── app/                             # Next.js frontend
├── feelsharper-backend/             # Python FastAPI backend
└── tests/                           # All test files
```

---

## 🔄 TDD Workflow - MANDATORY SEQUENCE

**Claude Code MUST follow this exact sequence for every feature:**

### 1. Feature Design → `docs/design/{feature}.md`
- Define feature requirements and specifications
- Include user stories and acceptance criteria
- Specify API contracts and data models

### 2. Test Design → `docs/testing/{feature}_test.md`
- Plan test cases and scenarios
- Define mock requirements and test data
- Specify coverage targets

### 3. Code Design → Interface definitions
- Create TypeScript interfaces
- Define API endpoints
- Specify database schemas

### 4. Test Implementation → Failing tests
- Write comprehensive test suite FIRST
- All mocks prefixed with "Mock"
- Include required header documentation

### 5. Feature Implementation → Pass tests
- Implement ONLY what's needed to pass tests
- NO MOCKS IN PRODUCTION CODE
- Follow existing code patterns

### 6. Validation → Coverage check
- Verify ≥80% test coverage
- Run all tests and ensure passing
- Update documentation

---

## 🚨 Issue Tracking Protocol

**Before Starting ANY Task:**
```bash
# 1. Check current status
cat issues/SUMMARY.md

# 2. Update active tasks
echo "- [TASK_NAME] - Started $(date)" >> issues/active.md

# 3. Log work start
echo "$(date): Started [TASK_NAME] - Estimated: Xh" >> issues/WORK_LOG.md
```

**During Work:**
```bash
# Log activities with time estimates
echo "$(date): [ACTIVITY] - Time: Xmin" >> issues/WORK_LOG.md

# Note blockers/decisions
echo "$(date): [BLOCKER/DECISION] - [DETAILS]" >> issues/work_history.md

# Update on commit
echo "$(date): Commit [HASH] - [DESCRIPTION]" >> issues/WORK_LOG.md
```

**After Completing Task:**
```bash
# 1. Update time tracking
echo "[TASK_NAME]: Xh Ymin - Completed $(date)" >> issues/TIME_TRACKING.md

# 2. Move to completed
grep "[TASK_NAME]" issues/active.md >> issues/completed.md
sed -i "/[TASK_NAME]/d" issues/active.md

# 3. Update summary
# Update issues/SUMMARY.md with new status
```

---

## 🏗️ Week 1: Foundation & Infrastructure

### Task 1.1: Issue Tracking Setup
**Estimated Time**: 30 minutes

**Claude Code Instructions:**
1. Create `issues/` directory with all required files
2. Initialize each file with proper headers
3. Set up first entry in active.md for this task
4. Follow issue tracking protocol for this task

**Files to Create:**
```
issues/SUMMARY.md - Status overview template
issues/active.md - Current tasks template  
issues/completed.md - Finished tasks log
issues/WORK_LOG.md - Detailed activity log
issues/work_history.md - Decisions/blockers
issues/TIME_TRACKING.md - Time spent tracking
```

**Acceptance Criteria:**
- [ ] All tracking files exist with proper templates
- [ ] First task logged following protocol
- [ ] Templates include required headers and format

### Task 1.2: Database Schema Enhancement
**Estimated Time**: 2 hours

**TDD Sequence:**
1. **Design**: `docs/design/database_schema.md`
2. **Test**: `docs/testing/database_test.md`  
3. **Code**: Database migration files
4. **Test**: Database schema validation tests
5. **Implement**: Execute migrations
6. **Validate**: Test coverage ≥80%

**Claude Code Instructions:**
1. Follow TDD sequence exactly
2. Update existing Supabase schema with MVP requirements
3. Add indexes for performance
4. Include proper foreign key constraints
5. Add validation rules and check constraints

**Required Tables:**
```sql
-- Enhanced profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_frequency INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_score INTEGER DEFAULT 0;

-- Enhanced activity_logs table  
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS structured_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- New insights table
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

-- New rule_cards table
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

**Acceptance Criteria:**
- [ ] All tables created with proper constraints
- [ ] Indexes added for performance queries
- [ ] Migration tests pass
- [ ] Schema validation tests ≥80% coverage
- [ ] No breaking changes to existing data

### Task 1.3: Enhanced Python Backend
**Estimated Time**: 4 hours

**TDD Sequence:**
1. **Design**: `docs/design/python_backend.md`
2. **Test**: `docs/testing/python_backend_test.md`
3. **Code**: Enhanced service interfaces
4. **Test**: Comprehensive backend tests  
5. **Implement**: Enhanced parsing and insights
6. **Validate**: Test coverage ≥80%

**Claude Code Instructions:**
1. Enhance existing `feelsharper-backend/` structure
2. Add new service modules for insights and rules
3. Implement confidence scoring improvements
4. Add comprehensive error handling
5. Follow existing code patterns

**Required File Structure:**
```
feelsharper-backend/
├── main.py                          # Enhanced with new endpoints
├── models/
│   ├── __init__.py
│   ├── activity.py                  # Activity data models
│   ├── insight.py                   # Insight data models
│   └── user.py                      # User profile models
├── services/
│   ├── __init__.py
│   ├── parser.py                    # Enhanced parsing (existing)
│   ├── insights.py                  # NEW: Insight generation
│   ├── rule_engine.py               # NEW: Rule card system
│   └── confidence.py                # NEW: Confidence scoring
├── api/
│   ├── __init__.py
│   ├── activities.py                # Activity endpoints
│   ├── insights.py                  # Insight endpoints
│   └── user.py                      # User profile endpoints
└── tests/
    ├── test_insights.py             # NEW: Insight tests
    ├── test_rule_engine.py          # NEW: Rule engine tests
    └── test_confidence.py           # NEW: Confidence tests
```

**New Endpoints Required:**
```python
# POST /api/insights/generate
# GET /api/insights/daily  
# POST /api/insights/{id}/feedback
# GET /api/user/profile
# PUT /api/user/profile
# GET /api/activities/logs
# PUT /api/activities/logs/{id}
```

**Acceptance Criteria:**
- [ ] All new endpoints implemented and tested
- [ ] Enhanced parsing with confidence scoring
- [ ] Rule engine with 5 core rules implemented
- [ ] Insight generation working
- [ ] All tests passing with ≥80% coverage
- [ ] Proper error handling and validation

### Task 1.4: Next.js Frontend Enhancements
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/frontend_structure.md`
2. **Test**: `docs/testing/frontend_test.md`
3. **Code**: Component interfaces and types
4. **Test**: Component and page tests
5. **Implement**: Enhanced UI components
6. **Validate**: Test coverage ≥80%

**Claude Code Instructions:**
1. Enhance existing Next.js structure
2. Add proper TypeScript types for all data
3. Create reusable UI components
4. Implement proper error boundaries
5. Add loading states and error handling

**Required File Structure:**
```
app/
├── (auth)/
│   ├── signin/page.tsx              # Enhanced with validation
│   └── signup/page.tsx              # Enhanced with validation
├── coach/
│   └── page.tsx                     # NEW: AI Coach page
├── log/
│   └── page.tsx                     # NEW: Quick logging page
├── dashboard/
│   └── page.tsx                     # Enhanced dashboard
├── profile/
│   └── page.tsx                     # NEW: User profile page
└── api/
    ├── insights/route.ts            # NEW: Insights proxy
    └── user/route.ts                # NEW: User profile proxy

components/
├── ui/                              # Base components (existing)
├── coach/
│   ├── InsightCard.tsx              # NEW: Insight display
│   └── CoachChat.tsx                # NEW: Chat interface  
├── logging/
│   ├── NaturalInput.tsx             # NEW: Text/voice input
│   ├── QuickActions.tsx             # NEW: One-tap logging
│   └── CommonLogs.tsx               # NEW: Frequent activities
├── dashboard/
│   ├── DynamicWidget.tsx            # NEW: Adaptive widgets
│   └── MetricCard.tsx               # NEW: Metric display
└── profile/
    ├── ProfileForm.tsx              # NEW: Profile editing
    └── PreferencesPanel.tsx         # NEW: Preferences
```

**Acceptance Criteria:**
- [ ] All new pages implemented with proper routing
- [ ] Reusable components with TypeScript types
- [ ] Proper error handling and loading states
- [ ] Responsive design for mobile/desktop
- [ ] Component tests with ≥80% coverage
- [ ] Integration with backend APIs working

---

## 🏗️ Week 2: Natural Language Processing

### Task 2.1: Enhanced Parser Engine
**Estimated Time**: 6 hours

**TDD Sequence:**
1. **Design**: `docs/design/nlp_parser.md`
2. **Test**: `docs/testing/nlp_parser_test.md`
3. **Code**: Parser interface definitions
4. **Test**: Comprehensive parsing tests
5. **Implement**: Enhanced parsing logic
6. **Validate**: 80%+ accuracy on test cases

**Claude Code Instructions:**
1. Enhance existing `services/parser.py`
2. Add pattern recognition for complex inputs
3. Implement entity extraction improvements
4. Add context awareness for ambiguous inputs
5. Improve confidence scoring algorithm

**Enhanced Parsing Categories:**
```python
ENHANCED_PATTERNS = {
    "nutrition": {
        "complex_meals": "chicken salad with avocado and nuts",
        "portion_sizes": "2 cups rice, 6oz chicken, handful of nuts",
        "meal_timing": "breakfast at 7am: eggs and toast",
        "macros": "high protein lunch, low carb dinner"
    },
    "exercise": {
        "structured_workouts": "bench 3x8 at 185, squats 3x10 at 225",
        "cardio_details": "ran 5k in 25:30, felt good, moderate effort",
        "sport_specific": "tennis 90min, 3 sets, won 6-4 6-2",
        "subjective": "great gym session, felt strong, PR on bench"
    },
    "biometrics": {
        "weight_context": "morning weight 175 after bathroom",
        "sleep_quality": "slept 8h, felt rested, no interruptions",
        "heart_rate": "resting HR 62, max during run 178"
    }
}
```

**Required Improvements:**
- [ ] Multi-activity parsing in single input
- [ ] Context-aware entity extraction
- [ ] Improved confidence calculation
- [ ] Better handling of ambiguous inputs
- [ ] Pattern learning from user corrections

**Acceptance Criteria:**
- [ ] 80%+ accuracy on complex test cases
- [ ] Handles multi-activity inputs correctly
- [ ] Confidence scores calibrated properly
- [ ] Proper clarifying questions generated
- [ ] All tests passing with ≥80% coverage

### Task 2.2: Rule Engine Implementation
**Estimated Time**: 5 hours

**TDD Sequence:**
1. **Design**: `docs/design/rule_engine.md`
2. **Test**: `docs/testing/rule_engine_test.md`
3. **Code**: Rule engine interfaces
4. **Test**: Rule matching and selection tests
5. **Implement**: Core rule engine logic
6. **Validate**: Rule coverage and accuracy

**Claude Code Instructions:**
1. Create new `services/rule_engine.py`
2. Implement rule card data structure
3. Add rule matching algorithm
4. Implement context-based selection
5. Add clarifying question generation

**Core Rule Cards to Implement:**
```python
CORE_RULES = {
    "pre_workout_fuel": {
        "conditions": {
            "has_upcoming_workout": True,
            "time_until_workout": {"min": 1, "max": 4, "unit": "hours"},
            "last_meal": {"min": 2, "unit": "hours"}
        },
        "advice": "Fuel up 1-3h before training: moderate carbs + lean protein, low fat/fiber",
        "clarifying_question": "What type of workout are you doing?",
        "confidence_required": 0.7
    },
    "post_workout_recovery": {
        "conditions": {
            "recent_workout": {"max": 2, "unit": "hours"},
            "workout_intensity": "moderate_to_high",
            "no_post_meal": True
        },
        "advice": "Recovery window is open: aim for carbs + protein within 2h",
        "examples": "Chocolate milk, turkey sandwich, protein smoothie with banana"
    },
    "hydration_check": {
        "conditions": {
            "workout_duration": {"min": 60, "unit": "minutes"},
            "no_water_logged": True
        },
        "advice": "Don't forget hydration: aim for 16-24oz per hour of exercise",
        "clarifying_question": "How much did you drink during your workout?"
    },
    "sleep_deficit": {
        "conditions": {
            "sleep_hours": {"max": 6},
            "has_workout_planned": True
        },
        "advice": "With limited sleep, consider reducing workout intensity by 10-20%",
        "alternatives": "Active recovery, light stretching, or short walk instead"
    },
    "protein_optimization": {
        "conditions": {
            "daily_protein": {"max": 0.8, "unit": "per_kg_bodyweight"},
            "strength_training": True
        },
        "advice": "Boost protein for muscle recovery: aim for 1.6-2.2g per kg bodyweight",
        "suggestions": "Add protein powder, Greek yogurt, or extra lean meat"
    }
}
```

**Acceptance Criteria:**
- [ ] 5 core rule cards implemented
- [ ] Rule matching algorithm working
- [ ] Context-aware rule selection
- [ ] Proper confidence thresholds
- [ ] Clarifying questions generated appropriately
- [ ] All tests passing with ≥80% coverage

### Task 2.3: Confidence Scoring System
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/confidence_scoring.md`
2. **Test**: `docs/testing/confidence_test.md`
3. **Code**: Confidence calculation interfaces
4. **Test**: Scoring accuracy tests
5. **Implement**: Confidence algorithms
6. **Validate**: Score calibration

**Claude Code Instructions:**
1. Create new `services/confidence.py`
2. Implement multi-factor confidence scoring
3. Add calibration based on user corrections
4. Include source reliability weighting
5. Add confidence-aware response formatting

**Confidence Factors:**
```python
CONFIDENCE_FACTORS = {
    "data_source": {
        "device": 0.9,      # High trust in device data
        "photo": 0.7,       # Moderate trust in image recognition
        "voice": 0.8,       # Good trust in voice transcription
        "manual": 0.6       # Base trust in typed input
    },
    "specificity": {
        "exact_numbers": +0.2,    # "175 lbs" vs "about 175"
        "units_specified": +0.1,   # "5 km" vs "5k"
        "time_specific": +0.1,     # "at 7am" vs "morning"
        "vague_terms": -0.3        # "some food" vs "chicken salad"
    },
    "consistency": {
        "matches_patterns": +0.1,   # Consistent with user history
        "reasonable_values": +0.1,  # Biologically plausible
        "contradicts_recent": -0.2   # Conflicts with recent logs
    }
}
```

**Acceptance Criteria:**
- [ ] Multi-factor confidence calculation
- [ ] Proper score calibration (0-1 range)
- [ ] Confidence-aware response generation
- [ ] Learning from user corrections
- [ ] All tests passing with ≥80% coverage

### Task 2.4: API Integration
**Estimated Time**: 2 hours

**TDD Sequence:**
1. **Design**: `docs/design/api_integration.md`
2. **Test**: `docs/testing/api_integration_test.md`
3. **Code**: API endpoint definitions
4. **Test**: Integration tests
5. **Implement**: Frontend-backend integration
6. **Validate**: End-to-end functionality

**Claude Code Instructions:**
1. Update `app/api/parse/route.ts` with enhanced features
2. Add error handling and validation
3. Implement proper request/response types
4. Add caching for performance
5. Test end-to-end integration

**Enhanced Parse Endpoint:**
```typescript
// POST /api/parse
interface ParseRequest {
    text: string;
    type_override?: string;
    occurred_at?: string;
    source?: 'manual' | 'voice' | 'device' | 'photo';
    user_context?: {
        recent_activities: ActivityLog[];
        upcoming_events: Event[];
        preferences: UserPreferences;
    };
}

interface ParseResponse {
    activities: ParsedActivity[];
    insights: AIInsight[];
    clarifying_questions: string[];
    confidence_summary: {
        overall: number;
        by_activity: number[];
    };
    processing_time_ms: number;
}
```

**Acceptance Criteria:**
- [ ] Enhanced API endpoints working
- [ ] Proper TypeScript types throughout
- [ ] Error handling and validation
- [ ] Performance optimization (caching)
- [ ] Integration tests passing
- [ ] End-to-end functionality verified

---

## 🏗️ Week 3: AI Coach & Insights

### Task 3.1: Insight Generation System
**Estimated Time**: 5 hours

**TDD Sequence:**
1. **Design**: `docs/design/insight_generation.md`
2. **Test**: `docs/testing/insight_generation_test.md`
3. **Code**: Insight service interfaces
4. **Test**: Insight quality and relevance tests
5. **Implement**: AI insight generation
6. **Validate**: Insight accuracy and helpfulness

**Claude Code Instructions:**
1. Create new `services/insights.py`
2. Implement daily insight generation
3. Add insight prioritization algorithm
4. Include user feedback integration
5. Add insight expiration and cleanup

**Insight Generation Logic:**
```python
class InsightGenerator:
    def generate_daily_insights(self, user_id: str) -> List[AIInsight]:
        """Generate 2-3 top insights for user's current context"""
        
        # Get user context
        recent_activities = self._get_recent_activities(user_id, days=7)
        user_profile = self._get_user_profile(user_id)
        upcoming_events = self._get_upcoming_events(user_id)
        
        # Apply all relevant rules
        applicable_rules = self.rule_engine.get_applicable_rules(
            activities=recent_activities,
            profile=user_profile,
            upcoming=upcoming_events
        )
        
        # Generate and prioritize insights
        insights = []
        for rule in applicable_rules:
            if rule.confidence_score >= rule.confidence_threshold:
                insight = self._generate_insight_from_rule(rule, user_context)
                insights.append(insight)
        
        # Prioritize by importance and relevance
        prioritized = self._prioritize_insights(insights)
        
        # Return top 2-3 insights
        return prioritized[:3]
```

**Insight Categories:**
- **Advice**: Actionable recommendations
- **Encouragement**: Positive reinforcement
- **Warning**: Potential issues or risks
- **Pattern**: Observed trends in user data

**Acceptance Criteria:**
- [ ] Daily insight generation working
- [ ] Proper prioritization algorithm
- [ ] User feedback integration
- [ ] Insight quality scoring
- [ ] All tests passing with ≥80% coverage

### Task 3.2: Coach Chat Interface
**Estimated Time**: 4 hours

**TDD Sequence:**
1. **Design**: `docs/design/coach_chat.md`
2. **Test**: `docs/testing/coach_chat_test.md`
3. **Code**: Chat component interfaces
4. **Test**: Chat functionality tests
5. **Implement**: Conversational AI interface
6. **Validate**: Chat quality and helpfulness

**Claude Code Instructions:**
1. Create `components/coach/CoachChat.tsx`
2. Implement context-aware responses
3. Add conversation history
4. Include follow-up suggestions
5. Add safety disclaimers for medical advice

**Chat Features:**
```typescript
interface CoachChatProps {
    userId: string;
    conversationId?: string;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: {
        referenced_activities: string[];
        rule_cards_used: string[];
        confidence_score: number;
    };
    follow_up_suggestions?: string[];
}
```

**Example Conversations to Handle:**
- "Should I eat carbs before my tennis match?"
- "Why am I always sore after leg day?"
- "Is my training load too high?"
- "What should I focus on for recovery?"

**Acceptance Criteria:**
- [ ] Context-aware chat responses
- [ ] Proper conversation history
- [ ] Follow-up suggestions working
- [ ] Safety disclaimers included
- [ ] Component tests with ≥80% coverage

### Task 3.3: AI Coach Page
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/coach_page.md`
2. **Test**: `docs/testing/coach_page_test.md`
3. **Code**: Page component structure
4. **Test**: Page functionality tests
5. **Implement**: Complete coach page
6. **Validate**: User experience flow

**Claude Code Instructions:**
1. Create `app/coach/page.tsx`
2. Display daily insights with proper formatting
3. Add insight interaction (helpful/not helpful)
4. Include quick stats and streaks
5. Add navigation to other pages

**Page Layout:**
```typescript
interface CoachPageData {
    daily_insights: AIInsight[];
    quick_stats: {
        recent_activities: number;
        streak_days: number;
        completion_score: number;
    };
    user_preferences: {
        insight_frequency: string;
        preferred_metrics: string[];
    };
}
```

**Required Components:**
- Welcome message with personalization
- 2-3 insight cards with actions
- Quick stats row
- Navigation to logging and dashboard

**Acceptance Criteria:**
- [ ] Daily insights displayed properly
- [ ] User feedback system working
- [ ] Quick stats accurate
- [ ] Proper navigation between pages
- [ ] Page tests with ≥80% coverage

### Task 3.4: Insight Feedback System
**Estimated Time**: 2 hours

**TDD Sequence:**
1. **Design**: `docs/design/feedback_system.md`
2. **Test**: `docs/testing/feedback_test.md`
3. **Code**: Feedback collection interfaces
4. **Test**: Feedback processing tests
5. **Implement**: Complete feedback loop
6. **Validate**: Learning from feedback

**Claude Code Instructions:**
1. Add feedback endpoints to backend
2. Implement feedback storage and processing
3. Create feedback UI components
4. Add learning algorithm for insight improvement
5. Include analytics for insight quality

**Feedback Collection:**
```python
# POST /api/insights/{id}/feedback
class InsightFeedback:
    insight_id: str
    helpful: bool
    followed: bool
    accuracy_rating: int  # 1-5 scale
    notes: Optional[str]
    user_id: str
    created_at: datetime
```

**Learning Algorithm:**
- Track helpful/not helpful ratios per rule
- Adjust confidence thresholds based on feedback
- Identify patterns in user corrections
- Improve rule matching accuracy over time

**Acceptance Criteria:**
- [ ] Feedback collection working
- [ ] Feedback storage and analytics
- [ ] Learning algorithm improving insights
- [ ] UI components for feedback
- [ ] All tests passing with ≥80% coverage

---

## 🏗️ Week 4: User Interface & Polish

### Task 4.1: Quick Logging Page
**Estimated Time**: 4 hours

**TDD Sequence:**
1. **Design**: `docs/design/quick_logging.md`
2. **Test**: `docs/testing/quick_logging_test.md`
3. **Code**: Logging component interfaces
4. **Test**: Input method tests
5. **Implement**: Complete logging interface
6. **Validate**: User experience optimization

**Claude Code Instructions:**
1. Create `app/log/page.tsx`
2. Implement natural language input with autocomplete
3. Add voice input with Web Speech API
4. Create quick action buttons
5. Display common logs for one-tap entry

**Logging Methods:**
```typescript
interface LoggingMethods {
    natural_input: {
        text: string;
        voice_enabled: boolean;
        autocomplete: string[];
    };
    quick_actions: {
        weight: boolean;
        sleep: boolean;
        mood: boolean;
        workout: boolean;
    };
    common_logs: {
        frequent_activities: ActivitySuggestion[];
        recent_foods: FoodSuggestion[];
    };
}
```

**Required Features:**
- Multi-line text input with auto-resize
- Voice-to-text integration
- Quick action grid (8 common activities)
- Recent/common logs section
- Real-time parsing feedback

**Acceptance Criteria:**
- [ ] Natural language input working
- [ ] Voice input functional
- [ ] Quick actions properly configured
- [ ] Common logs displayed and functional
- [ ] Page tests with ≥80% coverage

### Task 4.2: Enhanced Dashboard
**Estimated Time**: 5 hours

**TDD Sequence:**
1. **Design**: `docs/design/dashboard_enhancement.md`
2. **Test**: `docs/testing/dashboard_test.md`
3. **Code**: Widget system interfaces
4. **Test**: Widget rendering and data tests
5. **Implement**: Dynamic dashboard system
6. **Validate**: Personalization accuracy

**Claude Code Instructions:**
1. Enhance existing `app/dashboard/page.tsx`
2. Create widget system with 6 core widget types
3. Implement user-specific widget selection
4. Add timeframe controls (7d, 30d, 3m)
5. Include data visualization with charts

**Core Widget Types:**
```typescript
type WidgetType = 
    | 'weight_trend'
    | 'training_load' 
    | 'nutrition_balance'
    | 'sleep_quality'
    | 'mood_tracking'
    | 'performance_metrics';

interface Widget {
    type: WidgetType;
    title: string;
    data: WidgetData;
    config: WidgetConfig;
    priority: number;
}
```

**Personalization Logic:**
- Weight loss goal → Weight trend + Nutrition widgets
- Performance goal → Training load + Recovery widgets
- Strength training → Progression + Protein widgets
- Endurance sport → Cardio metrics + Hydration widgets

**Acceptance Criteria:**
- [ ] 6 widget types implemented
- [ ] User-specific widget selection
- [ ] Proper data visualization
- [ ] Timeframe controls working
- [ ] Dashboard tests with ≥80% coverage

### Task 4.3: User Profile System
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/user_profile.md`
2. **Test**: `docs/testing/profile_test.md`
3. **Code**: Profile management interfaces
4. **Test**: Profile validation tests
5. **Implement**: Complete profile system
6. **Validate**: Personalization impact

**Claude Code Instructions:**
1. Create `app/profile/page.tsx`
2. Implement profile form with validation
3. Add completion score calculation
4. Create preferences panel
5. Include integration settings

**Profile Sections:**
```typescript
interface UserProfile {
    basic_info: {
        age?: number;
        gender?: string;
        activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    };
    goals: {
        primary_goal: 'weight_loss' | 'muscle_gain' | 'performance' | 'health';
        target_weight?: number;
        sport_type: 'endurance' | 'strength' | 'skill_sport' | 'general';
        training_frequency: number;
    };
    preferences: {
        dietary_restrictions: string[];
        food_allergies: string[];
        notification_frequency: 'daily' | 'weekly' | 'as_needed';
        preferred_units: 'metric' | 'imperial';
    };
    completion_score: number; // 0-100%
}
```

**Completion Score Calculation:**
- Basic info: 30% weight
- Goals: 40% weight
- Preferences: 20% weight
- Integration setup: 10% weight

**Acceptance Criteria:**
- [ ] Profile form with proper validation
- [ ] Completion score accurate
- [ ] Preferences affecting personalization
- [ ] Integration settings functional
- [ ] Profile tests with ≥80% coverage

### Task 4.4: Mobile Optimization
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/mobile_optimization.md`
2. **Test**: `docs/testing/mobile_test.md`
3. **Code**: Responsive design updates
4. **Test**: Mobile interaction tests
5. **Implement**: Mobile-first improvements
6. **Validate**: Cross-device functionality

**Claude Code Instructions:**
1. Update all components for mobile responsiveness
2. Implement touch-optimized interactions
3. Add bottom navigation for mobile
4. Optimize loading performance
5. Test on multiple screen sizes

**Mobile Requirements:**
- Minimum touch target: 44x44px
- Readable text without zoom
- Single-column layout for narrow screens
- Swipe gestures for navigation
- Optimized keyboard input

**Breakpoint Strategy:**
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */

@media (max-width: 767px) {
    /* Mobile-first styles */
}

@media (min-width: 768px) and (max-width: 1023px) {
    /* Tablet styles */
}

@media (min-width: 1024px) {
    /* Desktop styles */
}
```

**Acceptance Criteria:**
- [ ] All pages responsive across breakpoints
- [ ] Touch interactions optimized
- [ ] Performance optimized for mobile
- [ ] Navigation appropriate for screen size
- [ ] Mobile tests with ≥80% coverage

### Task 4.5: Integration Testing & Polish
**Estimated Time**: 3 hours

**TDD Sequence:**
1. **Design**: `docs/design/integration_testing.md`
2. **Test**: `docs/testing/integration_test.md`
3. **Code**: End-to-end test scenarios
4. **Test**: Complete user journey tests
5. **Implement**: Bug fixes and polish
6. **Validate**: MVP readiness

**Claude Code Instructions:**
1. Create comprehensive integration tests
2. Test complete user journeys
3. Fix any discovered bugs
4. Optimize performance bottlenecks
5. Verify all acceptance criteria met

**User Journey Tests:**
```typescript
describe('Complete User Journey', () => {
    it('New user onboarding to first insight', async () => {
        // 1. Sign up new user
        // 2. Complete profile setup
        // 3. Log first activity
        // 4. Receive first insight
        // 5. Provide feedback
    });
    
    it('Daily usage flow', async () => {
        // 1. Check coach page for insights
        // 2. Log multiple activities
        // 3. View updated dashboard
        // 4. Use chat for question
    });
    
    it('Voice logging workflow', async () => {
        // 1. Use voice input for logging
        // 2. Verify parsing accuracy
        // 3. Check confidence scores
        // 4. Review generated insights
    });
});
```

**Performance Targets:**
- Page load time: <3 seconds on mobile
- Parse response time: <500ms
- Dashboard data load: <1 second
- 99%+ uptime during testing

**Acceptance Criteria:**
- [ ] All user journeys working end-to-end
- [ ] Performance targets met
- [ ] No critical bugs remaining
- [ ] All MVP features functional
- [ ] Ready for beta user testing

---

## 🎯 MVP Success Metrics

### Technical Metrics
| Metric | Target | Validation Method |
|--------|--------|------------------|
| Test Coverage | ≥80% | `npm run test:coverage` |
| Parse Accuracy | ≥80% | User correction rate <20% |
| Response Time | <500ms | API monitoring |
| Mobile Performance | <3s load | Lighthouse audit |

### User Experience Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Activity Logging | <30s per entry | User journey testing |
| Insight Helpfulness | ≥70% helpful ratings | Beta user feedback |
| Profile Completion | ≥80% of beta users | Analytics tracking |
| Feature Discovery | ≥60% use voice input | Usage analytics |

### Feature Completeness
- [ ] Natural language parsing with confidence
- [ ] AI coach with daily insights
- [ ] Quick logging with multiple methods
- [ ] Personalized dashboard widgets
- [ ] Complete user profile system
- [ ] Mobile-optimized responsive design

---

## 🔄 Continuous Integration

**Daily Testing:**
```bash
# Run all tests
npm run test
cd feelsharper-backend && python -m pytest

# Check coverage
npm run test:coverage
cd feelsharper-backend && python -m pytest --cov

# Type checking
npm run typecheck

# Linting
npm run lint
cd feelsharper-backend && flake8 .
```

**Pre-deployment Checklist:**
- [ ] All tests passing
- [ ] Coverage ≥80%
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Performance targets met
- [ ] Mobile responsiveness verified

---

## 📝 Documentation Requirements

**Required Documentation Updates:**
- [ ] API documentation with examples
- [ ] Component documentation with props
- [ ] Database schema documentation
- [ ] Testing documentation with coverage
- [ ] Deployment documentation
- [ ] User guide for beta testing

**File Locations:**
- `docs/api/` - API endpoint documentation
- `docs/components/` - Component usage guides
- `docs/testing/` - Test strategies and coverage
- `docs/deployment/` - Deployment procedures
- `docs/user-guide/` - Beta user documentation

---

## ✅ Definition of Done

**For each task to be considered complete:**
- [ ] TDD sequence followed exactly
- [ ] All tests passing with ≥80% coverage
- [ ] Issue tracking updated throughout
- [ ] Documentation updated
- [ ] Code reviewed for quality
- [ ] Integration tested end-to-end
- [ ] Performance validated
- [ ] Mobile responsiveness verified

**For MVP completion:**
- [ ] All 20 tasks completed successfully
- [ ] Beta testing environment ready
- [ ] Monitoring and analytics in place
- [ ] User onboarding flow working
- [ ] Support documentation available

---

*This MVP plan provides Claude Code with precise, executable instructions to build FeelSharper's core functionality. Every task follows TDD methodology and issue tracking requirements. The result will be a production-ready MVP with 80%+ test coverage and validated user experience.*