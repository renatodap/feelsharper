import { useState, useEffect, useCallback } from 'react';

// Types for the coaching system
export interface CoachingContext {
  currentStreaks: Array<{
    type: string;
    count: number;
    label: string;
  }>;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
}

export interface CoachingResponse {
  message: string;
  recommendations: Array<{
    title: string;
    description: string;
    actionable: boolean;
  }>;
  motivational_quote?: string;
}

export interface SmartCoachActions {
  getCoaching: (prompt: string) => Promise<CoachingResponse | null>;
  getQuickAdvice: (topic: 'plateau' | 'recovery' | 'nutrition' | 'motivation' | 'progress') => Promise<void>;
  refresh: () => Promise<void>;
}

export interface SmartCoachData {
  context: CoachingContext | null;
  coaching: CoachingResponse | null;
  isLoading: boolean;
  error: Error | null;
  canUseCoaching: boolean;
  remainingUses: number | null;
  actions: SmartCoachActions;
  insights: Array<{
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  streaks: Array<{
    type: string;
    count: number;
    label: string;
  }>;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionable: boolean;
  }>;
  sendMessage: (message: string) => Promise<void>;
}

export interface UseSmartCoachOptions {
  userId: string;
  autoLoad?: boolean;
}

export function useSmartCoach({ userId, autoLoad = false }: UseSmartCoachOptions): SmartCoachData {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [context, setContext] = useState<CoachingContext | null>(null);
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [canUseCoaching, setCanUseCoaching] = useState(true);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  
  // Load initial context if autoLoad is enabled
  useEffect(() => {
    if (autoLoad && userId) {
      loadContext();
    }
  }, [autoLoad, userId]);
  
  const loadContext = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coach/context?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContext(data.context);
        setCanUseCoaching(data.canUse);
        setRemainingUses(data.remainingUses);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCoaching = useCallback(async (prompt: string): Promise<CoachingResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, userId })
      });
      
      if (!response.ok) throw new Error('Failed to get coaching');
      
      const data = await response.json();
      setCoaching(data);
      if (data.remainingUses !== undefined) {
        setRemainingUses(data.remainingUses);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  const getQuickAdvice = useCallback(async (topic: 'plateau' | 'recovery' | 'nutrition' | 'motivation' | 'progress') => {
    const prompts = {
      plateau: "I feel like I'm not making progress. What should I change?",
      recovery: "How can I optimize my recovery?",
      nutrition: "What nutrition adjustments would help my goals?",
      motivation: "I need motivation to keep going.",
      progress: "Analyze my recent progress and give me insights."
    };
    
    await getCoaching(prompts[topic]);
  }, [getCoaching]);
  
  const refresh = useCallback(async () => {
    await loadContext();
  }, [userId]);
  
  const sendMessage = async (message: string) => {
    await getCoaching(message);
  };
  
  const actions: SmartCoachActions = {
    getCoaching,
    getQuickAdvice,
    refresh
  };
  
  return {
    context,
    coaching,
    isLoading,
    error,
    canUseCoaching,
    remainingUses,
    actions,
    insights: [],
    streaks: context?.currentStreaks || [],
    patterns: context?.patterns || [],
    recommendations: coaching?.recommendations || [],
    sendMessage
  };
}

// Progress tracking hook
export interface ProgressTrackingData {
  overallScore: number;
  scoreColor: string;
  progressEmoji: string;
}

export function useProgressTracking(userId: string): ProgressTrackingData {
  const [overallScore, setOverallScore] = useState(75);
  const [scoreColor, setScoreColor] = useState('text-green-500');
  const [progressEmoji, setProgressEmoji] = useState('💪');
  
  useEffect(() => {
    // Load progress data
    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/progress?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setOverallScore(data.score || 75);
          
          // Set color based on score
          if (data.score >= 80) {
            setScoreColor('text-green-500');
            setProgressEmoji('🔥');
          } else if (data.score >= 60) {
            setScoreColor('text-yellow-500');
            setProgressEmoji('💪');
          } else {
            setScoreColor('text-red-500');
            setProgressEmoji('📈');
          }
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    };
    
    if (userId) {
      loadProgress();
    }
  }, [userId]);
  
  return {
    overallScore,
    scoreColor,
    progressEmoji
  };
}