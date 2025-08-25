# 🔬 FeelSharper Research & Development Priorities

*Last Updated: 2025-08-21*

## 🎯 MVP Critical Research (Implement Now)

### 1. Natural Language Processing for Health Data ⚡ PRIORITY
**Why Critical**: Core to the "no forms" MVP promise

#### Immediate Implementation:
- **Ambiguity Resolution**: 
  - "protein shake" → prompt for brand/size via confidence scoring
  - "ran 5k" → assume kilometers (add context detection)
  - Cache user's common entries for faster future parsing
  
- **Temporal Expression Parsing**:
  - "worked out this morning" → timestamp extraction
  - "had lunch 2 hours ago" → relative time calculation
  - Use Gemini's free tier for 80% of parsing

- **Voice Error Correction**:
  - Handle common transcription errors ("one egg" vs "1g")
  - Context-based validation (eggs measured in count, not grams)
  - Implement fallback confirmations for low-confidence parses

#### MVP Baseline Target:
- 83.8% accuracy on food items (MIT research benchmark)
- 92.2% accuracy on quantity resolution
- <2 second response time

### 2. AI Coach Personality & Conversation Design ⚡ PRIORITY
**Why Critical**: Defines the entire user experience

#### Immediate Implementation:
- **Motivational Interviewing (MI) Basics**:
  ```
  Instead of: "You should run more"
  Use: "How did you feel after your last run?"
  ```
  - OARS method: Open questions, Affirmations, Reflective listening, Summaries
  - Empathy-first responses for trust building

- **Adaptive Tone (Simple Version)**:
  - Start with 3 presets: Gentle, Balanced, Push
  - User selects during onboarding
  - AI adjusts based on detected mood keywords

- **Conversation Memory**:
  - Store last 5 exchanges + user profile summary
  - Persist key facts (injuries, preferences, goals)
  - Use context injection for continuity

#### MVP Safety Guardrails:
- Medical disclaimer on every health suggestion
- Injury detection → "Please see a doctor"
- No extreme diet/exercise recommendations

### 3. Voice UX for Core Actions ⚡ PRIORITY
**Why Critical**: Voice-first is a key differentiator

#### Immediate Implementation (Top 10 Commands):
```javascript
1. "Log my [meal]: [description]"
2. "I [exercised] for [duration]"
3. "Start tracking my [activity]"
4. "Stop tracking"
5. "How many calories today?"
6. "What's my weight trend?"
7. "I weigh [number] [units]"
8. "I feel [mood/energy]"
9. "What should I do today?"
10. "Show my progress"
```

#### Technical Approach:
- Use Web Speech API for browser
- Leverage device's native speech recognition
- Implement confirmation for ambiguous commands
- Add noise handling for gym environments

### 4. Privacy & Medical Compliance ⚡ PRIORITY
**Why Critical**: Legal requirement and trust foundation

#### Day 1 Requirements:
- **Data Security**:
  - HTTPS everywhere
  - Encryption at rest and in transit
  - Secure token storage for API integrations

- **Compliance Basics**:
  - GDPR consent flow for EU users
  - Data export/delete functionality
  - Medical disclaimer on all pages
  - Age gate (16+ or parental consent)

- **Platform Policies**:
  - Apple HealthKit: No ads, no data selling
  - Google Fit: OAuth2 with minimal scopes
  - Clear privacy policy with data usage

### 5. LLM Prompt Engineering ⚡ PRIORITY
**Why Critical**: Powers both parsing and coaching

#### Immediate Implementation:
```python
# Few-shot learning template for parsing
prompt = """
User: I ran 2 miles in 18 minutes
Parse: {"activity": "running", "distance": 2, "unit": "miles", "duration": 18}

User: Had 2 eggs and toast for breakfast
Parse: {"meal": "breakfast", "foods": ["eggs", "toast"], "quantities": [2, 1]}

User: [NEW INPUT]
Parse:
"""

# Chain-of-thought for complex queries
prompt = """
Think step-by-step:
1. Identify the activity type
2. Extract quantities and units
3. Note any subjective descriptors
4. Structure the data
"""
```

#### Safety Measures:
- Prompt injection prevention
- Confidence scoring (0-100)
- Fallback to clarifying questions
- Never provide medical advice

## 🚀 MVP Simplified Features (Basic Version)

### 1. Habit Formation (Simple Version)
**Start Basic, Enhance Later**

#### MVP Implementation:
- **Simple Streak Tracking**: Daily check-in counter
- **3 Milestone Badges**: 7-day, 21-day, 30-day
- **One Daily Reminder**: User-set time
- **Streak Freeze**: 1 skip allowed per week

#### Post-MVP Enhancements:
- Location-based triggers
- Circadian rhythm optimization
- Weather-aware suggestions
- Complex habit stacking

