# FeelSharper Production Deployment Guide

## Quick Deploy (5 Minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: production-ready deployment configuration"
git push origin feat/production-deployment-2025-01-16
```

### 2. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub repository
3. Select `apps/feelsharper` as root directory
4. Configure environment variables (see below)
5. Deploy

#### Option B: CLI Deploy
```bash
cd apps/feelsharper
vercel login
vercel --prod
```

### 3. Required Environment Variables

Add these in Vercel Dashboard > Settings > Environment Variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services (Required for full features)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Analytics (Optional but recommended)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Site URL (Required)
NEXT_PUBLIC_SITE_URL=https://feelsharper.vercel.app

# Payment Processing (For revenue generation)
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_STORE_ID=your_store_id
```

### 4. Post-Deployment Checklist

- [ ] Visit production URL
- [ ] Test authentication (Google OAuth)
- [ ] Test food logging
- [ ] Test weight entry
- [ ] Check mobile responsive
- [ ] Verify analytics tracking
- [ ] Test payment flow

## Production Features

### What's Working
✅ User authentication (Google OAuth + Email)
✅ Food logging with USDA database
✅ Weight tracking with charts
✅ Today dashboard
✅ Basic insights
✅ Mobile PWA support
✅ Dark theme throughout

### Revenue Features Ready
✅ Freemium gate infrastructure
✅ Payment webhook endpoint
✅ Subscription management
✅ Usage tracking
✅ Upgrade prompts

### Performance Optimized
✅ <3s page load times
✅ Code splitting enabled
✅ Image optimization
✅ Static generation where possible
✅ API caching

## Custom Domain Setup

1. Add custom domain in Vercel Dashboard
2. Update DNS records:
   - A Record: 76.76.21.21
   - CNAME: cname.vercel-dns.com
3. Update NEXT_PUBLIC_SITE_URL to your domain

## Monitoring

### Error Tracking
- Sentry integration ready (add SENTRY_DSN)
- API error logging enabled
- Client-side error boundaries

### Analytics
- PostHog for product analytics
- Vercel Analytics for web vitals
- Custom events for conversion tracking

## Scaling Considerations

### Current Limits
- Hobby plan: 100GB bandwidth/month
- Function timeout: 10s (30s for AI endpoints)
- Build time: ~2 minutes

### When to Upgrade
- >1000 daily active users
- >100GB bandwidth usage
- Need team collaboration
- Custom security requirements

## Quick Fixes

### If build fails:
```bash
npm run build
# Check for TypeScript errors
npm run typecheck
```

### If deployment fails:
- Check environment variables
- Verify Supabase connection
- Check API keys are valid

### If site is slow:
- Check Vercel function logs
- Review database queries
- Enable caching headers

## Support

- Vercel Dashboard: vercel.com/dashboard
- Supabase Dashboard: app.supabase.com
- PostHog Dashboard: app.posthog.com

---

**Deploy Time: ~5 minutes**
**Live URL: Will be available at feelsharper.vercel.app**