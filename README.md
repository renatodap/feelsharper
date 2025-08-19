# Feel Sharper 🎯 - AI Fitness Coach That Actually Understands You

**"Iron sharpens iron"** - A revolutionary fitness app that uses natural language AI to make health tracking effortless.

## 📁 Organized Project Structure

```
feelsharper-deploy/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utilities and services
├── public/                 # Static assets
├── supabase/              # Database
│   └── migrations/        # 3 essential SQL files only
├── tests/                 # All test files (organized)
│   ├── api/              # API tests
│   ├── browser/          # Browser-based tests
│   ├── database/         # Database tests
│   ├── e2e/              # End-to-end tests
│   ├── integration/      # Integration tests
│   └── reports/          # Test reports & lighthouse
├── tools/                 # Development tools
│   └── scripts/          # Migration & utility scripts
├── docs/                  # Documentation
│   ├── mvp/              # MVP docs (MVP_TRUTH, etc)
│   └── guides/           # Setup guides
├── config/                # Configuration files
└── 99-ARCHIVE/           # Old files (safely archived)
```

## 🚀 What Makes This Different

**Traditional fitness apps**: Forms, databases, manual entry, clicking through menus  
**Feel Sharper**: Just talk naturally - AI handles everything

```
You: "Had eggs and toast, ran 5k, weight 175, feeling great"
AI: "Logged! Great run pace today. You're on track for your goal. Tomorrow try..."
```

## 🎯 Core Philosophy

Part of the **Sharpened Ecosystem** - AI-powered platforms for human improvement:
- **FeelSharper**: Fitness & health (this app)
- **StudySharper**: Learning optimization (coming soon)
- **SkillSharper**: Professional development (coming soon)

As AI replaces jobs, humans must sharpen themselves. We make that frictionless.

## ✨ MVP V2 Features (Natural Language Focus)

### What Users Can Do
- **Talk naturally**: "Had a burger for lunch" → AI logs calories automatically
- **Voice input**: Speak instead of type - perfect for post-workout logging
- **AI coaching**: Get personalized insights based on your patterns
- **Simple dashboard**: See only what matters for YOUR goals
- **Quick check-ins**: Rate energy/mood with one tap
- **Pattern recognition**: AI spots trends and suggests improvements

### What We Removed (On Purpose)
- ❌ No complex food databases to search through
- ❌ No forms with 20 fields to fill out
- ❌ No manual calorie counting
- ❌ No overwhelming dashboards
- ❌ No generic, one-size-fits-all advice

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.4.5, React 19, TypeScript
- **Styling**: Tailwind CSS 4 (dark-first design)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4 (parsing) + Claude 3 (coaching)
- **Voice**: Web Speech API
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase account
- OpenAI API key
- Anthropic API key

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/yourusername/feelsharper.git
   cd feelsharper
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   # AI APIs (Required for MVP V2)
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_claude_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
feelsharper/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home with natural language input
│   ├── chat/              # AI coach conversation
│   └── api/               # API routes
│       ├── ai/            # AI processing endpoints
│       └── activity/      # Activity logging
├── components/            
│   ├── ai/               # AI chat components
│   ├── voice/            # Voice input components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── ai/               # AI integration (OpenAI, Claude)
│   ├── parsers/          # Natural language parsers
│   └── supabase/         # Database client
└── docs/
    └── MVP_V2_NATURAL_LANGUAGE.md  # Full MVP documentation
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/feelsharper)

### Manual Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## 📊 Database Schema (Simplified for MVP V2)

```sql
-- Single table for all activities
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  timestamp TIMESTAMPTZ,
  type TEXT, -- 'food', 'weight', 'workout', 'mood'
  raw_input TEXT, -- Original user input
  parsed_data JSONB, -- AI-parsed data
  ai_response TEXT -- What AI replied
);
```

## 🎯 Roadmap

### Phase 1: MVP V2 (Current)
- ✅ Natural language input
- ✅ AI parsing
- ✅ Voice input
- ⬜ Pattern recognition
- ⬜ Daily challenges

### Phase 2: Intelligence
- ⬜ Advanced coaching
- ⬜ Predictive insights
- ⬜ Habit formation
- ⬜ Social features

### Phase 3: Expansion
- ⬜ Wearable integration
- ⬜ Meal planning
- ⬜ Form checking (video)
- ⬜ Native mobile apps

## 🤝 Contributing

This is currently a solo project, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- OpenAI for GPT-4 natural language processing
- Anthropic for Claude coaching capabilities
- The fitness community for inspiration
- "Iron sharpens iron" - Proverbs 27:17

---

**Remember**: We're not building another fitness tracker. We're building an AI that understands you through natural conversation and helps you become sharper every day.

For detailed MVP documentation, see [MVP_V2_NATURAL_LANGUAGE.md](./MVP_V2_NATURAL_LANGUAGE.md)