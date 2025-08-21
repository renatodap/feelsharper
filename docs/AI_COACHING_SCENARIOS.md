# 🎾 FeelSharper AI Coaching Scenarios & Response Framework

*Last Updated: 2025-08-21*
*Status: Core AI behavior documentation for MVP implementation*

## 🧠 AI Response Architecture

### Core Principles
1. **Interpret Context** - Understand event + timing + goal
2. **Check User Data** - Profile, recent logs, confidence scores
3. **Generate Personalized Response** - Adapt tone to confidence level
4. **Ask Clarifying Questions** - Only when critical info missing
5. **Provide Actionable Advice** - Specific when confident, general when uncertain

## 🎯 Real-World Scenarios & AI Responses

### Scenario 1: Tennis Match Preparation (2 Hours)
**User Input:** "I have a tennis match in 2 hours. What should I eat?"

**AI Logic Flow:**
```javascript
function handlePreMatchNutrition(user, timeToMatch) {
  // 1. Check stored data
  const lastMeal = getUserLastMeal(user);
  const dietaryRestrictions = user.profile.dietary;
  const typicalTolerance = user.patterns.preMatchFood;
  
  // 2. Determine confidence
  const confidence = calculateConfidence(lastMeal, typicalTolerance);
  
  // 3. Generate response based on timing
  if (timeToMatch <= 2) {
    if (!lastMeal || lastMeal.hoursAgo > 3) {
      return askClarifying("Did you eat a full meal in the last 3 hours?");
    }
    return generatePreMatchAdvice(user, confidence);
  }
}
```

**Response Templates:**

*High Confidence (knows last meal):*
> "Since you had lunch 3 hours ago, go light: banana + yogurt, small turkey sandwich, or sports bar. Mostly carbs, moderate protein, low fat/fiber for easy digestion."

*Medium Confidence (general pattern known):*
> "Based on your usual pre-match routine, stick with simple carbs: fruit, toast with nut butter, or an energy bar. Keep it light since match is soon."

*Low Confidence (missing data):*
> "Great — fuel matters here. Did you eat a full meal in the last 3 hours?"
> - If YES → "Go light: banana, sports bar, or toast. Mostly carbs."
> - If NO → "Have something more substantial but digestible: rice with chicken, sandwich, or oatmeal with fruit."

**Special Adaptations:**
- **Vegan:** "Try banana + oat bar or toast with almond butter"
- **Gluten-free:** "Rice cakes with nut butter or certified GF energy bar"
- **Sensitive stomach:** "Stick to what you know works - maybe just a banana"

### Scenario 2: Poor Sleep + Planned Workout
**User Input:** "I only slept 4h but I was planning a hard workout today."

**AI Logic:**
```javascript
function handleSleepDeprivedWorkout(user, sleepHours, plannedWorkout) {
  // Check if competition or training
  const isCompetition = checkIfCompetition(plannedWorkout);
  const recentSleepPattern = getRecentSleep(user, 7); // Last week
  
  if (sleepHours < 5) {
    return askClarifying("Is this workout for training or is it a competition?");
  }
}
```

**Response Templates:**

*Training Context:*
> "Since it's training, consider scaling back. With only 4h sleep:
> - Option A: 70% intensity of planned workout
> - Option B: Switch to recovery work (mobility, light cardio)
> - Option C: Rest day if you feel truly exhausted
> Sleep debt reduces recovery and increases injury risk."

*Competition Context:*
> "For competition, do your normal warmup and keep fueling consistent. Expect it to feel harder than usual. Focus on:
> - Extra hydration
> - Slightly more carbs for energy
> - Positive self-talk
> - Accepting reduced performance"

### Scenario 3: Post-Workout Soreness
**User Input:** "I'm super sore after yesterday's leg workout. What should I do today?"

**AI Logic:**
```javascript
function handleSoreness(user, bodyPart, severity) {
  // Determine if DOMS vs potential injury
  const painScale = assessPainDescription(user.input);
  
  if (!painScale.clear) {
    return askClarifying("How bad is the soreness — normal muscle discomfort or pain that limits movement?");
  }
  
  return generateRecoveryPlan(painScale, user.goals);
}
```

**Response Templates:**