### 2. Gamification (Minimal Version)
**Just Enough to Engage**

#### MVP Implementation:
- **Points**: 10 per logged activity
- **3 Levels**: Beginner (0-100), Regular (100-500), Pro (500+)
- **Weekly Challenge**: One simple goal
- **Progress Bar**: Visual daily completion

#### Post-MVP Enhancements:
- Bartle player types customization
- Variable reward schedules
- Team competitions
- Narrative elements

### 3. Food Database (Essential Only)
**Start with Free APIs**

#### MVP Implementation:
- **Primary**: USDA Database (free, reliable)
- **Backup**: OpenFoodFacts (free, community)
- **Custom**: Top 100 common foods cached
- **Estimation**: Generic portions (small/medium/large)

#### Post-MVP Enhancements:
- Nutritionix premium integration
- Restaurant menu matching
- Barcode scanning
- Recipe analysis

### 4. Wearable Integration (1-2 Only)
**Start with Most Popular**

#### MVP Implementation:
- **Apple Health**: iOS users (direct, no API cost)
- **Google Fit**: Android users (free API)
- Manual entry fallback for all metrics

#### Post-MVP Enhancements:
- Garmin Connect
- Fitbit
- Whoop
- Oura
- Strava

## 📅 Week 1 Research Tasks (Must Complete)

### Day 1-2: Baseline Testing
- [ ] Test 100 real fitness/food inputs with Gemini
- [ ] Document parsing accuracy baseline
- [ ] Identify top 20 failure patterns

### Day 3-4: API Documentation
- [ ] Document Gemini rate limits (60/min free)
- [ ] Document OpenAI costs (backup service)
- [ ] List Apple Health data types available
- [ ] Google Fit API scopes needed

### Day 5: Voice & Safety
- [ ] Create voice command grammar (10 commands)
- [ ] Build confidence scoring rubric
- [ ] Draft medical disclaimer text
- [ ] Create prompt injection test suite

## 🔮 Future Research Areas (Post-MVP)

### Advanced Analytics
- Habit formation curves by activity type
- Dropout prediction models
- Optimal intervention timing
- A/B testing framework

### Sport-Specific Metrics
- Tennis: First serve %, unforced errors
- Running: VO2max, TRIMP, recovery metrics
- Strength: 1RM calculations, volume progression
- Sport-specific coaching protocols

### Advanced Integrations
- Multi-device conflict resolution
- Real-time workout tracking
- Live group challenges
- WebSocket architecture

### Competitive Features to Study
- **MacroFactor**: Adaptive TDEE algorithm
- **StrongLifts**: Progressive overload
- **Sleep Cycle**: Phone-only sleep tracking
- **Centr**: Celebrity coach personalities
- **Future**: Human + AI hybrid

## 📊 Success Metrics for Research

### MVP Launch Criteria:
- NLP Accuracy: >80% on common inputs
- Response Time: <2 seconds
- Voice Recognition: >70% success rate
- Safety: 100% medical disclaimers
- Privacy: GDPR/CCPA compliant

### Research Validation:
- 100 test inputs documented
- 20 user intents mapped
- API costs within budget
- Voice commands tested
- Confidence scoring implemented

## 🚨 Research Blockers & Solutions

### Potential Issues:
1. **NLP Accuracy Too Low**
   - Solution: Add more few-shot examples
   - Fallback: Manual entry options

2. **API Costs Too High**
   - Solution: Aggressive caching
   - Fallback: Reduce features temporarily

3. **Voice Recognition Poor**
   - Solution: Limit to simple commands
   - Fallback: Text input priority

4. **Compliance Complexity**
   - Solution: Conservative approach
   - Fallback: Limit to US initially

## 💡 Key Insights from Research

### What Works (Proven):
- Tiny habits approach (BJ Fogg)
- Streak tracking with forgiveness
- Identity-based habit formation
- Variable rewards for engagement
- Social accountability features

### What to Avoid:
- Complex onboarding
- Too many features at once
- Rigid streak requirements
- Generic one-size-fits-all
- Guilt-based motivation

## 📝 Documentation Updates

### Files to Create:
- `/docs/NLP_PARSING_RULES.md`
- `/docs/VOICE_COMMANDS.md`
- `/docs/PRIVACY_POLICY.md`
- `/docs/AI_SAFETY_GUIDELINES.md`

### APIs to Document:
- Gemini configuration
- OpenAI fallback setup
- HealthKit permissions
- Google Fit OAuth flow

---

**Remember**: MVP = Minimum VIABLE Product
- Focus on core natural language experience
- Perfect the AI coach personality
- Ensure safety and compliance
- Everything else can be enhanced post-launch