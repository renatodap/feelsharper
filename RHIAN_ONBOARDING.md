# FeelSharper Development Guide for Rhian

Welcome to the FeelSharper codebase! This document will help you understand the architecture, identify the current authentication issue, and explore areas where you can make meaningful contributions.

## 🎯 Quick Start

**Your primary mission**: Fix the Supabase email/password authentication so users can sign in properly.

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Test the Auth Issue
1. Go to http://localhost:3000/test-auth
2. Try signing up with a test email
3. Try signing in - you'll notice it doesn't maintain the session properly
4. The auth state doesn't persist across page refreshes

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (currently broken for email/password)
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks + Supabase real-time subscriptions

### Project Structure
```
feelsharper-deploy/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (sign-in, sign-up, reset)
│   ├── api/               # API routes for backend logic
│   └── [pages]/           # Feature pages
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── coach/            # AI coaching features
│   └── workouts/         # Workout tracking
├── lib/                  # Core utilities
│   ├── supabase/         # Supabase client setup ⚠️
│   ├── ai/               # AI service integrations
│   └── types/            # TypeScript definitions
└── supabase/             # Database migrations
```

## 🔥 The Authentication Problem

### Current Issue
The Supabase email/password authentication is broken. Users can't sign in or maintain sessions properly. The Google OAuth works fine, but the traditional email/password flow fails.

### What We Know
1. **Environment Variables**: Confirmed working (check `.env.local`)
2. **Supabase Configuration**: Project exists and is accessible
3. **Client Setup**: Using `@supabase/ssr` for Next.js integration
4. **Cookie Management**: May be the root cause - cookies aren't being set/read properly

### Key Files to Investigate

#### 1. Client-Side Supabase Client
**File**: `lib/supabase/client.ts`
```typescript
// Current implementation - might be too simple
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```
**Potential Issue**: Missing cookie configuration for browser client

#### 2. Server-Side Supabase Client
**File**: `lib/supabase/server.ts`
```typescript
// Uses Next.js cookies() function
// Might have async/await issues with Next.js 15
```
**Potential Issue**: Cookie handling with Next.js 15's new async cookies API

#### 3. Sign-In Component
**File**: `app/(auth)/sign-in/page.tsx`
- Line 32-35: `signInWithPassword` call
- Line 49: Window redirect instead of Next.js router
**Potential Issue**: Not waiting for session to be established before redirect

#### 4. Middleware
**File**: `middleware.ts`
- Currently disabled (line 45: returns `NextResponse.next()` for all routes)
- Should be checking auth state and protecting routes
**Potential Issue**: No session validation in middleware

### Your Investigation Strategy

1. **Test the Auth Flow**
   ```bash
   # Use the test page
   npm run dev
   # Visit http://localhost:3000/test-auth
   ```

2. **Check Cookie Storage**
   - Open DevTools → Application → Cookies
   - Look for `sb-` prefixed cookies after sign-in
   - If missing, the session isn't being stored

3. **Debug Points to Add**
   ```typescript
   // In sign-in page, after sign-in:
   console.log('Session:', data.session);
   console.log('Cookies:', document.cookie);
   
   // Check if session persists:
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Current session:', session);
   ```

