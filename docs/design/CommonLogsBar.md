# CommonLogsBar Feature Design
*TDD Step 1: Feature Design Document*

## Feature Overview
The CommonLogsBar component provides one-tap quick logging for frequently used activities. It displays the user's most common logs as buttons for instant re-logging without typing or voice input.

## Business Requirements
- **Reduce logging friction**: Users should log common activities in 1 tap
- **Learn from usage**: System tracks frequency and surfaces most-used logs
- **Time efficiency**: Target <2 seconds from tap to logged
- **Mobile-first**: Touch-friendly, thumb-reachable on mobile

## User Stories
1. As a user, I want to see my most frequent logs as buttons so I can log them quickly
2. As a user, I want to tap once to re-log my morning coffee routine
3. As a user, I want the system to learn what I log most often
4. As a user, I want to customize which logs appear in my quick bar
5. As a user, I want visual feedback when I tap a quick log

## Functional Requirements

### Display Requirements
- Show 5-10 most frequent logs as buttons
- Each button displays:
  - Icon representing the activity type
  - Short label (e.g., "Morning coffee", "5k run")
  - Optional: Last logged time
- Horizontal scrollable on mobile
- Grid layout on desktop

### Interaction Requirements
- Single tap to log the exact same activity
- Long press to edit the activity before logging
- Swipe to remove from quick logs (mobile)
- Right-click to remove (desktop)
- Visual feedback on tap (scale animation + haptic on mobile)

### Data Requirements
- Track frequency of each unique log
- Update frequency counts in real-time
- Persist quick logs in local storage for instant load
- Sync with database for cross-device consistency
- Minimum 3 uses before appearing in quick logs

### Customization Requirements
- User can pin specific logs to always show
- User can hide specific logs from appearing
- User can reorder quick logs manually
- User can set max number to display (5-10)

## Technical Requirements

### Performance
- Initial render <100ms
- Tap response <50ms
- Local storage cache for instant display
- Background sync with database
- Optimistic UI updates

### Accessibility
- Minimum 44px touch targets
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Focus indicators

### Responsive Design
- Mobile: Horizontal scroll, 2 rows max
- Tablet: Grid 2x5
- Desktop: Single row, all visible

## UI/UX Specifications

### Visual Design (Following Sharpened Brand)
- Sharp angular containers with clip-path
- Lightning bolt accent on hover
- Dark background (#0A0A0A)
- Blue accent color (#4169E1)
- Electric glow on interaction

### Layout Structure
```
[CommonLogsBar Container]
  [QuickLogButton] [QuickLogButton] [QuickLogButton] [...]
  - Icon (24x24)
  - Label (12px)
  - Frequency badge (optional)
```

### States
- Default: Semi-transparent background
- Hover: Electric blue glow
- Active: Scale down + brightness
- Disabled: 50% opacity
- Loading: Pulse animation

## Data Flow

### Frequency Tracking
1. User logs activity via any method
2. System extracts normalized activity signature
3. Increment frequency counter for that signature
4. Check if meets threshold for quick logs
5. Update CommonLogsBar if needed

### Quick Log Execution
1. User taps quick log button
2. Button shows loading state
3. Send exact activity to parse endpoint
4. Save to database
5. Show success feedback (toast)
6. Update button state

## Success Metrics
- Average time to log: <2 seconds
- Quick logs usage: >40% of all logs
- User retention: +20% for users with quick logs
- Error rate: <1% of quick log attempts

## Edge Cases
- No common logs yet (new user)
- Database sync failure
- Parse endpoint timeout
- Duplicate activities with slight variations
- User clears browser data
- Cross-device sync conflicts

## Dependencies
- Parse API endpoint
- Activity logs database table
- Local storage API
- Toast notification system
- User preferences system

## Future Enhancements
- Smart suggestions based on time of day
- Predictive quick logs (e.g., "Time for lunch?")
- Quick log templates (e.g., "Workout: [duration]")
- Voice confirmation option
- Batch logging multiple activities

## Acceptance Criteria
- [ ] Displays 5-10 most frequent logs
- [ ] Single tap logs activity in <2 seconds
- [ ] Updates frequency tracking in real-time
- [ ] Works on mobile Safari, Chrome
- [ ] Accessible via keyboard
- [ ] Sharp angular design matches brand
- [ ] 80% test coverage
- [ ] No performance regression