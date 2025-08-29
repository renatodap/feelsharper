# 📱 FeelSharper UI Components Inventory
*Complete list of UI components needed to support MVP Week 3 features*

## 🎯 Core Features Implemented (Week 3 Checkpoint)

Based on the MVP Week 3 checkpoint assessment, the following features have been implemented and need UI support:

### ✅ Feature Status Summary
- **Parsers**: EnhancedFoodParser, WorkoutParser (Working)
- **Voice Input**: UnifiedNaturalInput component (Working)
- **Rule Engine**: 20+ rule cards with insights (Working)
- **Dashboard**: 5 user-type presets with widgets (Working)
- **Storage**: Activity logs to database (Working)
- **Common Logs**: Frequency tracking (Working)

---

## 🎨 UI Components Required by Feature

### 1. 🎤 Natural Language Input System
**Feature**: Voice and text input for logging activities

#### Primary Components:
- [x] **UnifiedNaturalInput.tsx** - Main input component
  - Voice recording button with animation
  - Text input field
  - Processing indicator (dots animation)
  - Confidence score display
  - Parse result preview

#### Supporting UI Elements:
- [x] Voice wave visualization (when recording)
- [x] Processing animation (3 dots pulsing)
- [x] Parsed result cards showing:
  - Activity type icon
  - Duration/quantity
  - Calories/metrics
  - Confidence percentage
- [ ] Error state display
- [ ] Retry button for failed parses

### 2. 📊 Dashboard System
**Feature**: Dynamic dashboards with user-type presets

#### Primary Components:
- [x] **PresetSelector.tsx** - User type selection
- [x] **DashboardProvider.tsx** - State management
- [ ] **DashboardGrid.tsx** - Widget layout system

#### Widget Components Needed:
- [ ] **ActivitySummaryWidget** - Today's activities count
- [ ] **ProgressWidget** - Weekly/monthly progress
- [ ] **GoalsWidget** - Goals completion status
- [ ] **StreakWidget** - Consecutive days tracking
- [ ] **CaloriesWidget** - Intake vs burn
- [ ] **NutritionWidget** - Macros breakdown
- [ ] **WorkoutWidget** - Exercise summary
- [ ] **WeightWidget** - Weight trend chart
- [ ] **SleepWidget** - Sleep quality/duration
- [ ] **HydrationWidget** - Water intake

#### Dashboard Presets (5 Types):
1. **Endurance Athlete** - Focus on cardio, calories, hydration
2. **Strength Athlete** - Focus on protein, workouts, recovery
3. **Tennis Player** - Focus on agility, recovery, match prep
4. **Weight Management** - Focus on calories, weight trend, habits
5. **Wellness** - Focus on balance, sleep, stress, mindfulness

### 3. 💡 Insights & Rule Cards System
**Feature**: AI-generated insights based on activity patterns

#### Primary Components:
- [ ] **InsightCard.tsx** - Individual insight display
- [ ] **InsightsFeed.tsx** - List of insights
- [ ] **RuleCardDisplay.tsx** - Rule card visualization

#### UI Elements for Each Insight:
- [ ] Icon representing insight type
- [ ] Title and description
- [ ] Action button (if applicable)
- [ ] Severity/importance indicator
- [ ] Time relevance (e.g., "Based on last 7 days")
- [ ] Dismiss/bookmark options

#### Clarifying Questions UI:
- [ ] **QuestionPrompt.tsx** - Single question display
- [ ] Answer input options (buttons, text, slider)
- [ ] Skip option
- [ ] Context about why asking

### 4. 📝 Activity Logging Pages
**Feature**: Three main pages for user interaction

#### /log Page Components:
- [x] UnifiedNaturalInput (main input)
- [ ] **CommonLogsBar.tsx** - Frequent logs as quick buttons
- [ ] **RecentLogs.tsx** - Last 5-10 logs for reference
- [ ] **LogConfirmation.tsx** - Success feedback

