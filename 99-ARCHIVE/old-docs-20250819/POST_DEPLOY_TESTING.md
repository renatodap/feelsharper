# ✅ POST-DEPLOYMENT TESTING CHECKLIST

## 🚨 CRITICAL 5-MINUTE SMOKE TEST

**Do this immediately after deployment:**

### 1. Basic Page Load Test
- [ ] Visit your deployed URL
- [ ] Homepage loads without errors
- [ ] Navigation menu works
- [ ] No console errors in browser dev tools

### 2. Authentication Flow
- [ ] Click "Sign Up"
- [ ] Enter email and password
- [ ] Sign up succeeds (or shows verification needed)
- [ ] Can sign in with created account
- [ ] User dashboard loads

### 3. Core MVP Features
- [ ] Visit `/food/add` - page loads
- [ ] Search for "chicken" - results appear
- [ ] Log a food item - saves successfully
- [ ] Visit `/weight` - page loads
- [ ] Enter weight - saves successfully
- [ ] Visit `/today` - shows logged data

### 4. Data Persistence
- [ ] Refresh page - data still there
- [ ] Sign out and sign back in - data persists
- [ ] Check Supabase dashboard - records in database

## 📱 COMPREHENSIVE USER FLOW TEST

### New User Onboarding:
1. **Landing Page**
   - [ ] Visit homepage
   - [ ] Click "Try It Now - Free"
   - [ ] Onboarding flow starts

2. **Account Creation**
   - [ ] Enter email/password
   - [ ] Account created successfully
   - [ ] Redirected to onboarding or dashboard

3. **First Food Log**
   - [ ] Navigate to food logging
   - [ ] Search for common food (e.g., "apple")
   - [ ] Select from results
   - [ ] Set portion size
   - [ ] Save successfully

4. **First Weight Entry**
   - [ ] Navigate to weight tracking
   - [ ] Enter current weight
   - [ ] Save successfully
   - [ ] See weight on chart/display

5. **Dashboard Review**
   - [ ] Today page shows logged food
   - [ ] Today page shows weight entry
   - [ ] Basic stats display correctly

## 🔧 TECHNICAL VALIDATION

### Performance Check:
- [ ] Page loads in <3 seconds
- [ ] No JavaScript errors in console
- [ ] Mobile responsive design works
- [ ] Images load correctly

### Database Connectivity:
- [ ] Food searches return results
- [ ] User data saves to Supabase
- [ ] Data queries work correctly
- [ ] Authentication tokens valid

### API Endpoints:
- [ ] `/api/health` returns 200
- [ ] `/api/food/search` returns results
- [ ] `/api/weight` accepts POST requests
- [ ] Error handling works (try invalid data)

## 💳 PAYMENT TESTING (IF CONFIGURED)

### Stripe Integration:
- [ ] Click upgrade to premium
- [ ] Stripe checkout loads
- [ ] Test with Stripe test card: 4242 4242 4242 4242
- [ ] Payment processes successfully
- [ ] User gets premium access
- [ ] Webhook receives payment confirmation

### Feature Gating:
- [ ] Free users see upgrade prompts
- [ ] Premium features are locked for free users
- [ ] Premium users get full access
- [ ] Billing portal accessible

## 🐛 ERROR SCENARIOS

### Test Edge Cases:
- [ ] Enter invalid email format
- [ ] Try to access protected routes without auth
- [ ] Submit empty forms
- [ ] Test with slow internet connection
- [ ] Try on different browsers (Chrome, Safari, Firefox)

### Network Issues:
- [ ] Offline mode shows appropriate message
- [ ] Poor connection shows loading states
- [ ] Failed API calls show error messages
- [ ] Retry mechanisms work

## 📊 MONITORING SETUP

### Vercel Dashboard:
- [ ] Functions tab shows API calls
- [ ] No error spikes in logs
- [ ] Performance metrics look good
- [ ] Deployment marked as successful

### Supabase Dashboard:
- [ ] User count increasing
- [ ] Database queries executing
- [ ] No authentication errors
- [ ] Table data looks correct

### Error Tracking:
- [ ] Set up error monitoring (Sentry)
- [ ] Configure alerts for high error rates
- [ ] Monitor user feedback channels

## 📱 DEVICE TESTING

### Mobile Browsers:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Mobile navigation works
- [ ] Touch interactions responsive

### Desktop Browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🔍 SEO & METADATA

### Page Metadata:
- [ ] Homepage title/description correct
- [ ] Social media cards display properly
- [ ] Favicon appears correctly
- [ ] Sitemap accessible

## 📈 ANALYTICS VERIFICATION

### PostHog (if configured):
- [ ] Page views tracking
- [ ] User sign-ups tracked
- [ ] Feature usage captured
- [ ] Funnel analysis working

## 🚨 EMERGENCY PROCEDURES

### If Critical Issues Found:
1. **Document the issue** - screenshot, error message, steps to reproduce
2. **Check Vercel logs** - identify root cause
3. **Rollback if necessary** - use previous deployment
4. **Fix and redeploy** - push hotfix
5. **Verify fix** - retest affected functionality

### Rollback Process:
```bash
# CLI rollback
vercel rollback

# Or Vercel Dashboard:
# Deployments → Previous version → Promote to Production
```

## ✅ SIGN-OFF CRITERIA

**MVP is ready for users when:**
- [ ] All critical 5-minute smoke tests pass
- [ ] Core user flow works end-to-end
- [ ] No blocking bugs found
- [ ] Performance meets targets
- [ ] Mobile experience works
- [ ] Database saves/retrieves data correctly

**You can confidently share the app when all checkboxes are complete!**