/**
 * Adaptive Behavioral Interventions - Phase 9 Implementation
 * Context-aware prompting system with graduated difficulty and personalized motivation
 */

import { 
  AdaptiveIntervention,
  BehavioralContext,
  UserPersonaType,
  PersonalizationProfile,
  InterventionTemplate as InterventionTemplateType
} from './types'

interface InterventionTrigger {
  contextMatch: (context: BehavioralContext) => number // 0-100 match score
  userStateMatch: (recentActivities: any[], profile: any) => number // 0-100 match score
  cooldownMinutes: number // Min time between same intervention type
  maxDailyUses: number // Max times per day
}

interface InterventionTemplate {
  id: string
  type: AdaptiveIntervention['type']
  trigger: InterventionTrigger
  contentTemplate: {
    [UserPersonaType.ENDURANCE]: string[]
    [UserPersonaType.STRENGTH]: string[]
    [UserPersonaType.SPORT]: string[]
    [UserPersonaType.PROFESSIONAL]: string[]
    [UserPersonaType.WEIGHT_MGMT]: string[]
  }
  actionPrompts: {
    [UserPersonaType.ENDURANCE]: string[]
    [UserPersonaType.STRENGTH]: string[]
    [UserPersonaType.SPORT]: string[]
    [UserPersonaType.PROFESSIONAL]: string[]
    [UserPersonaType.WEIGHT_MGMT]: string[]
  }
  successConditions: string[] // How to measure if intervention worked
}