#### /insights Page Components:
- [ ] **InsightsFeed.tsx** - Main insights list
- [ ] **InsightFilters.tsx** - Filter by category
- [ ] **InsightDetails.tsx** - Expanded view
- [ ] **ActionButtons.tsx** - Act on insights

#### /dashboard Page Components:
- [x] Dashboard grid with widgets
- [x] Preset selector
- [ ] **TimeRangeSelector.tsx** - Today/Week/Month/Year
- [ ] **ExportButton.tsx** - Export data option
- [ ] **CustomizeButton.tsx** - Rearrange widgets

### 5. 🔄 Common/Quick Logs System
**Feature**: One-tap logging for frequent activities

#### Components:
- [ ] **QuickLogButton.tsx** - Individual quick log
- [ ] **QuickLogsGrid.tsx** - Grid of common logs
- [ ] **LogFrequencyTracker.tsx** - Background tracking

#### UI Elements:
- [ ] Icon for each common activity
- [ ] Label (e.g., "Morning coffee")
- [ ] Last logged time
- [ ] Tap animation/feedback
- [ ] Edit/customize option

### 6. 🔐 Authentication & User Management
**Feature**: User accounts and personalization

#### Components:
- [x] **/signin Page** - Sign in form
- [x] **/signup Page** - Registration form
- [ ] **UserMenu.tsx** - Profile dropdown
- [ ] **SettingsPage.tsx** - User preferences

#### UI Elements:
- [x] Email/password inputs
- [x] Google OAuth button
- [ ] Profile picture/avatar
- [ ] Username display
- [ ] Sign out button
- [ ] Settings gear icon

### 7. 📈 Data Visualization
**Feature**: Charts and graphs for progress tracking

#### Components:
- [ ] **LineChart.tsx** - Weight/metrics over time
- [ ] **BarChart.tsx** - Daily calories/activities
- [ ] **PieChart.tsx** - Macros breakdown
- [ ] **ProgressRing.tsx** - Goal completion
- [ ] **Sparkline.tsx** - Mini trend indicators

### 8. 🔔 Feedback & Notifications
**Feature**: User feedback for actions

#### Components:
- [ ] **Toast.tsx** - Success/error messages
- [ ] **LoadingSpinner.tsx** - Processing indicator
- [ ] **EmptyState.tsx** - No data displays
- [ ] **ErrorBoundary.tsx** - Error handling
- [ ] **SuccessAnimation.tsx** - Completion feedback

### 9. 📱 Mobile-Specific Components
**Feature**: Mobile-optimized experience

#### Components:
- [ ] **MobileNav.tsx** - Bottom navigation
- [ ] **SwipeableCards.tsx** - Swipe through insights
- [ ] **PullToRefresh.tsx** - Refresh gesture
- [ ] **FloatingActionButton.tsx** - Quick log button

### 10. 🎨 Design System Components
**Feature**: Consistent UI elements

#### Base Components:
- [x] **Button** - Primary, secondary, ghost variants
- [x] **Card** - Container with shadows
- [x] **Input** - Text input fields
- [ ] **Select** - Dropdown menus
- [ ] **Modal** - Overlay dialogs
- [ ] **Tabs** - Tab navigation
- [ ] **Badge** - Status indicators
- [ ] **Avatar** - User images
- [ ] **Skeleton** - Loading placeholders

---

## 🚨 Critical Missing UI Components

### Must Have for MVP (Week 3):
1. **CommonLogsBar** - Quick logging is core feature
2. **InsightCard** - Display rule card insights
3. **Dashboard Widgets** - At least 3-4 basic widgets
4. **Toast Notifications** - User feedback
5. **Mobile Navigation** - Bottom nav for mobile

### Nice to Have (Post-MVP):
1. **Data visualization charts**
2. **Customizable dashboard**
3. **Export functionality**
4. **Advanced settings**
5. **Social features**

---

## 📐 UI Component Architecture

