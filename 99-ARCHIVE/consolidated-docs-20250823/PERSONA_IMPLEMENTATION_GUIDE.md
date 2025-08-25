# 🚀 FeelSharper Persona Implementation Quick Reference
*Last Updated: 2025-08-21*
*Status: TECHNICAL IMPLEMENTATION GUIDE*

## 🗄️ Database Schema Requirements

### activity_logs Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  raw_text TEXT NOT NULL,              -- Original natural language input
  activity_type ENUM('cardio', 'strength', 'sport', 'wellness', 'nutrition'),
  parsed_data JSONB,                   -- Structured extraction
  confidence_level FLOAT,              -- 0.0 to 1.0
  subjective_notes TEXT,               -- Feelings, mood, performance
  created_at TIMESTAMP
);
```

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  user_type ENUM('endurance', 'strength', 'sport', 'professional', 'weight_mgmt'),
  dashboard_config JSONB,              -- Widget preferences per persona
  common_logs JSONB,                   -- Frequently repeated entries
  preferences JSONB,                   -- Diet, goals, constraints
  detected_patterns JSONB,             -- AI-learned behaviors
  onboarding_data JSONB                -- Initial quiz responses
);
```

## 🤖 Natural Language Parser Prompts

### Endurance Athlete Parser
```javascript
const ENDURANCE_PARSER = `
Parse this athlete's training log. Extract:
- Distance and duration
- Pace/speed metrics  
- Heart rate zones if mentioned
- Perceived effort (RPE)
- Fatigue indicators
- Equipment used (bike, shoes, etc)

Example: "Ran 15k at 5:00/km, felt tired after 10k"
Output: {
  type: "run",
  distance_km: 15,
  pace_per_km: "5:00",
  subjective: "tired after 10k",
  confidence: 0.95
}
`;
```

### Strength Athlete Parser  
```javascript
const STRENGTH_PARSER = `
Parse this strength training log. Extract:
- Exercise name
- Weight, sets, reps
- RPE or "felt strong/weak"
- Body part targeted
- Rest periods if mentioned

Example: "Bench 225x8, felt strong"
Output: {
  exercise: "bench_press",
  weight_lbs: 225,
  reps: 8,
  subjective: "felt strong",
  confidence: 0.98
}
`;
```

### General Food Parser
```javascript
const FOOD_PARSER = `
Parse this food log. Estimate when vague:
- Food items and approximate portions
- Meal type (breakfast/lunch/dinner/snack)
- Estimated calories (with range)
- Protein content if relevant
- Confidence level based on specificity

Example: "Had pizza for dinner"
Output: {
  meal: "dinner",
  food: "pizza",
  calories_range: [600, 1200],
  calories_estimate: 900,
  confidence: 0.4
}
`;
```

## 📊 Dashboard Widget Configurations

### Endurance Athlete Widgets
```javascript
const ENDURANCE_DASHBOARD = {
  primary: [
    'weekly_volume',      // Miles/km per week
    'training_load',      // CTL/ATL/TSB if available
    'avg_heart_rate'      // Trends over time
  ],
  secondary: [
    'vo2max_estimate',
    'pace_progression',
    'recovery_score'
  ],
  hidden: ['protein_intake', 'body_measurements']
};
```

### Strength Athlete Widgets
```javascript
const STRENGTH_DASHBOARD = {
  primary: [
    'protein_daily',      // Grams with target line
    'strength_prs',       // Personal records tracker
    'weekly_volume'       // Sets x reps x weight
  ],
  secondary: [
    'body_weight',
    'body_composition',
    'muscle_group_frequency'
  ],
  hidden: ['running_pace', 'vo2max']
};
```

### Busy Professional Widgets
```javascript
const PROFESSIONAL_DASHBOARD = {
  primary: [
    'weight_trend',       // Simple line graph
    'workout_streak',     // Days active
    'energy_level'        // Self-reported 1-10
  ],
  secondary: [],          // Keep it minimal
  hidden: ['all_other_metrics']
};
```

## 🧠 AI Coach Response Templates

### For Endurance Athletes
```javascript
const ENDURANCE_INSIGHTS = [
  "Your easy runs are {10}% faster than 3 weeks ago",
  "Sleep quality dropped - consider an easy day",
  "Training load increasing - great progression!",
  "Heart rate {5} bpm lower at same pace - fitness improving"
];
```

### For Strength Athletes
```javascript
const STRENGTH_INSIGHTS = [
  "Bench press up {10} lbs in last month",
  "Protein intake averaging {amount}g - {target_comparison}",
  "Time for a deload week - volume very high",
  "Sleep correlates with your PR days"
];
```

### For Weight Management Users
```javascript
const WEIGHT_INSIGHTS = [
  "Down {x} lbs this month - steady progress",
  "Weekly average calories align with goal",
  "More protein could help with satiety",
  "Walking days show better weight trends"
];
```

## 🎯 User Type Detection Logic

```javascript
function detectUserType(logs) {
  const indicators = {
    endurance: ['ran', 'cycled', 'swam', 'miles', 'km', 'pace'],
    strength: ['bench', 'squat', 'deadlift', 'sets', 'reps', 'PR'],
    sport: ['tennis', 'basketball', 'soccer', 'practice', 'game', 'match'],
    professional: ['quick', 'busy', 'stressed', 'no time'],
    weight_mgmt: ['weight', 'scale', 'pounds', 'kg', 'diet']
  };
  
  // Count keyword frequency in first 10 logs
  // Assign user type based on highest match
  // Allow user to override in settings
}
```

## 🔄 Quick Log Templates by Persona

### Endurance
- "Same run as yesterday"
- "Easy 5k"
- "Long run Sunday"

### Strength  
- "Leg day"
- "Bench workout"
- "Back and bis"

### Sport
- "Tennis 90 min"
- "Practice session"
- "Game day"

### Professional
- "Gym 30 min"
- "Walked at lunch"
- "Skipped workout"

### Weight Management
- "Weigh in"
- "Cheat meal"
- "Good day"

## 📱 Voice Input Optimization

### Persona-Specific Voice Commands
```javascript
const VOICE_SHORTCUTS = {
  endurance: {
    "morning run": "ran 5k easy pace",
    "track workout": "intervals at track",
    "long run": "sunday long run completed"
  },
  strength: {
    "chest day": "bench press and accessories",
    "leg day": "squats and leg press",
    "arms": "biceps and triceps workout"
  },
  weight_mgmt: {
    "weigh in": "record current weight",
    "good day": "stayed on track with diet",
    "bad day": "overate today"
  }
};
```

## ⚡ Implementation Priority

### Week 1: Foundation
1. Natural language parser (all personas)
2. Basic user type detection
3. Database schema with persona fields

### Week 2: Personalization
1. Dashboard widget system
2. Persona-specific parsers
3. AI coach response templates

### Week 3: Optimization
1. Voice shortcuts per persona
2. Quick log templates
3. Confidence handling

### Week 4: Polish
1. User type refinement algorithm
2. Cross-persona features
3. Settings for manual override

---

**Remember: One codebase, many experiences. The magic is in the adaptation.**