export class AdaptiveBehavioralInterventionEngine {
  private interventionTemplates: InterventionTemplate[] = [
    // Morning Motivation Interventions
    {
      id: 'morning_energy_boost',
      type: 'motivation',
      trigger: {
        contextMatch: (context) => {
          const hour = parseInt(context.timeOfDay.split(':')[0])
          return (hour >= 6 && hour <= 9) ? 85 : 0
        },
        userStateMatch: (activities, profile) => {
          const recentMorningWorkouts = activities.filter(a => {
            const activityHour = new Date(a.created_at).getHours()
            return activityHour >= 6 && activityHour <= 10
          }).length
          return recentMorningWorkouts > 0 ? 70 : 30
        },
        cooldownMinutes: 12 * 60, // Once per 12 hours
        maxDailyUses: 1
      },
      contentTemplate: {
        [UserPersonaType.ENDURANCE]: [
          "🏃‍♀️ Your body is primed for morning cardio! Early training builds mental toughness for race day.",
          "⚡ Champions start their day with movement. Your cardiovascular system is most receptive now.",
          "🌅 Morning miles are bonus miles - they don't count against your evening energy reserves."
        ],
        [UserPersonaType.STRENGTH]: [
          "💪 Morning lifting activates your nervous system for the entire day. You'll feel unstoppable.",
          "🔥 Your testosterone levels peak in the morning - perfect timing for strength gains.",
          "⚡ Start strong, finish stronger. Morning workouts build unbreakable discipline."
        ],
        [UserPersonaType.SPORT]: [
          "🎾 Champions practice when others sleep. Morning sessions sharpen your competitive edge.",
          "🏀 Your reaction time and focus are sharpest in the AM - perfect for skill work.",
          "⚽ Early training builds the mental game. You're developing warrior discipline."
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "💼 A quick morning workout = 8 hours of enhanced focus and energy at work.",
          "⚡ 15 minutes now saves 3 hours of afternoon sluggishness. Invest in your productivity.",
          "🧠 Morning exercise literally grows your brain. Your best ideas happen post-workout."
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "🔥 Morning metabolism boost lasts all day. You're setting your fat-burning furnace on high.",
          "⚖️ Early exercise controls appetite hormones naturally. You'll make better food choices today.",
          "💚 Start your day with self-care. Every morning workout is a vote for the person you're becoming."
        ]
      },
      actionPrompts: {
        [UserPersonaType.ENDURANCE]: [
          "Log a 20-minute easy run",
          "Quick 15-minute bike ride",
          "Swimming or cardio session"
        ],
        [UserPersonaType.STRENGTH]: [
          "15-minute strength circuit",
          "Quick bodyweight workout",
          "Core and mobility session"
        ],
        [UserPersonaType.SPORT]: [
          "Skill practice session",
          "Sport-specific drills",
          "Quick technique work"
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "10-minute morning energizer",
          "Quick walk or stretching",
          "Bodyweight exercises"
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "Fat-burning cardio session",
          "Metabolism-boosting workout",
          "Quick calorie burner"
        ]
      },
      successConditions: [
        'workout_logged_within_2_hours',
        'positive_mood_reported',
        'energy_level_increased'
      ]
    },

    // Habit Streak Recovery
    {
      id: 'streak_recovery_gentle',
      type: 'suggestion',
      trigger: {
        contextMatch: (context) => {
          // Trigger after missed days
          return 60
        },
        userStateMatch: (activities, profile) => {
          const lastActivity = activities[0]
          if (!lastActivity) return 90
          
          const daysSinceLastActivity = Math.floor(
            (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
          
          return daysSinceLastActivity >= 2 ? 85 : 0
        },
        cooldownMinutes: 24 * 60, // Once per day
        maxDailyUses: 1
      },
      contentTemplate: {
        [UserPersonaType.ENDURANCE]: [
          "🎯 Even Olympians have rest days. Today's a perfect day to ease back into your training rhythm.",
          "💫 Your aerobic base is still strong. A gentle return builds sustainable momentum.",
          "🔄 Consistency beats perfection. Let's restart your training journey with self-compassion."
        ],
        [UserPersonaType.STRENGTH]: [
          "💪 Muscle memory is real - your strength comes back faster than you think.",
          "🔄 Every champion has comeback stories. Your next PR starts with today's return.",
          "⚡ Your body has been recovering. Time to rebuild stronger than before."
        ],
        [UserPersonaType.SPORT]: [
          "🎾 Great athletes know when to rest and when to return. Today's your comeback day.",
          "🏆 Champions are defined by how they handle setbacks. Time to show your resilience.",
          "💫 Your skills are still there. Let's dust them off with some fun practice."
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "🎯 Life gets busy - that's normal. The key is getting back on track quickly and kindly.",
          "⚡ You don't need to be perfect, just consistent. Small steps forward count.",
          "💼 Your future productive self will thank you for this gentle restart."
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "💚 Progress isn't linear. Every healthy choice moves you toward your goal.",
          "🔄 Your body is forgiving and adaptive. Today's a fresh start opportunity.",
          "⚖️ Small consistent actions outperform perfect plans. Let's begin again, gently."
        ]
      },
      actionPrompts: {
        [UserPersonaType.ENDURANCE]: [
          "Easy 15-minute walk",
          "Gentle stretching session",
          "Light recovery cardio"
        ],
        [UserPersonaType.STRENGTH]: [
          "Quick bodyweight circuit",
          "Light stretching",
          "Mobility session"
        ],
        [UserPersonaType.SPORT]: [
          "Fun skill practice",
          "Light technique work",
          "Casual activity session"
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "5-minute desk workout",
          "Quick walk break",
          "Simple stretching"
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "Gentle walk",
          "Light activity",
          "Mindful movement"
        ]
      },
      successConditions: [
        'any_activity_logged',
        'positive_self_talk_noted',
        'habit_restarted'
      ]
    },

    // Context-Aware Energy Boosters
    {
      id: 'afternoon_slump_fighter',
      type: 'suggestion',
      trigger: {
        contextMatch: (context) => {
          const hour = parseInt(context.timeOfDay.split(':')[0])
          return (hour >= 14 && hour <= 16) ? 75 : 0
        },
        userStateMatch: (activities, profile) => {
          // Check if user typically experiences afternoon energy dips
          return 65
        },
        cooldownMinutes: 4 * 60, // Once per 4 hours
        maxDailyUses: 2
      },
      contentTemplate: {
        [UserPersonaType.ENDURANCE]: [
          "🔋 Your glycogen stores need a refresh. A quick movement break will re-energize your system.",
          "⚡ Elite athletes use micro-training sessions to maintain energy. 5 minutes can transform your day."
        ],
        [UserPersonaType.STRENGTH]: [
          "💪 Your muscles have been dormant. A quick activation session will wake up your power systems.",
          "🔥 Strength athletes know: movement creates energy. Your body is designed to move frequently."
        ],
        [UserPersonaType.SPORT]: [
          "🎯 Your nervous system craves stimulation. Quick skill work will sharpen your focus instantly.",
          "⚡ Athletes use activity breaks for mental reset. Move to unlock your afternoon performance."
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "🧠 Your brain needs oxygen. 5 minutes of movement = 2 hours of enhanced focus.",
          "💼 High performers use micro-workouts to maintain energy without disrupting flow."
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "🔥 Your metabolism is naturally slower now. A quick burst will reignite your fat-burning furnace.",
          "⚡ Movement breaks prevent evening overeating by regulating hunger hormones."
        ]
      },
      actionPrompts: {
        [UserPersonaType.ENDURANCE]: [
          "5-minute cardio burst",
          "Quick stair climbing",
          "Energizing walk"
        ],
        [UserPersonaType.STRENGTH]: [
          "Desk push-ups",
          "Bodyweight squats",
          "Core activation"
        ],
        [UserPersonaType.SPORT]: [
          "Quick skill practice",
          "Coordination drills",
          "Mental rehearsal + movement"
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "Desk stretches",
          "Walking meeting",
          "Breathing + movement"
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "Calorie-burning stairs",
          "Desk workout",
          "Quick walk break"
        ]
      },
      successConditions: [
        'energy_level_reported_higher',
        'activity_completed_within_30min',
        'afternoon_productivity_maintained'
      ]
    },

    // Celebration and Momentum Builders  
    {
      id: 'milestone_celebration',
      type: 'celebration',
      trigger: {
        contextMatch: (context) => 50,
        userStateMatch: (activities, profile) => {
          // Check for recent achievements or streaks
          const recentStreak = this.calculateCurrentStreak(activities)
          return recentStreak % 7 === 0 && recentStreak > 0 ? 95 : 0
        },
        cooldownMinutes: 7 * 24 * 60, // Once per week
        maxDailyUses: 1
      },
      contentTemplate: {
        [UserPersonaType.ENDURANCE]: [
          "🏆 Incredible consistency! You're building the aerobic base that separates good from great athletes.",
          "🔥 Your dedication is Olympic-level. This kind of consistency creates breakthrough performances."
        ],
        [UserPersonaType.STRENGTH]: [
          "💪 Warrior discipline! You're forging the mindset that builds legendary strength.",
          "🏆 This consistency is exactly how champions are made. Your future strong self is thanking you."
        ],
        [UserPersonaType.SPORT]: [
          "🎾 Champion mentality! Consistent practice separates weekend players from true competitors.",
          "🏅 Your dedication to improvement is what makes great athletes legendary."
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "🌟 Exceptional consistency! You're proving that sustainable habits create extraordinary results.",
          "💼 Your commitment to health is investing in decades of enhanced performance."
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "🎉 Amazing dedication! This consistency is exactly how lasting transformations happen.",
          "💫 You're not just changing your body - you're becoming someone who prioritizes their health."
        ]
      },
      actionPrompts: {
        [UserPersonaType.ENDURANCE]: [
          "Plan your next race goal",
          "Celebrate with a recovery day",
          "Share your progress"
        ],
        [UserPersonaType.STRENGTH]: [
          "Set a new PR goal",
          "Plan a deload week",
          "Document your progress"
        ],
        [UserPersonaType.SPORT]: [
          "Schedule a skill assessment",
          "Plan advanced training",
          "Compete or scrimmage"
        ],
        [UserPersonaType.PROFESSIONAL]: [
          "Reward yourself mindfully",
          "Plan next habit addition",
          "Reflect on energy gains"
        ],
        [UserPersonaType.WEIGHT_MGMT]: [
          "Take progress photos",
          "Plan a healthy reward",
          "Reflect on non-scale victories"
        ]
      },
      successConditions: [
        'milestone_acknowledged',
        'next_goal_set',
        'positive_momentum_maintained'
      ]
    }
  ]

  private interventionHistory: Map<string, {
    lastUsed: string
    timesUsedToday: number
    effectiveness: number
    successRate: number
  }> = new Map()

  /**
   * Analyzes current context and selects best intervention
   */
  public async selectOptimalIntervention(
    context: BehavioralContext,
    recentActivities: any[],
    userProfile: PersonalizationProfile,
    availableData: any
  ): Promise<AdaptiveIntervention | null> {
    const currentTime = new Date()
    
    // Score all intervention templates
    const scoredInterventions = this.interventionTemplates.map(template => {
      const contextScore = template.trigger.contextMatch(context)
      const userStateScore = template.trigger.userStateMatch(recentActivities, userProfile)
      
      // Check cooldown and daily usage limits
      const history = this.interventionHistory.get(template.id)
      if (history) {
        const hoursSinceLastUse = (currentTime.getTime() - new Date(history.lastUsed).getTime()) / (1000 * 60 * 60)
        const cooldownHours = template.trigger.cooldownMinutes / 60
        
        if (hoursSinceLastUse < cooldownHours) return { template, score: 0 }
        if (history.timesUsedToday >= template.trigger.maxDailyUses) return { template, score: 0 }
      }
      
      // Combine scores with effectiveness weighting
      const effectivenessMultiplier = history?.effectiveness || 0.8
      const totalScore = (contextScore * 0.4 + userStateScore * 0.6) * effectivenessMultiplier
      
      return { template, score: totalScore }
    })

    // Find highest scoring intervention
    const bestIntervention = scoredInterventions
      .filter(si => si.score > 60) // Minimum threshold
      .sort((a, b) => b.score - a.score)[0]

    if (!bestIntervention) return null

    // Generate personalized intervention
    return this.generatePersonalizedIntervention(
      bestIntervention.template,
      userProfile.persona.type,
      context,
      userProfile.motivationalStyle
    )
  }

  /**
   * Generates personalized intervention content
   */
  private generatePersonalizedIntervention(
    template: InterventionTemplate,
    userType: UserPersonaType,
    context: BehavioralContext,
    motivationalStyle: PersonalizationProfile['motivationalStyle']
  ): AdaptiveIntervention {
    const messages = template.contentTemplate[userType]
    const actions = template.actionPrompts[userType]
    
    // Select message based on motivational style
    let selectedMessage = messages[0]
    if (motivationalStyle.preference === 'data-driven') {
      selectedMessage = messages.find(m => m.includes('hours') || m.includes('%') || m.includes('research')) || messages[0]
    } else if (motivationalStyle.preference === 'emotional') {
      selectedMessage = messages.find(m => m.includes('feel') || m.includes('❤️') || m.includes('💫')) || messages[0]
    } else if (motivationalStyle.preference === 'competitive') {
      selectedMessage = messages.find(m => m.includes('champion') || m.includes('win') || m.includes('beat')) || messages[0]
    }

    // Select action based on context and time availability
    const hour = parseInt(context.timeOfDay.split(':')[0])
    let selectedAction = actions[0]
    
    if (hour < 8 || hour > 20) {
      // Early morning or evening - suggest shorter activities
      selectedAction = actions.find(a => a.includes('quick') || a.includes('5-minute')) || actions[0]
    }

    return {
      id: `${template.id}_${Date.now()}`,
      templateId: template.id,
      type: template.type,
      message: selectedMessage,
      content: {
        title: template.type === 'celebration' ? 'Great Job!' : 
               template.type === 'reminder' ? 'Time to Move' :
               template.type === 'suggestion' ? 'Pro Tip' : 'Stay Strong',
        body: selectedMessage,
        actionText: selectedAction
      },
      actionPrompt: selectedAction,
      intensity: motivationalStyle.feedbackStyle === 'gentle' ? 'low' : 
                motivationalStyle.feedbackStyle === 'direct' ? 'high' : 'medium',
      personalizedFor: userType,
      contextMatch: 0.8, // Default context match score
      effectivenessScore: 0.7, // Default effectiveness score
      effectiveness: 0.7, // Alias for effectivenessScore
      cooldownMinutes: 720, // 12 hours default
      maxDailyUses: 1,
      currentUses: 0
    }
  }

  /**
   * Graduated difficulty system - starts tiny, builds up
   */
  public getGraduatedIntervention(
    userType: UserPersonaType,
    currentHabitLevel: 'beginner' | 'developing' | 'established',
    recentSuccessRate: number
  ): {
    difficulty: 'tiny' | 'moderate' | 'ambitious'
    suggestions: string[]
    timeCommitment: string
  } {
    const suggestions = {
      [UserPersonaType.ENDURANCE]: {
        tiny: ['2-minute walk', '30 seconds of movement', 'put on workout clothes'],
        moderate: ['10-minute cardio', '15-minute run', 'bike around the block'],
        ambitious: ['30-minute workout', 'interval training session', 'long run preparation']
      },
      [UserPersonaType.STRENGTH]: {
        tiny: ['5 push-ups', '1 minute of squats', 'pick up weights'],
        moderate: ['15-minute strength circuit', '3 sets of core exercises', 'full-body routine'],
        ambitious: ['60-minute lifting session', 'progressive overload workout', 'compound movement focus']
      },
      [UserPersonaType.SPORT]: {
        tiny: ['5 minutes skill practice', 'visualize one play', 'hold your equipment'],
        moderate: ['20-minute drill session', 'technique practice', 'conditioning work'],
        ambitious: ['full practice session', 'competitive training', 'game simulation']
      },
      [UserPersonaType.PROFESSIONAL]: {
        tiny: ['1-minute desk stretch', 'take the stairs', 'park further away'],
        moderate: ['10-minute lunch walk', 'bodyweight desk routine', 'stairs instead of elevator'],
        ambitious: ['full lunch workout', 'morning gym session', 'evening training']
      },
      [UserPersonaType.WEIGHT_MGMT]: {
        tiny: ['drink water first', 'one healthy swap', 'weigh yourself'],
        moderate: ['20-minute walk', 'healthy meal prep', 'track your food'],
        ambitious: ['60-minute workout', 'full meal planning', 'comprehensive tracking']
      }
    }

    // Determine difficulty based on habit level and recent success
    let difficulty: 'tiny' | 'moderate' | 'ambitious'
    
    if (currentHabitLevel === 'beginner' || recentSuccessRate < 0.6) {
      difficulty = 'tiny'
    } else if (currentHabitLevel === 'developing' || recentSuccessRate < 0.8) {
      difficulty = 'moderate'
    } else {
      difficulty = 'ambitious'
    }

    const timeCommitments = {
      tiny: '1-5 minutes',
      moderate: '10-20 minutes', 
      ambitious: '30-60 minutes'
    }

    return {
      difficulty,
      suggestions: suggestions[userType][difficulty],
      timeCommitment: timeCommitments[difficulty]
    }
  }

  /**
   * Records intervention outcome for learning
   */
  public recordInterventionOutcome(
    interventionId: string,
    outcome: {
      engaged: boolean
      actionTaken: boolean
      successConditionsMet: string[]
      timeToAction?: number
      userFeedback?: 'positive' | 'neutral' | 'negative'
    }
  ): void {
    const templateId = interventionId.split('_')[0] + '_' + interventionId.split('_')[1]
    const history = this.interventionHistory.get(templateId) || {
      lastUsed: new Date().toISOString(),
      timesUsedToday: 0,
      effectiveness: 0.7,
      successRate: 0.7
    }

    // Update success rate with exponential moving average
    const newSuccessRate = outcome.actionTaken ? 1 : 0
    history.successRate = history.successRate * 0.8 + newSuccessRate * 0.2

    // Update effectiveness based on comprehensive outcome
    let effectivenessScore = 0.5
    if (outcome.engaged) effectivenessScore += 0.2
    if (outcome.actionTaken) effectivenessScore += 0.3
    if (outcome.successConditionsMet.length > 0) effectivenessScore += 0.2
    if (outcome.userFeedback === 'positive') effectivenessScore += 0.1
    if (outcome.userFeedback === 'negative') effectivenessScore -= 0.2

    history.effectiveness = history.effectiveness * 0.7 + effectivenessScore * 0.3
    history.lastUsed = new Date().toISOString()
    
    // Reset daily counter if it's a new day
    const today = new Date().toDateString()
    const lastUsedDay = new Date(history.lastUsed).toDateString()
    if (today !== lastUsedDay) {
      history.timesUsedToday = 1
    } else {
      history.timesUsedToday += 1
    }

    this.interventionHistory.set(templateId, history)
  }

  private calculateCurrentStreak(activities: any[]): number {
    if (activities.length === 0) return 0
    
    const sortedActivities = activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.created_at)
      activityDate.setHours(0, 0, 0, 0)
      
      const daysDiff = (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff === streak + 1) {
        // Allow for one day gap (rest day)
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  private addMinutes(timeString: string, minutes: number): string {
    const [hours, mins] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, mins + minutes)
    return date.toTimeString().slice(0, 5)
  }
}

// Export singleton instance
export const adaptiveBehavioralEngine = new AdaptiveBehavioralInterventionEngine()