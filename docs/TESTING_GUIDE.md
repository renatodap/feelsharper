# FeelSharper MVP Testing Guide

## Quick Test Checklist

### 1. Authentication Flow ✓
```
□ Sign up with email
  - Navigate to /sign-up
  - Enter email and password
  - Check email for confirmation
  - Click confirmation link
  - Verify redirect to /today

□ Sign in with email
  - Navigate to /sign-in
  - Enter credentials
  - Verify redirect to /today
  - Check auth persistence

□ Google OAuth
  - Click "Sign in with Google"
  - Complete Google auth
  - Verify redirect to /today
  - Check profile created

□ Password reset
  - Click "Forgot password"
  - Enter email
  - Check email for reset link
  - Set new password
  - Verify can sign in

□ Protected routes
  - Access /today without auth → redirects to /sign-in
  - Access /food without auth → redirects to /sign-in
  - Access /weight without auth → redirects to /sign-in
```

### 2. Food Logging ✓
```
□ Search for food
  - Navigate to /food/add
  - Search "chicken"
  - Verify results appear
  - Select food item

□ Log food entry
  - Set quantity
  - Select meal type
  - Click "Log Food"
  - Verify success message

□ View food logs
  - Navigate to /food
  - Verify today's entries
  - Check calorie totals
  - Check macro breakdown

□ Create custom food
  - Click "Add Custom Food"
  - Enter food details
  - Save custom food
  - Verify appears in search

□ Delete food log
  - Click delete on entry
  - Confirm deletion
  - Verify totals update
```

### 3. Weight Tracking ✓
```
□ Log weight
  - Navigate to /weight
  - Enter weight value
  - Click "Log Weight"
  - Verify success

□ View weight history
  - Check trend graph
  - Verify statistics
  - Check 7-day change
  - Verify trend indicator

□ Quick weight entry
  - From /today dashboard
  - Click weight card "+"
  - Enter weight in modal
  - Verify updates
```

### 4. Dashboard Features ✓
```
□ Today's Summary
  - Navigate to /today
  - Verify food totals
  - Check weight display
  - View recent activity

□ Quick Actions
  - Click "Log Food" → /food/add
  - Click "Track Weight" → /weight
  - Click "View Progress" → /insights

□ Recent Activity
  - Log food entry
  - Verify appears in feed
  - Check timestamp
  - Verify calorie display
```

### 5. AI Chat Assistant ✓
```
□ Basic conversation
  - Open chat on /today
  - Type "Hello"
  - Verify response
  - Check response time

□ Fitness questions
  - Ask "How many calories should I eat?"
  - Verify relevant response
  - Check context awareness

□ Rate limiting (Free tier)
  - Send 10 messages quickly
  - Verify rate limit message
  - Wait 1 hour
  - Verify can send again

□ Usage tracking
  - Check usage display
  - Verify cost calculation
  - Check tier limits
```

### 6. Pricing & Subscriptions ✓
```
□ View pricing
  - Navigate to /pricing
  - Verify 3 tiers display
  - Check feature lists
  - Toggle monthly/yearly

□ Start subscription
  - Click "Start Trial"
  - Verify redirect to Stripe
  - Complete payment (test card)
  - Verify tier upgrade

□ Cancel subscription
  - Go to /settings
  - Click "Manage Subscription"
  - Cancel in Stripe portal
  - Verify downgrade
```

## Detailed Test Scenarios

### Scenario 1: New User Journey
1. Land on homepage
2. Click "Get Started Free"
3. Sign up with email
4. Confirm email
5. Complete onboarding
6. Log first meal
7. Track weight
8. Ask AI for advice
9. View progress
10. Consider upgrading

### Scenario 2: Daily Usage
1. Sign in
2. Log breakfast (300 cal)
3. Log lunch (500 cal)
4. Log dinner (600 cal)
5. Log weight
6. Check daily totals (1400 cal)
7. Ask AI about protein intake
8. View weekly trends

### Scenario 3: Premium Upgrade
1. Hit free tier AI limit
2. Click upgrade prompt
3. View pricing page
4. Select Starter plan
5. Complete Stripe checkout
6. Verify tier updated
7. Test unlimited AI chat
8. Access premium features

## API Testing

### Test with cURL