*Normal DOMS:*
> "That's normal post-leg day DOMS. Today try:
> - Light activity: 20min easy cycling or walking
> - Dynamic stretching: 10min lower body
> - Protein focus: Hit your target (aim for 150g+)
> - Hydration: Extra 1L water
> Movement helps recovery!"

*Concerning Pain:*
> "If it's limiting movement, skip intense training today:
> - Complete rest or gentle yoga only
> - Ice if inflamed, heat if just tight
> - Consider massage or foam rolling
> - Reassess tomorrow - see physio if worse"

### Scenario 4: Traveling with Limited Food Options
**User Input:** "I'm traveling and only have McDonald's nearby. What should I eat?"

**AI Logic:**
```javascript
function handleFastFoodOptimization(user, restaurant, context) {
  const goal = user.currentGoals.primary; // performance, weight loss, maintenance
  const timeToNextActivity = getNextPlannedActivity(user);
  
  if (!goal.clear) {
    return askClarifying("Are you prioritizing performance/recovery or keeping calories lighter today?");
  }
  
  return generateFastFoodStrategy(restaurant, goal, timeToNextActivity);
}
```

**Response Templates:**

*Performance Focus:*
> "For performance at McDonald's:
> - Grilled chicken sandwich + apple slices
> - Or: 2 hamburgers (no fries) for more protein
> - Add: Side salad for nutrients
> - Drink: Water or milk
> Total: ~600 cal, 40g protein, balanced macros"

*Calorie Control:*
> "For lighter calories at McDonald's:
> - Grilled chicken salad (no dressing or light)
> - Or: Grilled chicken sandwich (no mayo)
> - Skip: Fries, sugary drinks, desserts
> - Add: Apple slices if still hungry
> Total: ~300-400 cal, 30g protein"

### Scenario 5: Weight Loss Plateau
**User Input:** "I've been stuck at the same weight for 2 weeks."

**AI Logic:**
```javascript
function handleWeightPlateau(user, plateauDuration) {
  const weightGoal = user.goals.weight; // loss, gain, maintain
  const recentDeficit = calculateRecentDeficit(user, 14);
  const stressFactors = assessStressMarkers(user);
  
  if (!weightGoal.clear) {
    return askClarifying("Is your main goal weight loss or maintaining?");
  }
  
  return generatePlateauStrategy(plateauDuration, recentDeficit, stressFactors);
}
```

**Response Templates:**

*Weight Loss Goal:*
> "2-week plateaus are normal. Your body is adapting. Options:
> - Diet: Reduce portions by 10-15% OR add 1 fasting day
> - Activity: Add 2000 steps daily OR 1 extra workout
> - Recovery: Ensure 7+ hours sleep (cortisol affects weight)
> - Patience: Sometimes body needs time to 'whoosh'
> Track measurements too - you might be losing fat while gaining muscle."

*Maintenance Goal:*
> "Perfect! Staying steady for 2 weeks means you've found your maintenance calories. This is exactly what we want for maintaining weight."

## 🔄 Adaptive Response Framework

### Confidence Level Adjustments

**High Confidence Response Characteristics:**
- Specific numbers/recommendations
- Personalized to user's history
- References past patterns
- Detailed implementation steps

**Medium Confidence Response Characteristics:**
- General guidelines with ranges
- Multiple options provided
- Acknowledges uncertainty
- Suggests tracking for future

**Low Confidence Response Characteristics:**
- Asks clarifying question first
- Provides general principles
- Recommends safe defaults
- Emphasizes listening to body

### User Type Adaptations

**Endurance Athletes:**
- Focus on fueling strategies
- Emphasize recovery metrics
- Reference training zones
- Consider weekly volume

**Strength Athletes:**
- Protein timing emphasis
- Volume/intensity trade-offs
- Recovery between sessions
- Progressive overload context

**Sport Players (Tennis/Team):**
- Performance readiness focus
- Skill vs fitness balance
- Mental/physical correlation
- Competition vs practice

**Busy Professionals:**
- Time-efficient solutions
- Minimal complexity
- Clear priorities
- Quick wins focus

**Weight Management:**
- Sustainable approaches
- No extreme restrictions
- Behavior > perfection
- Long-term view

## 📊 Pattern Recognition & Learning

