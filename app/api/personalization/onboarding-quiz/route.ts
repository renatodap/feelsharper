/**
 * API Route: Onboarding Quiz
 * Phase 9 - Personalization Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get onboarding quiz questions
    const quiz = personalizationEngine.getOnboardingQuiz()

    return NextResponse.json({
      success: true,
      data: quiz
    })

  } catch (error) {
    console.error('Onboarding quiz error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get onboarding quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { answers } = await request.json()

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid quiz answers format' },
        { status: 400 }
      )
    }

    // Process quiz answers and create initial personalization profile
    const profile = await personalizationEngine.processOnboardingQuiz(userId, answers)

    return NextResponse.json({
      success: true,
      data: {
        userType: profile.persona.type,
        confidence: profile.persona.confidence,
        dashboardConfig: profile.dashboardConfig,
        motivationalStyle: profile.motivationalStyle,
        message: 'Personalization profile created successfully!'
      }
    })

  } catch (error) {
    console.error('Process onboarding quiz error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process quiz answers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}