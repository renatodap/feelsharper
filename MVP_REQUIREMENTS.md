# 🎯 FeelSharper MVP V2 Requirements - Natural Language AI Coach
*Last Updated: 2025-08-21*
*Status: REVOLUTIONARY PIVOT TO NATURAL LANGUAGE*

## 🚀 Core Vision
**The Problem**: Other fitness apps = endless forms & menus  
**Our Solution**: FeelSharper = just talk, AI does the rest

### Example Interaction
```
You: "Eggs & toast, ran 5k, weight 175, feeling great"
AI: "Logged! Great pace. On track—tomorrow try..."
```

## 🎯 MVP V2 Features (Priority Order)

### 1. **Natural Language Input** - THE CORE DIFFERENTIATOR
- Single chat box for EVERYTHING
- AI parses and categorizes automatically:
  - "Had eggs and toast for breakfast" → Auto-logs nutrition
  - "Ran 5k in 25 minutes" → Auto-logs workout  
  - "Weight 175, feeling great" → Logs weight + mood
  - "Played tennis poorly today" → Logs activity + subjective feeling
- Intelligent follow-up questions when needed
- Stores original text + parsed structured data

### 2. **Voice Input** - FRICTIONLESS LOGGING
- Web Speech API integration
- Speak after workout, done in seconds
- Transcribe → Parse → Save automatically
- Mobile-optimized for on-the-go logging

### 3. **Personalized AI Coach** - ADAPTIVE INTELLIGENCE
- Pattern recognition from ALL user data (sleep, weight, food, exercise, mood)
- Daily personalized challenges
- Top 2-3 insights in simple terms
- Adapts to user type (triathlete vs bodybuilder vs tennis player)
- Confidence levels for estimates

### 4. **Smart Dashboard** - WHAT MATTERS NOW
- Dynamically customized per user type
- Shows only relevant metrics based on goals
- "Add metric" button for manual exploration
- Different presets:
  - Endurance athlete: Hours trained, VO2 trends
  - Strength athlete: Volume, progressive overload
  - Sport-specific: Performance metrics

### 5. **Quick Re-logging** - HABITUAL ACTIONS
- "Common logs" section
- One-tap to repeat frequent entries
- Smart suggestions based on time/day patterns

## 📊 Success Metrics

### Technical Metrics
- **AI Response Time**: <2 seconds for parsing
- **Parse Accuracy**: 95%+ for common inputs
- **Voice Recognition**: 90%+ success rate
- **Dashboard Load**: <1 second

### User Metrics by Persona
- **Endurance Athletes**: 10-15 logs/week, 90% retention
- **Sport Players**: 5x/week engagement, 70% subjective notes
- **Strength Athletes**: Every workout logged, 95% protein tracking
- **Busy Professionals**: 100% voice usage, <30 sec interactions
- **Weight Management**: 4x/week weigh-ins, 70% meal logging

### Overall Business Metrics
- **Natural Language Usage**: 80% of all logs
- **Daily Active Users**: 70%+ 
- **Subscription Justification**: $497/month value demonstrated
- **User Type Distribution**: Track & optimize for high-value segments

## 🧠 AI Architecture & Knowledge System

### Data Organization Strategy
```
Central Intelligence File (per user):
├── Parse incoming text → Determine: INFO or QUESTION
├── Route to appropriate handler
├── Reference indexed knowledge:
│   ├── User tables (structured data)
│   ├── User notes (unstructured insights)
│   └── Knowledge base (medical/fitness/nutrition)
└── Generate response with confidence levels
```

### Knowledge Base Training
- Medical literature + peer-reviewed studies
- Professional nutritionist guidelines  
- Certified trainer methodologies
- Sport-specific training principles
- Continuous updates via automation
- Controversy handling: Default to scientific consensus, adapt to user constraints

### User Type Detection Algorithm
1. **Initial profiling**: Ask 2-3 questions on signup
2. **Behavioral analysis**: Learn from first 10 logs
3. **Vocabulary mapping**: "splits" → runner, "sets" → lifter
4. **Goal inference**: Performance vs health vs aesthetics
5. **Dynamic adjustment**: Refine classification over time

### Confidence Levels System
- High confidence: Precise data given (e.g., "200g chicken breast")
- Medium confidence: Reasonable estimate (e.g., "plate of rice with chicken")
- Low confidence: Vague input (e.g., "had lunch")
- Dashboard adapts advice based on confidence

## 📱 5-Page App Structure

### Page 1: AI Coach Dashboard
- Top 2-3 personalized insights
- Expandable explanations
- Today's mission/challenge
- Progress indicator

### Page 2: Quick Log
- Natural language chat box (prominent)
- Voice input button
- Fallback buttons: Manual food/weight/exercise logging
- Recent logs for quick repeat

