/**
 * API Route: Graduated Suggestions
 * Phase 9 - Personalization Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserOr401 } from '@/lib/auth/getUserOr401'
import { personalizationEngine } from '@/lib/ai-coach/personalization-engine'

export async function GET(request: NextRequest) {
  const auth = await getUserOr401(request);
  if (!auth.user) return auth.res;
  
  try {
    const userId = auth.user.id
    const { searchParams } = new URL(request.url)
    const currentLevel = (searchParams.get('level') as 'beginner' | 'developing' | 'established') || 'beginner'
    const successRateStr = searchParams.get('successRate')
    const successRate = successRateStr ? parseFloat(successRateStr) : 0.7

    // Get user's persona first
    const profile = await personalizationEngine.personalizeUserExperience(userId, false)
    
    // Get graduated suggestions based on user's current level and success rate
    const suggestions = personalizationEngine.getGraduatedSuggestions(
      profile.persona.type,
      currentLevel,
      successRate
    )

    return NextResponse.json({
      success: true,
      data: {
        userType: profile.persona.type,
        currentLevel,
        successRate,
        suggestions: suggestions.suggestions,
        difficulty: suggestions.difficulty,
        timeCommitment: suggestions.timeCommitment,
        motivationalMessage: getMotivationalMessage(
          profile.persona.type,
          suggestions.difficulty,
          successRate
        )
      }
    })

  } catch (error) {
    console.error('Get graduated suggestions error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get graduated suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getMotivationalMessage(userType: string, difficulty: string, successRate: number): string {
  const messages = {
    tiny: [
      "🌱 Every expert was once a beginner. These tiny steps build unshakeable habits.",
      "⚡ Small actions, massive results. You're laying the foundation for greatness.",
      "💫 The journey of 1000 miles begins with a single step. This is yours."
    ],
    moderate: [
      "🚀 You're building momentum! Consistency at this level creates lasting change.",
      "💪 Perfect! You've proven you can start - now you're learning you can sustain.",
      "🎯 This is where habits become part of who you are. Keep pushing forward!"
    ],
    ambitious: [
      "🏆 Champion level commitment! This consistency separates good from extraordinary.",
      "🔥 You've mastered the fundamentals. Time to unlock your full potential.",
      "⚡ Elite dedication! You're operating at the level that creates breakthroughs."
    ]
  }

  const levelMessages = messages[difficulty as keyof typeof messages] || messages.tiny
  return levelMessages[Math.floor(Math.random() * levelMessages.length)]
}