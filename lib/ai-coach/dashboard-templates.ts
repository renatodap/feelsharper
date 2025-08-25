/**
 * Dashboard Templates by Persona - Phase 9 Implementation
 * Defines specialized dashboard layouts for each user type
 */

import { 
  UserPersonaType, 
  DashboardTemplate, 
  PersonaDashboardConfig,
  DASHBOARD_WIDGETS 
} from './types'

export class DashboardTemplateManager {
  private templates: Record<UserPersonaType, DashboardTemplate> = {
    [UserPersonaType.ENDURANCE]: {
      persona: UserPersonaType.ENDURANCE,
      config: {
        primaryWidgets: [
          DASHBOARD_WIDGETS.HR_ZONES,
          DASHBOARD_WIDGETS.TRAINING_LOAD,
          DASHBOARD_WIDGETS.WEEKLY_VOLUME,
          DASHBOARD_WIDGETS.VO2_MAX,
          DASHBOARD_WIDGETS.RECOVERY_METRICS
        ],
        secondaryWidgets: [
          DASHBOARD_WIDGETS.PERSONAL_RECORDS,
          DASHBOARD_WIDGETS.WEIGHT_TREND,
          DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
          DASHBOARD_WIDGETS.MOOD_TRACKING,
          DASHBOARD_WIDGETS.HABIT_TRACKER
        ],
        layout: 'grid',
        defaultTimeframe: '30d'
      },
      widgets: {
        [DASHBOARD_WIDGETS.HR_ZONES]: {
          title: 'Heart Rate Training Zones',
          description: 'Time spent in each HR zone with zone distribution',
          component: 'HRZonesWidget',
          dataSource: 'activity_logs.cardio',
          priority: 1,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.TRAINING_LOAD]: {
          title: 'Training Load & TSS',
          description: 'Weekly training stress score and load progression',
          component: 'TrainingLoadWidget',
          dataSource: 'activity_logs.all',
          priority: 2,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.WEEKLY_VOLUME]: {
          title: 'Weekly Training Volume',
          description: 'Distance/time per activity type with weekly totals',
          component: 'VolumeWidget',
          dataSource: 'activity_logs.cardio',
          priority: 3,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.VO2_MAX]: {
          title: 'VO2 Max Progression',
          description: 'Estimated VO2 max based on performance data',
          component: 'VO2MaxWidget',
          dataSource: 'activity_logs.performance',
          priority: 4,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.RECOVERY_METRICS]: {
          title: 'Recovery Tracking',
          description: 'Sleep, HRV, RPE and recovery recommendations',
          component: 'RecoveryWidget',
          dataSource: 'activity_logs.recovery',
          priority: 5,
          showByDefault: true
        }
      }
    },

    [UserPersonaType.STRENGTH]: {
      persona: UserPersonaType.STRENGTH,
      config: {
        primaryWidgets: [
          DASHBOARD_WIDGETS.PERSONAL_RECORDS,
          DASHBOARD_WIDGETS.VOLUME_PROGRESSION,
          DASHBOARD_WIDGETS.PROTEIN_INTAKE,
          DASHBOARD_WIDGETS.BODY_COMPOSITION,
          DASHBOARD_WIDGETS.STRENGTH_BALANCE
        ],
        secondaryWidgets: [
          DASHBOARD_WIDGETS.WEIGHT_TREND,
          DASHBOARD_WIDGETS.RECOVERY_METRICS,
          DASHBOARD_WIDGETS.CALORIE_BALANCE,
          DASHBOARD_WIDGETS.HABIT_TRACKER,
          DASHBOARD_WIDGETS.MOOD_TRACKING
        ],
        layout: 'grid',
        defaultTimeframe: '30d'
      },
      widgets: {
        [DASHBOARD_WIDGETS.PERSONAL_RECORDS]: {
          title: 'Personal Records & PRs',
          description: 'Recent PRs, strength progression, and lift tracking',
          component: 'PersonalRecordsWidget',
          dataSource: 'personal_records',
          priority: 1,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.VOLUME_PROGRESSION]: {
          title: 'Training Volume Progression',
          description: 'Sets, reps, total volume progression over time',
          component: 'VolumeProgressionWidget',
          dataSource: 'activity_logs.strength',
          priority: 2,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.PROTEIN_INTAKE]: {
          title: 'Protein & Nutrition',
          description: 'Daily protein intake, timing, and muscle-building nutrients',
          component: 'ProteinWidget',
          dataSource: 'nutrition_logs',
          priority: 3,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.BODY_COMPOSITION]: {
          title: 'Body Composition Changes',
          description: 'Weight, muscle mass, body fat percentage trends',
          component: 'BodyCompositionWidget',
          dataSource: 'body_measurements',
          priority: 4,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.STRENGTH_BALANCE]: {
          title: 'Strength Balance Analysis',
          description: 'Push/pull ratios, muscle group balance, weak points',
          component: 'StrengthBalanceWidget',
          dataSource: 'activity_logs.strength',
          priority: 5,
          showByDefault: true
        }
      }
    },

    [UserPersonaType.SPORT]: {
      persona: UserPersonaType.SPORT,
      config: {
        primaryWidgets: [
          DASHBOARD_WIDGETS.PRACTICE_HOURS,
          DASHBOARD_WIDGETS.PERFORMANCE_RATING,
          DASHBOARD_WIDGETS.SKILL_PROGRESSION,
          DASHBOARD_WIDGETS.MOOD_TRACKING
        ],
        secondaryWidgets: [
          DASHBOARD_WIDGETS.WIN_LOSS_RECORD,
          DASHBOARD_WIDGETS.RECOVERY_METRICS,
          DASHBOARD_WIDGETS.STRENGTH_BALANCE,
          DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
          DASHBOARD_WIDGETS.HABIT_TRACKER
        ],
        layout: 'grid',
        defaultTimeframe: '30d'
      },
      widgets: {
        [DASHBOARD_WIDGETS.PRACTICE_HOURS]: {
          title: 'Practice & Training Hours',
          description: 'Weekly practice time, skill work, conditioning split',
          component: 'PracticeHoursWidget',
          dataSource: 'activity_logs.sport',
          priority: 1,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.PERFORMANCE_RATING]: {
          title: 'Performance Rating',
          description: 'Self-rated performance in games/practices (1-10 scale)',
          component: 'PerformanceRatingWidget',
          dataSource: 'activity_logs.subjective',
          priority: 2,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.SKILL_PROGRESSION]: {
          title: 'Skill Development',
          description: 'Technique improvements, skill milestones, coach feedback',
          component: 'SkillProgressionWidget',
          dataSource: 'activity_logs.sport',
          priority: 3,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.MOOD_TRACKING]: {
          title: 'Mental Game & Mood',
          description: 'Pre/post competition mood, confidence, mental state',
          component: 'MoodTrackingWidget',
          dataSource: 'activity_logs.wellness',
          priority: 4,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.WIN_LOSS_RECORD]: {
          title: 'Competition Results',
          description: 'Win/loss record, tournament results, rankings',
          component: 'WinLossWidget',
          dataSource: 'activity_logs.competition',
          priority: 5,
          showByDefault: false
        }
      }
    },

    [UserPersonaType.PROFESSIONAL]: {
      persona: UserPersonaType.PROFESSIONAL,
      config: {
        primaryWidgets: [
          DASHBOARD_WIDGETS.QUICK_STATS,
          DASHBOARD_WIDGETS.EXERCISE_STREAK,
          DASHBOARD_WIDGETS.ENERGY_LEVELS
        ],
        secondaryWidgets: [
          DASHBOARD_WIDGETS.WEIGHT_TREND,
          DASHBOARD_WIDGETS.HABIT_TRACKER,
          DASHBOARD_WIDGETS.RECOVERY_METRICS,
          DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
          DASHBOARD_WIDGETS.CALORIE_BALANCE
        ],
        layout: 'list',
        defaultTimeframe: '7d'
      },
      widgets: {
        [DASHBOARD_WIDGETS.QUICK_STATS]: {
          title: 'This Week At-a-Glance',
          description: 'Top 3 key metrics: workouts, weight, energy',
          component: 'QuickStatsWidget',
          dataSource: 'activity_logs.summary',
          priority: 1,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.EXERCISE_STREAK]: {
          title: 'Exercise Consistency',
          description: 'Current streak, weekly goals, habit formation progress',
          component: 'ExerciseStreakWidget',
          dataSource: 'activity_logs.habits',
          priority: 2,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.ENERGY_LEVELS]: {
          title: 'Energy & Productivity',
          description: 'Daily energy ratings, workout impact on work performance',
          component: 'EnergyLevelsWidget',
          dataSource: 'activity_logs.wellness',
          priority: 3,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.WEIGHT_TREND]: {
          title: 'Weight Trend',
          description: 'Simple weight tracking with weekly moving average',
          component: 'WeightTrendWidget',
          dataSource: 'body_measurements.weight',
          priority: 4,
          showByDefault: false
        },
        [DASHBOARD_WIDGETS.HABIT_TRACKER]: {
          title: 'Habit Formation',
          description: 'Daily habit completion, streak maintenance, consistency',
          component: 'HabitTrackerWidget',
          dataSource: 'activity_logs.habits',
          priority: 5,
          showByDefault: false
        }
      }
    },

    [UserPersonaType.WEIGHT_MGMT]: {
      persona: UserPersonaType.WEIGHT_MGMT,
      config: {
        primaryWidgets: [
          DASHBOARD_WIDGETS.WEIGHT_PROGRESS,
          DASHBOARD_WIDGETS.CALORIE_BALANCE,
          DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
          DASHBOARD_WIDGETS.PROGRESS_PHOTOS,
          DASHBOARD_WIDGETS.BODY_MEASUREMENTS
        ],
        secondaryWidgets: [
          DASHBOARD_WIDGETS.EXERCISE_STREAK,
          DASHBOARD_WIDGETS.MOOD_TRACKING,
          DASHBOARD_WIDGETS.HABIT_TRACKER,
          DASHBOARD_WIDGETS.ENERGY_LEVELS,
          DASHBOARD_WIDGETS.RECOVERY_METRICS
        ],
        layout: 'grid',
        defaultTimeframe: '30d'
      },
      widgets: {
        [DASHBOARD_WIDGETS.WEIGHT_PROGRESS]: {
          title: 'Weight Loss Progress',
          description: 'Weight trend, goal progress, projected timeline',
          component: 'WeightProgressWidget',
          dataSource: 'body_measurements.weight',
          priority: 1,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.CALORIE_BALANCE]: {
          title: 'Calorie Balance & Deficit',
          description: 'Daily calories in/out, deficit tracking, TDEE estimation',
          component: 'CalorieBalanceWidget',
          dataSource: 'nutrition_logs',
          priority: 2,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN]: {
          title: 'Nutrition Breakdown',
          description: 'Macros, meal timing, nutrient density, food quality',
          component: 'NutritionBreakdownWidget',
          dataSource: 'nutrition_logs',
          priority: 3,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.PROGRESS_PHOTOS]: {
          title: 'Progress Photos',
          description: 'Visual body composition changes over time',
          component: 'ProgressPhotosWidget',
          dataSource: 'body_measurements.photos',
          priority: 4,
          showByDefault: true
        },
        [DASHBOARD_WIDGETS.BODY_MEASUREMENTS]: {
          title: 'Body Measurements',
          description: 'Waist, chest, arms, body fat percentage changes',
          component: 'BodyMeasurementsWidget',
          dataSource: 'body_measurements.all',
          priority: 5,
          showByDefault: true
        }
      }
    }
  }

