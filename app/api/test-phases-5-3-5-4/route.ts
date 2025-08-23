/**
 * Comprehensive Test for Phases 5.3 & 5.4
 * Validates Insight Generation & Sport-Specific Habits
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 TESTING PHASES 5.3 & 5.4 - Insight Generation & Sport-Specific Habits')
    
    const baseUrl = req.nextUrl.origin
    const results: any = {
      phase5_3: {},
      phase5_4: {},
      integration: {},
      timestamp: new Date().toISOString()
    }

    // Test Phase 5.3: Insight Generation with Motivational Design
    console.log('🧠 Testing Phase 5.3: Insight Generation...')
    
    try {
      const insightResponse = await fetch(`${baseUrl}/api/insights?userId=test-user-123`)
      const insightData = await insightResponse.json()
      
      results.phase5_3 = {
        status: insightResponse.ok ? 'SUCCESS' : 'FAILED',
        dailyInsights: insightData.data?.dailyInsights?.length || 0,
        challenges: insightData.data?.personalizedChallenges?.length || 0,
        goalProgress: insightData.data?.goalProgress?.currentStreak || 0,
        adaptiveRecommendations: {
          autonomy: insightData.data?.adaptiveRecommendations?.autonomy?.length || 0,
          competence: insightData.data?.adaptiveRecommendations?.competence?.length || 0,
          relatedness: insightData.data?.adaptiveRecommendations?.relatedness?.length || 0
        },
        variableRewards: insightData.data?.dailyInsights?.filter((i: any) => i.isVariableReward)?.length || 0,
        gamificationElements: insightData.data?.dailyInsights?.filter((i: any) => i.gamificationElement)?.length || 0,
        response: insightData.success ? 'All motivational design elements working' : insightData.error
      }
      
      console.log(`✅ Phase 5.3 Results:`)
      console.log(`   - Daily insights generated: ${results.phase5_3.dailyInsights}`)
      console.log(`   - Challenges created: ${results.phase5_3.challenges}`)
      console.log(`   - Variable rewards: ${results.phase5_3.variableRewards}`)
      console.log(`   - Gamification elements: ${results.phase5_3.gamificationElements}`)
      
    } catch (error) {
      results.phase5_3 = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(`❌ Phase 5.3 Error: ${results.phase5_3.error}`)
    }

    // Test Phase 5.4: Sport-Specific Habits (Tennis Example)
    console.log('🎾 Testing Phase 5.4: Sport-Specific Habits...')
    
    try {
      const sportResponse = await fetch(`${baseUrl}/api/sport-habits?sport=tennis&experience=intermediate&schedule=competitive`)
      const sportData = await sportResponse.json()
      
      results.phase5_4 = {
        status: sportResponse.ok ? 'SUCCESS' : 'FAILED',
        sport: sportData.data?.sport || 'unknown',
        totalHabits: Object.values(sportData.data?.habitCategories || {}).flat().length,
        categories: Object.keys(sportData.data?.habitCategories || {}),
        personalizedRecommendations: sportData.data?.personalizedRecommendations?.length || 0,
        implementationWeeks: Object.keys(sportData.data?.implementationStrategy || {}),
        identityBasedHabits: Object.values(sportData.data?.habitCategories || {})
          .flat()
          .filter((h: any) => h.identityStatement)
          .length,
        behaviorModelComplete: Object.values(sportData.data?.habitCategories || {})
          .flat()
          .filter((h: any) => h.behaviorModel?.cue && h.behaviorModel?.routine && h.behaviorModel?.reward)
          .length,
        response: sportData.success ? 'All sport-specific elements working' : sportData.error
      }
      
      console.log(`✅ Phase 5.4 Results:`)
      console.log(`   - Sport: ${results.phase5_4.sport}`)
      console.log(`   - Total habits available: ${results.phase5_4.totalHabits}`)
      console.log(`   - Categories: ${results.phase5_4.categories.join(', ')}`)
      console.log(`   - Personalized recommendations: ${results.phase5_4.personalizedRecommendations}`)
      console.log(`   - Identity-based habits: ${results.phase5_4.identityBasedHabits}`)
      console.log(`   - Complete behavior models: ${results.phase5_4.behaviorModelComplete}`)
      
    } catch (error) {
      results.phase5_4 = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(`❌ Phase 5.4 Error: ${results.phase5_4.error}`)
    }

    // Test Integration: Sport-specific insights
    console.log('🔗 Testing Integration: Sport-specific insights...')
    
    try {
      // Test habit completion tracking
      const habitTrackingResponse = await fetch(`${baseUrl}/api/sport-habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_habit_completion',
          habitId: 'tennis-pre-match-nutrition-1',
          userId: 'test-user-123',
          data: {
            completed: true,
            difficulty: 'easy',
            notes: 'Had banana 45min before match'
          }
        })
      })
      
      const habitTrackingData = await habitTrackingResponse.json()
      
      // Test challenge completion
      const challengeResponse = await fetch(`${baseUrl}/api/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_challenge',
          userId: 'test-user-123',
          data: {
            challengeId: 'daily-123',
            rewardBadge: 'Daily Mover'
          }
        })
      })
      
      const challengeData = await challengeResponse.json()
      
      results.integration = {
        habitTracking: {
          status: habitTrackingResponse.ok ? 'SUCCESS' : 'FAILED',
          habitStrength: habitTrackingData.habitStrength?.strength || 0,
          encouragement: habitTrackingData.habitStrength?.encouragement || 'No encouragement',
        },
        challengeCompletion: {
          status: challengeResponse.ok ? 'SUCCESS' : 'FAILED',
          badgeAwarded: challengeData.reward?.badgeAwarded || 'None',
          xpEarned: challengeData.reward?.xpEarned || 0
        },
        crossSystemWorking: habitTrackingResponse.ok && challengeResponse.ok
      }
      
      console.log(`✅ Integration Results:`)
      console.log(`   - Habit tracking: ${results.integration.habitTracking.status}`)
      console.log(`   - Challenge completion: ${results.integration.challengeCompletion.status}`)
      console.log(`   - Cross-system integration: ${results.integration.crossSystemWorking ? 'WORKING' : 'NEEDS WORK'}`)
      
    } catch (error) {
      results.integration = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(`❌ Integration Error: ${results.integration.error}`)
    }

    // Overall assessment
    const phase5_3Success = results.phase5_3.status === 'SUCCESS'
    const phase5_4Success = results.phase5_4.status === 'SUCCESS'
    const integrationSuccess = results.integration.crossSystemWorking === true

    const overallStatus = phase5_3Success && phase5_4Success && integrationSuccess ? 'ALL SYSTEMS GO' : 'NEEDS ATTENTION'
    
    console.log('\n📊 PHASE 5.3 & 5.4 ASSESSMENT:')
    console.log(`   Phase 5.3 (Insights): ${phase5_3Success ? '✅ COMPLETE' : '❌ INCOMPLETE'}`)
    console.log(`   Phase 5.4 (Sport Habits): ${phase5_4Success ? '✅ COMPLETE' : '❌ INCOMPLETE'}`)
    console.log(`   Integration: ${integrationSuccess ? '✅ WORKING' : '❌ NEEDS WORK'}`)
    console.log(`   Overall Status: ${overallStatus}`)

    // Recommendations for next steps
    const nextSteps = []
    
    if (!phase5_3Success) {
      nextSteps.push('Fix insight generation system issues')
    }
    if (!phase5_4Success) {
      nextSteps.push('Fix sport-specific habit system issues')
    }
    if (!integrationSuccess) {
      nextSteps.push('Fix cross-system integration')
    }
    if (phase5_3Success && phase5_4Success && integrationSuccess) {
      nextSteps.push('Ready to move to Phase 6: 5-Page App Structure')
      nextSteps.push('Consider testing with real user data')
      nextSteps.push('Implement UI components for insights and habits')
    }

    return NextResponse.json({
      success: true,
      overallStatus,
      phases: {
        '5.3': {
          name: 'Insight Generation with Motivational Design',
          status: phase5_3Success ? 'COMPLETE' : 'INCOMPLETE',
          ...results.phase5_3
        },
        '5.4': {
          name: 'Sport-Specific Habit Formation',
          status: phase5_4Success ? 'COMPLETE' : 'INCOMPLETE',
          ...results.phase5_4
        }
      },
      integration: results.integration,
      nextSteps,
      behavioralDesignFeatures: {
        variableRewardSchedules: results.phase5_3.variableRewards > 0,
        gamificationElements: results.phase5_3.gamificationElements > 0,
        identityBasedHabits: results.phase5_4.identityBasedHabits > 0,
        behaviorModelFramework: results.phase5_4.behaviorModelComplete > 0,
        selfDeterminationTheory: results.phase5_3.adaptiveRecommendations?.autonomy > 0,
        socialAccountability: results.phase5_4.categories?.includes('socialAccountability') || false
      },
      readinessForPhase6: overallStatus === 'ALL SYSTEMS GO',
      timestamp: results.timestamp
    })

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Comprehensive test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}