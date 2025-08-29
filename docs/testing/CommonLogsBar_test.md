# CommonLogsBar Test Design
*TDD Step 2: Test Design Document*

## Test Strategy
Comprehensive testing of the CommonLogsBar component focusing on rendering, interaction, data management, and accessibility.

## Test Categories

### 1. Component Rendering Tests

#### Test: Should render with no quick logs (new user)
- **Given**: User has no log history
- **When**: Component mounts
- **Then**: Display empty state with helpful message

#### Test: Should render quick logs from frequency data
- **Given**: User has logs with varying frequencies
- **When**: Component mounts with frequency data
- **Then**: Display top 5-10 logs sorted by frequency

#### Test: Should apply Sharpened brand styling
- **Given**: Component is rendered
- **When**: Inspecting DOM elements
- **Then**: Has clip-path, dark background, blue accents

#### Test: Should render icons for each activity type
- **Given**: Quick logs with different activity types
- **When**: Component renders
- **Then**: Each button shows appropriate icon

### 2. Interaction Tests

#### Test: Should log activity on button click
- **Given**: Quick log button is displayed
- **When**: User clicks button
- **Then**: 
  - Call parse API with activity data
  - Show loading state
  - Display success toast
  - Update frequency count

#### Test: Should handle long press for edit
- **Given**: Quick log button is displayed
- **When**: User long presses (>500ms)
- **Then**: Open edit modal with activity details

#### Test: Should remove log on swipe (mobile)
- **Given**: Quick log button on mobile
- **When**: User swipes left on button
- **Then**: 
  - Show delete confirmation
  - Remove from quick logs on confirm

#### Test: Should show visual feedback on interaction
- **Given**: Quick log button
- **When**: User hovers/taps
- **Then**: Apply scale animation and glow effect

### 3. Data Management Tests

#### Test: Should track frequency correctly
- **Given**: User logs same activity multiple times
- **When**: Activity logged 3+ times
- **Then**: Appears in quick logs bar

#### Test: Should persist quick logs in localStorage
- **Given**: Quick logs are displayed
- **When**: Page refreshes
- **Then**: Quick logs load instantly from cache

#### Test: Should sync with database
- **Given**: Quick logs in localStorage
- **When**: Component mounts
- **Then**: Sync with database in background

#### Test: Should handle sync conflicts
- **Given**: Different data in localStorage vs database
- **When**: Sync occurs
- **Then**: Merge conflicts with database as source of truth

### 4. Customization Tests

#### Test: Should allow pinning logs
- **Given**: User pins a quick log
- **When**: Quick logs update
- **Then**: Pinned log always appears first

#### Test: Should allow hiding logs
- **Given**: User hides a quick log
- **When**: Component re-renders
- **Then**: Hidden log doesn't appear despite frequency

#### Test: Should allow reordering
- **Given**: User drags to reorder
- **When**: Drop completes
- **Then**: New order persists

#### Test: Should respect max display setting
- **Given**: User sets max to 5
- **When**: 10 logs qualify
- **Then**: Only show top 5

### 5. Performance Tests

#### Test: Should render within 100ms
- **Given**: Component with 10 quick logs
- **When**: Initial mount
- **Then**: First paint <100ms

#### Test: Should respond to tap within 50ms
- **Given**: Quick log button
- **When**: User taps
- **Then**: Visual feedback <50ms

#### Test: Should not block main thread
- **Given**: Large frequency dataset
- **When**: Processing frequencies
- **Then**: UI remains responsive

### 6. Accessibility Tests

#### Test: Should be keyboard navigable
- **Given**: Component is focused
- **When**: User presses arrow keys
- **Then**: Focus moves between buttons

#### Test: Should have ARIA labels
- **Given**: Quick log buttons
- **When**: Screen reader active
- **Then**: Announces activity name and action

#### Test: Should meet touch target size
- **Given**: Mobile viewport
- **When**: Buttons render
- **Then**: Minimum 44x44px touch targets

#### Test: Should support high contrast
- **Given**: High contrast mode active
- **When**: Component renders
- **Then**: Sufficient color contrast ratios

### 7. Error Handling Tests

#### Test: Should handle API failures gracefully
- **Given**: Parse API is down
- **When**: User taps quick log
- **Then**: 
  - Show error toast
  - Retry with exponential backoff
  - Don't lose user data

#### Test: Should handle localStorage quota exceeded
- **Given**: localStorage is full
- **When**: Trying to save quick logs
- **Then**: Clear old data and retry

#### Test: Should handle malformed data
- **Given**: Corrupted frequency data
- **When**: Component loads
- **Then**: Fall back to empty state gracefully

### 8. Responsive Design Tests

#### Test: Should adapt to mobile layout
- **Given**: Mobile viewport (<768px)
- **When**: Component renders
- **Then**: Horizontal scroll with 2 rows max

#### Test: Should adapt to tablet layout
- **Given**: Tablet viewport (768-1024px)
- **When**: Component renders
- **Then**: 2x5 grid layout

#### Test: Should adapt to desktop layout
- **Given**: Desktop viewport (>1024px)
- **When**: Component renders
- **Then**: Single row, all visible

## Mock Data Requirements

### MockQuickLog
```typescript
{
  id: string;
  activity: string;
  type: 'food' | 'exercise' | 'weight' | 'other';
  frequency: number;
  lastLogged: Date;
  isPinned: boolean;
  isHidden: boolean;
  icon: string;
  data: any; // Original parsed data
}
```

### MockFrequencyData
```typescript
{
  activities: Map<string, number>;
  lastUpdated: Date;
  totalLogs: number;
}
```

### MockUserPreferences
```typescript
{
  maxQuickLogs: number; // 5-10
  pinnedLogs: string[];
  hiddenLogs: string[];
  customOrder: string[];
}
```

## Test Utilities Needed

### MockLocalStorage
- Simulate localStorage API
- Track get/set calls
- Simulate quota exceeded

### MockParseAPI
- Simulate successful parse
- Simulate failures
- Track request data

### MockToastSystem
- Verify toast calls
- Check toast content
- Simulate user dismissal

## Coverage Requirements
- Line coverage: ≥80%
- Branch coverage: ≥75%
- Function coverage: ≥80%
- Statement coverage: ≥80%

## Test Execution Plan
1. Unit tests for helper functions
2. Component rendering tests
3. Interaction tests with mocks
4. Integration tests with real API
5. Accessibility audit
6. Performance benchmarks
7. Cross-browser testing

## Success Criteria
- All tests pass
- Coverage meets requirements
- No console errors/warnings
- Accessibility audit passes
- Performance benchmarks met
- Works on iOS Safari, Android Chrome