4. **Potential Fixes to Try**

   **Fix A: Update Client with Cookie Config**
   ```typescript
   // lib/supabase/client.ts
   import { createBrowserClient } from "@supabase/ssr";
   
   export const createClient = () =>
     createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             const value = document.cookie
               .split('; ')
               .find(row => row.startsWith(`${name}=`))
               ?.split('=')[1];
             return value;
           },
           set(name: string, value: string, options?: any) {
             document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''}`;
           },
           remove(name: string) {
             document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
           }
         }
       }
     );
   ```

   **Fix B: Add Auth Callback Handler**
   ```typescript
   // app/auth/callback/route.ts needs enhancement
   // Should properly exchange code for session
   ```

   **Fix C: Enable Middleware Protection**
   ```typescript
   // Update middleware.ts to actually check auth
   // Create proper Supabase client in middleware
   // Validate session before allowing protected routes
   ```

## 🚀 Other High-Impact Areas You Can Contribute

### 1. Performance Optimization
The app has some performance issues you could tackle:
- **Bundle Size**: Run `npm run build` and check the output - some chunks are large
- **API Route Optimization**: Many routes don't have proper caching
- **Database Queries**: No connection pooling, could add query optimization

### 2. Testing Infrastructure
Currently minimal testing. You could add:
- **Auth E2E Tests**: Using Playwright (already installed)
- **API Route Tests**: Jest setup exists but no tests written
- **Component Tests**: Testing library is configured

Example test you could write:
```typescript
// __tests__/auth/sign-in.test.ts
describe('Authentication', () => {
  it('should maintain session after sign-in', async () => {
    // Your test implementation
  });
});
```

### 3. Real-Time Features
Supabase has powerful real-time capabilities we're not using:
- **Live Workout Tracking**: Friends can see each other's workouts in real-time
- **Achievement Notifications**: Pop up when friends hit milestones
- **Leaderboards**: Real-time position updates

### 4. Mobile Responsiveness
The app works on mobile but could be better:
- **Touch Gestures**: Swipe actions for workout logging
- **PWA Features**: Already has manifest, needs service worker
- **Offline Support**: IndexedDB is imported but not implemented

### 5. AI Coach Enhancement
The AI coaching system could use refinement:
- **Response Caching**: Currently makes API calls repeatedly
- **Context Management**: Could maintain conversation history better
- **Streaming Responses**: Make the chat feel more responsive

## 🔍 Debugging Tools & Commands

### Useful Development Commands
```bash
# Type checking (run this often!)
npm run typecheck

# Check for linting issues
npm run lint

# Run the test suite
npm test

# Build for production (catches build-time errors)
npm run build

# Database type generation (after schema changes)
npm run db:types
```

### Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Project: uayxgxeueyjiokhvmjwd
3. Check Authentication → Users to see registered users
4. Check Authentication → Logs for auth errors

### Browser DevTools Tips
1. **Network Tab**: Watch for failed Supabase requests
2. **Console**: Add strategic `console.log` statements
3. **Application Tab**: Check cookies and local storage
4. **React DevTools**: Inspect component state

## 🎨 Code Style & Patterns

### TypeScript Patterns We Use
```typescript
// Always type your API responses
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Use proper error handling
try {
  const result = await someAsyncOperation();
  return { data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { error: 'Something went wrong' };
}
```

### Component Structure
```typescript
// We prefer functional components with hooks
export default function ComponentName() {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {};
  
  // Effects after handlers
  useEffect(() => {}, []);
  
  // Render
  return <div>Content</div>;
}
```

## 💡 Quick Wins You Could Implement

1. **Add Loading States**: Many components show blank during data fetching
2. **Error Boundaries**: App crashes on errors, needs proper error handling
3. **Form Validation**: Sign-up form accepts invalid emails
4. **Rate Limiting**: API routes have no protection against spam
5. **SEO Metadata**: Pages are missing proper meta tags

## 🤝 Working Together

### Communication
- Comment your code changes thoroughly
- Use descriptive commit messages
- Feel free to add TODO comments for things you notice

### Git Workflow
```bash
# Create a feature branch
git checkout -b fix/supabase-auth

# Make your changes
# Test thoroughly
# Commit with clear message
git add .
git commit -m "Fix: Supabase auth session persistence issue"

# Push your branch
git push origin fix/supabase-auth
```

## 🎯 Your First Goal

1. **Fix the authentication** - This is the highest priority
2. **Document your findings** - Add comments explaining what was wrong
3. **Write a test** - Ensure the fix stays fixed
4. **Suggest next improvements** - You'll spot things I've missed

## 🏆 Why This Project Matters

FeelSharper is designed to be the smartest fitness tracking app - combining AI coaching with social accountability. Once we fix authentication, we can launch to real users and start gathering feedback. Your engineering expertise from Rose-Hulman, especially your understanding of system architecture and debugging skills, makes you perfectly suited to solve this authentication puzzle.

The codebase is complex but well-organized. Your fresh perspective will help identify issues I've become blind to after staring at it for so long. Plus, once auth is working, there are fascinating challenges around real-time data, AI integration, and performance optimization that I think you'll really enjoy tackling.

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router Auth Pattern](https://nextjs.org/docs/app/building-your-application/authentication)
- [Our Supabase Dashboard](https://supabase.com/dashboard/project/uayxgxeueyjiokhvmjwd)
- [Current Live Demo](https://feelsharper.com) (Google auth works, email doesn't)

---

Welcome aboard! Can't wait to see what you discover and build. The authentication fix will unlock everything else we want to do with this app.

-P