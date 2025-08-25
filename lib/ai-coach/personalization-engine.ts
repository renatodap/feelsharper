/**
 * Personalization Engine - Phase 9 Main Controller
 * Orchestrates user type detection, dashboard customization, and adaptive interventions
 */

import { 
  UserPersonaType,
  UserPersona, 
  PersonalizationProfile,
  BehavioralContext,
  PersonaDashboardConfig,
  AdaptiveIntervention
} from './types'
import { userTypeDetector } from './user-type-detector'
import { dashboardTemplateManager } from './dashboard-templates'
import { adaptiveBehavioralEngine } from './adaptive-interventions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class PersonalizationEngine {
  private supabase = createClientComponentClient()

  /**
   * Complete user personalization workflow
   */
  public async personalizeUserExperience(
    userId: string,
    forceRefresh: boolean = false
  ): Promise<PersonalizationProfile> {
    try {
      // 1. Check if we have existing personalization profile
      let existingProfile = await this.getPersonalizationProfile(userId)
      
      if (existingProfile && !forceRefresh && this.isProfileCurrent(existingProfile)) {
        return existingProfile
      }

      // 2. Gather user data for analysis
      const userData = await this.gatherUserData(userId)
      
      // 3. Detect or refine user persona
      const persona = await this.detectUserPersona(userId, userData, existingProfile?.persona)
      
      // 4. Generate personalized dashboard config
      const dashboardConfig = await this.generateDashboardConfig(persona, userData)
      
      // 5. Determine motivational style and habit preferences
      const motivationalProfile = await this.analyzeMotivationalStyle(userData)
      const habitProfile = await this.analyzeHabitFormationStyle(userData)
      
      // 6. Generate adaptive interventions
      const interventions = await this.generateInterventions(persona, userData, motivationalProfile)

      // 7. Create complete personalization profile
      const newProfile: PersonalizationProfile = {
        userId,
        persona,
        dashboardConfig,
        motivationalStyle: motivationalProfile,
        habitFormationProfile: habitProfile,
        adaptiveInterventions: interventions,
        lastPersonalizationUpdate: new Date().toISOString()
      }

      // 8. Save profile
      await this.savePersonalizationProfile(newProfile)
      
      return newProfile
    } catch (error) {
      console.error('Personalization engine error:', error)
      // Return default profile on error
      return this.getDefaultProfile(userId)
    }
  }

  /**
   * Get current behavioral context
   */
  public getCurrentContext(userId: string): BehavioralContext {
    const now = new Date()
    
    return {
      timeOfDay: now.toTimeString().slice(0, 5),
      dayOfWeek: now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
      recentActivity: [], // Will be populated from recent logs
      environmentalFactors: {
        location: 'unknown',
        weather: 'unknown',
        calendar: []
      },
      lastInteraction: now.toISOString()
    }
  }

  /**
   * Get optimal intervention for current context
   */
  public async getOptimalIntervention(
    userId: string,
    context?: BehavioralContext
  ): Promise<AdaptiveIntervention | null> {
    try {
      const profile = await this.getPersonalizationProfile(userId)
      if (!profile) return null

      const currentContext = context || this.getCurrentContext(userId)
      const recentActivities = await this.getRecentActivities(userId, 7) // Last 7 days
      
      // Add recent activity to context
      currentContext.recentActivity = recentActivities.map(a => a.activity_type).slice(0, 5)

      return await adaptiveBehavioralEngine.selectOptimalIntervention(
        currentContext,
        recentActivities,
        profile,
        {}
      )
    } catch (error) {
      console.error('Failed to get optimal intervention:', error)
      return null
    }
  }

  /**
   * Update personalization based on new user behavior
   */
  public async updatePersonalizationFromBehavior(
    userId: string,
    newActivities: any[],
    userInteractions: {
      expandedWidgets: string[]
      hiddenWidgets: string[]
      timeSpentPerWidget: Record<string, number>
      mostUsedActions: string[]
    }
  ): Promise<PersonalizationProfile> {
    const currentProfile = await this.getPersonalizationProfile(userId)
    if (!currentProfile) {
      return await this.personalizeUserExperience(userId)
    }

    // Refine user type based on new activities
    const recentLogs = newActivities.map(a => a.parsed_data?.original_text || '').filter(Boolean)
    const refinedPersona = await userTypeDetector.refineUserType(
      currentProfile.persona,
      newActivities,
      recentLogs
    )

    // Update dashboard based on user interactions
    const dataAvailability = await this.checkDataAvailability(userId)
    const updatedDashboardConfig = dashboardTemplateManager.customizeDashboard(
      refinedPersona.type,
      userInteractions,
      dataAvailability
    )

    // Update profile
    const updatedProfile: PersonalizationProfile = {
      ...currentProfile,
      persona: refinedPersona,
      dashboardConfig: updatedDashboardConfig,
      lastPersonalizationUpdate: new Date().toISOString()
    }

    await this.savePersonalizationProfile(updatedProfile)
    return updatedProfile
  }

  /**
   * Generate onboarding quiz for quick personalization
   */
  public getOnboardingQuiz() {
    return userTypeDetector.getOnboardingQuiz()
  }

  /**
   * Process onboarding quiz results
   */
  public async processOnboardingQuiz(
    userId: string,
    answers: Record<string, string>
  ): Promise<PersonalizationProfile> {
    // Get initial persona from quiz
    const persona = userTypeDetector.processOnboardingQuiz(answers)
    
    // Generate initial dashboard config
    const dashboardConfig = dashboardTemplateManager.getPersonalizedConfig(persona.type)
    
    // Create initial profile with defaults
    const profile: PersonalizationProfile = {
      userId,
      persona,
      dashboardConfig,
      motivationalStyle: {
        preference: 'data-driven', // Default, will be refined
        rewardType: 'immediate',
        feedbackStyle: 'gentle'
      },
      habitFormationProfile: {
        difficultyPreference: 'tiny', // Start with tiny habits
        consistencyPattern: 'streaks',
        recoveryStyle: 'forgiveness'
      },
      adaptiveInterventions: [],
      lastPersonalizationUpdate: new Date().toISOString()
    }

    await this.savePersonalizationProfile(profile)
    return profile
  }

  /**
   * Get graduated difficulty suggestions
   */
  public getGraduatedSuggestions(
    persona: UserPersonaType,
    currentLevel: 'beginner' | 'developing' | 'established',
    successRate: number
  ) {
    return adaptiveBehavioralEngine.getGraduatedIntervention(
      persona,
      currentLevel,
      successRate
    )
  }

  private async gatherUserData(userId: string) {
    const [activities, profile, recentLogs] = await Promise.all([
      this.getRecentActivities(userId, 30), // Last 30 days
      this.getUserProfile(userId),
      this.getRecentLogs(userId, 50) // Last 50 log entries
    ])

    return { activities, profile, recentLogs }
  }

  private async detectUserPersona(
    userId: string, 
    userData: any, 
    existingPersona?: UserPersona
  ): Promise<UserPersona> {
    if (existingPersona) {
      // Refine existing persona
      return await userTypeDetector.refineUserType(
        existingPersona,
        userData.activities,
        userData.recentLogs
      )
    } else {
      // Detect new persona
      return await userTypeDetector.analyzeUserType(
        userData.activities,
        userData.profile,
        userData.recentLogs
      )
    }
  }

  private async generateDashboardConfig(
    persona: UserPersona,
    userData: any
  ): Promise<PersonaDashboardConfig> {
    const dataAvailability = await this.checkDataAvailability(userData.profile?.id)
    
    // Generate adaptive dashboard based on available data and recent activity patterns
    return dashboardTemplateManager.generateAdaptiveDashboard(
      persona.type,
      userData.activities,
      userData.profile?.goals || []
    )
  }

  private async analyzeMotivationalStyle(userData: any): Promise<PersonalizationProfile['motivationalStyle']> {
    // Analyze user's vocabulary and activity patterns to determine motivational preferences
    const vocabulary = userData.recentLogs.join(' ').toLowerCase()
    
    let preference: 'data-driven' | 'emotional' | 'social' | 'competitive' = 'data-driven'
    
    if (vocabulary.includes('feel') || vocabulary.includes('mood') || vocabulary.includes('energy')) {
      preference = 'emotional'
    } else if (vocabulary.includes('team') || vocabulary.includes('group') || vocabulary.includes('friend')) {
      preference = 'social'  
    } else if (vocabulary.includes('beat') || vocabulary.includes('win') || vocabulary.includes('compete')) {
      preference = 'competitive'
    }

    return {
      preference,
      rewardType: 'immediate', // Most users prefer immediate feedback
      feedbackStyle: 'gentle' // Start gentle, can be adjusted based on engagement
    }
  }

  private async analyzeHabitFormationStyle(userData: any): Promise<PersonalizationProfile['habitFormationProfile']> {
    // Analyze consistency patterns in user data
    const activities = userData.activities
    const consistency = this.calculateConsistencyMetrics(activities)
    
    return {
      difficultyPreference: consistency.averageSessionLength < 30 ? 'tiny' : 
                           consistency.averageSessionLength < 60 ? 'moderate' : 'ambitious',
      consistencyPattern: consistency.hasStreaks ? 'streaks' : 'flexible',
      recoveryStyle: consistency.recoversFromLapses ? 'forgiveness' : 'restart'
    }
  }

  private async generateInterventions(
    persona: UserPersona,
    userData: any,
    motivationalStyle: PersonalizationProfile['motivationalStyle']
  ): Promise<AdaptiveIntervention[]> {
    // Return empty array - interventions are generated on-demand
    return []
  }

  private async getPersonalizationProfile(userId: string): Promise<PersonalizationProfile | null> {
    try {
      const { data } = await this.supabase
        .from('user_personalization')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return data ? JSON.parse(data.profile_data) : null
    } catch (error) {
      console.error('Failed to get personalization profile:', error)
      return null
    }
  }

  private async savePersonalizationProfile(profile: PersonalizationProfile): Promise<void> {
    try {
      await this.supabase
        .from('user_personalization')
        .upsert({
          user_id: profile.userId,
          persona_type: profile.persona.type,
          profile_data: JSON.stringify(profile),
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to save personalization profile:', error)
      throw error
    }
  }

  private async getRecentActivities(userId: string, days: number): Promise<any[]> {
    const { data } = await this.supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    return data || []
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return data || {}
  }

  private async getRecentLogs(userId: string, limit: number): Promise<string[]> {
    const { data } = await this.supabase
      .from('activity_logs')
      .select('original_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data || []).map(item => item.original_text).filter(Boolean)
  }

  private async checkDataAvailability(userId: string): Promise<Record<string, boolean>> {
    const [activities, nutrition, measurements, workouts] = await Promise.all([
      this.supabase.from('activity_logs').select('id').eq('user_id', userId).limit(1),
      this.supabase.from('nutrition_logs').select('id').eq('user_id', userId).limit(1),
      this.supabase.from('body_measurements').select('id').eq('user_id', userId).limit(1),
      this.supabase.from('workouts').select('id').eq('user_id', userId).limit(1)
    ])

    return {
      activities: (activities.data?.length || 0) > 0,
      nutrition: (nutrition.data?.length || 0) > 0,
      measurements: (measurements.data?.length || 0) > 0,
      workouts: (workouts.data?.length || 0) > 0
    }
  }

  private isProfileCurrent(profile: PersonalizationProfile): boolean {
    const lastUpdate = new Date(profile.lastPersonalizationUpdate)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Refresh if more than 7 days old or confidence is low
    return daysSinceUpdate < 7 && profile.persona.confidence > 70
  }

  private calculateConsistencyMetrics(activities: any[]) {
    if (activities.length === 0) {
      return {
        averageSessionLength: 30,
        hasStreaks: false,
        recoversFromLapses: true
      }
    }

    const sessionLengths = activities
      .map(a => a.duration_minutes)
      .filter(Boolean)
    
    const averageSessionLength = sessionLengths.length > 0 
      ? sessionLengths.reduce((a, b) => a + b) / sessionLengths.length
      : 30

    // Simple streak detection
    const dates = activities.map(a => new Date(a.created_at).toDateString())
    const uniqueDates = Array.from(new Set(dates))
    const hasStreaks = uniqueDates.length > 3

    // Recovery detection - if user has gaps but comes back
    const sortedDates = uniqueDates.sort()
    let hasGapsAndRecovery = false
    
    for (let i = 1; i < sortedDates.length - 1; i++) {
      const prev = new Date(sortedDates[i - 1])
      const curr = new Date(sortedDates[i])
      const next = new Date(sortedDates[i + 1])
      
      const gapBefore = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      const gapAfter = (next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      
      if (gapBefore > 3 && gapAfter <= 2) {
        hasGapsAndRecovery = true
        break
      }
    }

    return {
      averageSessionLength,
      hasStreaks,
      recoversFromLapses: hasGapsAndRecovery
    }
  }

  private getDefaultProfile(userId: string): PersonalizationProfile {
    return {
      userId,
      persona: {
        type: UserPersonaType.PROFESSIONAL,
        confidence: 50,
        indicators: {
          vocabulary: [],
          activityPatterns: [],
          goalTypes: [],
          frequencyPatterns: []
        },
        detectedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      dashboardConfig: dashboardTemplateManager.getTemplate(UserPersonaType.PROFESSIONAL).config,
      motivationalStyle: {
        preference: 'data-driven',
        rewardType: 'immediate',
        feedbackStyle: 'gentle'
      },
      habitFormationProfile: {
        difficultyPreference: 'tiny',
        consistencyPattern: 'flexible',
        recoveryStyle: 'forgiveness'
      },
      adaptiveInterventions: [],
      lastPersonalizationUpdate: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const personalizationEngine = new PersonalizationEngine()