### Data Collection for Improved Responses
```javascript
// Track what works for each user
const responseEffectiveness = {
  preMatchMeal: {
    recommendation: "banana + toast",
    performance: "played well",
    feelingDuring: "good energy",
    adjustmentNeeded: false
  },
  postWorkoutRecovery: {
    recommendation: "light cycling",
    nextDaySoreness: "reduced",
    adjustmentNeeded: false
  }
};

// Build user-specific knowledge
function updateUserPatterns(user, scenario, outcome) {
  user.patterns[scenario] = {
    ...user.patterns[scenario],
    lastRecommendation: outcome.recommendation,
    effectiveness: outcome.result,
    confidence: calculateNewConfidence(outcome)
  };
}
```

## 🎯 Implementation Guidelines

### Response Generation Pipeline
1. **Parse Input** → Extract intent, context, urgency
2. **Retrieve Context** → User profile, recent logs, patterns
3. **Assess Confidence** → Data quality, recency, relevance
4. **Generate Response** → Adapt to confidence + user type
5. **Track Outcome** → Learn from user feedback/results

### Critical Success Factors
- **Speed:** <2 second response time
- **Relevance:** Context-aware recommendations
- **Clarity:** Simple, actionable advice
- **Personalization:** Evolves with user data
- **Trust:** Transparent about confidence levels

### Error Handling
- Missing critical data → Ask ONE clarifying question
- Conflicting patterns → Default to safe recommendation
- Unknown scenario → Provide general principles
- Low confidence → Acknowledge uncertainty

## 🏃 Tennis-Specific Performance Scenarios

### Pre-Match Timeline Optimization
```
T-24h: Carb loading begins, hydration focus
T-12h: Last heavy meal, good sleep priority  
T-3h: Moderate meal (pasta, rice, chicken)
T-2h: Light snack (banana, energy bar)
T-1h: Hydration only, dynamic warmup
T-30m: Mental prep, court warmup
Match: Hydrate between games, quick carbs at changeover
```

### Recovery Protocol Post-Tennis
```
0-30min: Protein + carbs (chocolate milk, protein bar)
30-60min: Stretch, shower, decompress
2-3h: Full meal with quality protein
Evening: Extra hydration, good sleep
Next day: Active recovery if sore
```

### Common Tennis Nutrition Mistakes
- Eating too close to match (cramping)
- Not enough carbs (early fatigue)
- Over-hydrating right before (sluggish)
- Skipping post-match nutrition (poor recovery)
- Heavy protein pre-match (slow digestion)

## 📝 Sample Conversations

### Example 1: Complete Pre-Match Flow
```
User: "Tennis at 2pm, it's noon now"
AI: "Did you have breakfast or early lunch?"
User: "Big breakfast at 9am"
AI: "Perfect timing. Have a light snack now - banana with a small handful of nuts or a granola bar. Then just water until match time. You'll have good energy without feeling heavy."
```

### Example 2: Recovery Focus
```
User: "Played 3 hours of tennis, exhausted"
AI: "Great session! Priority now is recovery. Within 30min: protein shake or chocolate milk. Then a full meal with carbs and protein within 2 hours. Extra water today and aim for 8+ hours sleep tonight."
```

### Example 3: Tournament Scenario
```
User: "Tennis tournament, might play 2-3 matches today"
AI: "Tournament nutrition strategy:
- Between matches: Banana, dates, or sports drink
- If >2hr break: Light sandwich
- Constant hydration: Small sips regularly
- Bring: Multiple snacks, electrolytes
- Avoid: Anything new or heavy"
```

## 🚀 MVP Implementation Priority

### Phase 1: Core Scenarios (Week 1)
- Pre-activity nutrition
- Post-workout recovery
- Sleep-affected training
- Weight plateaus
- Fast food optimization

### Phase 2: Sport-Specific (Week 2)
- Tennis match prep
- Tournament nutrition
- Endurance fueling
- Strength training recovery
- Competition vs training

### Phase 3: Advanced Patterns (Week 3)
- Multi-day fatigue
- Injury prevention
- Mental performance
- Travel adjustments
- Stress management

## 📊 Success Metrics
- Response accuracy: 95%+ for common scenarios
- User satisfaction: 4.5+ rating
- Follow-through rate: 70%+ implement advice
- Pattern learning: Improves over time
- Confidence calibration: Accurate uncertainty

---

*This framework ensures FeelSharper AI provides valuable, personalized coaching that actually helps users perform better.*