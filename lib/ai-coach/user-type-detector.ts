/**
 * User Type Detector - Phase 9 Implementation
 * Automatically detects user persona type based on vocabulary, activity patterns, and goals
 */

import { 
  UserPersonaType, 
  UserPersona, 
  PersonalizationProfile,
  BehavioralContext 
} from './types'

interface ActivityAnalysis {
  vocabulary: string[]
  activityTypes: string[]
  frequency: number // activities per week
  duration: number // average session duration
  goals: string[]
  timePatterns: string[] // morning, evening, weekends
}

interface VocabularyIndicators {
  [UserPersonaType.ENDURANCE]: string[]
  [UserPersonaType.STRENGTH]: string[]
  [UserPersonaType.SPORT]: string[]
  [UserPersonaType.PROFESSIONAL]: string[]
  [UserPersonaType.WEIGHT_MGMT]: string[]
}

export class UserTypeDetector {
  private vocabularyMap: VocabularyIndicators = {
    [UserPersonaType.ENDURANCE]: [
      'run', 'running', 'jog', 'jogging', 'bike', 'cycling', 'swim', 'swimming',
      'marathon', 'half marathon', '5k', '10k', 'pace', 'intervals', 'tempo',
      'long run', 'easy run', 'brick workout', 'triathlon', 'heart rate', 'zone',
      'vo2max', 'threshold', 'cadence', 'stroke rate', 'splits', 'negative split'
    ],
    
    [UserPersonaType.STRENGTH]: [
      'lift', 'lifting', 'deadlift', 'squat', 'bench', 'press', 'row', 'curl',
      'set', 'sets', 'rep', 'reps', 'pr', 'personal record', 'max', '1rm',
      'bulk', 'cut', 'lean', 'gains', 'progressive overload', 'compound',
      'isolation', 'hypertrophy', 'strength', 'power', 'amrap', 'emom', 'superset'
    ],
    
    [UserPersonaType.SPORT]: [
      'practice', 'training', 'drill', 'scrimmage', 'game', 'match', 'tournament',
      'season', 'off-season', 'competition', 'team', 'coach', 'technique', 'form',
      'skill', 'strategy', 'play', 'opponent', 'win', 'loss', 'score', 'performance',
      'tennis', 'basketball', 'soccer', 'football', 'baseball', 'hockey', 'golf'
    ],
    
    [UserPersonaType.PROFESSIONAL]: [
      'work', 'office', 'meeting', 'busy', 'schedule', 'quick', 'fast', 'efficient',
      'lunch break', 'morning', 'early', 'routine', 'habit', 'consistency',
      'simple', 'easy', 'time', 'stress', 'energy', 'focus', 'productivity'
    ],
    
    [UserPersonaType.WEIGHT_MGMT]: [
      'weight', 'lose', 'gain', 'diet', 'calories', 'calorie', 'macro', 'macros',
      'protein', 'carbs', 'fat', 'deficit', 'surplus', 'scale', 'weigh', 'body fat',
      'muscle', 'tone', 'slim', 'fit', 'healthy', 'transformation', 'progress photo'
    ]
  }

  private activityPatterns: VocabularyIndicators = {
    [UserPersonaType.ENDURANCE]: [
      'long duration cardio', 'running', 'cycling', 'swimming', 'triathlon training',
      'interval training', 'base building', 'tempo work', 'recovery runs'
    ],
    
    [UserPersonaType.STRENGTH]: [
      'weight training', 'powerlifting', 'bodybuilding', 'resistance training',
      'compound movements', 'isolation exercises', 'strength training', 'lifting'
    ],
    
    [UserPersonaType.SPORT]: [
      'sport-specific training', 'skill practice', 'team practice', 'games',
      'competitions', 'technique work', 'match play', 'seasonal training'
    ],
    
    [UserPersonaType.PROFESSIONAL]: [
      'quick workouts', 'lunch workouts', 'early morning exercise', 'home workouts',
      'gym sessions', 'efficient training', 'bodyweight exercises', 'cardio'
    ],
    
    [UserPersonaType.WEIGHT_MGMT]: [
      'moderate cardio', 'strength training', 'circuit training', 'walking',
      'calorie burning', 'body composition work', 'weight training', 'HIIT'
    ]
  }

