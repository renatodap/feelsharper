# MVP UI Structure Feature Design
*TDD Step 1: Feature Design Document*

## Feature Overview
Complete MVP implementation of FeelSharper with three core pages (/insights, /log, /dashboard) plus settings slide-over. Focus on minimal viable functionality with strong user experience.

## Business Requirements
- **Ship in 3 weeks**: Minimal features that actually work
- **Zero friction logging**: < 5 seconds from intent to logged
- **Actionable insights**: 2-3 high-value insights maximum
- **Auto-preset dashboard**: Smart defaults based on user behavior
- **Mobile-first**: Works perfectly on phones

## Core Pages

### 1. /insights - AI Coach (Light)
**Purpose**: Surface 2-3 highest-leverage actions based on recent logs

#### Requirements
- Display 2-3 insight cards maximum
- Show single critical question banner
- Provide micro-chat for single-turn Q&A
- Refresh insights on demand
- Snooze/dismiss capabilities
- Date range selector (7/14/30 days)

#### Key Features
- **Insight Cards**: Title, severity, action button, expand for details
- **Critical Question**: Single choice with chips
- **Ask Coach**: One-line input, one-paragraph response
- **Evidence**: Show which logs triggered the insight

### 2. /log - Quick Log
**Purpose**: Unified entry point for all logging with < 5 second time-to-log

#### Requirements
- Natural language input (text + voice)
- Quick action bar for repeats
- Manual form fallbacks
- History feed with edit/delete
- Parse preview with confidence
- Backdate capability

#### Key Features
- **UnifiedNaturalInput**: Text + mic with parse on enter
- **CommonLogsBar**: One-tap repeats (already implemented)
- **ParsePreview**: Show extracted fields before save
- **History Feed**: Last 30 logs with filters
- **Manual Forms**: Food, workout, weight, water, sleep

### 3. /dashboard - Auto-Preset Widgets
**Purpose**: Show only what matters based on detected persona

#### Requirements
- Auto-detect persona (Endurance/Strength/Tennis/Weight/Wellness)
- Display 4 core widgets
- Allow override of persona
- Toggle additional widgets via side panel
- Time range selector

#### Key Features
- **Core Widgets**: Streak, Weight Trend, Training Volume, Recovery
- **Optional Widgets**: Hydration, Protein, Tennis-specific, Adherence
- **Side Panel**: Toggle available widgets on/off
- **Auto-Preset**: AI selects best widgets for user

### 4. Settings - Slide-Over
**Purpose**: Minimal control center without full page

#### Requirements
- Slide from right on avatar click
- Profile management
- Units & display preferences
- Goals configuration
- Data export/delete

#### Key Features
- **Profile**: Name, email, provider badges
- **Units**: Weight, distance, volume, time format
- **Goals**: Target weight, training days, sleep, hydration
- **Preferences**: Persona preset, coaching style
- **Privacy**: Export data, delete account

## Data Architecture

### Database Tables (Using Existing Schema)
```sql
-- Primary tables we'll use
activity_logs - All logged activities with parsed data
profiles - User preferences and settings
body_measurements - Weight tracking
workout_logs - Exercise tracking
food_logs - Nutrition tracking
sleep_logs - Sleep data

-- New table needed
insights (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  rule_id text,
  title text,
  body text,
  severity text CHECK (severity IN ('info', 'warning', 'critical')),
  evidence_json jsonb,
  snoozed_until timestamp,
  created_at timestamp DEFAULT now()
)

user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  units_weight text DEFAULT 'lbs',
  units_distance text DEFAULT 'mi',
  units_volume text DEFAULT 'oz',
  time_format text DEFAULT '12h',
  persona_preset text DEFAULT 'auto',
  goals_json jsonb,
  coaching_style text DEFAULT 'direct',
  reminder_time time,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

common_logs (
  -- Materialized view from activity_logs
  -- Groups by raw_text, counts frequency
  -- Used for CommonLogsBar
)
```

### API Endpoints
```
POST /api/parse - Parse natural language input
POST /api/logs - Save parsed activity
GET /api/logs - Fetch user's logs with filters
PATCH /api/logs/:id - Edit log
DELETE /api/logs/:id - Delete log

GET /api/insights - Generate insights from logs
POST /api/coach/answer - Store clarifying answer
POST /api/coach/qa - Single-turn Q&A

GET /api/dashboard - Get dashboard data
GET /api/common-logs - Get frequent logs

GET /api/export - Export user data
POST /api/preferences - Save user preferences
```

## UI/UX Specifications

### Design System (Sharpened Brand)
- **Colors**: 
  - Primary: #4169E1 (royal blue)
  - Background: #0A0A0B (near black)
  - Surface: #1A1A1B (dark gray)
  - Border: rgba(255,255,255,0.1)
  - Success: #10B981
  - Warning: #F59E0B
  - Error: #EF4444

- **Typography**:
  - Font: SF Pro Display (headings), Inter (body)
  - Sizes: 12px, 14px, 16px, 20px, 24px, 32px
  
- **Components**:
  - Sharp angular containers (clip-path polygons)
  - Electric glow effects on hover
  - Lightning bolt accents
  - Dark glass morphism effects

### Responsive Breakpoints
- Mobile: < 768px (bottom nav, vertical stack)
- Tablet: 768-1024px (hybrid layout)
- Desktop: > 1024px (side nav, horizontal layout)

### Navigation Structure
- **Desktop**: Top app bar with Insights • Log • Dashboard, avatar right
- **Mobile**: Bottom tab bar with same options, avatar in header

## Technical Requirements

### Performance Targets
- Initial load: < 2 seconds
- Time to interactive: < 3 seconds
- Parse response: < 500ms
- Dashboard render: < 100ms
- Insight generation: < 1 second

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Touch targets ≥ 44px
- Color contrast ratios ≥ 4.5:1

## Implementation Priority

### Week 1: Foundation
1. Database migrations for new tables
2. Core API endpoints
3. /log page with UnifiedNaturalInput
4. ParsePreview component
5. Basic /api/parse implementation

### Week 2: Intelligence
1. /insights page with rule engine
2. Insight card components
3. Coach micro-chat
4. /dashboard with auto-preset
5. Widget components

### Week 3: Polish
1. Settings slide-over
2. Data export/import
3. Performance optimization
4. Mobile responsiveness
5. Error handling

## Success Metrics
- Time to log: < 5 seconds (measured)
- Daily active users: > 60% (tracked)
- Logs per user per day: > 3 (average)
- Insight engagement: > 40% expand rate
- Parse accuracy: > 85% confidence

## Edge Cases to Handle
- No logs yet (empty states)
- Parse failures (fallback to manual)
- Offline mode (queue and sync)
- Conflicting data (database as truth)
- Rate limiting (exponential backoff)

## What We're NOT Building
- Full conversational AI chat
- Deep dashboard customization
- External integrations (HealthKit, etc)
- Nutrition database lookups
- Push notifications (stub only)
- Social features
- Payment processing
- Multi-user support

## Acceptance Criteria
- [ ] All 3 pages functional
- [ ] Natural language input works
- [ ] Insights generate correctly
- [ ] Dashboard auto-presets work
- [ ] Settings save properly
- [ ] Mobile responsive
- [ ] 80% test coverage
- [ ] < 3 second load time