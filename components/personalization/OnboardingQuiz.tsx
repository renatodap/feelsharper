/**
 * Onboarding Quiz Component - Phase 9
 * 2-3 question quiz for quick user type detection
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePersonalization } from '@/hooks/usePersonalization'
import { UserPersonaType } from '@/lib/ai-coach/types'

interface QuizQuestion {
  id: string
  question: string
  options: Array<{
    value: string
    label: string
    personaWeight: Partial<Record<UserPersonaType, number>>
  }>
}

interface OnboardingQuizProps {
  onComplete: (result: {
    userType: UserPersonaType
    confidence: number
    dashboardConfig: any
    motivationalStyle: any
  }) => void
  onSkip?: () => void
}

export function OnboardingQuiz({ onComplete, onSkip }: OnboardingQuizProps) {
  const { 
    onboardingQuiz, 
    loadOnboardingQuiz, 
    submitOnboardingQuiz, 
    isLoading,
    error 
  } = usePersonalization()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string>('')

  useEffect(() => {
    loadOnboardingQuiz()
  }, [loadOnboardingQuiz])

  const questions = onboardingQuiz?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = selectedOption !== ''

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value)
  }

  const handleNext = () => {
    if (!currentQuestion || !selectedOption) return

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOption
    }
    setAnswers(newAnswers)

    if (isLastQuestion) {
      handleSubmit(newAnswers)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption('')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      // Restore previous answer
      const previousQuestion = questions[currentQuestionIndex - 1]
      setSelectedOption(answers[previousQuestion.id] || '')
    }
  }

  const handleSubmit = async (finalAnswers: Record<string, string>) => {
    try {
      const result = await submitOnboardingQuiz(finalAnswers)
      onComplete(result)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }

  if (isLoading && !onboardingQuiz) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-feel-primary mx-auto mb-4" />
        <p className="text-feel-text-secondary">Loading personalization quiz...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center">
        <div className="text-red-500 mb-4">⚠️ Error loading quiz</div>
        <p className="text-feel-text-secondary mb-4">{error}</p>
        <Button onClick={() => loadOnboardingQuiz()}>
          Retry
        </Button>
      </Card>
    )
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center">
        <p className="text-feel-text-secondary">No quiz questions available.</p>
      </Card>
    )
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-feel-text-primary mb-2">
          🎯 Personalize Your Experience
        </h2>
        <p className="text-feel-text-secondary">
          Help us customize FeelSharper to match your fitness style
        </p>
        
        {/* Progress bar */}
        <div className="mt-6 bg-feel-bg-secondary rounded-full h-2">
          <div 
            className="bg-feel-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-feel-text-secondary mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-feel-text-primary mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedOption === option.value
                  ? 'border-feel-primary bg-feel-primary/10 text-feel-primary'
                  : 'border-feel-border hover:border-feel-primary/50 text-feel-text-primary hover:bg-feel-bg-secondary'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                  selectedOption === option.value
                    ? 'border-feel-primary bg-feel-primary'
                    : 'border-feel-border'
                }`}>
                  {selectedOption === option.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          {currentQuestionIndex > 0 && (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isLoading}
            >
              ← Previous
            </Button>
          )}
          
          {onSkip && currentQuestionIndex === 0 && (
            <Button 
              variant="outline" 
              onClick={onSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          variant="primary"
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-b-2 border-white" />
              <span>Processing...</span>
            </div>
          ) : isLastQuestion ? (
            '🚀 Complete Setup'
          ) : (
            'Next →'
          )}
        </Button>
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-feel-bg-secondary rounded-lg">
        <p className="text-sm text-feel-text-secondary">
          <strong>Why we ask:</strong> By understanding your fitness style, we can show you the most 
          relevant metrics, suggest activities you'll enjoy, and provide coaching that matches your goals.
        </p>
      </div>
    </Card>
  )
}

export default OnboardingQuiz