  /**
   * Get dashboard template for specific persona
   */
  public getTemplate(persona: UserPersonaType): DashboardTemplate {
    return this.templates[persona]
  }

  /**
   * Get personalized dashboard configuration
   */
  public getPersonalizedConfig(
    persona: UserPersonaType,
    userPreferences?: Partial<PersonaDashboardConfig>
  ): PersonaDashboardConfig {
    const baseTemplate = this.templates[persona]
    
    return {
      ...baseTemplate.config,
      ...userPreferences
    }
  }

  /**
   * Get widget configuration for specific widget
   */
  public getWidgetConfig(persona: UserPersonaType, widgetId: string) {
    const template = this.templates[persona]
    return template.widgets[widgetId] || null
  }

  /**
   * Get all available widgets for persona (primary + secondary)
   */
  public getAllWidgets(persona: UserPersonaType): string[] {
    const template = this.templates[persona]
    return [
      ...template.config.primaryWidgets,
      ...template.config.secondaryWidgets
    ]
  }

  /**
   * Customize dashboard based on user behavior and preferences
   */
  public customizeDashboard(
    persona: UserPersonaType,
    userInteractions: {
      expandedWidgets: string[]
      hiddenWidgets: string[]
      timeSpentPerWidget: Record<string, number>
      mostUsedActions: string[]
    },
    dataAvailability: Record<string, boolean>
  ): PersonaDashboardConfig {
    const baseConfig = this.templates[persona].config
    
    // Filter out widgets for which we don't have data
    const availablePrimaryWidgets = baseConfig.primaryWidgets.filter(
      widget => dataAvailability[widget] !== false
    )
    
    const availableSecondaryWidgets = baseConfig.secondaryWidgets.filter(
      widget => dataAvailability[widget] !== false
    )

    // Prioritize widgets based on user engagement
    const engagementScores = this.calculateEngagementScores(
      [...availablePrimaryWidgets, ...availableSecondaryWidgets],
      userInteractions
    )

    // Re-sort widgets by engagement (high engagement = primary)
    const sortedWidgets = Object.entries(engagementScores)
      .sort(([,scoreA], [,scoreB]) => scoreB - scoreA)
      .map(([widget]) => widget)

    // Take top widgets as primary, rest as secondary
    const maxPrimaryWidgets = Math.min(5, sortedWidgets.length)
    
    return {
      ...baseConfig,
      primaryWidgets: sortedWidgets.slice(0, maxPrimaryWidgets),
      secondaryWidgets: sortedWidgets.slice(maxPrimaryWidgets)
    }
  }