### Page 3: Personal Dashboard
- Fully AI-customized metrics by user type:
  - **Endurance**: Training load, HR zones, weekly volume
  - **Strength**: PRs, volume progression, protein intake
  - **Sport**: Hours trained, performance ratings, win/loss
  - **Wellness**: Steps, sleep, mood tracking
  - **Weight**: Weight trend, calorie balance, photos
- "Add metric" sidebar for exploration
- Visual progress charts adapted to user preference
- Hide irrelevant metrics automatically

### Page 4: Coach Chat
- Deep conversation with AI
- Ask questions, get advice
- Review historical patterns
- Goal planning

### Page 5: Profile & Settings
- User preferences
- Profile completion score
- Goal adjustments
- Integration settings

## 👥 Target User Personas & Adaptations

### Primary Personas (MVP Focus)
1. **Endurance Athletes** (triathletes, runners, cyclists)
   - Dashboard: HR zones, training load, VO₂max trends
   - Logs: "Ran 15k at 5:00/km, felt tired after 10k"
   - AI Focus: Recovery patterns, training load optimization

2. **Tennis/Sport Players** (skill-based athletes)
   - Dashboard: Hours trained, performance ratings, mood overlay
   - Logs: "Tennis 90min, backhand was off today"
   - AI Focus: Performance-mood correlations, optimal rest periods

3. **Strength Athletes** (bodybuilders, powerlifters)
   - Dashboard: PRs, protein intake, volume progression
   - Logs: "Bench 225x8, felt strong"
   - AI Focus: Progressive overload, protein optimization

4. **Busy Professionals** (time-strapped users)
   - Dashboard: Minimal - weight, exercise frequency, energy
   - Logs: Voice-only "20 min Peloton, skipped lunch"
   - AI Focus: Quick actionable tips, no fluff

5. **Weight Management Users**
   - Dashboard: Weight trend, calorie estimates, weekly averages
   - Logs: "Had pizza for dinner" (vague is OK)
   - AI Focus: Gentle guidance, sustainable habits

### Adaptive Features by User Type
- **Natural language** adapts to user's vocabulary
- **Dashboard widgets** change based on detected user type
- **AI coaching tone** adjusts (technical for athletes, simple for beginners)
- **Confidence levels** shown differently per user sophistication

## 🎨 Design Principles
- **Philosophy**: Invisible interface - AI handles complexity
- **User Experience**: One input, infinite possibilities  
- **Visual Style**: Dark, focused, distraction-free
- **Interaction**: Natural language first, forms last
- **Personalization**: Every user sees their perfect version

## 💰 Business Model
- **Pricing**: $497/month premium (high value positioning)
- **Target**: Ambitious professionals who value time
- **Value Prop**: Personal AI coach that actually understands you
- **Future**: Team/corporate plans

## 🚫 NOT in MVP (Explicitly Out)
- Complex food database browsing
- Manual calorie counting interfaces
- Generic one-size-fits-all dashboards
- Form-based input as primary method
- Social features
- Meal planning (for now)

## 🔧 Technical Requirements
- **Must have**: OpenAI GPT-4 for parsing
- **Must have**: Claude API for coaching
- **Must have**: Unified activity_logs table
- **Must have**: Voice transcription
- **Performance**: <2 second response time
- **Scale**: 1,000 users initially

## 🔄 Future Integrations (Post-MVP)
- Garmin Connect sync
- Apple Health/Watch
- Strava import
- MyFitnessPal migration tool
- Whoop data

## ⚡ Critical Path to Launch
1. Implement natural language parser with OpenAI
2. Create unified activity_logs schema with user_type field
3. Build voice input interface (mobile-first)
4. Train AI coach on initial knowledge base + user personas
5. Design adaptive dashboard system with persona templates
6. Test with 10 beta users (2 per primary persona)
7. Iterate based on accuracy metrics per user type
8. Launch at $497/month with persona-specific marketing

## 🤔 Open Design Questions (Resolved)
- [x] How to handle different user types? → Adaptive dashboards
- [x] How to track subjective feelings? → Parse and store in notes
- [x] How to handle imprecise data? → Confidence levels
- [x] How to handle controversies? → Scientific consensus + user constraints
- [x] How to make re-logging easy? → Common logs section

## 📝 Key Insights from Vision
- **Personalization is everything** - No two users see the same dashboard
- **Friction kills habits** - Natural language removes ALL friction
- **Context matters** - "Played poorly" is as important as "played tennis"
- **Confidence transparency** - Tell users when we're estimating
- **Adaptive advice** - Specific when confident, general when not

## 🎯 What Makes This Revolutionary
Traditional apps make users adapt to the software.
FeelSharper adapts to the user.

Instead of:
- Navigate → Food → Search → Select → Quantity → Save

We have:
- "Had a burger" → Done

This is the future of fitness tracking.

---
**This vision delivers INSANE value because it solves the #1 problem: logging friction**