```
src/components/
├── core/                    # Base design system
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ...
├── features/               # Feature-specific
│   ├── logging/
│   │   ├── UnifiedNaturalInput.tsx
│   │   ├── CommonLogsBar.tsx
│   │   └── QuickLogButton.tsx
│   ├── insights/
│   │   ├── InsightCard.tsx
│   │   ├── InsightsFeed.tsx
│   │   └── RuleCardDisplay.tsx
│   ├── dashboard/
│   │   ├── DashboardProvider.tsx
│   │   ├── PresetSelector.tsx
│   │   └── widgets/
│   │       ├── ActivityWidget.tsx
│   │       ├── ProgressWidget.tsx
│   │       └── ...
│   └── auth/
│       ├── SignInForm.tsx
│       └── UserMenu.tsx
├── layout/                 # Layout components
│   ├── Header.tsx
│   ├── MobileNav.tsx
│   └── Footer.tsx
└── feedback/              # User feedback
    ├── Toast.tsx
    ├── LoadingSpinner.tsx
    └── EmptyState.tsx
```

---

## 🎯 Implementation Priority

### Phase 1 (Immediate - Week 3):
1. Fix existing components (UnifiedNaturalInput, Dashboard)
2. Add CommonLogsBar for quick logging
3. Create basic InsightCard component
4. Implement 3-4 dashboard widgets
5. Add Toast notifications

### Phase 2 (Beta Launch):
1. Polish mobile experience
2. Add data visualizations
3. Implement settings page
4. Create onboarding flow
5. Add export functionality

### Phase 3 (Post-Beta):
1. Advanced customization
2. Social features
3. Gamification elements
4. Premium features
5. Third-party integrations

---

## 📊 UI Component Status

| Component | Status | Priority | Notes |
|-----------|--------|----------|-------|
| UnifiedNaturalInput | ✅ Exists | Critical | Needs mobile testing |
| PresetSelector | ✅ Exists | High | Working |
| DashboardProvider | ✅ Exists | High | Working |
| CommonLogsBar | ❌ Missing | Critical | Core MVP feature |
| InsightCard | ❌ Missing | Critical | Display insights |
| Dashboard Widgets | ⚠️ Partial | High | Need 3-4 more |
| Toast | ❌ Missing | High | User feedback |
| MobileNav | ❌ Missing | High | Mobile UX |
| Charts | ❌ Missing | Medium | Post-MVP |
| Settings | ❌ Missing | Low | Post-MVP |

---

## 🔧 Technical Requirements

### Performance:
- Lazy load heavy components
- Virtualize long lists
- Optimize re-renders
- Cache parsed results

### Accessibility:
- ARIA labels on all inputs
- Keyboard navigation
- Screen reader support
- High contrast mode

### Responsive:
- Mobile-first design
- Touch-friendly targets (44px min)
- Swipe gestures
- Adaptive layouts

### Testing:
- Component unit tests
- Integration tests
- Visual regression tests
- Mobile device testing

---

## 📱 Mobile-Specific Considerations

### Voice Input:
- Test on iOS Safari
- Test on Android Chrome
- Handle permissions properly
- Fallback for unsupported browsers

### Touch Interactions:
- Swipe to delete logs
- Pull to refresh
- Long press for options
- Pinch to zoom charts

### Performance:
- Minimize bundle size
- Optimize images
- Reduce network calls
- Offline support

---

## 🚀 Next Steps

1. **Audit existing components** - Test what's working
2. **Build CommonLogsBar** - Critical for quick logging
3. **Create InsightCard** - Display rule insights
4. **Add basic widgets** - Activity, Progress, Goals
5. **Implement Toast** - User feedback system
6. **Test on mobile** - Ensure voice works everywhere
7. **Polish animations** - Smooth transitions
8. **Add loading states** - Better perceived performance

---

*This inventory represents the complete UI component requirements for FeelSharper MVP Week 3. Focus on critical missing components first to achieve core functionality.*