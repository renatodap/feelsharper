/**
 * Test API Route: Personalization Engine
 * Phase 9 - Comprehensive testing of personalization features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'
import { userTypeDetector } from '@/lib/ai-coach/user-type-detector'
import { dashboardTemplateManager } from '@/lib/ai-coach/dashboard-templates'
import { adaptiveBehavioralEngine } from '@/lib/ai-coach/adaptive-interventions'
import { UserPersonaType } from '@/lib/ai-coach/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test') || 'all'

    const results: any = {
      timestamp: new Date().toISOString(),
      userId,
      tests: {}
    }

    // Test 1: Onboarding Quiz
    if (testType === 'all' || testType === 'quiz') {
      try {
        const quiz = userTypeDetector.getOnboardingQuiz()
        results.tests.onboardingQuiz = {
          success: true,
          questionsCount: quiz.questions.length,
          sampleQuestion: quiz.questions[0]?.question,
          allPersonasRepresented: quiz.questions.every(q => 
            q.options.some(opt => 
              Object.keys(opt.personaWeight).length > 0
            )
          )
        }
      } catch (error) {
        results.tests.onboardingQuiz = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 2: User Type Detection
    if (testType === 'all' || testType === 'detection') {
      try {
        // Test with sample data
        const sampleActivities = [
          {
            activity_type: 'cardio',
            duration_minutes: 45,
            created_at: new Date().toISOString(),
            date: new Date().toDateString()
          },
          {
            activity_type: 'strength',
            duration_minutes: 60,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
          }
        ]
        
        const sampleLogs = [
          'ran 5k this morning feeling great',
          'deadlifted 315 for new pr today',
          'practiced tennis serves for 30 minutes'
        ]
        
        const detectedPersona = await userTypeDetector.analyzeUserType(
          sampleActivities,
          { goal_type: 'endurance' },
          sampleLogs
        )
        
        results.tests.userTypeDetection = {
          success: true,
          detectedType: detectedPersona.type,
          confidence: detectedPersona.confidence,
          indicators: detectedPersona.indicators,
          hasVocabularyMatches: detectedPersona.indicators.vocabulary.length > 0,
          hasActivityPatterns: detectedPersona.indicators.activityPatterns.length > 0
        }
      } catch (error) {
        results.tests.userTypeDetection = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 3: Dashboard Templates
    if (testType === 'all' || testType === 'dashboard') {
      try {
        const personaTypes = Object.values(UserPersonaType)
        const templateTests = personaTypes.map(persona => {
          const template = dashboardTemplateManager.getTemplate(persona)
          const widgetCount = template.config.primaryWidgets.length + template.config.secondaryWidgets.length
          
          return {
            persona,
            primaryWidgets: template.config.primaryWidgets.length,
            secondaryWidgets: template.config.secondaryWidgets.length,
            totalWidgets: widgetCount,
            layout: template.config.layout,
            hasWidgetConfigs: Object.keys(template.widgets).length > 0
          }
        })
        
        results.tests.dashboardTemplates = {
          success: true,
          allPersonasCovered: templateTests.length === 5,
          templates: templateTests,
          avgWidgetsPerPersona: Math.round(
            templateTests.reduce((sum, t) => sum + t.totalWidgets, 0) / templateTests.length
          )
        }
      } catch (error) {
        results.tests.dashboardTemplates = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 4: Adaptive Interventions
    if (testType === 'all' || testType === 'interventions') {
      try {
        const mockContext = {
          timeOfDay: '08:30',
          dayOfWeek: 'monday',
          recentActivity: ['cardio', 'strength'],
          environmentalFactors: {
            location: 'home',
            weather: 'sunny',
            calendar: ['workout session']
          },
          lastInteraction: new Date().toISOString()
        }
        
        const mockProfile = {
          userId,
          persona: {
            type: UserPersonaType.ENDURANCE,
            confidence: 85,
            indicators: {
              vocabulary: ['running', 'cardio'],
              activityPatterns: ['endurance training'],
              goalTypes: ['marathon'],
              frequencyPatterns: ['morning_person']
            },
            detectedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          dashboardConfig: dashboardTemplateManager.getTemplate(UserPersonaType.ENDURANCE).config,
          motivationalStyle: {
            preference: 'data-driven' as const,
            rewardType: 'immediate' as const,
            feedbackStyle: 'gentle' as const
          },
          habitFormationProfile: {
            difficultyPreference: 'moderate' as const,
            consistencyPattern: 'streaks' as const,
            recoveryStyle: 'forgiveness' as const
          },
          adaptiveInterventions: [],
          lastPersonalizationUpdate: new Date().toISOString()
        }
        
        const intervention = await adaptiveBehavioralEngine.selectOptimalIntervention(
          mockContext,
          [], // empty activities for test
          mockProfile,
          {}
        )
        
        results.tests.adaptiveInterventions = {
          success: true,
          interventionGenerated: intervention !== null,
          intervention: intervention ? {
            type: intervention.type,
            hasContent: !!intervention.content,
            hasMessage: !!intervention.message,
            hasActionPrompt: !!intervention.actionPrompt,
            intensity: intervention.intensity,
            personalizedFor: intervention.personalizedFor
          } : null
        }
      } catch (error) {
        results.tests.adaptiveInterventions = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 5: Graduated Suggestions
    if (testType === 'all' || testType === 'graduated') {
      try {
        const suggestions = adaptiveBehavioralEngine.getGraduatedIntervention(
          UserPersonaType.PROFESSIONAL,
          'beginner',
          0.7
        )
        
        results.tests.graduatedSuggestions = {
          success: true,
          difficulty: suggestions.difficulty,
          suggestionsCount: suggestions.suggestions.length,
          timeCommitment: suggestions.timeCommitment,
          hasSuggestions: suggestions.suggestions.length > 0
        }
      } catch (error) {
        results.tests.graduatedSuggestions = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 6: End-to-End Personalization (if user has data)
    if (testType === 'all' || testType === 'e2e') {
      try {
        const profile = await personalizationEngine.personalizeUserExperience(userId, false)
        
        results.tests.endToEndPersonalization = {
          success: true,
          hasProfile: !!profile,
          userType: profile.persona.type,
          confidence: profile.persona.confidence,
          dashboardConfigured: !!profile.dashboardConfig,
          motivationalStyleSet: !!profile.motivationalStyle,
          isPersonalized: profile.persona.confidence > 70
        }
      } catch (error) {
        results.tests.endToEndPersonalization = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Calculate overall success
    const testResults = Object.values(results.tests)
    const successfulTests = testResults.filter((test: any) => test.success).length
    const totalTests = testResults.length
    
    results.summary = {
      testsRun: totalTests,
      testsSuccessful: successfulTests,
      testsFaileed: totalTests - successfulTests,
      overallSuccess: successfulTests === totalTests,
      successRate: Math.round((successfulTests / totalTests) * 100)
    }

    return NextResponse.json({
      success: results.summary.overallSuccess,
      data: results,
      message: `Personalization Engine Test Results: ${successfulTests}/${totalTests} tests passed`
    })

  } catch (error) {
    console.error('Personalization test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Personalization test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}