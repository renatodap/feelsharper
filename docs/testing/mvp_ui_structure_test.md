# MVP UI Structure Test Design
*TDD Step 2: Test Design Document*

## Test Strategy
Comprehensive testing of all MVP pages focusing on user flows, data management, API integration, and accessibility.

## Test Categories by Page

### 1. /insights Page Tests

#### Component Rendering Tests
```typescript
describe('InsightsPage', () => {
  test('Should render with no insights for new user')
  test('Should display maximum 3 insight cards')
  test('Should show date range selector with correct options')
  test('Should display critical question banner when applicable')
  test('Should render Ask Coach micro-chat input')
  test('Should apply Sharpened brand styling')
})
```

#### Insight Generation Tests
```typescript
describe('Insight Generation', () => {
  test('Should generate insights from activity logs')
  test('Should prioritize insights by severity')
  test('Should not show snoozed insights')
  test('Should refresh insights on button click')
  test('Should update insights when date range changes')
})
```

#### Interaction Tests
```typescript
describe('Insight Interactions', () => {
  test('Should expand insight card on click')
  test('Should show evidence when expanded')
  test('Should execute primary action on button click')
  test('Should snooze insight for 7 days')
  test('Should dismiss insight permanently')
})
```

#### Coach Tests
```typescript
describe('Coach Features', () => {
  test('Should answer critical question and update insights')
  test('Should process Ask Coach question')
  test('Should return single paragraph response')
  test('Should ground response in recent logs')
  test('Should show related logs link')
})
```

### 2. /log Page Tests

#### Natural Language Input Tests
```typescript
describe('UnifiedNaturalInput', () => {
  test('Should parse text input on Enter')
  test('Should handle voice input via mic button')
  test('Should show ParsePreview before saving')
  test('Should display confidence badge')
  test('Should allow inline editing of parsed fields')
  test('Should support backdating')
})
```

#### Quick Actions Tests
```typescript
describe('Quick Actions', () => {
  test('Should display CommonLogsBar with frequent logs')
  test('Should log activity on quick button tap')
  test('Should update frequency on repeat log')
  test('Should pin/unpin quick logs')
  test('Should show manual form options')
})
```

#### History Feed Tests
```typescript
describe('History Feed', () => {
  test('Should display last 30 logs')
  test('Should filter by activity type')
  test('Should search across logs')
  test('Should edit log in DetailDrawer')
  test('Should delete with undo option')
  test('Should report bad parse')
})
```

#### Parse API Tests
```typescript
describe('Parse API', () => {
  test('Should extract food from text')
  test('Should extract exercise from text')
  test('Should extract weight from text')
  test('Should handle ambiguous input')
  test('Should return confidence score')
  test('Should handle multiple activities in one input')
})
```

### 3. /dashboard Page Tests

#### Auto-Preset Tests
```typescript
describe('Dashboard Auto-Preset', () => {
  test('Should detect Endurance persona from running logs')
  test('Should detect Strength persona from lifting logs')
  test('Should detect Tennis persona from tennis logs')
  test('Should detect Weight Management from weight logs')
  test('Should allow manual override of persona')
})
```

#### Widget Tests
```typescript
describe('Dashboard Widgets', () => {
  test('Should display 4 core widgets')
  test('Should calculate streak correctly')
  test('Should show weight trend sparkline')
  test('Should sum training volume')
  test('Should calculate sleep debt')
  test('Should update when date range changes')
})
```

#### Side Panel Tests
```typescript
describe('Widget Management', () => {
  test('Should toggle widgets on/off')
  test('Should persist widget preferences')
  test('Should show why widget suggested')
  test('Should restore defaults')
  test('Should limit to reasonable number of widgets')
})
```

### 4. Settings Slide-Over Tests

#### Slide-Over Behavior Tests
```typescript
describe('Settings SlideOver', () => {
  test('Should slide from right on avatar click')
  test('Should close on X or outside click')
  test('Should trap focus when open')
  test('Should prevent body scroll when open')
  test('Should animate smoothly')
})
```

#### Settings Management Tests
```typescript
describe('Settings Management', () => {
  test('Should display current user profile')
  test('Should update units preferences')
  test('Should save goals')
  test('Should change persona preset')
  test('Should export data as JSON')
  test('Should soft delete account')
})
```

### 5. API Integration Tests

