# FeelSharper MVP Deployment Guide

## Overview
Complete deployment guide for FeelSharper MVP with authentication, AI features, and usage-based pricing.

## Prerequisites

1. **Accounts Required:**
   - Supabase account (database & auth)
   - Vercel account (hosting)
   - Stripe account (payments)
   - OpenAI API key (AI features)
   - Anthropic API key (premium AI)
   - Groq API key (free tier AI) - optional

2. **Local Setup:**
   - Node.js 18+ installed
   - Git configured
   - npm or yarn installed

## Step 1: Database Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project URL and anon key

### 1.2 Apply Database Migrations
```bash
# Link your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
npx supabase db push

# Or apply manually in SQL editor:
# Run migrations in order from supabase/migrations/
```

### 1.3 Seed Initial Data
```sql
-- Run scripts/seed-foods.sql in Supabase SQL editor
-- This adds verified food database
```

### 1.4 Enable Google OAuth
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add Google OAuth credentials:
   - Client ID from Google Cloud Console
   - Client Secret
4. Add redirect URL to Google Console:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```

## Step 2: Environment Configuration

### 2.1 Create .env.local
```bash
cp .env.example .env.local
```

### 2.2 Required Environment Variables
```env
# Supabase (from your project)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=sk-...  # For Starter tier
ANTHROPIC_API_KEY=sk-ant-...  # For Pro tier
GROQ_API_KEY=gsk_...  # Optional for free tier

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...  # Use test key for development
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

## Step 3: Stripe Setup

### 3.1 Create Products in Stripe Dashboard
1. Go to Stripe Dashboard > Products
2. Create "Starter" product ($4.99/month)
3. Create "Pro" product ($14.99/month)
4. Copy price IDs

### 3.2 Update Price IDs
```typescript
// app/api/stripe/checkout/route.ts
const PRICING_PLANS = {
  starter: {
    priceId: 'price_YOUR_STARTER_ID',
    // ...
  },
  pro: {
    priceId: 'price_YOUR_PRO_ID',
    // ...
  }
};
```

### 3.3 Configure Webhook
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Step 4: Local Development

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Run Development Server
```bash
npm run dev
```

### 4.3 Test Features
- Sign up at http://localhost:3000/sign-up
- Log food at http://localhost:3000/food/add
- Track weight at http://localhost:3000/weight
- View dashboard at http://localhost:3000/today
- Test AI chat on dashboard

## Step 5: Production Deployment

### 5.1 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 5.2 Configure Environment Variables in Vercel
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add all variables from .env.local
3. Update NEXT_PUBLIC_APP_URL to your production domain

### 5.3 Update OAuth Redirect URLs
1. **Google OAuth:**
   - Add `https://your-domain.com/auth/callback` to Google Console
   
2. **Supabase:**
   - Update Site URL in Authentication settings

### 5.4 Configure Custom Domain (Optional)
1. Add domain in Vercel Dashboard
2. Update DNS records
3. Enable SSL

## Step 6: Testing Checklist

### Authentication
- [ ] Email sign up with confirmation
- [ ] Email sign in
- [ ] Google OAuth sign in
- [ ] Password reset flow
- [ ] Auth persistence across refreshes
- [ ] Protected route redirects

### Core Features
- [ ] Food search and logging
- [ ] Custom food creation
- [ ] Weight entry and tracking
- [ ] Dashboard data display
- [ ] Recent activity feed

### AI Features
- [ ] Chat assistant responds
- [ ] Rate limiting works (free tier: 100/month)
- [ ] Usage tracking updates
- [ ] Tier limits enforced
- [ ] Context-aware responses

### Payments
- [ ] Pricing page displays
- [ ] Stripe checkout redirect
- [ ] Subscription created
- [ ] Tier upgraded in database
- [ ] Cancel subscription flow

## Step 7: Monitoring

### 7.1 Error Tracking
```bash
# Check Vercel Functions logs
vercel logs --prod

# Monitor Supabase logs
# Dashboard > Logs > API
```

### 7.2 Usage Monitoring
```sql
-- Check AI usage
SELECT 
  user_id,
  SUM(estimated_cost) as total_cost,
  COUNT(*) as query_count
FROM ai_usage
WHERE created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY user_id
ORDER BY total_cost DESC;
```

### 7.3 Performance Monitoring
- Use Vercel Analytics
- Monitor Core Web Vitals
- Check API response times

## Step 8: Maintenance

### Daily Tasks
- Monitor error logs
- Check AI usage costs
- Review user feedback

### Weekly Tasks
- Database backups
- Usage report generation
- Performance optimization

### Monthly Tasks
- Reset AI usage counters
- Review subscription metrics
- Update dependencies

## Troubleshooting

### Common Issues

1. **Auth not working:**
   - Check Supabase URL and keys
   - Verify redirect URLs configured
   - Check middleware.ts for protected routes

2. **AI chat not responding:**
   - Verify API keys are set
   - Check rate limits
   - Monitor usage quotas

3. **Payments failing:**
   - Verify Stripe keys
   - Check webhook configuration
   - Test with Stripe CLI locally

4. **Database errors:**
   - Check RLS policies
   - Verify migrations applied
   - Monitor connection pool

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Next.js Docs:** https://nextjs.org/docs

## Security Checklist

- [ ] All API keys in environment variables
- [ ] RLS policies enabled on all tables
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] HTTPS enforced in production

## Launch Checklist

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Staging environment tested
- [ ] Production environment ready
- [ ] Monitoring configured
- [ ] Support email setup
- [ ] Terms & Privacy pages live
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Rollback plan ready

---

**Congratulations!** Your FeelSharper MVP is ready for launch! 🚀