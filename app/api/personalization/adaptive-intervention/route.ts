/**
 * API Route: Adaptive Interventions
 * Phase 9 - Personalization Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserOr401 } from '@/lib/auth/getUserOr401'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'
import { adaptiveBehavioralEngine } from '@/lib/ai-coach/adaptive-interventions'

export async function GET(request: NextRequest) {
  const auth = await getUserOr401(request);
  if (!auth.user) return auth.res;
  
  try {
    const userId = auth.user.id
    const { searchParams } = new URL(request.url)
    const contextOverride = searchParams.get('context')

    // Get optimal intervention for current context
    let context = undefined
    if (contextOverride) {
      try {
        context = JSON.parse(contextOverride)
      } catch (e) {
        // Invalid context, use default
      }
    }

    const intervention = await personalizationEngine.getOptimalIntervention(userId, context)

    if (!intervention) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No intervention recommended at this time'
      })
    }

    return NextResponse.json({
      success: true,
      data: intervention
    })

  } catch (error) {
    console.error('Get adaptive intervention error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get intervention',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await getUserOr401(request);
  if (!auth.user) return auth.res;
  
  try {
    const { interventionId, outcome } = await request.json()

    if (!interventionId || !outcome) {
      return NextResponse.json(
        { success: false, error: 'Missing interventionId or outcome' },
        { status: 400 }
      )
    }

    // Record intervention outcome for learning
    adaptiveBehavioralEngine.recordInterventionOutcome(interventionId, outcome)

    return NextResponse.json({
      success: true,
      message: 'Intervention outcome recorded successfully'
    })

  } catch (error) {
    console.error('Record intervention outcome error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record outcome',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}