/**
 * Sport-Specific Habit Formation Framework
 * Phase 5.4 Implementation - Tennis Example with Identity-Based Habits
 */

export interface SportHabit {
  id: string
  sport: string
  category: 'preparation' | 'performance' | 'recovery' | 'nutrition' | 'mental'
  name: string
  description: string
  cue: string
  routine: string
  reward: string
  identityStatement: string
  difficulty: 1 | 2 | 3 // Tiny habits start at 1
  frequency: 'daily' | 'pre-activity' | 'post-activity' | 'weekly'
  trackingMethod: 'boolean' | 'duration' | 'rating' | 'count'
  progressionSteps: string[]
}

export interface SportContext {
  sport: string
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  goals: string[]
  schedule: 'casual' | 'regular' | 'competitive' | 'professional'
  constraints: string[]
}

export class SportSpecificHabits {
  private sport: string
  private userLevel: string

  constructor(sport: string = 'tennis', userLevel: string = 'intermediate') {
    this.sport = sport
    this.userLevel = userLevel
  }

  /**
   * Phase 5.4.1: Pre-match nutrition timing as consistent cue-based routine
   */
  generatePreMatchNutritionHabits(): SportHabit[] {
    return [
      {
        id: 'tennis-pre-match-nutrition-1',
        sport: 'tennis',
        category: 'nutrition',
        name: 'Pre-Match Fuel Routine',
        description: 'Consistent nutrition timing before matches/practice',
        cue: '3 hours before tennis',
        routine: 'Eat balanced meal: carbs + lean protein + vegetables',
        reward: 'Feel energized and ready to compete',
        identityStatement: 'I am an athlete who prioritizes optimal performance through nutrition',
        difficulty: 1,
        frequency: 'pre-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1-2: Just eat something 3 hours before',
          'Week 3-4: Add protein to pre-match meal',
          'Week 5-6: Perfect timing and macronutrient balance',
          'Week 7+: Personalized meal based on match intensity'
        ]
      },
      {
        id: 'tennis-pre-match-hydration',
        sport: 'tennis',
        category: 'nutrition',
        name: 'Pre-Match Hydration Protocol',
        description: 'Systematic hydration leading up to play',
        cue: '2 hours before tennis',
        routine: 'Drink 16-20oz water, sip 8oz 30min before',
        reward: 'No cramping, sustained energy',
        identityStatement: 'I am an athlete who prevents performance issues through preparation',
        difficulty: 1,
        frequency: 'pre-activity',
        trackingMethod: 'count',
        progressionSteps: [
          'Week 1: Just drink water before playing',
          'Week 2-3: Time it 2 hours before',
          'Week 4+: Perfect hydration timing protocol'
        ]
      },
      {
        id: 'tennis-pre-match-snack',
        sport: 'tennis',
        category: 'nutrition',
        name: 'Pre-Match Energy Snack',
        description: 'Quick energy 30-60 minutes before play',
        cue: '45 minutes before tennis',
        routine: 'Banana + small amount of caffeine (if used to it)',
        reward: 'Quick energy boost without stomach upset',
        identityStatement: 'I am an athlete who times nutrition for peak performance',
        difficulty: 2,
        frequency: 'pre-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1-2: Any light snack 30-60min before',
          'Week 3-4: Optimize timing to 45 minutes',
          'Week 5+: Perfect snack for your body'
        ]
      }
    ]
  }

  /**
   * Phase 5.4.2: Post-match recovery protocols with immediate reward feedback
   */
  generatePostMatchRecoveryHabits(): SportHabit[] {
    return [
      {
        id: 'tennis-post-match-hydration',
        sport: 'tennis',
        category: 'recovery',
        name: 'Immediate Rehydration',
        description: 'Replace fluids lost during play',
        cue: 'Immediately after leaving court',
        routine: 'Drink 16-24oz water or sports drink',
        reward: 'Feel refreshed, prevent headaches',
        identityStatement: 'I am an athlete who prioritizes recovery as much as performance',
        difficulty: 1,
        frequency: 'post-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1: Just drink something after tennis',
          'Week 2-3: Measure fluid intake (16-24oz)',
          'Week 4+: Choose optimal recovery drink based on session intensity'
        ]
      },
      {
        id: 'tennis-post-match-nutrition',
        sport: 'tennis',
        category: 'recovery',
        name: '30-Minute Recovery Window',
        description: 'Optimal nutrition timing for recovery',
        cue: 'Within 30 minutes after tennis',
        routine: 'Protein + carbs (3:1 ratio) - chocolate milk, protein shake + banana',
        reward: 'Faster recovery, less soreness tomorrow',
        identityStatement: 'I am an athlete who optimizes every recovery opportunity',
        difficulty: 2,
        frequency: 'post-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1-2: Eat something within 1 hour',
          'Week 3-4: Target 30-minute window',
          'Week 5+: Perfect protein:carb ratio'
        ]
      },
      {
        id: 'tennis-cool-down-routine',
        sport: 'tennis',
        category: 'recovery',
        name: 'Court-Side Cool Down',
        description: 'Immediate movement and stretching',
        cue: 'Before leaving tennis facility',
        routine: '5-minute walk + 3 key stretches (calves, hip flexors, shoulders)',
        reward: 'Feel loose and relaxed, prevent stiffness',
        identityStatement: 'I am an athlete who treats my body with professional care',
        difficulty: 1,
        frequency: 'post-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1: Just walk for 2-3 minutes',
          'Week 2-3: Add one stretch',
          'Week 4+: Full 5-minute cool down routine'
        ]
      }
    ]
  }

  /**
   * Phase 5.4.3: Tournament preparation habits with progressive disclosure
   */
  generateTournamentPrepHabits(): SportHabit[] {
    return [
      {
        id: 'tennis-tournament-sleep',
        sport: 'tennis',
        category: 'preparation',
        name: 'Tournament Sleep Protocol',
        description: 'Consistent sleep schedule before competitions',
        cue: '3 days before tournament',
        routine: 'Same bedtime/wake time, 8+ hours sleep',
        reward: 'Feel alert and focused on match day',
        identityStatement: 'I am an athlete who prioritizes sleep as a competitive advantage',
        difficulty: 2,
        frequency: 'pre-activity',
        trackingMethod: 'duration',
        progressionSteps: [
          'Week 1-2: Track current sleep before matches',
          'Week 3-4: Establish consistent pre-tournament bedtime',
          'Week 5+: Perfect sleep environment and routine'
        ]
      },
      {
        id: 'tennis-equipment-prep',
        sport: 'tennis',
        category: 'preparation',
        name: 'Equipment Ritual',
        description: 'Consistent equipment preparation reduces anxiety',
        cue: 'Night before tournament/important match',
        routine: 'Check racquet strings, pack bag, prepare water/snacks',
        reward: 'Feel prepared and confident',
        identityStatement: 'I am an athlete who leaves nothing to chance',
        difficulty: 1,
        frequency: 'pre-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1: Basic bag packing',
          'Week 2-3: Add equipment checklist',
          'Week 4+: Full pre-match preparation ritual'
        ]
      },
      {
        id: 'tennis-visualization',
        sport: 'tennis',
        category: 'mental',
        name: 'Pre-Match Visualization',
        description: 'Mental preparation and confidence building',
        cue: '30 minutes before warm-up',
        routine: '5-minute visualization of successful points and strategies',
        reward: 'Feel calm, confident, and focused',
        identityStatement: 'I am an athlete who prepares mentally as well as physically',
        difficulty: 3,
        frequency: 'pre-activity',
        trackingMethod: 'duration',
        progressionSteps: [
          'Week 1-2: 2-minute breathing exercise before matches',
          'Week 3-4: Add simple positive self-talk',
          'Week 5+: Full visualization routine'
        ]
      }
    ]
  }

  /**
   * Phase 5.4.4: Sleep optimization habits with identity reinforcement
   */
  generateSleepOptimizationHabits(): SportHabit[] {
    return [
      {
        id: 'tennis-recovery-sleep',
        sport: 'tennis',
        category: 'recovery',
        name: 'Athlete Sleep Schedule',
        description: 'Consistent sleep for optimal recovery and performance',
        cue: '9 PM (or 10 hours before tennis)',
        routine: 'Phone away, room temp 65-68°F, same bedtime',
        reward: 'Wake up energized and ready for training',
        identityStatement: 'I am an athlete who prioritizes recovery through quality sleep',
        difficulty: 2,
        frequency: 'daily',
        trackingMethod: 'duration',
        progressionSteps: [
          'Week 1-2: Track current sleep hours',
          'Week 3-4: Establish consistent bedtime',
          'Week 5-6: Optimize sleep environment',
          'Week 7+: Perfect pre-sleep routine'
        ]
      },
      {
        id: 'tennis-post-training-wind-down',
        sport: 'tennis',
        category: 'recovery',
        name: 'Post-Training Wind Down',
        description: 'Transition from high intensity to recovery mode',
        cue: '2 hours after evening tennis',
        routine: 'Shower, light meal, no screens 1 hour before bed',
        reward: 'Fall asleep faster, deeper sleep',
        identityStatement: 'I am an athlete who treats recovery as sacred time',
        difficulty: 2,
        frequency: 'daily',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1: Just shower after tennis',
          'Week 2-3: Add no-screens rule',
          'Week 4+: Full wind-down routine'
        ]
      }
    ]
  }

  /**
   * Phase 5.4.5: Training consistency through social accountability features
   */
  generateSocialAccountabilityHabits(): SportHabit[] {
    return [
      {
        id: 'tennis-training-log-share',
        sport: 'tennis',
        category: 'mental',
        name: 'Training Log Sharing',
        description: 'Share training consistency with accountability partner',
        cue: 'After each tennis session',
        routine: 'Log session details and share with tennis buddy/coach',
        reward: 'Feel supported and motivated by community',
        identityStatement: 'I am an athlete who values community and shared growth',
        difficulty: 1,
        frequency: 'post-activity',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1-2: Just log your sessions',
          'Week 3-4: Share with one accountability partner',
          'Week 5+: Engage with tennis community regularly'
        ]
      },
      {
        id: 'tennis-goal-commitment',
        sport: 'tennis',
        category: 'mental',
        name: 'Public Goal Commitment',
        description: 'Share training and competition goals publicly',
        cue: 'Beginning of each month',
        routine: 'Share monthly tennis goals with community/social media',
        reward: 'Feel accountable and motivated by public commitment',
        identityStatement: 'I am an athlete who commits publicly to my growth',
        difficulty: 3,
        frequency: 'weekly',
        trackingMethod: 'boolean',
        progressionSteps: [
          'Week 1-2: Write down private goals',
          'Week 3-4: Share goals with one person',
          'Week 5+: Make public commitment to goals'
        ]
      }
    ]
  }

  /**
   * Get all tennis habits organized by category
   */
  getAllTennisHabits(): Record<string, SportHabit[]> {
    return {
      preMatchNutrition: this.generatePreMatchNutritionHabits(),
      postMatchRecovery: this.generatePostMatchRecoveryHabits(),
      tournamentPrep: this.generateTournamentPrepHabits(),
      sleepOptimization: this.generateSleepOptimizationHabits(),
      socialAccountability: this.generateSocialAccountabilityHabits()
    }
  }

  /**
   * Generate personalized habit recommendations based on user context
   */
  generatePersonalizedHabits(context: SportContext): SportHabit[] {
    const allHabits = this.getAllTennisHabits()
    const recommendations: SportHabit[] = []

    // Start with basics for beginners
    if (context.experience === 'beginner') {
      recommendations.push(allHabits.postMatchRecovery[0]) // Hydration
      recommendations.push(allHabits.preMatchNutrition[0]) // Basic nutrition
      recommendations.push(allHabits.sleepOptimization[0]) // Sleep schedule
    }
    
    // Add competitive habits for regular/competitive players
    if (context.schedule === 'competitive' || context.schedule === 'professional') {
      recommendations.push(...allHabits.tournamentPrep)
      recommendations.push(...allHabits.socialAccountability)
    }

    // Add all recovery habits for advanced players
    if (context.experience === 'advanced' || context.experience === 'professional') {
      recommendations.push(...allHabits.postMatchRecovery)
      recommendations.push(...allHabits.sleepOptimization)
    }

    return recommendations
  }

  /**
   * Track habit formation progress with BJ Fogg's Behavior Model
   */
  calculateHabitStrength(habit: SportHabit, completionData: {date: Date, completed: boolean}[]): {
    strength: number // 0-100
    consistency: number // 0-100
    progression: number // 0-100
    nextStep: string
  } {
    const recentCompletions = completionData
      .filter(d => d.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    // Calculate consistency (completion rate)
    const consistency = recentCompletions.length > 0 
      ? (recentCompletions.filter(c => c.completed).length / recentCompletions.length) * 100
      : 0

    // Calculate strength (streak + consistency)
    let currentStreak = 0
    for (const completion of recentCompletions) {
      if (completion.completed) {
        currentStreak++
      } else {
        break
      }
    }

    const strength = Math.min(100, (currentStreak * 5) + (consistency * 0.5))

    // Calculate progression through steps
    const currentStep = Math.floor(currentStreak / 7) // Weekly progression
    const progression = Math.min(100, (currentStep / habit.progressionSteps.length) * 100)

    // Determine next step
    const nextStepIndex = Math.min(currentStep, habit.progressionSteps.length - 1)
    const nextStep = habit.progressionSteps[nextStepIndex] || 'Maintain this habit!'

    return {
      strength,
      consistency,
      progression,
      nextStep
    }
  }
}

// Export specific sport implementations
export const TennisHabits = new SportSpecificHabits('tennis', 'intermediate')

// Framework for other sports
export const createSportHabits = (sport: string, level: string) => 
  new SportSpecificHabits(sport, level)

export default SportSpecificHabits