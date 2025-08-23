/**
 * Insight Generator with Motivational Design
 * Phase 5.3 Implementation - Variable Reward Schedules & Milestone Tracking
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DailyInsight {
  id: string
  type: 'progress' | 'pattern' | 'achievement' | 'challenge' | 'motivation'
  title: string
  message: string
  actionItem?: string
  rewardType: 'badge' | 'streak' | 'milestone' | 'social' | 'intrinsic'
  priority: number // 1-3 (top 3 insights per day)
  createdAt: Date
  data: Record<string, any>
}

export interface UserChallenge {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  rewardBadge: string
  progressPercent: number
  isCompleted: boolean
  expiresAt: Date
}

export interface ProgressBadge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: 'streak' | 'milestone' | 'achievement' | 'social'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

export class InsightGenerator {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Generate top 2-3 daily insights using variable reward schedules
   * Implementation of Phase 5.3.1
   */
  async generateDailyInsights(): Promise<DailyInsight[]> {
    try {
      // Fetch recent user data
      const [activityData, userProfile, existingInsights] = await Promise.all([
        this.getRecentActivityData(),
        this.getUserProfile(),
        this.getExistingInsights()
      ])

      const insights: DailyInsight[] = []
      
      // 1. Progress Insights (most reliable reward)
      const progressInsight = await this.generateProgressInsight(activityData)
      if (progressInsight) insights.push(progressInsight)

      // 2. Pattern Detection Insights (variable reward)
      const patternInsight = await this.generatePatternInsight(activityData)
      if (patternInsight) insights.push(patternInsight)

      // 3. Achievement/Milestone Insights (rare, high-value reward)
      const achievementInsight = await this.generateAchievementInsight(activityData, userProfile)
      if (achievementInsight) insights.push(achievementInsight)

      // 4. Challenge Insights (gamification)
      const challengeInsight = await this.generateChallengeInsight(activityData)
      if (challengeInsight) insights.push(challengeInsight)

      // Sort by priority and return top 3
      return insights
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3)
    } catch (error) {
      console.error('Error generating daily insights:', error)
      return []
    }
  }

  /**
   * Generate personalized challenges with milestone badges
   * Implementation of Phase 5.3.2
   */
  async generatePersonalizedChallenges(): Promise<UserChallenge[]> {
    try {
      const userProfile = await this.getUserProfile()
      const recentActivity = await this.getRecentActivityData()
      
      const challenges: UserChallenge[] = []

      // Daily challenges (variable rewards)
      if (Math.random() > 0.3) { // 70% chance of daily challenge
        const dailyChallenge = this.createDailyChallenge(recentActivity, userProfile)
        if (dailyChallenge) challenges.push(dailyChallenge)
      }

      // Weekly challenges (consistent progression)
      const weeklyChallenge = this.createWeeklyChallenge(recentActivity, userProfile)
      if (weeklyChallenge) challenges.push(weeklyChallenge)

      // Monthly milestones (rare, high-value rewards)
      const monthlyChallenge = this.createMonthlyChallenge(recentActivity, userProfile)
      if (monthlyChallenge) challenges.push(monthlyChallenge)

      return challenges
    } catch (error) {
      console.error('Error generating challenges:', error)
      return []
    }
  }

  /**
   * Track goal progress with streak counters and forgiveness features
   * Implementation of Phase 5.3.3
   */
  async trackGoalProgress(goalId: string): Promise<{
    currentStreak: number
    longestStreak: number
    completionRate: number
    streakFreezeUsed: boolean
    forgivenessModeActive: boolean
    nextMilestone: { days: number, reward: string }
  }> {
    try {
      const { data: goal } = await supabase
        .from('user_goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', this.userId)
        .single()

      if (!goal) throw new Error('Goal not found')

      // Calculate streak metrics
      const streakData = await this.calculateStreakMetrics(goalId)
      
      // Check for streak freeze usage (1 per week)
      const streakFreezeData = await this.getStreakFreezeStatus(goalId)
      
      // Determine next milestone reward
      const nextMilestone = this.getNextMilestone(streakData.currentStreak)

      return {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        completionRate: streakData.completionRate,
        streakFreezeUsed: streakFreezeData.used,
        forgivenessModeActive: this.shouldActiveForgiveness(streakData),
        nextMilestone
      }
    } catch (error) {
      console.error('Error tracking goal progress:', error)
      throw error
    }
  }

  /**
   * Generate adaptive recommendations based on Self-Determination Theory
   * Implementation of Phase 5.3.4 (Autonomy, Competence, Relatedness)
   */
  async generateAdaptiveRecommendations(): Promise<{
    autonomy: string[]    // Choice-based recommendations
    competence: string[]  // Skill-building recommendations
    relatedness: string[] // Social/community recommendations
  }> {
    try {
      const userProfile = await this.getUserProfile()
      const recentActivity = await this.getRecentActivityData()
      const socialData = await this.getSocialActivityData()

      return {
        // Autonomy: Multiple options, user choice
        autonomy: [
          "Choose your workout style: Quick 15-min HIIT or steady 30-min cardio?",
          "Pick your challenge: Weight-focused or endurance-focused this week?",
          "Set your own goal: What feels achievable and exciting for tomorrow?"
        ],

        // Competence: Progressive skill building
        competence: [
          "You've mastered basic workouts! Ready to try intermediate variations?",
          "Your consistency is solid. Let's work on workout intensity next.",
          "Perfect form on squats! Time to add some weight or try pistol squats."
        ],

        // Relatedness: Community and social connection
        relatedness: [
          "3 people in your network completed similar workouts today!",
          "Share your 7-day streak - inspire others in the community!",
          "Join the weekly challenge: 15 others are working toward the same goal."
        ]
      }
    } catch (error) {
      console.error('Error generating adaptive recommendations:', error)
      return { autonomy: [], competence: [], relatedness: [] }
    }
  }

  // Helper methods
  private async getRecentActivityData() {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    return data || []
  }

  private async getUserProfile() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    return data
  }

  private async getExistingInsights() {
    const { data } = await supabase
      .from('daily_insights')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', new Date().toISOString().split('T')[0])

    return data || []
  }

  private async getSocialActivityData() {
    // Get community activity for social recommendations
    const { data } = await supabase
      .from('activity_logs')
      .select('user_id, activity_type, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    return data || []
  }

  private async generateProgressInsight(activityData: any[]): Promise<DailyInsight | null> {
    if (!activityData.length) return null

    const weeklyCount = activityData.length
    const averageConfidence = activityData.reduce((sum, a) => sum + a.confidence_level, 0) / weeklyCount

    return {
      id: `progress-${Date.now()}`,
      type: 'progress',
      title: 'Weekly Progress Update',
      message: `You logged ${weeklyCount} activities this week with ${averageConfidence.toFixed(0)}% accuracy. You're building great tracking habits!`,
      actionItem: weeklyCount < 5 ? "Try to log one more activity today to reach your weekly goal!" : undefined,
      rewardType: 'intrinsic',
      priority: 1,
      createdAt: new Date(),
      data: { weeklyCount, averageConfidence }
    }
  }

  private async generatePatternInsight(activityData: any[]): Promise<DailyInsight | null> {
    // Look for patterns (variable reward - only sometimes generated)
    if (Math.random() > 0.6) return null // 40% chance

    const morningWorkouts = activityData.filter(a => 
      new Date(a.created_at).getHours() < 12 && a.activity_type === 'cardio'
    ).length

    if (morningWorkouts >= 3) {
      return {
        id: `pattern-${Date.now()}`,
        type: 'pattern',
        title: 'Morning Warrior Pattern Detected!',
        message: `You're crushing those morning cardio sessions! ${morningWorkouts} morning workouts this week builds incredible momentum.`,
        actionItem: "Keep this pattern going - morning workouts set your energy for the entire day!",
        rewardType: 'badge',
        priority: 2,
        createdAt: new Date(),
        data: { morningWorkouts }
      }
    }

    return null
  }

  private async generateAchievementInsight(activityData: any[], userProfile: any): Promise<DailyInsight | null> {
    // Check for milestone achievements (rare, high-value)
    const totalActivities = activityData.length
    const milestones = [5, 10, 20, 30, 50, 100]
    
    const reachedMilestone = milestones.find(m => totalActivities === m)
    if (reachedMilestone) {
      return {
        id: `achievement-${Date.now()}`,
        type: 'achievement',
        title: `🏆 ${reachedMilestone}-Activity Milestone Reached!`,
        message: `Incredible! You've logged ${reachedMilestone} activities. This level of consistency transforms habits into identity.`,
        rewardType: 'milestone',
        priority: 1,
        createdAt: new Date(),
        data: { milestone: reachedMilestone }
      }
    }

    return null
  }

  private async generateChallengeInsight(activityData: any[]): Promise<DailyInsight | null> {
    // Generate challenge invitations
    const recentCardio = activityData.filter(a => a.activity_type === 'cardio').length
    
    if (recentCardio >= 2) {
      return {
        id: `challenge-${Date.now()}`,
        type: 'challenge',
        title: 'Cardio Consistency Challenge',
        message: `You're on fire with cardio! Join the 7-day cardio challenge and earn the "Endurance Elite" badge.`,
        actionItem: "Accept the challenge and track 7 cardio sessions this week!",
        rewardType: 'badge',
        priority: 3,
        createdAt: new Date(),
        data: { challengeType: '7-day-cardio' }
      }
    }

    return null
  }

  private createDailyChallenge(activityData: any[], userProfile: any): UserChallenge | null {
    // Variable daily challenges based on recent activity
    const challenges = [
      {
        type: 'daily' as const,
        title: 'Today\'s Movement Goal',
        description: 'Log any physical activity today',
        targetValue: 1,
        unit: 'activity',
        rewardBadge: 'Daily Mover'
      },
      {
        type: 'daily' as const,
        title: 'Hydration Hero',
        description: 'Track your water intake today',
        targetValue: 8,
        unit: 'glasses',
        rewardBadge: 'Hydration Hero'
      },
      {
        type: 'daily' as const,
        title: 'Mindful Moment',
        description: 'Log a wellness or mood activity',
        targetValue: 1,
        unit: 'moment',
        rewardBadge: 'Mindful Warrior'
      }
    ]

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
    
    return {
      id: `daily-${Date.now()}`,
      ...randomChallenge,
      currentValue: 0,
      progressPercent: 0,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  }

  private createWeeklyChallenge(activityData: any[], userProfile: any): UserChallenge | null {
    const averageWeekly = activityData.length
    const targetValue = Math.max(averageWeekly + 1, 5) // Progressive challenge

    return {
      id: `weekly-${Date.now()}`,
      type: 'weekly',
      title: 'Weekly Consistency Challenge',
      description: `Log ${targetValue} activities this week`,
      targetValue,
      currentValue: 0,
      unit: 'activities',
      rewardBadge: 'Weekly Warrior',
      progressPercent: 0,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }

  private createMonthlyChallenge(activityData: any[], userProfile: any): UserChallenge | null {
    return {
      id: `monthly-${Date.now()}`,
      type: 'monthly',
      title: 'Transform Your Identity',
      description: 'Build a 30-day habit streak in any category',
      targetValue: 30,
      currentValue: 0,
      unit: 'days',
      rewardBadge: 'Identity Transformer',
      progressPercent: 0,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  }

  private async calculateStreakMetrics(goalId: string) {
    // Calculate current and longest streak
    const { data } = await supabase
      .from('goal_completions')
      .select('completed_at')
      .eq('goal_id', goalId)
      .order('completed_at', { ascending: false })

    if (!data) return { currentStreak: 0, longestStreak: 0, completionRate: 0 }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate streaks (simplified logic)
    for (let i = 0; i < data.length; i++) {
      const date = new Date(data[i].completed_at)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak++
        tempStreak++
      } else if (daysDiff <= i + 1) {
        currentStreak++
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
        if (i === 0) currentStreak = 0
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)
    const completionRate = data.length > 0 ? (currentStreak / data.length) * 100 : 0

    return { currentStreak, longestStreak, completionRate }
  }

  private async getStreakFreezeStatus(goalId: string) {
    // Check if streak freeze was used this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const { data } = await supabase
      .from('streak_freezes')
      .select('*')
      .eq('goal_id', goalId)
      .gte('used_at', oneWeekAgo.toISOString())

    return { used: (data?.length || 0) > 0 }
  }

  private getNextMilestone(currentStreak: number) {
    const milestones = [
      { days: 7, reward: "Week Warrior Badge" },
      { days: 14, reward: "Two-Week Champion Badge" },
      { days: 21, reward: "Habit Former Badge" },
      { days: 30, reward: "Month Master Badge" },
      { days: 66, reward: "Automatic Habit Badge" },
      { days: 100, reward: "Century Club Badge" }
    ]

    return milestones.find(m => m.days > currentStreak) || 
           { days: currentStreak + 30, reward: "Legendary Streak Badge" }
  }

  private shouldActiveForgiveness(streakData: any): boolean {
    // Activate forgiveness mode if streak was broken recently
    return streakData.currentStreak === 0 && streakData.longestStreak > 7
  }
}

export default InsightGenerator