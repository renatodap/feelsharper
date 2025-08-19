# FeelSharper MVP V2 - Natural Language AI Coach
**Last Updated**: 2025-08-19
**Vision**: Iron sharpens iron — AI-powered fitness companion that actually understands you

## 🎯 Core Philosophy Change

### ❌ OLD MVP (What We're Killing)
- Traditional form-based logging
- Search through 8000 foods
- Separate pages for each feature
- Manual everything
- MyFitnessPal clone from 2010

### ✅ NEW MVP (What We're Building)
- **ONE INPUT**: Natural language (voice or text)
- **AI COACH**: Real conversations, not forms
- **PERSONALIZED**: Shows only what matters to each user
- **FRICTIONLESS**: 30-second interactions
- **INTELLIGENT**: Learns patterns, gives insights

## 🚀 The New User Experience

### Day 1: Onboarding That Learns
```
App: "Hey! What brings you to FeelSharper?"
User: "I want to lose 20 pounds and get stronger"
App: "Got it. Tell me about your typical day - just talk naturally"
User: "I work 9-5, gym after work, usually tired by 8pm"
App: "Based on that, I'll help you track workouts, energy, and food. Sound good?"
User: "Yes"
App: "Perfect. Let's start simple - just tell me what you eat today, however you want."
```

### Daily Use: Natural Language Everything
```
Morning:
User: "Weight 175, feeling good, black coffee"
AI: Logs weight, mood: good, food: black coffee (0 cal)

Lunch:
User: "Chipotle bowl with chicken and rice"
AI: Logs ~650 cal, 45g protein, 65g carbs, 20g fat

Post-workout:
User: "Crushed legs, squats 225 for 5x5, tired but strong"
AI: Logs workout, notes fatigue, suggests recovery focus tomorrow
```

### Evening Check-in: Sharpening Reflection
```
AI: "How sharp did you feel today? (1-10)"
User: "7"
AI: "Nice! You hit your protein goal and crushed squats. Tomorrow's focus: recovery walk + extra sleep. Deal?"
User: "Deal"
```

## 🏗️ Technical Architecture

### Core Components

#### 1. Natural Language Processor
```typescript
// API: OpenAI GPT-4 for parsing
async function parseUserInput(text: string, userContext: UserContext) {
  const prompt = `
    Parse this fitness/health input into structured data:
    "${text}"
    
    User context: ${userContext}
    
    Extract: type (food/weight/workout/mood), data, timestamp
  `;
  
  return await openai.parse(prompt);
}
```

#### 2. Unified Activity Stream
```sql
-- Single table for everything
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  timestamp TIMESTAMPTZ,
  type TEXT, -- 'food', 'weight', 'workout', 'mood', 'energy'
  raw_input TEXT, -- Original user input
  parsed_data JSONB, -- AI-parsed structured data
  ai_response TEXT, -- What AI said back
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. AI Coach Brain
```typescript
interface CoachBrain {
  analyzePatterns(userId: string): Promise<Insights>;
  generateDailyChallenge(userId: string): Promise<Challenge>;
  createResponse(input: string, context: UserContext): Promise<Response>;
  suggestNextAction(history: Activity[]): Promise<Suggestion>;
}
```

## 📱 Simplified Pages Structure

### Before: 15+ pages
```
/food, /food/add, /weight, /workouts, /workouts/add, /insights, /goals, /settings...
```

### After: 3 pages
```
/ (Home)
  - Natural language input box
  - Today's mission
  - Quick stats
  - Last AI insight

/chat
  - Full conversation with AI coach
  - Voice input option
  - History of interactions

/progress
  - Simple visualizations
  - Week over week comparison
  - Pattern insights