  /**
   * Analyzes user activity data to detect persona type
   */
  public async analyzeUserType(
    activities: any[], 
    profile: any,
    recentLogs: string[]
  ): Promise<UserPersona> {
    const analysis = this.extractActivityAnalysis(activities, recentLogs)
    
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    // Score based on vocabulary usage (40% weight)
    const vocabularyScores = this.scoreByVocabulary(analysis.vocabulary)
    Object.entries(vocabularyScores).forEach(([type, score]) => {
      scores[type as UserPersonaType] += score * 0.4
    })

    // Score based on activity patterns (35% weight)  
    const activityScores = this.scoreByActivityPatterns(analysis.activityTypes)
    Object.entries(activityScores).forEach(([type, score]) => {
      scores[type as UserPersonaType] += score * 0.35
    })

    // Score based on goals (15% weight)
    const goalScores = this.scoreByGoals(analysis.goals)
    Object.entries(goalScores).forEach(([type, score]) => {
      scores[type as UserPersonaType] += score * 0.15
    })

    // Score based on frequency patterns (10% weight)
    const frequencyScores = this.scoreByFrequency(analysis.frequency, analysis.duration)
    Object.entries(frequencyScores).forEach(([type, score]) => {
      scores[type as UserPersonaType] += score * 0.1
    })

    // Find highest scoring type
    const topType = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as UserPersonaType] > scores[b[0] as UserPersonaType] ? a : b
    )[0] as UserPersonaType

    const confidence = Math.min(scores[topType], 100)

    return {
      type: topType,
      confidence: confidence,
      indicators: {
        vocabulary: this.getMatchingVocabulary(analysis.vocabulary, topType),
        activityPatterns: this.getMatchingActivities(analysis.activityTypes, topType),
        goalTypes: analysis.goals,
        frequencyPatterns: analysis.timePatterns
      },
      detectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Onboarding quiz for quick type detection (2-3 questions)
   */
  public getOnboardingQuiz(): {
    questions: Array<{
      id: string
      question: string
      options: Array<{
        value: string
        label: string
        personaWeight: Partial<Record<UserPersonaType, number>>
      }>
    }>
  } {
    return {
      questions: [
        {
          id: 'primary_goal',
          question: 'What\'s your primary fitness goal?',
          options: [
            {
              value: 'endurance_performance',
              label: 'Improve endurance performance (running, cycling, swimming)',
              personaWeight: { 
                [UserPersonaType.ENDURANCE]: 80,
                [UserPersonaType.SPORT]: 20
              }
            },
            {
              value: 'strength_muscle',
              label: 'Build strength and muscle mass',
              personaWeight: { 
                [UserPersonaType.STRENGTH]: 80,
                [UserPersonaType.WEIGHT_MGMT]: 20
              }
            },
            {
              value: 'sport_performance',
              label: 'Improve at my sport (tennis, basketball, etc.)',
              personaWeight: { 
                [UserPersonaType.SPORT]: 80,
                [UserPersonaType.ENDURANCE]: 10,
                [UserPersonaType.STRENGTH]: 10
              }
            },
            {
              value: 'weight_management',
              label: 'Lose weight or improve body composition',
              personaWeight: { 
                [UserPersonaType.WEIGHT_MGMT]: 70,
                [UserPersonaType.PROFESSIONAL]: 30
              }
            },
            {
              value: 'general_health',
              label: 'Stay healthy and fit (busy professional)',
              personaWeight: { 
                [UserPersonaType.PROFESSIONAL]: 80,
                [UserPersonaType.WEIGHT_MGMT]: 20
              }
            }
          ]
        },
        {
          id: 'time_availability',
          question: 'How much time do you typically have for exercise?',
          options: [
            {
              value: 'very_limited',
              label: '15-30 minutes (very busy)',
              personaWeight: { 
                [UserPersonaType.PROFESSIONAL]: 60,
                [UserPersonaType.WEIGHT_MGMT]: 40
              }
            },
            {
              value: 'moderate',
              label: '45-60 minutes most days',
              personaWeight: { 
                [UserPersonaType.WEIGHT_MGMT]: 40,
                [UserPersonaType.STRENGTH]: 30,
                [UserPersonaType.PROFESSIONAL]: 30
              }
            },
            {
              value: 'substantial',
              label: '1-2 hours regularly',
              personaWeight: { 
                [UserPersonaType.STRENGTH]: 50,
                [UserPersonaType.ENDURANCE]: 30,
                [UserPersonaType.SPORT]: 20
              }
            },
            {
              value: 'extensive',
              label: '2+ hours daily (serious training)',
              personaWeight: { 
                [UserPersonaType.ENDURANCE]: 50,
                [UserPersonaType.SPORT]: 40,
                [UserPersonaType.STRENGTH]: 10
              }
            }
          ]
        },
        {
          id: 'activity_preference',
          question: 'Which describes your preferred activities?',
          options: [
            {
              value: 'cardio_focused',
              label: 'Running, cycling, swimming (cardio-focused)',
              personaWeight: { 
                [UserPersonaType.ENDURANCE]: 80,
                [UserPersonaType.WEIGHT_MGMT]: 20
              }
            },
            {
              value: 'strength_focused',
              label: 'Weight lifting, resistance training',
              personaWeight: { 
                [UserPersonaType.STRENGTH]: 80,
                [UserPersonaType.WEIGHT_MGMT]: 20
              }
            },
            {
              value: 'sport_specific',
              label: 'Sport-specific training and games',
              personaWeight: { 
                [UserPersonaType.SPORT]: 90,
                [UserPersonaType.ENDURANCE]: 10
              }
            },
            {
              value: 'variety_efficient',
              label: 'Variety of activities, efficient workouts',
              personaWeight: { 
                [UserPersonaType.PROFESSIONAL]: 50,
                [UserPersonaType.WEIGHT_MGMT]: 50
              }
            }
          ]
        }
      ]
    }
  }

  /**
   * Process onboarding quiz results
   */
  public processOnboardingQuiz(answers: Record<string, string>): UserPersona {
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    const quiz = this.getOnboardingQuiz()
    
    Object.entries(answers).forEach(([questionId, selectedValue]) => {
      const question = quiz.questions.find(q => q.id === questionId)
      if (!question) return
      
      const selectedOption = question.options.find(opt => opt.value === selectedValue)
      if (!selectedOption) return

      Object.entries(selectedOption.personaWeight).forEach(([type, weight]) => {
        scores[type as UserPersonaType] += weight || 0
      })
    })

    // Find highest scoring type
    const topType = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as UserPersonaType] > scores[b[0] as UserPersonaType] ? a : b
    )[0] as UserPersonaType

    // Calculate confidence based on score separation
    const sortedScores = Object.values(scores).sort((a, b) => b - a)
    const confidence = Math.min(
      (sortedScores[0] / (sortedScores[1] || 1)) * 60, // Max 60% from quiz alone
      100
    )

    return {
      type: topType,
      confidence: Math.round(confidence),
      indicators: {
        vocabulary: [],
        activityPatterns: [],
        goalTypes: Object.keys(answers),
        frequencyPatterns: []
      },
      detectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  }

  private extractActivityAnalysis(activities: any[], recentLogs: string[]): ActivityAnalysis {
    const allText = recentLogs.join(' ').toLowerCase()
    const vocabulary = allText.split(/\s+/)
    
    const activityTypes = activities.map(a => a.activity_type || a.type || '').filter(Boolean)
    const frequency = activities.length / Math.max(1, this.getWeeksSpan(activities))
    const duration = activities.reduce((sum, a) => sum + (a.duration_minutes || 30), 0) / Math.max(1, activities.length)
    
    // Extract goals from profile and recent mentions
    const goals = this.extractGoalMentions(allText)
    
    // Extract time patterns
    const timePatterns = this.extractTimePatterns(activities)

    return {
      vocabulary,
      activityTypes,
      frequency,
      duration,
      goals,
      timePatterns
    }
  }

  private scoreByVocabulary(vocabulary: string[]): Record<UserPersonaType, number> {
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    Object.entries(this.vocabularyMap).forEach(([type, keywords]) => {
      const matches = vocabulary.filter(word => 
        keywords.some((keyword: string) => word.includes(keyword.toLowerCase()))
      ).length
      
      scores[type as UserPersonaType] = Math.min(matches * 5, 100) // 5 points per match, max 100
    })

    return scores
  }

  private scoreByActivityPatterns(activityTypes: string[]): Record<UserPersonaType, number> {
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    const cardioTypes = ['cardio', 'running', 'cycling', 'swimming', 'endurance']
    const strengthTypes = ['strength', 'lifting', 'weights', 'resistance']
    const sportTypes = ['sport', 'tennis', 'basketball', 'soccer', 'practice', 'game']
    const generalTypes = ['fitness', 'workout', 'exercise', 'training']

    const cardioCount = activityTypes.filter(t => cardioTypes.some(ct => t.toLowerCase().includes(ct))).length
    const strengthCount = activityTypes.filter(t => strengthTypes.some(st => t.toLowerCase().includes(st))).length
    const sportCount = activityTypes.filter(t => sportTypes.some(sp => t.toLowerCase().includes(sp))).length
    const generalCount = activityTypes.filter(t => generalTypes.some(gt => t.toLowerCase().includes(gt))).length

    scores[UserPersonaType.ENDURANCE] = cardioCount * 20
    scores[UserPersonaType.STRENGTH] = strengthCount * 20
    scores[UserPersonaType.SPORT] = sportCount * 25
    scores[UserPersonaType.PROFESSIONAL] = generalCount * 15
    scores[UserPersonaType.WEIGHT_MGMT] = (cardioCount + strengthCount) * 10

    return scores
  }

  private scoreByGoals(goals: string[]): Record<UserPersonaType, number> {
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    goals.forEach(goal => {
      if (['marathon', 'endurance', 'cardio', 'running', 'cycling'].some(g => goal.includes(g))) {
        scores[UserPersonaType.ENDURANCE] += 30
      }
      if (['strength', 'muscle', 'lifting', 'bulk', 'power'].some(g => goal.includes(g))) {
        scores[UserPersonaType.STRENGTH] += 30
      }
      if (['sport', 'tennis', 'basketball', 'performance', 'competition'].some(g => goal.includes(g))) {
        scores[UserPersonaType.SPORT] += 35
      }
      if (['weight', 'lose', 'diet', 'fat', 'calories'].some(g => goal.includes(g))) {
        scores[UserPersonaType.WEIGHT_MGMT] += 30
      }
      if (['health', 'fitness', 'routine', 'consistent', 'busy'].some(g => goal.includes(g))) {
        scores[UserPersonaType.PROFESSIONAL] += 25
      }
    })

    return scores
  }

  private scoreByFrequency(frequency: number, duration: number): Record<UserPersonaType, number> {
    const scores: Record<UserPersonaType, number> = {
      [UserPersonaType.ENDURANCE]: 0,
      [UserPersonaType.STRENGTH]: 0,
      [UserPersonaType.SPORT]: 0,
      [UserPersonaType.PROFESSIONAL]: 0,
      [UserPersonaType.WEIGHT_MGMT]: 0
    }

    // High frequency, long duration -> Endurance or Sport
    if (frequency >= 5 && duration >= 60) {
      scores[UserPersonaType.ENDURANCE] += 20
      scores[UserPersonaType.SPORT] += 20
    }
    
    // Medium frequency, medium duration -> Strength or Weight Management
    if (frequency >= 3 && frequency <= 5 && duration >= 45 && duration <= 90) {
      scores[UserPersonaType.STRENGTH] += 25
      scores[UserPersonaType.WEIGHT_MGMT] += 20
    }

    // Low frequency, short duration -> Professional
    if (frequency <= 3 && duration <= 45) {
      scores[UserPersonaType.PROFESSIONAL] += 30
    }

    return scores
  }

  private getMatchingVocabulary(vocabulary: string[], type: UserPersonaType): string[] {
    return vocabulary.filter(word => 
      this.vocabularyMap[type].some(keyword => 
        word.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 10) // Top 10 matches
  }

  private getMatchingActivities(activities: string[], type: UserPersonaType): string[] {
    return activities.filter(activity => 
      this.activityPatterns[type].some(pattern => 
        activity.toLowerCase().includes(pattern.toLowerCase())
      )
    ).slice(0, 10) // Top 10 matches
  }

  private getWeeksSpan(activities: any[]): number {
    if (activities.length === 0) return 1
    
    const dates = activities.map(a => new Date(a.date || a.created_at))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    return Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 7)))
  }

  private extractGoalMentions(text: string): string[] {
    const goalKeywords = [
      'lose weight', 'gain muscle', 'marathon', 'strength', 'performance',
      'competition', 'health', 'fitness', 'endurance', 'sport', 'training'
    ]
    
    return goalKeywords.filter(goal => 
      text.toLowerCase().includes(goal.toLowerCase())
    )
  }

  private extractTimePatterns(activities: any[]): string[] {
    const patterns: string[] = []
    
    const morningCount = activities.filter(a => {
      const hour = new Date(a.created_at || a.date).getHours()
      return hour >= 5 && hour <= 11
    }).length

    const eveningCount = activities.filter(a => {
      const hour = new Date(a.created_at || a.date).getHours()
      return hour >= 17 && hour <= 22
    }).length

    const weekendCount = activities.filter(a => {
      const day = new Date(a.created_at || a.date).getDay()
      return day === 0 || day === 6
    }).length

    if (morningCount > activities.length * 0.6) patterns.push('morning_person')
    if (eveningCount > activities.length * 0.6) patterns.push('evening_person')
    if (weekendCount > activities.length * 0.4) patterns.push('weekend_warrior')

    return patterns
  }

  /**
   * Continuous refinement based on new activity data
   */
  public async refineUserType(
    currentPersona: UserPersona,
    newActivities: any[],
    newLogs: string[]
  ): Promise<UserPersona> {
    const newAnalysis = await this.analyzeUserType(newActivities, {}, newLogs)
    
    // Weight current persona (70%) with new analysis (30%)
    const blendedConfidence = (currentPersona.confidence * 0.7) + (newAnalysis.confidence * 0.3)
    
    // If new type is significantly different and confident, switch
    if (newAnalysis.type !== currentPersona.type && newAnalysis.confidence > 75) {
      return {
        ...newAnalysis,
        confidence: Math.round(blendedConfidence),
        lastUpdated: new Date().toISOString(),
        detectedAt: currentPersona.detectedAt // Keep original detection date
      }
    }

    // Otherwise, update indicators and confidence
    return {
      ...currentPersona,
      confidence: Math.round(blendedConfidence),
      indicators: {
        vocabulary: Array.from(new Set([...currentPersona.indicators.vocabulary, ...newAnalysis.indicators.vocabulary])),
        activityPatterns: Array.from(new Set([...currentPersona.indicators.activityPatterns, ...newAnalysis.indicators.activityPatterns])),
        goalTypes: Array.from(new Set([...currentPersona.indicators.goalTypes, ...newAnalysis.indicators.goalTypes])),
        frequencyPatterns: Array.from(new Set([...currentPersona.indicators.frequencyPatterns, ...newAnalysis.indicators.frequencyPatterns]))
      },
      lastUpdated: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const userTypeDetector = new UserTypeDetector()