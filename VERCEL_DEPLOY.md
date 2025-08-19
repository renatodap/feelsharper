# 🚀 VERCEL DEPLOYMENT GUIDE

## QUICK DEPLOY (5 MINUTES)

### Option A: GitHub Auto-Deploy (RECOMMENDED)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# 2. Deploy via Vercel Dashboard
# Go to: https://vercel.com/new
# Click "Import Git Repository"
# Select your repo
# Add environment variables
# Click Deploy
```

### Option B: CLI Deploy

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? (No for first time)
# - What's your project name? feelsharper
# - In which directory? ./
# - Want to override settings? No
```

## ENVIRONMENT VARIABLES IN VERCEL

**CRITICAL**: Add these in Vercel Dashboard → Settings → Environment Variables

### Required for MVP:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV = production
```

### Optional Enhancements:
```
ANTHROPIC_API_KEY = sk-ant-api03-...
OPENAI_API_KEY = sk-...
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
NEXT_PUBLIC_POSTHOG_KEY = phc_...
NEXT_PUBLIC_POSTHOG_HOST = https://us.posthog.com
```

## VERCEL CONFIGURATION

Your `vercel.json` is already optimized:

✅ **Function Timeouts**: AI endpoints get 30 seconds
✅ **Security Headers**: XSS protection, content sniffing prevention
✅ **API Caching**: No-cache for dynamic endpoints
✅ **Rewrites**: PostHog analytics proxy

## DEPLOYMENT PROCESS

### 1. Pre-Deploy Check:
```bash
# Test build locally
npm run build
npm start

# Test on localhost:3000
# Sign up, log food, enter weight
```

### 2. Deploy:
```bash
# If using CLI
vercel --prod

# If using GitHub integration
git push origin main
# Vercel auto-deploys
```

### 3. Post-Deploy Check:
```bash
# Visit your live URL
# Test core functionality
# Check Vercel dashboard for errors
```

## CUSTOM DOMAIN (OPTIONAL)

### Add Your Domain:
1. Vercel Dashboard → Domains
2. Add domain: `feelsharper.com`
3. Update DNS records as shown
4. Wait for SSL certificate

### DNS Configuration:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## MONITORING AFTER DEPLOYMENT

### Vercel Dashboard:
- **Functions**: Monitor API response times
- **Analytics**: Page views, Core Web Vitals
- **Logs**: Runtime errors and warnings

### Check These URLs:
- `yourapp.vercel.app/` - Homepage loads
- `yourapp.vercel.app/api/health` - API working
- `yourapp.vercel.app/sign-up` - Auth working

## ROLLBACK PLAN

### If Deployment Fails:
```bash
# CLI rollback
vercel --prod --force

# Or in Vercel Dashboard:
# Deployments → Previous deployment → Promote to Production
```

### Emergency Fixes:
```bash
# Quick fix and redeploy
git add .
git commit -m "hotfix: critical issue"
git push origin main
# Auto-deploys via GitHub integration
```

## PERFORMANCE OPTIMIZATION (ALREADY DONE)

✅ **Bundle Size**: 193KB first load (excellent)
✅ **Code Splitting**: Automatic by Next.js
✅ **Image Optimization**: Next.js Image component
✅ **Static Generation**: 81 pages pre-rendered
✅ **Edge Functions**: Fast global response

## COMMON DEPLOYMENT ISSUES

### Build Fails:
- Check TypeScript errors (currently ignored for speed)
- Verify all imports are correct
- Check package.json dependencies

### Environment Variables Not Working:
- Refresh Vercel deployment after adding vars
- Check variable names match exactly
- Verify no extra spaces in values

### Database Connection Fails:
- Test Supabase credentials locally first
- Check Supabase project is active
- Verify RLS policies allow access

### Slow Performance:
- Already optimized to 193KB bundle
- Check Vercel Analytics for bottlenecks
- Monitor Core Web Vitals

## SUCCESS METRICS

### Technical:
- [ ] Build succeeds in <2 minutes
- [ ] Pages load in <3 seconds
- [ ] 99.9% uptime on Vercel
- [ ] Core Web Vitals all green

### Functional:
- [ ] Users can sign up
- [ ] Food logging works
- [ ] Weight tracking saves
- [ ] Payments process (if configured)

## POST-DEPLOYMENT CHECKLIST

### Day 1:
- [ ] Test all core user flows
- [ ] Check error rates in Vercel dashboard
- [ ] Monitor user sign-ups
- [ ] Verify email delivery

### Week 1:
- [ ] Set up monitoring alerts
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Plan next iteration

Your app is **DEPLOYMENT READY**. The entire process should take 5-10 minutes once you have your environment variables!