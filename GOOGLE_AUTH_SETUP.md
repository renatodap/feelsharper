# 🔐 Google Authentication Setup for FeelSharper

## ✅ What's Already Done
- GoogleAuthButton component exists and is integrated
- Auth callback page is set up at `/auth/callback`
- Sign-in and sign-up pages have Google auth buttons
- Supabase client is configured

## 📋 What You Need to Do

### 1️⃣ Google Cloud Console Setup (10 minutes)

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project:**
   - Click "Select a project" → "New Project"
   - Project name: `feelsharper-production`
   - Click "Create"

3. **Enable Google Identity API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity Toolkit API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - Click "Create"
   - Fill in:
     - App name: `FeelSharper`
     - User support email: `your-email@gmail.com`
     - App logo: (optional, can add later)
     - App domain: `https://feelsharper.com` (or your domain)
     - Authorized domains: `feelsharper.com`
     - Developer contact: `your-email@gmail.com`
   - Click "Save and Continue"
   - Scopes: Just click "Save and Continue" (default is fine)
   - Test users: Add your email if you want to test before going live
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `FeelSharper Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://feelsharper.com
     https://feelsharper.vercel.app
     ```
   - **Authorized redirect URIs (CRITICAL - must be exact):**
     ```
     https://YOUR-SUPABASE-PROJECT-ID.supabase.co/auth/v1/callback
     ```
     ⚠️ Replace `YOUR-SUPABASE-PROJECT-ID` with your actual Supabase project ID
     
   - Click "Create"
   - **SAVE THESE:**
     - Client ID: `xxxxxxxxxxxx.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxxxxxxxxxxx`

### 2️⃣ Supabase Dashboard Setup (5 minutes)

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**

2. **Select your FeelSharper project**

3. **Enable Google Provider:**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list
   - Toggle it **ON**
   - Add your credentials:
     - **Client ID:** (paste from Google Console)
     - **Client Secret:** (paste from Google Console)
   - **Authorized Client IDs:** (paste your Client ID again)
   - Click "Save"

4. **Get your Supabase Project URL:**
   - Go to "Settings" → "API"
   - Copy your Project URL (looks like `https://xxxxx.supabase.co`)
   - This is what you use in Google's redirect URI

5. **Check Redirect URLs:**
   - Still in "Authentication" → "URL Configuration"
   - **Site URL:** `https://feelsharper.com` (or `http://localhost:3000` for dev)
   - **Redirect URLs:** Add these:
     ```
     http://localhost:3000/**
     https://feelsharper.com/**
     https://feelsharper.vercel.app/**
     ```

### 3️⃣ Environment Variables Setup

**Local Development (.env.local):**
```env
# Already should have these:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Add this for production redirects:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Vercel Production:**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your FeelSharper project
3. Go to "Settings" → "Environment Variables"
4. Add:
   ```
   NEXT_PUBLIC_SITE_URL = https://feelsharper.com
   ```

### 4️⃣ Test the Setup

1. **Local Testing:**
   ```bash
   cd feelsharper-deploy
   npm run dev
   ```
   - Go to http://localhost:3000/sign-in
   - Click "Sign in with Google"
   - Should redirect to Google → back to your app

2. **Production Testing:**
   - Deploy to Vercel
   - Go to https://feelsharper.com/sign-in
   - Test Google sign-in

### 5️⃣ Troubleshooting

**"Redirect URI mismatch" error:**
- The redirect URI in Google Console must EXACTLY match Supabase's callback URL
- Find your exact URL in Supabase Dashboard → Authentication → Providers → Google (it shows the callback URL)

**"This app hasn't been verified" warning:**
- Normal for development
- For production: Submit for verification in Google Console (takes 1-2 weeks)

**User stays on callback page:**
- Check that `NEXT_PUBLIC_SITE_URL` is set correctly
- Check browser console for errors

**"Invalid credentials" error:**
- Double-check Client ID and Secret are copied correctly
- Make sure there are no extra spaces

### 6️⃣ Going to Production

Before launching:
1. **Submit for Google Verification** (if you expect >100 users)
   - In OAuth consent screen, click "Publish App"
   - May need to provide privacy policy and terms of service

2. **Add your production domain** everywhere:
   - Google Console redirect URIs
   - Supabase redirect URLs
   - Vercel environment variables

3. **Test with a fresh Google account** (not your dev account)

## 🎯 Quick Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google Identity API
- [ ] Configured OAuth Consent Screen
- [ ] Created OAuth 2.0 Web Client
- [ ] Saved Client ID and Secret
- [ ] Added redirect URI with exact Supabase project ID
- [ ] Enabled Google in Supabase
- [ ] Added Client ID and Secret to Supabase
- [ ] Set Site URL in Supabase
- [ ] Added redirect URLs to Supabase
- [ ] Set NEXT_PUBLIC_SITE_URL in Vercel
- [ ] Tested locally
- [ ] Tested in production

## 📝 Your Credentials (Fill these in)

```
Google Client ID: _________________________________
Google Client Secret: _____________________________
Supabase Project ID: ______________________________
Supabase Project URL: _____________________________
Production Domain: ________________________________
```

## 🚀 That's it!

Once you complete these steps, users can sign in with Google. The existing code handles everything else - creating user profiles, redirecting to the right page, etc.

Need help? The most common issue is the redirect URI - it must be EXACTLY:
`https://[your-project-id].supabase.co/auth/v1/callback`

## 🔧 Troubleshooting Vercel Deployment

If you see "Application error: a server-side exception has occurred":
1. Check environment variables are set in Vercel
2. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
3. Redeploy after adding environment variables