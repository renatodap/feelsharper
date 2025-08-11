# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server
npm run dev

# Production build (includes embedding generation)
npm run build

# Start production server
npm run start

# Type checking (run before commits)
npm run typecheck

# Code linting
npm run lint

# End-to-end testing
npm run test:e2e
```

### AI Assistant Commands
```bash
# Generate embeddings for blog content (required before build)
npm run generate-embeddings

# Test assistant functionality
npm run test-assistant

# Seed database with initial data
npm run seed
```

## Architecture Overview

This is a Next.js 15 application with App Router featuring a wellness blog with an AI-powered assistant called "Ask Feel Sharper". The application is built around a **Retrieval-Augmented Generation (RAG)** architecture that processes blog content into embeddings for semantic search and contextual AI responses.

### Key Components Architecture

**Content Processing Pipeline:**
- MDX blog posts in `content/posts/` → Embedding generation → Vector storage → AI retrieval
- Script: `scripts/generate-embeddings.ts` processes MDX content into chunks
- Library: `lib/embeddings.ts` handles OpenAI text-embedding-3-small generation
- Storage: `lib/vector-store.ts` provides in-memory vector search with cosine similarity

**AI Assistant System:**
- API Route: `app/api/ask/route.ts` - Claude 3.5 Sonnet with custom system prompt
- Retrieval: `lib/retrieval.ts` - Query preprocessing and content retrieval
- Rate Limiting: `lib/rate-limiter.ts` - Request throttling and abuse prevention

**Database Schema:**
- Supabase PostgreSQL with comprehensive fitness tracking tables
- Migration: `supabase/migrations/0001_init.sql` defines complete schema
- Tables: profiles, workouts, meals, body_metrics, sleep_logs, AI conversations, etc.
- Row-Level Security enabled for all user data

### Application Structure

```
app/                     # Next.js App Router
├── api/ask/            # AI assistant API endpoint
├── blog/               # Blog pages and dynamic routes
├── (auth)/             # Authentication pages (sign-in/up)
└── [feature pages]     # Dashboard, settings, tracking pages

components/
├── chat/               # AI assistant UI components
├── blog/               # Blog-specific components (cards, callouts)
├── feature/            # Core feature components
├── layout/             # Navigation and layout
└── ui/                 # Reusable UI primitives

lib/
├── embeddings.ts       # OpenAI embedding generation
├── vector-store.ts     # In-memory vector search
├── retrieval.ts        # RAG content retrieval
├── rate-limiter.ts     # API rate limiting
└── supabase/          # Database clients
```

## Technology Stack

**Core Framework:**
- Next.js 15 with App Router, React 19, TypeScript strict mode
- Tailwind CSS 4 with custom brand color system and typography

**AI & Content:**
- Anthropic Claude 3.5 Sonnet for AI assistant responses
- OpenAI text-embedding-3-small for content embeddings
- MDX processing with gray-matter for frontmatter

**Database & Auth:**
- Supabase for PostgreSQL database, authentication, and real-time features
- Row-Level Security policies for data isolation

**Development Tools:**
- Husky for pre-commit hooks
- Playwright for end-to-end testing
- ESLint and TypeScript for code quality

## Environment Variables

Required environment variables (see `env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI APIs
ANTHROPIC_API_KEY=           # For Claude assistant
OPENAI_API_KEY=              # For embeddings

# App Configuration
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_UNITS_WEIGHT=kg
NEXT_PUBLIC_DEFAULT_UNITS_DISTANCE=km
```

## Critical Build Process

**Embedding Generation is REQUIRED before production build:**
1. MDX content is processed into semantic chunks
2. OpenAI embeddings generated for each chunk
3. Vector store populated for retrieval
4. Data persisted to `data/embeddings.json`

The build command automatically runs `generate-embeddings` before `next build`.

## AI Assistant Implementation Details

**RAG Pipeline:**
1. User query → Query preprocessing with term expansion
2. Generate query embedding via OpenAI
3. Vector similarity search against content chunks
4. Retrieve top relevant content with similarity scores
5. Build context prompt with retrieved content
6. Send to Claude with specialized system prompt
7. Return response with source citations

**System Prompt Character:**
- Brand voice: Direct, Grounded, Intentional
- Wellness optimization coach for men 25-45
- Evidence-based, no-hype approach
- Always includes medical disclaimers

**Rate Limiting:**
- IP-based throttling to prevent abuse
- Configurable limits with exponential backoff
- Health check endpoint for monitoring

## Database Design Patterns

The Supabase schema supports comprehensive fitness tracking:
- **User Management:** profiles with preferences and goals
- **Workout Tracking:** strength sets, cardio sessions with metrics
- **Nutrition Logging:** meals and detailed food items
- **Body Metrics:** weight, measurements, body fat tracking
- **Recovery:** sleep quality and subjective wellness scores
- **AI Integration:** conversation history and weekly insights

All tables use UUID primary keys and include Row-Level Security policies ensuring users only access their own data.

## Testing Strategy

**Type Safety:**
- Strict TypeScript configuration with `noEmit: true`
- Path aliases configured via `@/*` imports
- Run `npm run typecheck` before all commits

**E2E Testing:**
- Playwright configuration for smoke tests
- Tests run against local development server
- Test file: `tests/smoke.spec.ts`

## Performance Optimizations

**Content Delivery:**
- Automatic image optimization via Next.js
- Static generation for blog content where applicable
- Component-level code splitting

**AI Response Efficiency:**
- Chunk-based content retrieval limits context size
- Claude token limits (800 max tokens) for faster responses
- Cosine similarity thresholds filter low-relevance content

**Caching Strategy:**
- Vector store loaded once at build time
- In-memory search for sub-second query response
- Next.js automatic route and data caching