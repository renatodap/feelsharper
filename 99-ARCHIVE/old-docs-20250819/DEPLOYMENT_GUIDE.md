# 🚀 FeelSharper Deployment Guide

**Complete step-by-step guide to deploy FeelSharper to Vercel**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure these are complete:

```bash
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo\apps\feelsharper

# 1. Check TypeScript (MUST PASS)
npm run typecheck

# 2. Check ESLint (MUST PASS)
npm run lint

# 3. Build locally (MUST SUCCEED)
npm run build

# 4. Test core features
npm test
```

---

## 🔧 Option 1: Deploy from Existing GitHub Repo (If Already Setup)

If you already have a GitHub repo for FeelSharper:

```bash
# 1. Navigate to FeelSharper
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo\apps\feelsharper

# 2. Check current branch
git branch

# 3. Make sure you're on main
git checkout main

# 4. Add and commit any changes
git add .
git commit -m "feat: prepare for deployment"

# 5. Push to GitHub
git push origin main

# 6. Deploy with Vercel CLI
vercel --prod
```

---

## 🆕 Option 2: Create New GitHub Repository (Recommended)

Since FeelSharper needs its own repository for Vercel:

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name: `feelsharper`
3. Description: "AI-powered fitness and nutrition tracker"
4. Make it **Private** initially
5. Don't initialize with README (we have one)
6. Click "Create repository"

### Step 2: Initialize Git in FeelSharper

```bash
# Navigate to FeelSharper directory
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo\apps\feelsharper

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial FeelSharper deployment"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/feelsharper.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Connect to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Answer the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? feelsharper
# - Directory? ./
# - Override settings? No
```

### Step 4: Configure Environment Variables in Vercel

Go to https://vercel.com/YOUR_USERNAME/feelsharper/settings/environment-variables

Add these required variables:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services (REQUIRED)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Analytics (Optional but recommended)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Payments (For premium features)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

### Step 5: Deploy to Production

```bash
# Deploy to production
vercel --prod

# This will give you a URL like:
# https://feelsharper.vercel.app
```

---

## 🌿 Option 3: Deploy Specific Branch

If you want to deploy a feature branch:

```bash
# Create and switch to feature branch
git checkout -b deploy/production-ready

# Make any final changes
# ...

# Commit changes
git add .
git commit -m "feat: production deployment"

# Push branch
git push origin deploy/production-ready

# Deploy this branch
vercel --prod
```

---

## 🔍 Verify Deployment

After deployment, check:

1. **Visit your URL**: https://feelsharper.vercel.app
2. **Test authentication**: Sign up/Sign in
3. **Test food logging**: Add some foods
4. **Test weight tracking**: Log weight
5. **Check dashboard**: Verify data displays

---

## 🐛 Troubleshooting

### Build Fails on Vercel

```bash
# Check build logs
vercel logs

# Common fixes:
# 1. Ensure all environment variables are set
# 2. Check package.json dependencies
# 3. Verify TypeScript compiles locally
npm run typecheck
npm run build
```

### Database Connection Issues

1. Check Supabase environment variables
2. Verify Supabase project is running
3. Check RLS policies in Supabase

### Deployment Not Updating

```bash
# Force new deployment
vercel --prod --force

# Or clear cache
vercel --prod --no-cache
```

---

## 📊 Post-Deployment

### Monitor Performance
- Check Vercel Analytics: https://vercel.com/YOUR_USERNAME/feelsharper/analytics
- Monitor errors: https://vercel.com/YOUR_USERNAME/feelsharper/functions

### Set up Custom Domain (Optional)
1. Go to Vercel project settings
2. Add domain: `feelsharper.com` or your domain
3. Update DNS records as instructed

---

## 🔄 Continuous Deployment

For automatic deployments on push:

1. Connect GitHub to Vercel:
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select `feelsharper` repo
   - Auto-deploy on push to main

2. Branch Protection:
   ```bash
   # Only deploy from main branch
   # Set in Vercel project settings
   ```

---

## 📝 Quick Deploy Commands

```bash
# Complete deployment flow
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo\apps\feelsharper
npm run typecheck && npm run lint && npm run build && vercel --prod

# Or use this one-liner
npm run typecheck && npm run lint && npm run build && git add . && git commit -m "deploy: production release" && git push && vercel --prod
```

---

## ⚡ FASTEST DEPLOYMENT (If repo exists)

```bash
# From FeelSharper directory
git add .
git commit -m "deploy: production release"
git push origin main
vercel --prod
```

---

## 🎯 Next Steps After Deployment

1. **Share with testers**: Send URL to friends/family
2. **Monitor usage**: Check Vercel analytics
3. **Collect feedback**: Set up feedback form
4. **Fix issues**: Deploy fixes quickly
5. **Add Stripe**: Enable premium features

---

**Remember**: Always test locally before deploying!

```bash
npm run build  # Must succeed before deploying
```

---

*Last Updated: 2025-08-18*