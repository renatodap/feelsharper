# 🚨 FeelSharper Safety & Blindspot Rule Cards (21-35)
*Critical safety overrides and behavioral adaptations for comprehensive coaching*

*Last Updated: 2025-08-21*
*Status: Essential safety and edge case handling*

## 🩺 MEDICAL/HEALTH SAFETY RULES (21-25)

### Rule Card #21: Medical Red Flags
```yaml
id: "MEDICAL_RED_FLAG_001"
priority: 10 # HIGHEST PRIORITY
category: "safety"
immediate_stop_triggers:
  symptoms:
    - "chest pain|pressure|tightness"
    - "difficulty breathing|shortness of breath"
    - "dizziness|fainting|lightheaded"
    - "blood in (stool|urine|vomit)"
    - "severe headache|vision changes"
    - "numbness|tingling|weakness"
    - "irregular heartbeat|palpitations"
    - "severe abdominal pain"
    
response_template:
  critical: |
    "I notice you mentioned [symptom]. This requires immediate medical attention.
    Please stop any physical activity and consult a healthcare provider right away.
    If symptoms are severe, consider calling emergency services."
    
  concerning: |
    "That symptom could be important. I recommend pausing exercise and 
    checking with your doctor before continuing your training plan."
    
override_all_other_advice: true
log_for_review: true
notify_emergency_contact: optional
```

### Rule Card #22: Chronic Condition Management
```yaml
id: "CHRONIC_CONDITION_001"
priority: 9
category: "safety"
conditions_requiring_adaptation:
  diabetes:
    type_1:
      pre_exercise: "Check blood sugar. If <100mg/dL, have 15-30g fast carbs"
      during: "Monitor for hypoglycemia symptoms"
      post: "Check blood sugar again. May need less insulin with meal"
      never_recommend: ["fasting workouts", "very low carb before exercise"]
    type_2:
      focus: "Consistent carb intake, avoid spikes"
      timing: "Exercise 1-2h after meals when blood sugar peaks"
      
  hypertension:
    avoid: ["heavy lifting with breath holding", "inverted positions initially"]
    monitor: "Stop if systolic BP >250 or diastolic >115"
    sodium: "Limit to <2300mg/day (or as prescribed)"
    
  asthma:
    pre_exercise: "Use inhaler 15min before if prescribed"
    warning_signs: "Stop if wheezing, coughing, chest tightness"
    environment: "Avoid cold air, high pollen days"
    
  heart_disease:
    require_clearance: true
    monitor: "Stay in prescribed heart rate zones"
    warning: "Stop for chest discomfort, unusual fatigue"
    
  kidney_disease:
    protein: "May need restriction (check with nephrologist)"
    supplements: "Avoid creatine, high-dose vitamins"
    hydration: "May have fluid restrictions"
    
always_add_disclaimer: |
  "Since you have [condition], always follow your doctor's specific guidance.
  These suggestions are general and may need medical adjustment."
```

### Rule Card #23: Medication Interaction Warnings
```yaml
id: "MEDICATION_INTERACTION_001"
priority: 9
category: "safety"
known_interactions:
  beta_blockers:
    effect: "Lower heart rate, reduced exercise capacity"
    adaptation: "Use RPE instead of heart rate zones"
    
  blood_thinners:
    warning: "Avoid contact sports, high fall risk activities"
    bruising: "Normal to bruise easier"
    
  diuretics:
    hydration: "Need extra fluids and electrolytes"
    timing: "Exercise before taking if possible"
    
  metformin:
    gi_issues: "May cause stomach upset with intense exercise"
    b12: "Monitor B12 levels"
    
  statins:
    muscle_pain: "Report unusual muscle soreness"
    coq10: "Consider supplementation (ask doctor)"
    
  antidepressants:
    heat: "Some increase heat sensitivity"
    energy: "May affect energy levels initially"
    
supplement_drug_interactions:
  creatine:
    avoid_with: ["kidney disease", "certain diuretics"]
  caffeine:
    limit_with: ["anxiety meds", "heart conditions", "high BP"]
  protein_powder:
    check_with: ["kidney disease", "liver disease"]

response: |
  "I see you're taking [medication]. This can affect [aspect].
  Consider [adaptation]. Always consult your doctor before 
  starting new supplements."
```