  /**
   * Generate adaptive dashboard based on recent activity patterns
   */
  public generateAdaptiveDashboard(
    persona: UserPersonaType,
    recentActivities: any[],
    currentGoals: string[]
  ): PersonaDashboardConfig {
    const baseTemplate = this.templates[persona]
    
    // Analyze recent activity focus
    const activityFocus = this.analyzeActivityFocus(recentActivities)
    
    // Adjust widget priorities based on current focus
    const adaptedWidgets = this.adaptWidgetsByFocus(
      baseTemplate.config.primaryWidgets,
      activityFocus,
      currentGoals
    )

    return {
      ...baseTemplate.config,
      primaryWidgets: adaptedWidgets.slice(0, 5),
      secondaryWidgets: [
        ...adaptedWidgets.slice(5),
        ...baseTemplate.config.secondaryWidgets.filter(
          w => !adaptedWidgets.includes(w)
        )
      ]
    }
  }

  private calculateEngagementScores(
    widgets: string[],
    interactions: {
      expandedWidgets: string[]
      hiddenWidgets: string[]
      timeSpentPerWidget: Record<string, number>
      mostUsedActions: string[]
    }
  ): Record<string, number> {
    const scores: Record<string, number> = {}

    widgets.forEach(widget => {
      let score = 50 // Base score
      
      // Bonus for expanded widgets
      if (interactions.expandedWidgets.includes(widget)) {
        score += 30
      }
      
      // Penalty for hidden widgets
      if (interactions.hiddenWidgets.includes(widget)) {
        score -= 40
      }
      
      // Time spent bonus
      const timeSpent = interactions.timeSpentPerWidget[widget] || 0
      score += Math.min(timeSpent / 60, 20) // Up to 20 points for time spent
      
      // Action usage bonus
      const widgetActions = interactions.mostUsedActions.filter(
        action => action.includes(widget)
      ).length
      score += widgetActions * 10

      scores[widget] = Math.max(0, Math.min(100, score))
    })

    return scores
  }

