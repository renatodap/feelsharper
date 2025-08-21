# 🏗️ FeelSharper MVP V2 - Natural Language Technical Architecture
*Last Updated: 2025-08-21*
*Status: DETAILED IMPLEMENTATION BLUEPRINT*

## 🧠 AI System Architecture

### Core AI Pipeline
```mermaid
User Input (text/voice)
    ↓
Transcription (if voice)
    ↓
Natural Language Parser (GPT-4)
    ↓
Intent Classification
    ├── LOG_DATA → Data Extraction → Confidence Scoring → Database Storage
    ├── QUESTION → Context Retrieval → Claude Coach → Response Generation
    └── COMMAND → Action Execution → Confirmation
    ↓
Response to User
```

### Database Schema Evolution

#### Unified Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Raw Input
  raw_text TEXT NOT NULL,  -- Original user input
  input_method VARCHAR(10), -- 'text', 'voice'
  
  -- Parsed Data
  activity_type VARCHAR(20), -- 'food', 'exercise', 'weight', 'mood', 'sleep'
  structured_data JSONB,     -- Parsed structured data
  confidence_level DECIMAL,  -- 0.0 to 1.0
  
  -- Metadata
  ai_model_version VARCHAR(20),
  parsing_metadata JSONB,    -- Debug info, tokens used, etc.
  
  -- User Context
  subjective_notes TEXT,     -- Extracted subjective feelings
  context_tags TEXT[],       -- ['morning', 'post-workout', 'tired']
  
  INDEX idx_user_timestamp (user_id, timestamp DESC),
  INDEX idx_activity_type (user_id, activity_type)
);
```

#### User Intelligence Profile
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY,
  
  -- User Type & Goals
  athlete_type VARCHAR(50), -- 'triathlete', 'bodybuilder', 'tennis_player'
  primary_goals TEXT[],
  constraints JSONB,        -- dietary, medical, preferences
  
  -- Adaptive Dashboard Config
  dashboard_metrics JSONB,  -- Which metrics to show
  dashboard_layout JSONB,   -- Customized layout
  
  -- AI Memory
  conversation_context JSONB, -- Rolling context window
  common_logs JSONB,          -- Frequently logged items
  patterns_detected JSONB,    -- Behavioral patterns
  
  -- Profile Completion
  profile_completeness DECIMAL,
  last_updated TIMESTAMPTZ
);
```

#### Knowledge Base Tables
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY,
  category VARCHAR(50),     -- 'nutrition', 'exercise', 'medical'
  topic VARCHAR(200),
  content TEXT,
  source VARCHAR(500),
  confidence_score DECIMAL,
  last_verified DATE,
  tags TEXT[]
);

CREATE TABLE user_knowledge_index (
  user_id UUID,
  knowledge_id UUID,
  relevance_score DECIMAL,
  last_accessed TIMESTAMPTZ,
  PRIMARY KEY (user_id, knowledge_id)
);
```

## 🎯 Natural Language Processing Implementation

### Input Processing Flow
```typescript
interface NLPPipeline {
  // Step 1: Receive Input
  async processInput(input: string, userId: string): Promise<ProcessedInput> {
    // Classify intent
    const intent = await classifyIntent(input);
    
    // Extract entities based on intent
    const entities = await extractEntities(input, intent);
    
    // Calculate confidence
    const confidence = calculateConfidence(entities);
    
    // Get user context
    const context = await getUserContext(userId);
    
    // Generate structured data
    const structured = await structureData(entities, context);
    
    return { intent, entities, confidence, structured };
  }
}
```

### Intent Classification Examples
```javascript
const INTENT_PATTERNS = {
  LOG_FOOD: [
    "ate", "had", "breakfast", "lunch", "dinner", "snack",
    "consumed", "drank", "calories"
  ],
  LOG_EXERCISE: [
    "ran", "lifted", "workout", "trained", "played",
    "swam", "cycled", "walked", "exercise"
  ],
  LOG_WEIGHT: [
    "weight", "weigh", "pounds", "kg", "lbs", "scale"
  ],
  LOG_MOOD: [
    "feeling", "mood", "happy", "tired", "energetic",
    "stressed", "great", "poor", "bad"
  ],
  QUESTION: [
    "what", "how", "why", "should", "can", "tell me",
    "advice", "suggest", "recommend"
  ]
};
```

### Confidence Scoring Algorithm
```typescript
interface ConfidenceScorer {
  calculateConfidence(parsedData: ParsedData): number {
    let score = 1.0;
    
    // Reduce confidence for vague quantities
    if (parsedData.hasVagueQuantity) score *= 0.7;  // "some", "a bit"
    
    // Reduce for missing units
    if (parsedData.missingUnits) score *= 0.8;       // "ran 5" (5 what?)
    
    // Reduce for ambiguous foods
    if (parsedData.genericFood) score *= 0.6;        // "had lunch"
    
    // Boost for specific measurements
    if (parsedData.hasPreciseMeasures) score *= 1.2; // "200g chicken"
    
    return Math.min(score, 1.0);
  }
}
```

## 🗣️ Voice Input Implementation

### Web Speech API Integration
```typescript
class VoiceInputHandler {
  private recognition: SpeechRecognition;
  
  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }
  
  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      this.recognition.onerror = reject;
      this.recognition.start();
    });
  }
}
```

## 🤖 AI Coach Intelligence System

### Coaching Logic Architecture
```typescript
interface CoachingSystem {
  // Analyze all user data to generate insights
  async generateInsights(userId: string): Promise<Insight[]> {
    const data = await getUserData(userId);
    
    // Pattern detection
    const patterns = detectPatterns(data);
    
    // Anomaly detection
    const anomalies = detectAnomalies(data);
    
    // Goal progress
    const progress = calculateProgress(data);
    
    // Generate personalized insights
    return generatePersonalizedInsights(patterns, anomalies, progress);
  }
  