### Rule Card #24: Injury Detection & Management
```yaml
id: "INJURY_DETECTION_001"
priority: 8
category: "safety"
acute_injury_signs:
  stop_immediately:
    - "sharp pain"
    - "pop or snap sound"
    - "sudden swelling"
    - "inability to bear weight"
    - "joint instability"
    
  rice_protocol: |
    "Sounds like an acute injury. Follow RICE:
    - Rest: Stop activity immediately
    - Ice: 20min every 2-3h for 48h
    - Compression: Wrap if appropriate
    - Elevation: Above heart if possible
    See a doctor if not improving in 48h"
    
chronic_injury_patterns:
  detection:
    - "pain lasting >2 weeks"
    - "pain getting worse"
    - "pain at rest"
    - "night pain"
    
  response: |
    "This sounds chronic. You need:
    1. Professional assessment (PT, sports med)
    2. Modified training (work around, not through)
    3. Active recovery focus"
    
pain_vs_soreness:
  soreness_normal:
    - "comes on 24-48h after"
    - "feels better with movement"
    - "bilateral (both sides)"
    - "dull, achy"
    
  pain_concerning:
    - "sharp, stabbing, burning"
    - "during exercise"
    - "one-sided"
    - "joint-specific"
    - "worsens with activity"
```

### Rule Card #25: Age & Special Population Adaptations
```yaml
id: "SPECIAL_POPULATION_001"
priority: 7
category: "safety"
populations:
  youth_under_18:
    focus: "Skill development over intensity"
    avoid: "Heavy max lifting until growth plates close"
    nutrition: "Growth requires extra calories"
    
  seniors_over_65:
    priority: "Balance, flexibility, functional strength"
    recovery: "Need 48-72h between intense sessions"
    protein: "Higher needs (1.2-1.5g/kg) for muscle preservation"
    warmup: "Longer warmup essential"
    
  pregnancy:
    first_trimester:
      continue: "Current exercise if comfortable"
      avoid: "Overheating, contact sports"
    second_third:
      avoid: "Supine exercises after 20 weeks"
      modify: "Impact activities as needed"
    warning_signs: "Bleeding, contractions, fluid leak → stop"
    
  postpartum:
    return_gradual: "Wait 6+ weeks, cleared by OB"
    core: "Check for diastasis recti first"
    pelvic_floor: "May need PT assessment"
    
response_adaptation:
  add_context: true
  conservative_approach: true
  medical_clearance_reminder: true
```

---

## 🍎 NUTRITION BLINDSPOTS (26-30)

### Rule Card #26: Portion Size Intelligence
```yaml
id: "PORTION_ESTIMATION_001"
priority: 6
category: "nutrition"
estimation_framework:
  high_confidence_portions:
    packaged: "Anything with a label"
    chain_restaurants: "Published nutrition info"
    measured: "User says cups, grams, oz"
    
  medium_confidence_portions:
    hand_portions:
      protein: "Palm = 3-4oz = 20-30g protein"
      carbs: "Cupped hand = 1/2 cup = 30g carbs"
      fats: "Thumb = 1 tbsp = 10-15g fat"
      veggies: "Fist = 1 cup"
      
  low_confidence_portions:
    vague_descriptions:
      "plate of": "300-800 kcal range"
      "bowl of": "200-600 kcal range"
      "handful": "50-150 kcal range"
      "some": "Cannot estimate"
      
confidence_communication:
  high: "Based on [source], that's approximately [X] calories"
  medium: "Estimating [X±20%] calories based on typical portions"
  low: "Hard to estimate precisely. Could be [X-Y] calorie range.
        For better tracking, try describing portions in hand sizes."
  
education_prompts:
  - "Quick tip: Your palm ≈ 1 serving of protein"
  - "A cupped hand ≈ 1 serving of carbs"
  - "Your fist ≈ 1 serving of veggies"
```

