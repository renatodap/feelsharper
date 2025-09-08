# FeelSharper Navigation Structure
*Updated: 2025-08-29*

## URL Structure

### Public Pages (No Authentication Required)
- **`/`** - Landing page (SharpenedLanding component)
  - Always accessible to everyone
  - Shows marketing content and features
  - Has "START FREE" button → `/signin`
  - Logged-in users can still view this page

- **`/signin`** or **`/sign-in`** - Sign in page
  - Redirects to `/insights` after successful login
  - If already logged in, redirects to `/insights`

- **`/signup`** or **`/sign-up`** - Sign up page
  - Redirects to `/insights` after successful registration
  - If already logged in, redirects to `/insights`

- **`/auth/callback`** - OAuth callback handler
- **`/reset-password`** - Password reset page
- **`/verify-email`** - Email verification page

### Private Pages (Authentication Required)
All private pages include the navigation bar with easy access to other pages.

#### Main MVP Pages
- **`/insights`** - AI Coach page (DEFAULT after login)
  - 2-3 AI-generated insights
  - Critical questions
  - Micro-chat with coach
  
- **`/log`** - Natural language activity logging
  - Voice or text input
  - Quick activity logging
  - AI parsing of activities

- **`/dashboard`** - Main dashboard
  - Activity overview
  - Progress metrics
  - Quick actions

#### Navigation Components

**Desktop (Top Bar)**:
- Logo (FEELSHARPER) - Links to `/` (landing page)
- Insights (with Brain icon)
- Log (with PenLine icon)
- Dashboard (with LayoutDashboard icon)
- User Avatar → Settings slide-over

**Mobile (Bottom Tab Bar)**:
- Insights
- Log
- Dashboard
- Avatar (for settings)

**Settings Slide-over** (Accessible via avatar click):
- User preferences
- Units configuration
- Persona/coaching style
- Export data
- Sign out
- Delete account

## User Flow

### New User
1. Visits `https://feelsharper-official.vercel.app/` (landing page)
2. Clicks "START FREE" → `/signin`
3. Signs in or signs up
4. Redirected to `/insights` (Coach page)
5. Can navigate between Insights, Log, and Dashboard
6. Can return to landing page via logo click

### Returning User
1. Visits `https://feelsharper-official.vercel.app/` (landing page)
2. If not logged in: Same as new user
3. If logged in: Can view landing page OR navigate to app pages
4. Can access Insights, Log, Dashboard directly
5. Settings always accessible via avatar

## Key Behaviors
- Landing page (`/`) is ALWAYS accessible (no auto-redirect)
- After sign-in, users go to `/insights` (not `/today`)
- Navigation bar appears on ALL private pages
- Logo always links back to landing page
- Settings slide-over accessible from any private page
- Sign out returns user to landing page (`/`)

## Technical Implementation
- `AuthenticatedLayout` wraps all pages and handles auth
- `AppNavigation` provides consistent navigation on private pages
- Public routes don't show navigation bar
- Landing page is treated as a public route
- No automatic redirects from landing page for logged-in users