```

## 🔧 Implementation Plan

### Phase 1: Core AI (Days 1-2)
- [ ] Set up OpenAI API integration
- [ ] Create natural language parser
- [ ] Build unified activity_logs table
- [ ] Test parsing accuracy with 50 examples

### Phase 2: Simplified UI (Days 3-4)
- [ ] Replace homepage with single input box
- [ ] Add voice input via Web Speech API
- [ ] Create minimalist dashboard (5 widgets max)
- [ ] Remove all complex forms

### Phase 3: Intelligence Layer (Days 5-7)
- [ ] Pattern recognition system
- [ ] Daily challenge generator
- [ ] Insight engine (weekly patterns)
- [ ] Personalized responses based on history

### Phase 4: Testing & Polish (Days 8-10)
- [ ] Test with 5 real users
- [ ] Refine AI prompts based on feedback
- [ ] Optimize for <2 second response time
- [ ] Add offline support for basic logging

## 🎮 User Flows

### Flow 1: Quick Morning Log
1. Open app
2. Tap mic or type
3. Say "Weight 175, feeling great"
4. See confirmation + daily mission
5. Close app
**Time: 15 seconds**

### Flow 2: Post-Meal Log
1. Open app
2. Type "lunch: chicken salad and apple"
3. AI shows parsed nutrition
4. User confirms or corrects
5. Done
**Time: 20 seconds**

### Flow 3: AI Coaching Session
1. User: "I'm struggling with evening snacking"
2. AI: Analyzes patterns, finds triggers
3. AI: "I notice you snack most after stressful work days. Let's try..."
4. Provides actionable strategy
5. Sets reminder for evening check-in
**Time: 2 minutes**

## 💾 Database Schema (Simplified)

```sql
-- Users table (existing)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ
);

-- Single activity table (NEW)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  timestamp TIMESTAMPTZ,
  type TEXT,
  raw_input TEXT,
  parsed_data JSONB,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (NEW)
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users,
  goals TEXT[],
  tracked_metrics TEXT[], -- ['weight', 'food', 'mood']
  ai_personality TEXT DEFAULT 'encouraging', -- or 'strict', 'analytical'
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights cache (NEW)
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  insight_type TEXT, -- 'pattern', 'suggestion', 'warning'
  content TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔑 API Keys Configuration

```env
# OpenAI - Natural language parsing
OPENAI_API_KEY=sk-proj-[configured]

# Anthropic Claude - Advanced coaching conversations
ANTHROPIC_API_KEY=sk-ant-api03-[configured]

# Model Selection
AI_PARSING_MODEL=gpt-4-turbo-preview  # Fast parsing
AI_COACH_MODEL=claude-3-opus           # Deep conversations
```

## 📊 Success Metrics

### Week 1
- 80% of inputs via natural language (not forms)
- Average session duration: <30 seconds
- Daily active rate: 70%
- AI parsing accuracy: >90%

### Month 1
- User feedback: "Feels like talking to a real coach"
- 50% convert to premium for unlimited AI
- Users share AI insights on social media
- Retention: 60% still active daily

## 🚨 What We're NOT Building (Yet)

- Complex food database searching
- Detailed workout exercise library
- Social features/challenges
- Wearable integrations
- Meal planning
- Barcode scanning
- Photo food recognition

## 🎯 The One Thing That Matters

**If users can log their entire day in one sentence and get valuable feedback, we win.**

Example:
```
"Ran 5k, ate healthy except for pizza at dinner, weight same, feeling tired"
```

AI understands:
- Cardio workout completed
- Mostly good nutrition with one indulgence
- Weight stable
- Low energy levels

AI responds:
"Great job on the 5k! The pizza won't hurt your progress. Your fatigue might be from 3 days of intense training. Tomorrow: easy recovery day?"

## 🏁 Launch Criteria

MVP is ready when:
1. ✅ Natural language input works for food, weight, workouts, mood
2. ✅ AI responds intelligently to patterns
3. ✅ User can complete daily logging in <30 seconds
4. ✅ Personalized dashboard based on user goals
5. ✅ 5 beta users say "This feels different from other apps"

---

**Remember**: We're not building another tracker. We're building an AI coach that understands you through natural conversation. Every feature should support this vision.