  private analyzeActivityFocus(activities: any[]): {
    cardioFocus: number
    strengthFocus: number
    sportFocus: number
    nutritionFocus: number
    recoveryFocus: number
  } {
    const total = activities.length || 1
    
    const cardioCount = activities.filter(a => 
      ['cardio', 'running', 'cycling', 'swimming'].includes(a.activity_type)
    ).length

    const strengthCount = activities.filter(a => 
      ['strength', 'weightlifting', 'resistance'].includes(a.activity_type)
    ).length

    const sportCount = activities.filter(a => 
      ['sport', 'tennis', 'basketball', 'soccer'].includes(a.activity_type)
    ).length

    const nutritionCount = activities.filter(a => 
      a.activity_type === 'nutrition'
    ).length

    const recoveryCount = activities.filter(a => 
      ['sleep', 'wellness', 'recovery'].includes(a.activity_type)
    ).length

    return {
      cardioFocus: cardioCount / total,
      strengthFocus: strengthCount / total,
      sportFocus: sportCount / total,
      nutritionFocus: nutritionCount / total,
      recoveryFocus: recoveryCount / total
    }
  }

  private adaptWidgetsByFocus(
    baseWidgets: string[],
    focus: {
      cardioFocus: number
      strengthFocus: number
      sportFocus: number
      nutritionFocus: number
      recoveryFocus: number
    },
    goals: string[]
  ): string[] {
    const widgetPriorities: Record<string, number> = {}
    
    baseWidgets.forEach(widget => {
      let priority = 50 // Base priority
      
      // Adjust based on activity focus
      if (widget.includes('hr_zones') || widget.includes('training_load')) {
        priority += focus.cardioFocus * 30
      }
      
      if (widget.includes('personal_records') || widget.includes('strength')) {
        priority += focus.strengthFocus * 30
      }
      
      if (widget.includes('performance') || widget.includes('practice')) {
        priority += focus.sportFocus * 30
      }
      
      if (widget.includes('nutrition') || widget.includes('calorie')) {
        priority += focus.nutritionFocus * 30
      }
      
      if (widget.includes('recovery') || widget.includes('sleep')) {
        priority += focus.recoveryFocus * 30
      }
      
      // Adjust based on current goals
      goals.forEach(goal => {
        if (goal.toLowerCase().includes('weight') && widget.includes('weight')) {
          priority += 20
        }
        if (goal.toLowerCase().includes('strength') && widget.includes('strength')) {
          priority += 20
        }
        if (goal.toLowerCase().includes('endurance') && widget.includes('hr_zones')) {
          priority += 20
        }
      })

      widgetPriorities[widget] = priority
    })

    return Object.entries(widgetPriorities)
      .sort(([,priorityA], [,priorityB]) => priorityB - priorityA)
      .map(([widget]) => widget)
  }
}

// Export singleton instance
export const dashboardTemplateManager = new DashboardTemplateManager()