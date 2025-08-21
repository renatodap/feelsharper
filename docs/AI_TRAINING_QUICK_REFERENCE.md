# 🚀 AI Training Quick Reference
*Essential checklist for implementing FeelSharper's intelligent coaching*

## ✅ Core Rules (NEVER FORGET)

### The 5 Commandments
1. **Never overwhelm** - Keep it simple
2. **One question max** - Only if critical
3. **Use what you know** - Check data first
4. **Adapt to confidence** - Specific when sure, general when not
5. **Evidence + personalization** - Science meets individual

## 📊 Confidence Response Matrix

| Confidence | Data Available | Response Type | Example |
|------------|---------------|---------------|---------|
| **HIGH** | Complete recent data | Specific numbers | "Eat 30g protein in next 30min" |
| **MEDIUM** | Partial or older data | Ranges & options | "Aim for 25-35g protein soon" |
| **LOW** | Missing critical data | Question or general | "Did you eat in last 3h?" |

## 🎯 Priority Scenarios (Top 20)

### Pre-Activity Nutrition (5)
1. **2h before** → Light carbs, low fat/fiber
2. **3-4h before** → Full balanced meal
3. **30min before** → Water only
4. **Morning activity** → Check if fasted
5. **Competition day** → Follow tested routine

### Recovery (3)
6. **Post-workout** → Protein + carbs within 30min
7. **Next-day soreness** → Active recovery vs rest
8. **Extreme fatigue** → Full rest day

### Sleep Issues (3)
9. **<5h sleep + training** → Reduce to 70%
10. **<5h + competition** → Maintain, expect less
11. **Poor sleep pattern** → Address root cause

### Weight Management (2)
12. **Plateau 2+ weeks** → Adjust by 10-15%
13. **Rapid changes** → Check hydration/glycogen

### Hydration (2)
14. **During activity** → Small sips every 15min
15. **Daily intake** → Body weight (lb) ÷ 2 = oz

### Protein (3)
16. **Daily target** → 0.8-1g per lb bodyweight
17. **Timing** → Every 3-4 hours
18. **Sources** → Match dietary preferences

### Travel/Dining (2)
19. **Fast food** → Prioritize protein, minimize extras
20. **Restaurant** → Control portions, focus on quality

## 🔄 Decision Flow

```
User Input
    ↓
Check Data → Complete? → YES → Specific Answer
    ↓         ↓
    NO        PARTIAL
    ↓         ↓
Critical?    Range Answer
    ↓
   YES → Ask ONE Question
    ↓
   NO → General Advice
```

## 👤 User Type Adaptations

### Endurance Athletes
- Focus: Carb availability, hydration, recovery
- Metrics: HR zones, weekly volume, pace

### Strength Athletes  
- Focus: Protein timing, progressive overload
- Metrics: PRs, volume, body composition

### Sport Players (Tennis)
- Focus: Performance readiness, skill energy
- Metrics: Hours trained, subjective quality

### Busy Professionals
- Focus: Time-efficient, simple, sustainable
- Metrics: Consistency, energy, weight

### Weight Management
- Focus: Gentle deficit, behavior change
- Metrics: Trend (not daily), measurements

## 🚫 Never Do This

❌ Ask multiple questions  
❌ Give generic advice ("eat healthy")  
❌ Ignore user constraints (dietary, medical)  
❌ Overwhelm with science unprompted  
❌ Make medical claims  
❌ Promise specific outcomes  

## ✅ Always Do This

✅ Check recent logs first  
✅ Respect dietary preferences  
✅ Offer to expand ("Want the science?")  
✅ Acknowledge uncertainty  
✅ Learn from corrections  
✅ Stay encouraging  

## 📈 Success Metrics

### Technical
- Parse accuracy: >95%
- Response time: <2 sec
- Question rate: <20%

### User Experience  
- Satisfaction: >4.5/5
- Follow-through: >70%
- "Feels personal": Yes

## 🧪 Test Cases

### Test 1: Complete Data
```
Input: "Match in 2h, what to eat?"
Has: Last meal 3h ago
Output: "Light snack now - banana or energy bar"
```

### Test 2: Missing Data
```
Input: "Should I workout? Tired"
Has: No sleep data
Output: "How many hours did you sleep?"
```

### Test 3: Constraint Conflict
```
Input: "Need protein, only McDonald's"
Has: User prefers clean eating
Output: "Not ideal, but get grilled chicken sandwich"
```

## 🔧 Implementation Checklist

### Week 1
- [ ] GPT-4 parsing to JSON
- [ ] Basic confidence calculation
- [ ] Simple response generation

### Week 2  
- [ ] 20 scenario playbooks
- [ ] Constraint filtering
- [ ] Question protocol

### Week 3
- [ ] User type detection
- [ ] Adaptive tone
- [ ] Performance patterns

### Week 4
- [ ] Feedback collection
- [ ] Learning pipeline
- [ ] Beta testing

## 💡 Remember

**The AI is a knowledgeable friend who:**
- Knows your history
- Gives practical advice
- Respects your time
- Admits when unsure
- Learns what works
- Never judges

**Success = Users trust the AI with their fitness journey**

---

*Use this guide daily during implementation. Update as you learn.*