### Rule Card #27: Micronutrient Monitoring
```yaml
id: "MICRONUTRIENT_001"
priority: 6
category: "nutrition"
critical_micronutrients:
  iron:
    at_risk: ["vegans", "female athletes", "endurance athletes"]
    symptoms: ["fatigue", "poor performance", "frequent illness"]
    sources: ["red meat", "spinach + vitamin C", "fortified cereals"]
    testing: "Ferritin levels annually"
    
  vitamin_d:
    at_risk: ["indoor athletes", "northern climates", "dark skin"]
    symptoms: ["fatigue", "bone pain", "frequent illness"]
    sources: ["sun exposure", "fatty fish", "fortified dairy"]
    supplement: "1000-2000 IU common"
    
  b12:
    at_risk: ["vegans", "older adults", "metformin users"]
    symptoms: ["fatigue", "numbness", "cognitive issues"]
    sources: ["animal products", "fortified foods", "supplements"]
    
  calcium:
    at_risk: ["dairy-free", "female athletes", "adolescents"]
    needs: "1000-1300mg/day"
    sources: ["dairy", "fortified plant milk", "leafy greens"]
    
  omega_3:
    at_risk: ["no fish consumption", "high inflammation"]
    sources: ["fatty fish", "walnuts", "flax", "algae supplement"]
    ratio: "Balance with omega-6"
    
monitoring_approach:
  pattern_detection: |
    IF user_diet excludes [food_group] for >2 weeks
    THEN flag potential [nutrient] deficiency
    
  proactive_suggestions: |
    "Haven't seen much [nutrient] lately. Consider adding [foods]
    or discussing supplementation with your healthcare provider."
    
  testing_reminders: |
    "As a [population], consider annual blood work for [nutrients]"
```

### Rule Card #28: Special Diet Adaptations
```yaml
id: "SPECIAL_DIET_001"
priority: 6
category: "nutrition"
diet_specific_rules:
  ketogenic:
    carb_limit: "<50g/day (often <20g)"
    exercise_adaptation:
      first_2_weeks: "Expect reduced performance"
      electrolytes: "Critical: sodium, potassium, magnesium"
      pre_workout: "MCT oil or exogenous ketones"
    never_recommend: ["carb loading", "standard sports drinks"]
    
  intermittent_fasting:
    patterns: ["16:8", "5:2", "warrior"]
    exercise_timing:
      fasted: "Low intensity only if adapted"
      fed_window: "High intensity training"
    breaking_fast: "Start gentle if exercising fasted"
    
  vegan:
    protein_combining: "Ensure complete amino acids"
    b12_essential: "Must supplement"
    iron: "Pair with vitamin C for absorption"
    omega_3: "Consider algae supplement"
    protein_targets: "May need 10-20% higher intake"
    
  paleo:
    avoid: ["grains", "dairy", "legumes", "processed"]
    pre_workout: "Sweet potato, dates, fruit"
    recovery: "Emphasize whole food sources"
    
  fodmap:
    avoid_pre_exercise: ["high FODMAP foods that trigger symptoms"]
    safe_options: ["rice", "banana", "lactose-free"]
    timing: "Test tolerance during training, not competition"
    
adaptation_logic:
  check_diet_type: true
  filter_recommendations: true
  provide_alternatives: true
  respect_philosophy: true
```

### Rule Card #29: Hydration Intelligence
```yaml
id: "HYDRATION_ADVANCED_001"
priority: 7
category: "nutrition"
hydration_calculations:
  baseline:
    formula: "BW(lbs) / 2 = oz minimum"
    metric: "35ml/kg body weight"
    
  exercise_additions:
    per_hour: "16-24 oz (500-750ml)"
    sweat_rate_test: |
      1. Weigh before exercise
      2. Exercise 1 hour, track fluid intake
      3. Weigh after
      4. Loss + intake = sweat rate
      
  environmental_adjustments:
    heat: "+20-30%"
    altitude: "+25%"
    air_travel: "+16oz per 2h flight"
    
electrolyte_needs:
  light_exercise: "Water sufficient if <60min"
  moderate_1h+:
    sodium: "300-700mg/L"
    potassium: "150-300mg/L"
  heavy_sweater:
    sodium: "Up to 1000mg/L"
    add: "Magnesium, calcium"
    
  signs_of_need:
    - "white salt marks on clothes"
    - "cramping despite hydration"
    - "very salty sweat taste"
    
special_situations:
  pre_competition:
    2_days_before: "Increase by 20%"
    morning_of: "16-20oz upon waking"
    2h_before: "16oz"
    stop: "30min before to avoid fullness"
    
  recovery:
    formula: "150% of fluid lost"
    with: "Sodium to enhance retention"
    
monitoring:
  urine_color: "Pale yellow = good"
  weight_changes: ">2% loss = dehydrated"
  thirst: "Already late indicator"
```

