/**
 * Adaptive Intervention Component - Phase 9
 * Displays context-aware behavioral interventions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePersonalization } from '@/hooks/usePersonalization'
import { AdaptiveIntervention as InterventionType } from '@/lib/ai-coach/types'

interface AdaptiveInterventionProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

export function AdaptiveIntervention({ 
  className = '', 
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: AdaptiveInterventionProps) {
  const { 
    currentIntervention, 
    getCurrentIntervention, 
    recordInterventionOutcome,
    userType 
  } = usePersonalization()

  const [isVisible, setIsVisible] = useState(false)
  const [userFeedback, setUserFeedback] = useState<'positive' | 'neutral' | 'negative' | null>(null)
  const [actionStartTime, setActionStartTime] = useState<number | null>(null)
  const [hasEngaged, setHasEngaged] = useState(false)
  const [actionTaken, setActionTaken] = useState(false)

  // Auto-refresh interventions
  useEffect(() => {
    if (!autoRefresh) return

    const fetchIntervention = async () => {
      const intervention = await getCurrentIntervention()
      if (intervention && !isVisible) {
        setIsVisible(true)
        setHasEngaged(false)
        setActionTaken(false)
        setUserFeedback(null)
        setActionStartTime(null)
      }
    }

    // Initial fetch
    fetchIntervention()

    // Set up interval
    const interval = setInterval(fetchIntervention, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, getCurrentIntervention, isVisible])

  // Track engagement
  useEffect(() => {
    if (currentIntervention && isVisible && !hasEngaged) {
      setHasEngaged(true)
    }
  }, [currentIntervention, isVisible, hasEngaged])

  if (!currentIntervention || !isVisible) {
    return null
  }

  const handleActionClick = () => {
    setActionStartTime(Date.now())
    setActionTaken(true)
    
    // Record positive engagement
    if (currentIntervention) {
      recordInterventionOutcome(currentIntervention.id, {
        engaged: true,
        actionTaken: true,
        successConditionsMet: ['action_button_clicked'],
        timeToAction: actionStartTime ? Date.now() - actionStartTime : undefined,
        userFeedback: 'positive'
      })
    }
  }

  const handleFeedback = (feedback: 'positive' | 'neutral' | 'negative') => {
    setUserFeedback(feedback)
    
    if (currentIntervention) {
      recordInterventionOutcome(currentIntervention.id, {
        engaged: hasEngaged,
        actionTaken: actionTaken,
        successConditionsMet: feedback === 'positive' ? ['positive_feedback'] : [],
        timeToAction: actionStartTime ? Date.now() - actionStartTime : undefined,
        userFeedback: feedback
      })
    }

    // Hide after feedback
    setTimeout(() => {
      setIsVisible(false)
    }, 1000)
  }

  const handleDismiss = () => {
    if (currentIntervention) {
      recordInterventionOutcome(currentIntervention.id, {
        engaged: hasEngaged,
        actionTaken: false,
        successConditionsMet: [],
        userFeedback: 'neutral'
      })
    }
    
    setIsVisible(false)
  }

  const getInterventionIcon = (type: InterventionType['type']) => {
    switch (type) {
      case 'motivation': return '⚡'
      case 'reminder': return '⏰'
      case 'suggestion': return '💡'
      case 'celebration': return '🎉'
      default: return '🎯'
    }
  }

  const getIntensityStyles = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      case 'medium':
        return 'border-orange-200 bg-orange-50 text-orange-800'
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800'
      default:
        return 'border-feel-border bg-feel-bg-secondary text-feel-text-primary'
    }
  }

  return (
    <Card className={`${className} ${getIntensityStyles(currentIntervention.intensity)} border-2 relative`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>

      <div className="p-6 pr-10">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="text-2xl">
            {getInterventionIcon(currentIntervention.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg capitalize">
                {currentIntervention.type}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-feel-primary/10 text-feel-primary font-medium">
                {userType}
              </span>
            </div>
            <p className="text-sm opacity-70">
              Personalized for your {currentIntervention.trigger?.type || 'daily'} routine
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-base leading-relaxed mb-4">
            {currentIntervention.message || currentIntervention.content.title}
          </p>

          {(currentIntervention.actionPrompt || currentIntervention.content.actionText) && (
            <div className="bg-white/50 rounded-lg p-4 border border-white/20">
              <p className="text-sm font-medium mb-2">Suggested action:</p>
              <p className="text-sm">{currentIntervention.actionPrompt || currentIntervention.content.actionText}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!userFeedback && (
          <div className="flex flex-col space-y-3">
            {(currentIntervention.actionPrompt || currentIntervention.content.actionText) && (
              <Button
                onClick={handleActionClick}
                variant="primary"
                className="w-full"
              >
                {actionTaken ? '✅ Action Started!' : '🚀 Take Action'}
              </Button>
            )}

            {/* Feedback buttons */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleFeedback('positive')}
                className="text-sm px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                title="This was helpful"
              >
                👍 Helpful
              </button>
              <button
                onClick={() => handleFeedback('neutral')}
                className="text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Not relevant right now"
              >
                😐 Not now
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                className="text-sm px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="This wasn't useful"
              >
                👎 Not useful
              </button>
            </div>
          </div>
        )}

        {/* Feedback confirmation */}
        {userFeedback && (
          <div className="text-center p-4 bg-white/30 rounded-lg">
            <p className="text-sm font-medium mb-2">
              {userFeedback === 'positive' && '🙏 Thanks for the feedback!'}
              {userFeedback === 'neutral' && "👍 No problem, we'll try again later."}
              {userFeedback === 'negative' && "📝 Got it, we'll improve our suggestions."}
            </p>
            <p className="text-xs opacity-70">
              {userFeedback === 'positive' && 'Your personalization is getting smarter!'}
              {userFeedback === 'neutral' && "We'll suggest this at a better time."}
              {userFeedback === 'negative' && "We'll adjust our recommendations for you."}
            </p>
          </div>
        )}

        {/* Effectiveness indicator */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-60">
            <span>Success rate: {Math.round(currentIntervention.effectiveness * 100)}%</span>
            <span>Used {currentIntervention.currentUses} times</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AdaptiveIntervention