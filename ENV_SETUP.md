# 🔑 ENVIRONMENT VARIABLES SETUP

## REQUIRED FOR MVP (CRITICAL)

Create `.env.local` file in project root:

```bash
# SUPABASE (CRITICAL - APP WON'T WORK WITHOUT THESE)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ENVIRONMENT
NODE_ENV=production
```

## OPTIONAL FOR ENHANCED FEATURES

```bash
# AI FEATURES (Ask FeelSharper, food parsing)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# PAYMENTS (Premium subscriptions)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...

# ANALYTICS (User tracking)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# ERROR MONITORING
SENTRY_DSN=https://...@sentry.io/...
```

## WHERE TO GET KEYS

### 🟦 SUPABASE (REQUIRED)
1. Go to https://supabase.com/dashboard
2. Select your project (or create new)
3. Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 🤖 ANTHROPIC (OPTIONAL)
1. Go to https://console.anthropic.com
2. Create API key
3. Copy → `ANTHROPIC_API_KEY`

### 🔵 OPENAI (OPTIONAL)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy → `OPENAI_API_KEY`

### 💳 STRIPE (OPTIONAL)
1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Webhooks → Create endpoint → Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 📊 POSTHOG (OPTIONAL)
1. Go to https://app.posthog.com/project/settings
2. Copy Project API key → `NEXT_PUBLIC_POSTHOG_KEY`

## VERCEL DEPLOYMENT SETUP

Add ALL environment variables to Vercel:

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project-ref.supabase.co`
   - Environment: Production (and Preview if testing)

## SECURITY NOTES

- ✅ `NEXT_PUBLIC_*` variables are safe (exposed to browser)
- 🔒 Other variables are server-only (secure)
- ❌ Never commit .env.local to git
- ✅ .env.local is in .gitignore

## TESTING YOUR SETUP

```bash
# Test locally
npm run dev
# Visit http://localhost:3000
# Try to sign up/sign in

# If sign-up fails → Check Supabase keys
# If AI features don't work → Check Anthropic/OpenAI keys
# If payments don't work → Check Stripe keys
```

## MVP MINIMUM (BARE MINIMUM TO WORK)

You only NEED these three for basic functionality:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

Everything else is optional enhancement!