#### Data Flow Tests
```typescript
describe('API Integration', () => {
  test('POST /api/parse returns parsed data')
  test('POST /api/logs saves to database')
  test('GET /api/logs returns user logs')
  test('GET /api/insights generates insights')
  test('POST /api/coach/qa returns response')
  test('GET /api/dashboard returns widget data')
  test('GET /api/common-logs returns frequencies')
})
```

#### Error Handling Tests
```typescript
describe('Error Handling', () => {
  test('Should handle parse API failure gracefully')
  test('Should queue logs when offline')
  test('Should retry with exponential backoff')
  test('Should show error toasts')
  test('Should fall back to manual entry')
})
```

### 6. Performance Tests

```typescript
describe('Performance', () => {
  test('Should load page in < 2 seconds')
  test('Should parse in < 500ms')
  test('Should render dashboard in < 100ms')
  test('Should generate insights in < 1 second')
  test('Should not block main thread')
  test('Should lazy load heavy components')
})
```

### 7. Accessibility Tests

```typescript
describe('Accessibility', () => {
  test('Should be fully keyboard navigable')
  test('Should have proper ARIA labels')
  test('Should meet color contrast requirements')
  test('Should have 44px minimum touch targets')
  test('Should work with screen readers')
  test('Should support reduced motion')
})
```

### 8. Mobile Responsiveness Tests

```typescript
describe('Mobile Responsiveness', () => {
  test('Should show bottom tab nav on mobile')
  test('Should stack widgets vertically on mobile')
  test('Should make CommonLogsBar scrollable on mobile')
  test('Should optimize touch interactions')
  test('Should handle orientation changes')
})
```

## Mock Data Requirements

### MockUser
```typescript
interface MockUser {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}
```

### MockActivityLog
```typescript
interface MockActivityLog {
  id: string;
  user_id: string;
  type: 'weight' | 'food' | 'exercise' | 'sleep' | 'water' | 'mood' | 'other';
  raw_text: string;
  parsed_data: any;
  confidence: number;
  timestamp: Date;
}
```

### MockInsight
```typescript
interface MockInsight {
  id: string;
  rule_id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  evidence_json: any;
  snoozed_until: Date | null;
}
```

### MockDashboardData
```typescript
interface MockDashboardData {
  streak: number;
  weight_trend: number[];
  training_volume: number;
  sleep_debt: number;
  persona: string;
}
```

## Test Utilities Needed

### MockSupabaseClient
```typescript
class MockSupabaseClient {
  auth = {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
  };
  from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }));
}
```

### MockFetch
```typescript
global.fetch = jest.fn((url: string) => {
  const responses = {
    '/api/parse': { type: 'exercise', confidence: 0.9 },
    '/api/insights': [mockInsight1, mockInsight2],
    '/api/dashboard': mockDashboardData
  };
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(responses[url])
  });
});
```

### TestWrapper
```typescript
const TestWrapper = ({ children }) => (
  <AuthProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AuthProvider>
);
```

## Test Execution Plan

### Phase 1: Unit Tests
1. Component rendering tests
2. Hook logic tests
3. Utility function tests
4. API endpoint tests

### Phase 2: Integration Tests
1. User flow tests (log → insight → dashboard)
2. Data persistence tests
3. API integration tests
4. Auth flow tests

### Phase 3: E2E Tests
1. Complete user journey
2. Cross-browser testing
3. Mobile device testing
4. Performance benchmarks

## Coverage Requirements
- Line coverage: ≥80%
- Branch coverage: ≥75%
- Function coverage: ≥80%
- Statement coverage: ≥80%

## Critical User Flows to Test

### Flow 1: First Time User
1. Sign up → Empty dashboard
2. Log first activity → See in history
3. Log 3+ activities → Generate first insight
4. View dashboard → See auto-preset widgets

### Flow 2: Quick Logging
1. Open /log
2. Type "ran 5k"
3. See parse preview
4. Confirm → See success toast
5. Activity appears in history

### Flow 3: Voice Logging
1. Open /log
2. Tap mic button
3. Say "bench pressed 185 pounds"
4. See transcription
5. Confirm parse → Saved

### Flow 4: Insight Interaction
1. View /insights
2. See top insight
3. Expand for details
4. Take suggested action
5. Insight updates

## Success Criteria
- All tests pass
- Coverage meets requirements
- No console errors/warnings
- Accessibility audit passes
- Performance benchmarks met
- Works on target browsers/devices
- User flows complete successfully