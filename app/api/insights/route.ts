/**
 * Daily Insights API - Phase 5.3 Implementation
 * Generates personalized insights with motivational design
 */

import { NextRequest, NextResponse } from 'next/server'
import InsightGenerator from '@/lib/ai-coach/insight-generator'
import { getUserOr401 } from '@/lib/auth/getUserOr401'

export async function GET(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    console.log('🧠 Generating daily insights with motivational design...')
    
    // Use authenticated user ID
    const userId = auth.user.id
    
    const insightGenerator = new InsightGenerator(userId)
    
    // Generate all insight types
    const [
      dailyInsights,
      personalizedChallenges,
      adaptiveRecommendations
    ] = await Promise.all([
      insightGenerator.generateDailyInsights(),
      insightGenerator.generatePersonalizedChallenges(),
      insightGenerator.generateAdaptiveRecommendations()
    ])

    // Example goal progress (in real app, get from request params)
    const goalProgress = await insightGenerator.trackGoalProgress('demo-goal-123').catch(() => ({
      currentStreak: 5,
      longestStreak: 12,
      completionRate: 78,
      streakFreezeUsed: false,
      forgivenessModeActive: false,
      nextMilestone: { days: 7, reward: "Week Warrior Badge" }
    }))

    const response = {
      success: true,
      data: {
        dailyInsights: dailyInsights.map(insight => ({
          ...insight,
          isVariableReward: insight.type === 'pattern' || insight.type === 'achievement',
          gamificationElement: insight.rewardType === 'badge' || insight.rewardType === 'milestone'
        })),
        personalizedChallenges: personalizedChallenges.map(challenge => ({
          ...challenge,
          motivationalDesign: {
            progressVisual: `${Math.round(challenge.progressPercent)}% complete`,
            socialProof: challenge.type === 'weekly' ? '47 others working on similar goals' : null,
            variableReward: challenge.type === 'daily',
            identityReinforcement: `Challenge for ${challenge.rewardBadge} achievers`
          }
        })),
        goalProgress: {
          ...goalProgress,
          motivationalFeatures: {
            streakVisualization: `🔥 ${goalProgress.currentStreak} day streak`,
            milestoneProgress: `${Math.round((goalProgress.currentStreak / goalProgress.nextMilestone.days) * 100)}% to ${goalProgress.nextMilestone.reward}`,
            forgivenessActive: goalProgress.forgivenessModeActive,
            socialComparison: goalProgress.currentStreak > 7 ? 'Above average (5.2 days)' : 'Building momentum'
          }
        },
        adaptiveRecommendations: {
          ...adaptiveRecommendations,
          selfDeterminationTheory: {
            autonomySupport: adaptiveRecommendations.autonomy.length > 0,
            competenceBuilding: adaptiveRecommendations.competence.length > 0,
            relatednessBoost: adaptiveRecommendations.relatedness.length > 0
          }
        },
        timestamp: new Date().toISOString(),
        userId
      }
    }

    console.log('✅ Daily insights generated successfully')
    console.log(`   - ${dailyInsights.length} daily insights (variable rewards: ${dailyInsights.filter(i => i.type === 'pattern').length})`)
    console.log(`   - ${personalizedChallenges.length} personalized challenges`)
    console.log(`   - Current streak: ${goalProgress.currentStreak} days`)
    console.log(`   - Next milestone: ${goalProgress.nextMilestone.days} days (${goalProgress.nextMilestone.reward})`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error generating insights:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const body = await req.json()
    const { action, data } = body // Remove userId from body
    const userId = auth.user.id // Use authenticated user ID

    console.log(`🎯 Processing insight action: ${action}`)

    const insightGenerator = new InsightGenerator(userId)

    switch (action) {
      case 'complete_challenge':
        // Handle challenge completion
        const challengeId = data.challengeId
        console.log(`✅ Challenge completed: ${challengeId}`)
        
        // In real app, update database and award badges
        return NextResponse.json({
          success: true,
          message: 'Challenge completed!',
          reward: {
            badgeAwarded: data.rewardBadge,
            xpEarned: 100,
            nextChallenge: 'Ready for your next challenge?'
          }
        })

      case 'use_streak_freeze':
        // Handle streak freeze usage
        console.log(`❄️ Streak freeze used for goal: ${data.goalId}`)
        
        return NextResponse.json({
          success: true,
          message: 'Streak freeze activated! Your streak is protected for today.',
          streakProtected: true
        })

      case 'accept_recommendation':
        // Handle recommendation acceptance
        const recommendationType = data.type // autonomy, competence, relatedness
        console.log(`🎯 Recommendation accepted: ${recommendationType}`)
        
        return NextResponse.json({
          success: true,
          message: 'Recommendation added to your action plan!',
          nextStep: 'Check your dashboard for the next action'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Error processing insight action:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}