### Rule Card #30: Competition Nutrition Protocol
```yaml
id: "COMPETITION_NUTRITION_001"
priority: 8
category: "nutrition"
sport_specific_protocols:
  tennis_match:
    night_before: "Normal dinner + extra carbs (pasta, rice)"
    morning_3h_before: "Familiar breakfast: oatmeal, toast, banana"
    1h_before: "Light snack if needed: banana, energy bar"
    during_changeover:
      - "Sips of sports drink"
      - "Banana pieces"
      - "Dates or energy chews"
    between_matches: 
      - "<1h gap: Light carbs only"
      - ">2h gap: Small meal with carbs + protein"
    post: "Recovery drink within 30min"
    
  endurance_event:
    carb_loading:
      3_days_out: "8-10g/kg carbs"
      taper_training: true
    race_morning: "2-4g/kg carbs, 3-4h before"
    during:
      - "30-60g carbs/hour <2.5h"
      - "Up to 90g/hour >2.5h"
      - "Multiple carb sources (glucose + fructose)"
    
  strength_competition:
    weigh_in_considerations: true
    timing: "Last meal 2-3h before"
    between_attempts: "Sips of carbs, avoid fullness"
    
  team_sports:
    pre_game: "3-4h before: Full meal"
    halftime: "Sports drink, orange slices"
    post: "Team meal within 2h"
    
never_try_new: "Competition day is not for experiments"
practice_nutrition: "Train your gut during practice"
```

---

## 🏋 TRAINING BLINDSPOTS (31-33)

### Rule Card #31: Overtraining Detection System
```yaml
id: "OVERTRAINING_001"
priority: 9
category: "training_safety"
monitoring_metrics:
  objective_markers:
    resting_hr_elevation: ">5-10 bpm above normal"
    hrv_decline: ">20% below baseline"
    performance_drop: ">5% in standard workout"
    weight_loss: "Unexpected >2% in week"
    
  subjective_markers:
    mood: ["irritable", "depressed", "anxious"]
    sleep: ["insomnia", "restless", "not refreshing"]
    motivation: ["no desire to train", "dreading workouts"]
    soreness: ["persistent", "not recovering", "getting worse"]
    
  scoring_system:
    daily_check:
      energy: 1-10
      mood: 1-10
      soreness: 1-10
      sleep_quality: 1-10
      motivation: 1-10
    threshold: "Score <25/50 for 3+ days = red flag"
    
interventions:
  yellow_flag:
    reduce_intensity: "Drop to 70% for 2-3 days"
    maintain_frequency: "Keep routine but easier"
    focus: "Sleep, nutrition, stress management"
    
  red_flag:
    immediate: "Complete rest day or active recovery only"
    week_plan: "50% volume reduction"
    reassess: "After 3-4 days"
    
  chronic_pattern:
    response: |
      "You're showing signs of overtraining:
      1. Take 3-5 days complete rest
      2. Focus on sleep (9+ hours)
      3. Increase calories by 300-500
      4. Consider blood work (CBC, hormones)
      5. Gradual return over 1-2 weeks"
      
prevention:
  deload_weeks: "Every 3-4 weeks reduce by 40-50%"
  hard_day_rule: "No more than 2 hard days in a row"
  life_stress: "Reduce training when life stress high"
```

