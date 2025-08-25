/**
 * API Route: Detect User Type
 * Phase 9 - Personalization Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { forceRefresh = false } = await request.json()

    // Run personalization analysis
    const profile = await personalizationEngine.personalizeUserExperience(userId, forceRefresh)

    return NextResponse.json({
      success: true,
      data: {
        userType: profile.persona.type,
        confidence: profile.persona.confidence,
        indicators: profile.persona.indicators,
        dashboardConfig: profile.dashboardConfig,
        motivationalStyle: profile.motivationalStyle,
        lastUpdated: profile.lastPersonalizationUpdate
      }
    })

  } catch (error) {
    console.error('User type detection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to detect user type',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current personalization profile
    const profile = await personalizationEngine.personalizeUserExperience(userId, false)

    return NextResponse.json({
      success: true,
      data: {
        userType: profile.persona.type,
        confidence: profile.persona.confidence,
        dashboardConfig: profile.dashboardConfig,
        lastUpdated: profile.lastPersonalizationUpdate
      }
    })

  } catch (error) {
    console.error('Get user type error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user type',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}