  // Adaptive dashboard configuration
  async configureDashboard(userId: string): Promise<DashboardConfig> {
    const profile = await getUserProfile(userId);
    const goals = profile.primary_goals;
    const athleteType = profile.athlete_type;
    
    // Select relevant metrics
    const metrics = selectMetricsForUser(athleteType, goals);
    
    // Prioritize based on current focus
    const prioritized = prioritizeMetrics(metrics, profile.patterns_detected);
    
    return createDashboardConfig(prioritized);
  }
}
```

### Pattern Detection Examples
```javascript
const PATTERN_DETECTORS = {
  // Performance correlation
  performanceCorrelation: (data) => {
    // "You perform better in tennis after 8+ hours of sleep"
    return correlate(data.tennis_performance, data.sleep_duration);
  },
  
  // Nutritional gaps
  nutritionalGaps: (data) => {
    // "You're consistently low on protein on training days"
    return analyzeNutrientTiming(data.food_logs, data.workouts);
  },
  
  // Recovery patterns
  recoveryPatterns: (data) => {
    // "Your weight increases after high-sodium meals"
    return analyzeRecovery(data.weight_logs, data.food_logs);
  }
};
```

## 📊 Dashboard Personalization Engine

### Dynamic Metric Selection
```typescript
interface DashboardEngine {
  selectMetricsForUser(athleteType: string, goals: string[]): Metric[] {
    const BASE_METRICS = ['weight_trend', 'calories', 'activity'];
    
    const TYPE_SPECIFIC_METRICS = {
      triathlete: ['training_hours', 'zone_distribution', 'weekly_volume'],
      bodybuilder: ['protein_intake', 'progressive_overload', 'muscle_groups'],
      tennis_player: ['match_performance', 'serve_speed', 'rally_length'],
      general: ['step_count', 'sleep_quality', 'energy_level']
    };
    
    const GOAL_SPECIFIC_METRICS = {
      weight_loss: ['calorie_deficit', 'weekly_average', 'trend_line'],
      muscle_gain: ['protein_per_lb', 'training_volume', 'recovery_score'],
      performance: ['power_output', 'efficiency_metrics', 'fatigue_index']
    };
    
    return mergeAndPrioritize(
      BASE_METRICS,
      TYPE_SPECIFIC_METRICS[athleteType],
      ...goals.map(g => GOAL_SPECIFIC_METRICS[g])
    );
  }
}
```

## 🔄 Common Logs & Quick Actions

### Learning User Patterns
```typescript
class QuickLogLearner {
  async updateCommonLogs(userId: string, newLog: ActivityLog) {
    const userProfile = await getUserProfile(userId);
    const commonLogs = userProfile.common_logs || {};
    
    // Increment frequency counter
    const logSignature = this.createSignature(newLog);
    commonLogs[logSignature] = (commonLogs[logSignature] || 0) + 1;
    
    // Keep top 10 most common
    const topLogs = Object.entries(commonLogs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    await updateUserProfile(userId, { common_logs: Object.fromEntries(topLogs) });
  }
  
  createSignature(log: ActivityLog): string {
    // Create a signature for grouping similar logs
    return `${log.activity_type}:${log.structured_data.main_item}:${log.time_of_day}`;
  }
}
```

## 🧪 Handling Edge Cases

### Ambiguous Input Resolution
```typescript
const CLARIFICATION_STRATEGIES = {
  vague_quantity: {
    trigger: "had some rice",
    clarify: "About how much? (small bowl, large plate, cups?)",
    default: "1 cup (estimated)"
  },
  
  missing_context: {
    trigger: "ran 5",
    clarify: "5 miles or 5 kilometers?",
    default: "5 km (based on your usual patterns)"
  },
  
  multiple_interpretations: {
    trigger: "turkey",
    clarify: "Turkey breast, ground turkey, or turkey sandwich?",
    default: "4 oz turkey breast (most common for you)"
  }
};
```

### Controversy & Constraint Handling
```typescript
interface ConstraintManager {
  applyUserConstraints(advice: string, userProfile: UserProfile): string {
    const constraints = userProfile.constraints;
    
    // Dietary restrictions
    if (constraints.dietary?.includes('vegan')) {
      advice = replaceAnimalProducts(advice);
    }
    
    // Medical conditions
    if (constraints.medical?.includes('diabetes')) {
      advice = adjustForBloodSugar(advice);
    }
    
    // Personal philosophy
    if (constraints.philosophy?.includes('carnivore')) {
      advice = focusOnMeatBasedNutrition(advice);
    }
    
    return advice;
  }
}
```

## 📈 Performance Optimization

### Caching Strategy
```typescript
const CACHE_LAYERS = {
  // User context cache (5 minutes)
  userContext: new Map(),
  
  // Common food items cache (1 hour)
  foodDatabase: new Map(),
  
  // AI response cache for similar queries (10 minutes)
  aiResponses: new LRUCache({ max: 100 }),
  
  // Dashboard config cache (until profile change)
  dashboardConfig: new Map()
};
```

### Response Time Optimization
```javascript
async function optimizedPipeline(input: string, userId: string) {
  // Parallel processing where possible
  const [userContext, knowledgeBase] = await Promise.all([
    getUserContext(userId),
    loadRelevantKnowledge(input)
  ]);
  
  // Stream response while processing continues
  const stream = new ResponseStream();
  
  // Start parsing immediately
  parseInBackground(input, userContext).then(result => {
    stream.update(result);
  });
  
  // Return stream for immediate UI update
  return stream;
}
```

## 🚀 Implementation Phases

### Phase 1: Core Natural Language (Week 1)
- [ ] Set up OpenAI GPT-4 integration
- [ ] Create activity_logs table
- [ ] Build basic parser for food/exercise/weight
- [ ] Implement confidence scoring

### Phase 2: Voice & Quick Logs (Week 2)
- [ ] Integrate Web Speech API
- [ ] Build common logs learning system
- [ ] Create quick-tap interface
- [ ] Mobile optimization

### Phase 3: AI Coach Intelligence (Week 3)
- [ ] Implement pattern detection
- [ ] Build insight generation
- [ ] Create adaptive dashboards
- [ ] Set up Claude API for coaching

### Phase 4: Personalization (Week 4)
- [ ] User profiling system
- [ ] Dashboard customization engine
- [ ] Constraint handling
- [ ] Knowledge base integration

## 📊 Success Metrics & Monitoring

### Key Performance Indicators
```typescript
const KPIs = {
  // Technical metrics
  parseAccuracy: 0.95,        // Target 95% correct parsing
  responseTime: 2000,          // Max 2 seconds
  voiceRecognitionRate: 0.90, // 90% successful transcription
  
  // User metrics  
  nlUsageRate: 0.80,          // 80% logs via NL vs forms
  dailyActiveRate: 0.70,      // 70% daily usage
  quickLogUsage: 0.60,        // 60% use quick logs
  
  // Business metrics
  conversionRate: 0.15,       // 15% trial to paid
  churnRate: 0.05,            // <5% monthly churn
  avgRevenuePerUser: 497      // $497/month target
};
```

---
**This architecture enables the revolutionary vision: Just talk, AI does the rest.**