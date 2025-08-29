/**
 * API Route: Dashboard Configuration
 * Phase 9 - Personalization Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserOr401 } from '@/lib/auth/getUserOr401'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'
import { dashboardTemplateManager } from '@/lib/ai-coach/dashboard-templates'

export async function GET(request: NextRequest) {
  const auth = await getUserOr401(request);
  if (!auth.user) return auth.res;
  
  try {
    const userId = auth.user.id

    // Get current personalization profile and dashboard config
    const profile = await personalizationEngine.personalizeUserExperience(userId, false)
    
    // Get all available widgets for this persona
    const availableWidgets = dashboardTemplateManager.getAllWidgets(profile.persona.type)
    
    // Get widget configurations
    const widgetConfigs = availableWidgets.reduce((acc, widgetId) => {
      const config = dashboardTemplateManager.getWidgetConfig(profile.persona.type, widgetId)
      if (config) {
        acc[widgetId] = config
      }
      return acc
    }, {} as any)

    return NextResponse.json({
      success: true,
      data: {
        dashboardConfig: profile.dashboardConfig,
        availableWidgets,
        widgetConfigs,
        userType: profile.persona.type
      }
    })

  } catch (error) {
    console.error('Get dashboard config error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get dashboard configuration',
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
    const userId = auth.user.id
    const { userInteractions, newActivities } = await request.json()

    if (!userInteractions) {
      return NextResponse.json(
        { success: false, error: 'Missing userInteractions data' },
        { status: 400 }
      )
    }

    // Update personalization based on user behavior
    const updatedProfile = await personalizationEngine.updatePersonalizationFromBehavior(
      userId,
      newActivities || [],
      {
        expandedWidgets: userInteractions.expandedWidgets || [],
        hiddenWidgets: userInteractions.hiddenWidgets || [],
        timeSpentPerWidget: userInteractions.timeSpentPerWidget || {},
        mostUsedActions: userInteractions.mostUsedActions || []
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        dashboardConfig: updatedProfile.dashboardConfig,
        userType: updatedProfile.persona.type,
        confidence: updatedProfile.persona.confidence,
        message: 'Dashboard configuration updated based on your usage patterns'
      }
    })

  } catch (error) {
    console.error('Update dashboard config error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update dashboard configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}