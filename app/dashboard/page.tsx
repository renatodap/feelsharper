'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, TrendingUp, Target, Brain, Activity } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface InsightCard {
  id: string
  title: string
  summary: string
  detail?: string
  action?: {
    label: string
    route: string
  }
  priority: 1 | 2 | 3
  category: 'nutrition' | 'fitness' | 'recovery' | 'trend'
  icon: React.ReactNode
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchInsights()
    } else {
      // Show demo insights for non-authenticated users
      setInsights(getDemoInsights())
      setLoading(false)
    }
  }, [user])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights')
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || getDemoInsights())
      } else {
        setInsights(getDemoInsights())
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      setInsights(getDemoInsights())
    } finally {
      setLoading(false)
    }
  }

  const getDemoInsights = (): InsightCard[] => [
    {
      id: '1',
      title: 'Great workout streak!',
      summary: "You've worked out 3 days in a row. Keep the momentum going!",
      detail: 'Consistency is key to building lasting fitness habits. Your current streak is your longest this month. One more day and you\'ll hit a new personal record!',
      action: {
        label: 'Log Today\'s Workout',
        route: '/log'
      },
      priority: 1,
      category: 'fitness',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Protein intake below target',
      summary: 'You\'re averaging 20g below your daily protein goal.',
      detail: 'Based on your workout intensity and goals, you should aim for 150g of protein daily. Consider adding a protein shake or Greek yogurt to hit your target.',
      action: {
        label: 'Log Food',
        route: '/log'
      },
      priority: 2,
      category: 'nutrition',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Recovery insight',
      summary: 'Your sleep quality impacts your performance. Aim for 7-8 hours.',
      detail: 'We\'ve noticed your best workouts happen after nights with 7+ hours of sleep. Last night you got 6 hours. Consider an earlier bedtime tonight for better tomorrow\'s performance.',
      priority: 3,
      category: 'recovery',
      icon: <Brain className="w-5 h-5" />
    }
  ]

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const getCategoryColor = (category: InsightCard['category']) => {
    switch (category) {
      case 'fitness':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'nutrition':
        return 'border-green-500/20 bg-green-500/5'
      case 'recovery':
        return 'border-purple-500/20 bg-purple-500/5'
      case 'trend':
        return 'border-yellow-500/20 bg-yellow-500/5'
      default:
        return 'border-gray-500/20 bg-gray-500/5'
    }
  }

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          Important
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-[#4169E1] animate-pulse" />
          <p className="text-gray-400">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {user?.email ? `Welcome back!` : 'Your Insights'}
          </h1>
          <p className="text-gray-400">
            Here's what's important for you today
          </p>
        </div>

        {/* Insights Cards */}
        <div className="space-y-4">
          {insights.map((insight) => {
            const isExpanded = expandedCards.has(insight.id)
            
            return (
              <div
                key={insight.id}
                className={`
                  border rounded-xl p-6 transition-all duration-300
                  ${getCategoryColor(insight.category)}
                  hover:border-opacity-40
                `}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{insight.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <p className="text-gray-300">{insight.summary}</p>
                    </div>
                  </div>
                  
                  {insight.detail && (
                    <button
                      onClick={() => toggleCard(insight.id)}
                      className="ml-4 p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Detail */}
                {isExpanded && insight.detail && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-300 leading-relaxed">
                      {insight.detail}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {insight.action && (
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(insight.action!.route)}
                      className="
                        px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90
                        rounded-lg font-medium transition-colors
                        inline-flex items-center gap-2
                      "
                    >
                      {insight.action.label}
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-[#1A1A1B] rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/log')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-center"
            >
              <Activity className="w-5 h-5 mx-auto mb-1 text-[#4169E1]" />
              <span className="text-sm">Log Activity</span>
            </button>
            <button
              onClick={() => router.push('/my-dashboard')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-center"
            >
              <svg className="w-5 h-5 mx-auto mb-1 text-[#4169E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm">View Stats</span>
            </button>
            <button
              onClick={() => router.push('/coach')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-center"
            >
              <Brain className="w-5 h-5 mx-auto mb-1 text-[#4169E1]" />
              <span className="text-sm">Ask Coach</span>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-center"
            >
              <svg className="w-5 h-5 mx-auto mb-1 text-[#4169E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
