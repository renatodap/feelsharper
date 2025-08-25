/**
 * usePersonalization Hook - Phase 9
 * React hook for personalization engine integration
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  PersonalizationProfile, 
  AdaptiveIntervention, 
  UserPersonaType,
  PersonaDashboardConfig 
} from '@/lib/ai-coach/types'

interface PersonalizationState {
  profile: PersonalizationProfile | null
  isLoading: boolean
  error: string | null
  dashboardConfig: PersonaDashboardConfig | null
  currentIntervention: AdaptiveIntervention | null
}

interface OnboardingQuizData {
  questions: Array<{
    id: string
    question: string
    options: Array<{
      value: string
      label: string
      personaWeight: Partial<Record<UserPersonaType, number>>
    }>
  }>
}

interface GraduatedSuggestions {
  suggestions: string[]
  difficulty: 'tiny' | 'moderate' | 'ambitious'
  timeCommitment: string
  motivationalMessage: string
}

export function usePersonalization() {
  const [state, setState] = useState<PersonalizationState>({
    profile: null,
    isLoading: false,
    error: null,
    dashboardConfig: null,
    currentIntervention: null
  })

  const [onboardingQuiz, setOnboardingQuiz] = useState<OnboardingQuizData | null>(null)

  // Load initial personalization profile
  const loadProfile = useCallback(async (forceRefresh: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const method = forceRefresh ? 'POST' : 'GET'
      const body = forceRefresh ? JSON.stringify({ forceRefresh: true }) : undefined
      
      const response = await fetch('/api/personalization/detect-user-type', {
        method,
        headers: forceRefresh ? { 'Content-Type': 'application/json' } : {},
        body
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load personalization profile')
      }
      
      setState(prev => ({
        ...prev,
        profile: {
          userId: '', // Will be populated
          persona: {
            type: result.data.userType,
            confidence: result.data.confidence,
            indicators: result.data.indicators,
            detectedAt: '',
            lastUpdated: result.data.lastUpdated
          },
          dashboardConfig: result.data.dashboardConfig,
          motivationalStyle: result.data.motivationalStyle,
          habitFormationProfile: {
            difficultyPreference: 'tiny',
            consistencyPattern: 'streaks',
            recoveryStyle: 'forgiveness'
          },
          adaptiveInterventions: [],
          lastPersonalizationUpdate: result.data.lastUpdated
        },
        dashboardConfig: result.data.dashboardConfig,
        isLoading: false
      }))
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }))
    }
  }, [])

  // Load onboarding quiz
  const loadOnboardingQuiz = useCallback(async () => {
    try {
      const response = await fetch('/api/personalization/onboarding-quiz')
      
      if (!response.ok) {
        throw new Error('Failed to load onboarding quiz')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setOnboardingQuiz(result.data)
      
    } catch (error) {
      console.error('Failed to load onboarding quiz:', error)
    }
  }, [])

  // Submit onboarding quiz
  const submitOnboardingQuiz = useCallback(async (answers: Record<string, string>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch('/api/personalization/onboarding-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Reload profile with new data
      await loadProfile()
      
      return result.data
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit quiz',
        isLoading: false
      }))
      throw error
    }
  }, [loadProfile])

  // Get current adaptive intervention
  const getCurrentIntervention = useCallback(async (contextOverride?: any) => {
    try {
      const queryParams = contextOverride 
        ? `?context=${encodeURIComponent(JSON.stringify(contextOverride))}`
        : ''
        
      const response = await fetch(`/api/personalization/adaptive-intervention${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to get intervention')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setState(prev => ({
        ...prev,
        currentIntervention: result.data
      }))
      
      return result.data
      
    } catch (error) {
      console.error('Failed to get intervention:', error)
      return null
    }
  }, [])

  // Record intervention outcome
  const recordInterventionOutcome = useCallback(async (
    interventionId: string,
    outcome: {
      engaged: boolean
      actionTaken: boolean
      successConditionsMet: string[]
      timeToAction?: number
      userFeedback?: 'positive' | 'neutral' | 'negative'
    }
  ) => {
    try {
      const response = await fetch('/api/personalization/adaptive-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interventionId, outcome })
      })
      
      if (!response.ok) {
        throw new Error('Failed to record outcome')
      }
      
      const result = await response.json()
      return result.success
      
    } catch (error) {
      console.error('Failed to record intervention outcome:', error)
      return false
    }
  }, [])

  // Get graduated suggestions
  const getGraduatedSuggestions = useCallback(async (
    level: 'beginner' | 'developing' | 'established' = 'beginner',
    successRate: number = 0.7
  ): Promise<GraduatedSuggestions | null> => {
    try {
      const response = await fetch(
        `/api/personalization/graduated-suggestions?level=${level}&successRate=${successRate}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return {
        suggestions: result.data.suggestions,
        difficulty: result.data.difficulty,
        timeCommitment: result.data.timeCommitment,
        motivationalMessage: result.data.motivationalMessage
      }
      
    } catch (error) {
      console.error('Failed to get graduated suggestions:', error)
      return null
    }
  }, [])

  // Update dashboard configuration based on user interactions
  const updateDashboardConfig = useCallback(async (
    userInteractions: {
      expandedWidgets: string[]
      hiddenWidgets: string[]
      timeSpentPerWidget: Record<string, number>
      mostUsedActions: string[]
    },
    newActivities: any[] = []
  ) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch('/api/personalization/dashboard-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInteractions, newActivities })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update dashboard config')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setState(prev => ({
        ...prev,
        dashboardConfig: result.data.dashboardConfig,
        isLoading: false
      }))
      
      return result.data
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update dashboard',
        isLoading: false
      }))
      return null
    }
  }, [])

  // Initialize personalization on mount
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    // State
    profile: state.profile,
    dashboardConfig: state.dashboardConfig,
    currentIntervention: state.currentIntervention,
    isLoading: state.isLoading,
    error: state.error,
    onboardingQuiz,
    
    // Actions
    loadProfile,
    refreshProfile: () => loadProfile(true),
    loadOnboardingQuiz,
    submitOnboardingQuiz,
    getCurrentIntervention,
    recordInterventionOutcome,
    getGraduatedSuggestions,
    updateDashboardConfig,
    
    // Computed properties
    userType: state.profile?.persona.type,
    confidence: state.profile?.persona.confidence,
    isPersonalized: state.profile && state.profile.persona.confidence > 70,
    needsOnboarding: !state.profile || state.profile.persona.confidence < 60
  }
}