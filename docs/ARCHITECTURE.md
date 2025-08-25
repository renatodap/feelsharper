# FeelSharper Architecture Documentation

*Generated: 2025-01-08*
*Status: Active*

## Repository Map

### Framework & Runtime
- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with custom components

### Entry Points
- **Main App**: `app/` directory (App Router structure)
- **API Routes**: `app/api/` directory
- **Middleware**: `middleware.ts` (rate limiting, security)
- **Development**: `npm run dev` (port 3000)
- **Production**: `npm run build && npm run start`

### Directory Structure

```
feelsharper-deploy/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth group routes
│   ├── [locale]/            # Localization routes
│   ├── api/                 # API endpoints
│   │   ├── admin/           # Admin endpoints
│   │   ├── ai/              # AI services
│   │   ├── auth/            # Authentication
│   │   └── coach/           # Coach features
│   ├── dashboard/           # User dashboard
│   ├── coach/               # Coach interface
│   └── workouts/            # Workout features
│
├── components/              # React components
│   ├── admin/              # Admin components
│   ├── ai/                 # AI-related UI
│   ├── coach/              # Coach components
│   ├── streaks/            # Streak tracking
│   ├── ui/                 # Base UI components
│   └── voice/              # Voice input
│
├── lib/                    # Core library code
│   ├── ai/                 # AI services
│   ├── ai-coach/           # Coach logic
│   ├── analytics/          # Analytics
│   ├── auth/               # Auth utilities
│   ├── database/           # DB utilities
│   └── types/              # TypeScript types
│
├── hooks/                  # React hooks
├── public/                 # Static assets
├── supabase/              # Database
│   └── migrations/        # SQL migrations
├── scripts/               # Build/utility scripts
└── __tests__/             # Test files
```

### API Routes Structure
- `/api/admin/*` - Admin functionality
- `/api/ai/*` - AI services (parse, coach, analyze)
- `/api/auth/*` - Authentication endpoints
- `/api/coach/*` - Coach features
- `/api/activities/*` - Activity logging
- `/api/workouts/*` - Workout management
- `/api/health` - Health check endpoint

### Database
- **Provider**: Supabase (PostgreSQL)
- **Migrations**: `supabase/migrations/`
- **Client**: `@supabase/supabase-js`
- **Auth**: Supabase Auth with JWT

### AI Services
- **Anthropic Claude**: Main AI provider
- **OpenAI**: Fallback/specific features
- **Google AI**: Additional features
- **Endpoints**: `/api/ai/parse`, `/api/ai/coach`, `/api/ai/analyze-food`

### Testing Setup
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Jest coverage reports
- **Commands**: `npm test`, `npm run test:e2e`

### CI/CD
- **Deployment**: Vercel
- **Environment Variables**: Vercel dashboard
- **Build Command**: `npm run build`
- **Output**: `.next/` directory

### Environment Variables
Required variables (see `.env.example`):
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- AI: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`
- Analytics: `SENTRY_DSN`, `POSTHOG_KEY`
- Payment: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Email: `RESEND_API_KEY`

### Data Flows
1. **User Request** → Next.js App Router → API Route → Service Layer → Database/AI
2. **Authentication**: Supabase Auth → JWT → Middleware validation
3. **AI Processing**: User input → Parser → AI Service → Response formatting
4. **Real-time**: Supabase Realtime subscriptions for live updates

### Component Boundaries
- **Pages**: Route handlers in `app/`
- **Components**: Reusable UI in `components/`
- **Services**: Business logic in `lib/`
- **API**: HTTP endpoints in `app/api/`
- **Database**: Supabase client abstraction
- **Types**: Shared types in `lib/types/`

### Security Layers
1. Middleware rate limiting
2. Input validation (Zod schemas)
3. Supabase Row Level Security
4. JWT authentication
5. Environment variable protection

### Performance Optimizations
- Server Components by default
- Client Components only when needed
- Image optimization with Next.js Image
- API route caching
- Database query optimization