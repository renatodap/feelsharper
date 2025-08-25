# FeelSharper System Architecture

*Last Updated: 2025-08-23*

## Overview

FeelSharper is a Next.js 14 application with Supabase backend, featuring natural language processing for fitness tracking and AI-powered coaching.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Supabase      │
│   (Next.js 14)  │◄──►│   (Edge/Node.js) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Voice Input   │    │   AI Services    │
│   (Web Speech)  │    │   Multi-provider │
└─────────────────┘    └──────────────────┘
```

## Core Components

### 1. Frontend Layer (Next.js 14)
- **App Router**: Modern routing with layouts and page components
- **Server Components**: Optimized rendering and data fetching
- **Client Components**: Interactive UI with React hooks
- **Progressive Web App**: Offline support and native-like experience

### 2. API Layer
- **Parse Endpoint** (`/api/parse`): Natural language processing
- **Coach Endpoint** (`/api/coach`): AI coaching responses
- **Auth Endpoints**: User authentication and session management
- **Data Endpoints**: CRUD operations for user data

### 3. Database Layer (Supabase)
- **PostgreSQL**: Primary database with JSONB support
- **Row Level Security**: User-scoped data access
- **Real-time subscriptions**: Live data updates
- **Edge Functions**: Server-side logic

### 4. AI Integration
- **Primary**: Google Gemini (free tier, 80% usage)
- **Secondary**: OpenAI GPT-4 (paid, 20% usage)
- **Premium**: Claude 3.5 Sonnet (5% usage)
- **Smart Routing**: Automatic service selection and fallback

## Technical Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context + useReducer
- **PWA**: Service worker with caching strategies

### Backend
- **Runtime**: Node.js/Edge Runtime
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Caching**: In-memory caching with TTL

### AI Services
- **Gemini API**: Primary NLP and coaching
- **OpenAI API**: Advanced parsing fallback
- **Claude API**: Premium coaching features
- **Rate Limiting**: Service-specific limits with queuing

## Performance Optimizations

### Frontend
- **React.memo**: All major components memoized
- **useMemo**: Expensive computations cached
- **useCallback**: Event handlers optimized
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js automatic image optimization

### Backend
- **Database Queries**: Optimized with indexes and proper joins
- **Caching Layer**: 24h cache for parsing, 1h for coaching
- **Rate Limiting**: Prevents API abuse and controls costs
- **Connection Pooling**: Efficient database connections

### Bundle Size
- **First Load JS**: 183kB (optimized)
- **Build Time**: ~12 seconds
- **Lighthouse Score**: 95+ performance

## Security

### Authentication
- **Supabase Auth**: JWT-based authentication
- **Row Level Security**: Database-level access control
- **Session Management**: Secure session handling
- **Route Protection**: Middleware-based route guards

### Data Protection
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **HTTPS Only**: All communication encrypted

### AI Safety
- **Medical Disclaimers**: All health advice includes disclaimers
- **Professional Referrals**: System routes serious concerns to professionals
- **Content Filtering**: Inappropriate content detection
- **Rate Limiting**: Prevents abuse of AI services

## Deployment

### Production Environment
- **Frontend**: Vercel Edge Network
- **Database**: Supabase Cloud
- **CDN**: Vercel CDN for static assets
- **Monitoring**: Built-in error tracking and analytics

### Environment Variables
```bash
# Core Services
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=
```

## Monitoring & Analytics

### Performance Monitoring
- **Web Vitals**: Core performance metrics
- **Error Tracking**: Automatic error reporting
- **API Performance**: Response time monitoring
- **Database Performance**: Query analysis

### Business Analytics
- **User Engagement**: Feature usage tracking
- **Conversion Metrics**: Sign-up and retention rates
- **AI Usage**: Service utilization and costs
- **Health Metrics**: System uptime and reliability

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side state storage
- **Database Scaling**: Supabase handles database scaling
- **CDN Distribution**: Global content delivery
- **API Rate Limits**: Prevents system overload

### Cost Optimization
- **AI Service Selection**: Smart routing to minimize costs
- **Caching Strategy**: Reduces repeated API calls
- **Database Optimization**: Efficient queries and indexes
- **Edge Computing**: Reduced server load

---

For detailed implementation guides, see the [Implementation Directory](../implementation/).