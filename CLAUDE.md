# Feel Sharper - Claude Code Instructions

## Project Overview
AI-powered fitness companion using natural language processing for frictionless health tracking. "Iron sharpens iron" - users interact through conversation, not forms.

## MVP V2 - NATURAL LANGUAGE AI COACH (NEW FOCUS)
**Target**: Revolutionary fitness app that understands natural language
**Documentation**: See `MVP_V2_NATURAL_LANGUAGE.md` for full details

### Core MVP Features (COMPLETE PIVOT)
1. **Natural Language Input** - One input box for everything
   - "Had eggs and toast for breakfast" → Auto-logs nutrition
   - "Ran 5k in 25 minutes" → Auto-logs workout
   - "Weight 175, feeling great" → Logs weight + mood
   
2. **AI Coach Chat** - Real conversations, not forms
   - Pattern recognition from user data
   - Personalized daily challenges
   - Intelligent responses to user needs
   
3. **Simplified Dashboard** - Only what matters
   - Today's mission (1 clear goal)
   - Quick natural language input
   - Energy/mood tracker
   - One key insight from AI

4. **Voice Input** - Speak instead of type
   - Web Speech API integration
   - Transcribe → Parse → Save automatically

### What We're REMOVING from Old MVP
- ❌ Complex food search with 8000 foods
- ❌ Multiple separate pages for each feature
- ❌ Form-based input screens
- ❌ Manual food selection and calculation
- ❌ Static, one-size-fits-all dashboard

### New Technical Requirements
1. **OpenAI Integration** - Natural language parsing
2. **Claude API** - Advanced coaching conversations
3. **Unified activity_logs table** - One table for all inputs
4. **Voice input** - Web Speech API
5. **Real-time AI responses** - <2 second target

## Core Tech Stack
- Next.js 15.4.5 + React 19.1.0 + TypeScript
- Supabase (auth + database)
- Tailwind CSS 4 (dark-first design system)
- Jest + Testing Library (testing)

## Essential Commands
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint validation
npm test             # Jest tests
npm run seed         # Database seeding
```

## Brand System (ONLY These Colors)
- **Navy**: `#0B2A4A` (primary brand)
- **Black**: `#0A0A0A` (background)
- **White**: `#FFFFFF` (text primary)
- **Grays**: `#C7CBD1` (secondary), `#8B9096` (muted)
- **NO** purple, indigo, pink, or other colors

## Core Features (Implemented)
### MVP Features (Priority)
1. **Food Logging** (`/food`, `/food/add`) - USDA verified food database
2. **Weight Logging** (`/weight`) - One-tap weight entry
3. **Today Dashboard** (`/today`) - Quick action hub
4. **Basic Progress** (`/insights`) - Weight trend visualization

### Post-MVP Features (Disabled for MVP)
- **Workout Tracking** (`/workouts`, `/workouts/add`) - Deterministic AI parser
- **Advanced Analytics** - Complex insights and goal tracking

## Database Architecture
### MVP Tables (Priority)
- `foods` table (USDA verified, 8000+ entries)
- `body_weight` table (daily weight logs)
- `food_logs` table (user food entries)

### Post-MVP Tables (Exists but Disabled)
- `workouts` table (sets/reps/weight tracking)

Row-Level Security enabled for multi-tenant safety

## Key File Locations
- **Pages**: `app/[route]/page.tsx` (Next.js App Router)
- **Components**: `components/[feature]/` organized by domain
- **Database**: `supabase/migrations/` for schema changes
- **Types**: `lib/types/` for TypeScript definitions
- **Styles**: `app/globals.css` + Tailwind utilities

## Development Rules
### MVP Rules (Enforced)
1. **MVP ONLY** - Work only on Food/Weight/Today/Basic Progress
2. **No workout features** - Ignore all workout-related requests until post-MVP
3. **Perfect existing flows** - Fix bugs in MVP features vs adding new ones
4. **1-week deadline** - Prioritize shipping over feature completeness

### General Rules
5. **Always dark-first** - Default to dark theme, black backgrounds
6. **No fake content** - Only real, verified data
7. **No fluff text** - Simple, clear, functional copy only
8. **Test everything** - Write Jest tests for new features
9. **Type everything** - Full TypeScript coverage required

## Testing Strategy
- Component tests in `__tests__/components/`
- Page tests in `__tests__/pages/`
- Utility tests in `__tests__/lib/`
- All tests must pass before deployment

## Common Tasks
### Fix styling issues:
1. Check `tailwind.config.ts` for color definitions
2. Verify `app/globals.css` for global styles
3. Ensure components use dark-first classes

### Add new feature:
1. Create route in `app/[feature]/page.tsx`
2. Add database migration in `supabase/migrations/`
3. Create component in `components/[feature]/`
4. Write tests in `__tests__/`
5. Update navigation in `lib/navigation/routes.ts`

### Database changes:
1. Create migration: `supabase/migrations/XXXX_description.sql`
2. Update types in `lib/types/`
3. Add RLS policies for security
4. Update seed script if needed

## Deployment Checklist
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production
- [ ] Database migrations applied
- [ ] Environment variables configured

## Troubleshooting
- **White backgrounds**: Check for missing `bg-bg` or `bg-surface` classes
- **Type errors**: Ensure all imports have proper types
- **Test failures**: Update test assertions for new content
- **Build failures**: Check for unused imports or type mismatches

## Performance Notes
- Images optimized with Next.js Image component
- Bundle splitting enabled for code optimization
- Database queries use efficient RLS policies
- Minimal dependencies for fast load times