### Rule Card #32: Periodization & Programming
```yaml
id: "PERIODIZATION_001"
priority: 6
category: "training"
training_phases:
  base_building:
    duration: "4-8 weeks"
    focus: "Volume, aerobic capacity, technique"
    intensity: "60-75% mostly"
    
  strength_building:
    duration: "4-6 weeks"
    focus: "Force production, hills, resistance"
    intensity: "75-85%"
    
  peak_performance:
    duration: "2-3 weeks"
    focus: "Race pace, power, speed"
    intensity: "85-95%"
    volume: "Reduced by 30%"
    
  taper:
    duration: "1-2 weeks"
    reduce_volume: "40-60%"
    maintain_intensity: true
    
  recovery:
    duration: "1-2 weeks"
    focus: "Active recovery, cross-training"
    intensity: "<60%"
    
auto_programming:
  detect_goal_date: true
  work_backward: true
  adjust_for_fitness: true
  
  suggestion: |
    "You have [X] weeks until [event].
    Suggested phases:
    - Weeks 1-4: Base building
    - Weeks 5-7: Specific prep
    - Week 8: Taper
    Let's optimize your training!"
```

### Rule Card #33: Cross-Training Intelligence
```yaml
id: "CROSS_TRAINING_001"
priority: 5
category: "training"
sport_complementary_activities:
  tennis:
    cardio: ["cycling", "swimming", "elliptical"]
    strength: ["core", "rotational power", "legs"]
    flexibility: ["yoga", "dynamic stretching"]
    avoid: ["high-impact running if knee issues"]
    
  running:
    cardio: ["cycling", "pool running", "rowing"]
    strength: ["single leg", "core", "glutes"]
    flexibility: ["hip mobility", "calf stretching"]
    recovery: ["swimming", "yoga"]
    
  triathlon:
    balance: "Maintain 2:2:1 ratio (bike:run:swim)"
    brick_workouts: "Bike→run transitions crucial"
    recovery: "Extra important with 3 disciplines"
    
  strength_training:
    cardio: ["Low intensity to not interfere"]
    mobility: ["Daily 10-15min minimum"]
    recovery: ["Swimming", "walking", "yoga"]
    
injury_alternatives:
  knee_pain:
    avoid: ["running", "jumps", "deep squats"]
    alternatives: ["cycling", "swimming", "upper body"]
    
  back_pain:
    avoid: ["heavy loading", "impact"]
    alternatives: ["core stability", "swimming", "walking"]
    
  shoulder_issue:
    avoid: ["overhead", "swimming"]
    alternatives: ["legs", "core", "cycling"]
```

---

## 👤 BEHAVIORAL & UX BLINDSPOTS (34-35)

### Rule Card #34: Motivation & Psychology Adaptation
```yaml
id: "MOTIVATION_PSYCHOLOGY_001"
priority: 7
category: "behavioral"
user_state_detection:
  high_motivation:
    indicators: ["streak going", "goals hit", "positive language"]
    response_style: "Challenge them"
    suggestions: ["Stretch goals", "New PRs", "Competitions"]
    
  low_motivation:
    indicators: ["missed workouts", "negative language", "fatigue"]
    response_style: "Support and simplify"
    suggestions: ["Minimum viable workout", "Fun activities", "Social exercise"]
    
  stressed:
    indicators: ["work mentions", "sleep issues", "irritability"]
    response_style: "Gentle and flexible"
    suggestions: ["Yoga", "walks", "meditation", "reduce intensity"]
    
  plateau_frustration:
    indicators: ["no progress", "same complaints", "considering quitting"]
    response_style: "Reframe and refocus"
    suggestions: ["Process goals", "new metrics", "change stimulus"]
    
adaptive_messaging:
  celebration_triggers:
    - "3-day streak"
    - "Weekly goal hit"
    - "New PR"
    - "Consistency milestone"
    
  gentle_nudges:
    after_missed: "No worries! Today's a fresh start. What's one small thing you can do?"
    when_tired: "Rest is training too. How about some light stretching?"
    
  reframe_failures:
    missed_goal: "Data point, not failure. What can we learn?"
    bad_workout: "Bad days make good days feel better. Recovery time!"
    
personality_types:
  competitor:
    motivate_with: ["Rankings", "comparisons", "challenges"]
  improver:
    motivate_with: ["Personal progress", "skill development"]
  socializer:
    motivate_with: ["Group activities", "sharing achievements"]
  completionist:
    motivate_with: ["Streaks", "badges", "checklists"]
```

