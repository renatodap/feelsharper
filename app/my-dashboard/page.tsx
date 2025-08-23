'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Minus, MoreVertical } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface MetricWidget {
  id: string
  title: string
  value: string | number
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  chartData?: number[]
  category: string
  priority: number
}

interface DashboardConfig {
  primaryMetrics: MetricWidget[]
  hiddenMetrics: MetricWidget[]
  layout: 'grid' | 'list' | 'cards'
}

export default function MyDashboardPage() {
  const { user } = useAuth()
  const [showSidebar, setShowSidebar] = useState(false)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    primaryMetrics: [],
    hiddenMetrics: [],
    layout: 'grid'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardConfig()
  }, [user])

  const fetchDashboardConfig = async () => {
    try {
      // In production, this would fetch from API based on user preferences
      // For now, we'll use demo data based on user type
      const demoConfig = getDemoConfig()
      setDashboardConfig(demoConfig)
    } catch (error) {
      console.error('Error fetching dashboard config:', error)
      setDashboardConfig(getDemoConfig())
    } finally {
      setLoading(false)
    }
  }

  const getDemoConfig = (): DashboardConfig => {
    // This would be determined by AI based on user type and behavior
    // For demo, showing a strength training focused dashboard
    return {
      layout: 'grid',
      primaryMetrics: [
        {
          id: '1',
          title: 'Weekly Volume',
          value: '42,500',
          unit: 'lbs',
          change: 12,
          trend: 'up',
          chartData: [35000, 38000, 40000, 39000, 41000, 42000, 42500],
          category: 'strength',
          priority: 1
        },
        {
          id: '2',
          title: 'Protein Today',
          value: 142,
          unit: 'g',
          change: -5,
          trend: 'down',
          chartData: [150, 145, 160, 155, 148, 142],
          category: 'nutrition',
          priority: 1
        },
        {
          id: '3',
          title: 'Workout Streak',
          value: 7,
          unit: 'days',
          change: 0,
          trend: 'neutral',
          chartData: [1, 2, 3, 4, 5, 6, 7],
          category: 'consistency',
          priority: 1
        },
        {
          id: '4',
          title: 'Body Weight',
          value: 175.2,
          unit: 'lbs',
          change: -0.8,
          trend: 'down',
          chartData: [176.5, 176.2, 175.8, 175.5, 175.3, 175.2],
          category: 'body',
          priority: 2
        },
        {
          id: '5',
          title: 'Sleep Average',
          value: 7.2,
          unit: 'hrs',
          change: 0.3,
          trend: 'up',
          chartData: [6.5, 7.0, 6.8, 7.5, 7.8, 7.2],
          category: 'recovery',
          priority: 2
        }
      ],
      hiddenMetrics: [
        {
          id: '6',
          title: 'Calories Burned',
          value: 2450,
          unit: 'kcal',
          change: 5,
          trend: 'up',
          category: 'energy',
          priority: 3
        },
        {
          id: '7',
          title: 'Water Intake',
          value: 2.8,
          unit: 'L',
          change: -10,
          trend: 'down',
          category: 'hydration',
          priority: 3
        },
        {
          id: '8',
          title: 'Bench Press PR',
          value: 225,
          unit: 'lbs',
          change: 0,
          trend: 'neutral',
          category: 'strength',
          priority: 3
        },
        {
          id: '9',
          title: 'Recovery Score',
          value: 82,
          unit: '%',
          change: 8,
          trend: 'up',
          category: 'recovery',
          priority: 3
        }
      ]
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral', category?: string) => {
    if (trend === 'neutral') return 'text-gray-400'
    
    // For weight/body metrics, down might be good
    if (category === 'body' && trend === 'down') return 'text-green-400'
    
    // Standard coloring
    return trend === 'up' ? 'text-green-400' : 'text-red-400'
  }

  const renderMiniChart = (data?: number[]) => {
    if (!data || data.length === 0) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    return (
      <div className="flex items-end gap-1 h-12 mt-3">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100
          return (
            <div
              key={index}
              className="flex-1 bg-[#4169E1]/30 rounded-t"
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>
    )
  }

  const moveMetricToPrimary = (metric: MetricWidget) => {
    setDashboardConfig(prev => ({
      ...prev,
      primaryMetrics: [...prev.primaryMetrics, metric],
      hiddenMetrics: prev.hiddenMetrics.filter(m => m.id !== metric.id)
    }))
  }

  const moveMetricToHidden = (metric: MetricWidget) => {
    setDashboardConfig(prev => ({
      ...prev,
      primaryMetrics: prev.primaryMetrics.filter(m => m.id !== metric.id),
      hiddenMetrics: [...prev.hiddenMetrics, metric]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-gray-400">Customizing your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white relative">
      {/* Main Content */}
      <div className={`transition-all duration-300 ${showSidebar ? 'mr-80' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
              <p className="text-gray-400">
                AI-selected metrics based on your goals
              </p>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {showSidebar ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Primary Metrics Grid */}
          <div className={`grid gap-4 ${
            dashboardConfig.layout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {dashboardConfig.primaryMetrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-[#1A1A1B] rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-gray-400 font-medium">{metric.title}</h3>
                  <button
                    onClick={() => moveMetricToHidden(metric)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-sm text-gray-400">{metric.unit}</span>
                  )}
                </div>

                {metric.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-2 ${getTrendColor(metric.trend, metric.category)}`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm">
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}

                {metric.chartData && renderMiniChart(metric.chartData)}
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[#4169E1]/10 to-purple-500/10 rounded-xl border border-[#4169E1]/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#4169E1]/20 rounded-lg">
                <svg className="w-5 h-5 text-[#4169E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Insight</h3>
                <p className="text-sm text-gray-300">
                  Your workout volume increased 12% this week while maintaining form quality. 
                  Your body is adapting well to the progressive overload. Consider a deload week 
                  if you feel any unusual fatigue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-80 bg-[#1A1A1B] border-l border-white/10
        transform transition-transform duration-300 overflow-y-auto
        ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">More Metrics</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {dashboardConfig.hiddenMetrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => moveMetricToPrimary(metric)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{metric.title}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold">{metric.value}</span>
                      {metric.unit && (
                        <span className="text-xs text-gray-400">{metric.unit}</span>
                      )}
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              Tap any metric to add it to your main dashboard. The AI will learn your preferences over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}