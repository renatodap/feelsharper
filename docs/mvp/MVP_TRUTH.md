# FeelSharper MVP - The Single Source of Truth
**Last Updated**: 2025-08-19
**Status**: IMPLEMENTING TRUE A+ VERSION

## 🎯 MVP Core Requirements

### Essential Features (MUST HAVE)
1. **Food Logging** ✅ - Track what you eat
2. **Weight Tracking** ✅ - Monitor weight changes  
3. **Exercise Logging** ✅ - Record workouts

### Revolutionary Feature: Unified Natural Language Input
- **Single input box** that understands everything
- **No need to specify type** - AI figures out if it's food, weight, or exercise
- **Voice input** via Web Speech API
- **Photo input** with AI analysis
- **Smart auto-logging** when confidence is high (>80%)
- **Confirmation UI** for uncertain inputs (50-80% confidence)

## 🏗️ Implementation Status

### ✅ COMPLETED
- OpenAI + Claude API integration
- Basic natural language parsing endpoint (`/api/ai/parse`)
- Pattern matching for weight, food, exercise
- Traditional pages (food/add, weight, etc.)
- Database schema (Supabase)
- Production build working

### 🚧 IMPLEMENTING NOW
- [x] UnifiedNaturalInput component with voice + photo
- [ ] Smart auto-logging with confidence levels
- [ ] Image parsing endpoint (`/api/ai/parse-image`)
- [ ] Activity logging endpoint (`/api/activities/log`)
- [ ] Integration on main dashboard
- [ ] Full testing of all input types

## 📱 User Experience

### How It Works
1. **User opens app** → Sees unified input box
2. **User speaks/types/photos** → "weight 175" or "ran 5k" or photo of meal
3. **AI parses** → Determines type and extracts data
4. **Smart logging**:
   - High confidence (>80%) → Auto-logs
   - Medium confidence (50-80%) → Shows confirmation
   - Low confidence (<50%) → Asks for clarification
5. **Instant feedback** → "✓ Weight logged: 175 lbs"

### Example Interactions
```
User: "175"
AI: [Confirms] "Log weight as 175 lbs?" [Yes/No]

User: "weight 175"  
AI: [Auto-logs] "✓ Weight logged: 175 lbs"

User: "Ran 5k in 25 minutes, feeling great"
AI: [Auto-logs] "✓ Exercise logged: 5k run, 25 minutes"

User: "Chicken salad for lunch"
AI: [Auto-logs] "✓ Food logged: Chicken salad (lunch)"

User: [Photos meal]
AI: [Analyzes] "✓ Food logged: Sandwich, apple, water"
```

## 🔧 Technical Architecture

### Components
```
UnifiedNaturalInput.tsx    # Main input component
├── Voice input (Web Speech API)
├── Photo upload + preview
├── Text input with auto-submit
├── Confidence-based UI
└── Auto-logging system

/api/ai/parse              # Natural language parsing
├── OpenAI GPT-4 parsing
├── Pattern matching fallback
├── Confidence scoring
└── Claude coaching response

/api/ai/parse-image        # Image analysis
├── OCR for text in images
├── AI food recognition
└── Exercise form analysis

/api/activities/log        # Unified logging
├── Save to activity_logs table
├── Type-specific processing
└── Real-time updates
```

### Database
```sql
-- Unified activity table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  type TEXT, -- 'food', 'weight', 'exercise', 'mood'
  raw_input TEXT,
  parsed_data JSONB,
  confidence FLOAT,
  auto_logged BOOLEAN,
  created_at TIMESTAMPTZ
);
```

## ✅ Success Criteria

The MVP is A+ when:
1. **Unified input works** for all three types (food, weight, exercise)
2. **Voice input** transcribes and parses correctly
3. **Photo input** recognizes food and logs it
4. **Auto-logging** works for high-confidence inputs
5. **Confirmation UI** appears for uncertain inputs
6. **Everything tested** end-to-end with real examples

## 📊 Testing Checklist

- [ ] Weight: "175" → Confirmation → Logs
- [ ] Weight: "weight 175" → Auto-logs
- [ ] Food: "chicken salad" → Auto-logs
- [ ] Food: Photo of meal → Recognizes → Logs
- [ ] Exercise: "ran 5k" → Auto-logs
- [ ] Voice: Speak any above → Transcribes → Logs
- [ ] Mixed: "weight 175, ran 5k, ate healthy" → Parses all three
- [ ] Uncertain: "did stuff" → Asks for clarification

## 🚀 Deployment Plan

1. **Complete implementation** (4-6 hours)
2. **Test all scenarios** (2 hours)
3. **Deploy to production** (30 minutes)
4. **Monitor and iterate** based on user feedback

## 🎯 The One Test That Matters

Open the app and say: **"Weight 175, ran 5k, had eggs for breakfast"**

If this logs all three activities correctly, we have achieved A+.

---

**This is the ONLY MVP documentation that matters. Everything else is archived.**