#### 1. Get Auth Token
```bash
# Sign in and get cookies
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

#### 2. Test Food Search
```bash
curl -X GET "http://localhost:3000/api/food/search?q=apple" \
  -b cookies.txt
```

#### 3. Test Food Logging
```bash
curl -X POST http://localhost:3000/api/food/log \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "food_id": "uuid-here",
    "meal_type": "breakfast",
    "quantity": 1
  }'
```

#### 4. Test AI Chat
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"message":"What should I eat for lunch?"}'
```

## Database Testing

### Check User Data
```sql
-- Check user profile
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Check food logs
SELECT * FROM food_logs 
WHERE user_id = 'user-uuid' 
AND logged_at >= CURRENT_DATE;

-- Check weight logs
SELECT * FROM body_weight 
WHERE user_id = 'user-uuid'
ORDER BY logged_at DESC
LIMIT 10;

-- Check AI usage
SELECT * FROM ai_usage
WHERE user_id = 'user-uuid'
AND created_at >= date_trunc('month', CURRENT_DATE);
```

## Performance Testing

### Page Load Times
- Homepage: < 2s
- Dashboard: < 3s
- Food search: < 1s
- AI response: < 3s

### Lighthouse Scores
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

## Mobile Testing

### Responsive Design
- [ ] Test on iPhone 12/13/14
- [ ] Test on Android (Pixel)
- [ ] Test on iPad
- [ ] Test on small screens (SE)

### Touch Interactions
- [ ] Swipe gestures work
- [ ] Tap targets adequate
- [ ] Form inputs accessible
- [ ] Modals closeable

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

## Security Testing

### Authentication
- [ ] Cannot access protected routes without auth
- [ ] JWT tokens expire properly
- [ ] Refresh tokens work
- [ ] Password requirements enforced

### Data Validation
- [ ] SQL injection prevented
- [ ] XSS attacks blocked
- [ ] CSRF protection active
- [ ] Input sanitization works

### API Security
- [ ] Rate limiting enforced
- [ ] API keys protected
- [ ] CORS configured
- [ ] Headers secure

## Edge Cases

### Data Entry
- [ ] Negative weight values rejected
- [ ] Future dates handled
- [ ] Very large numbers capped
- [ ] Special characters sanitized

### Network Issues
- [ ] Offline message shown
- [ ] Retry mechanisms work
- [ ] Timeout handling
- [ ] Error recovery

### Concurrency
- [ ] Multiple tabs handled
- [ ] Race conditions prevented
- [ ] Optimistic updates work
- [ ] Conflicts resolved

## Accessibility Testing

### Screen Readers
- [ ] ARIA labels present
- [ ] Focus management
- [ ] Keyboard navigation
- [ ] Alt text on images

### Color Contrast
- [ ] WCAG AA compliant
- [ ] Dark mode readable
- [ ] Error states visible
- [ ] Focus indicators clear

## Load Testing

### Concurrent Users
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/food/search?q=test
```

### Expected Results
- 10 concurrent users: < 100ms response
- 50 concurrent users: < 500ms response
- 100 concurrent users: < 1s response

## Bug Reporting Template

```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [etc.]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [Chrome 120]
- OS: [Windows 11]
- Screen: [1920x1080]
- User Tier: [Free/Starter/Pro]

### Screenshots
[Attach if applicable]

### Additional Context
[Any other relevant information]
```

## Test Data

### Test Accounts
```
Free Tier:
Email: free@test.com
Password: Test123!

Starter Tier:
Email: starter@test.com
Password: Test123!

Pro Tier:
Email: pro@test.com
Password: Test123!
```

### Test Credit Card (Stripe)
```
Number: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
```

## Automated Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Type Check
```bash
npm run typecheck
```

### Run Linting
```bash
npm run lint
```

## Production Testing

### Pre-Launch Checklist
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Manual testing complete
- [ ] Performance acceptable
- [ ] Security scan clean
- [ ] Accessibility verified
- [ ] Mobile testing done
- [ ] Load testing passed

### Post-Launch Monitoring
- [ ] Error tracking active
- [ ] Analytics configured
- [ ] Uptime monitoring
- [ ] Performance alerts
- [ ] User feedback system

---

**Testing Complete?** Ship it! 🚀