### Rule Card #35: Privacy & Trust Building
```yaml
id: "PRIVACY_TRUST_001"
priority: 8
category: "behavioral"
sensitive_data_handling:
  health_data:
    storage: "Encrypted, HIPAA-compliant"
    sharing: "Never without explicit consent"
    retention: "User-controlled deletion"
    
  mood_mental_health:
    extra_sensitive: true
    no_judgement: true
    resources: "Provide professional resources if concerning"
    
  body_image:
    language: "Focus on performance and health, not appearance"
    photos: "Optional, encrypted, private by default"
    weight: "Trends matter more than daily numbers"
    
transparency_practices:
  data_usage:
    clear_communication: |
      "Your data helps personalize advice. Here's what we track:
      - Activities: To optimize training
      - Nutrition: To ensure proper fueling
      - Mood: To prevent burnout
      You can export or delete anytime."
      
  ai_limitations:
    acknowledge: |
      "I'm AI, not a doctor or certified trainer.
      My advice is based on general guidelines and your data.
      Always listen to your body and consult professionals."
      
  confidence_disclosure:
    always_show: "When confidence <70%"
    explain: "Why confidence is low"
    
trust_building:
  consistency: "Same advice patterns over time"
  memory: "Reference past conversations/successes"
  personalization: "Show you understand their specific situation"
  respect_boundaries: "Don't push when user says no"
  admit_mistakes: "If wrong, acknowledge and adjust"
```

---

## 🔧 IMPLEMENTATION PRIORITY

### Critical Safety (Implement First)
1. Rule #21: Medical Red Flags
2. Rule #22: Chronic Conditions
3. Rule #31: Overtraining Detection
4. Rule #24: Injury Detection

### High Priority (Week 1)
5. Rule #26: Portion Estimation
6. Rule #29: Hydration Intelligence
7. Rule #34: Motivation Adaptation
8. Rule #35: Privacy & Trust

### Medium Priority (Week 2)
9. Rule #23: Medication Interactions
10. Rule #27: Micronutrient Monitoring
11. Rule #28: Special Diets
12. Rule #32: Periodization

### Lower Priority (Week 3+)
13. Rule #25: Age Adaptations
14. Rule #30: Competition Nutrition
15. Rule #33: Cross-Training

---

## 📊 SAFETY METRICS TO TRACK

```typescript
const SafetyMetrics = {
  // Critical Events
  medicalRedFlagsTriggered: 0,
  injuriesDetected: 0,
  overtrainingInterventions: 0,
  
  // Accuracy
  falsePositives: 0, // Flagged safe as unsafe
  falseNegatives: 0, // Missed real issues
  
  // User Trust
  safetyOverridesAccepted: 0,
  medicalConsultsRecommended: 0,
  professionalReferrals: 0,
  
  // Effectiveness
  injuriesPrevented: 0, // User reported avoiding injury
  recoverySuccess: 0, // Returned safely from issue
  chronicConditionSupport: 0, // Positive management
};
```

---

## ✅ SAFETY CHECKLIST

Before EVERY response, check:
- [ ] Any medical red flags in user input?
- [ ] Known chronic conditions to consider?
- [ ] Signs of overtraining/fatigue?
- [ ] Injury risk present?
- [ ] Medication interactions possible?
- [ ] Age/special population considerations?
- [ ] Confidence level appropriate for advice?
- [ ] Professional referral needed?

---

## 🚨 EMERGENCY PROTOCOL

If user reports:
1. **Chest pain, difficulty breathing, severe symptoms**
   → Immediate: "Stop activity. Seek emergency medical care."
   
2. **Acute injury (pop, severe pain, can't bear weight)**
   → "Stop activity. RICE protocol. See doctor if not better in 48h."
   
3. **Mental health crisis indicators**
   → "I'm concerned about you. Please reach out to:
      - Crisis hotline: 988
      - Your healthcare provider
      - Trusted friend or family"

4. **Eating disorder signs**
   → "Your relationship with food/exercise seems stressed.
      Consider talking to a professional who specializes in this."

---

*These 15 additional rule cards close critical safety gaps and ensure FeelSharper provides safe, effective, and trustworthy coaching.*