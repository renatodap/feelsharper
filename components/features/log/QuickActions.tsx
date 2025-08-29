'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Plus } from 'lucide-react'

interface QuickAction {
  id: string
  text: string
  type: string
  count: number
  icon?: string
  lastUsed?: string
  data?: Record<string, any>
}

interface QuickActionsProps {
  userId?: string
  onQuickLog: (action: QuickAction) => void
  maxItems?: number
}

const typeIcons: Record<string, string> = {
  nutrition: '🍽️',
  cardio: '🏃',
  strength: '💪',
  weight: '⚖️',
  sleep: '😴',
  water: '💧',
  mood: '😊',
  unknown: '📝'
}

const typeColors: Record<string, string> = {
  nutrition: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
  cardio: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
  strength: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
  weight: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
  sleep: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
  water: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
  mood: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
  unknown: 'bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20'
}

export function QuickActions({ userId, onQuickLog, maxItems = 10 }: QuickActionsProps) {
  const [actions, setActions] = useState<QuickAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchCommonLogs()
  }, [userId])

  const fetchCommonLogs = async () => {
    try {
      const response = await fetch('/api/common-logs')
      if (!response.ok) throw new Error('Failed to fetch common logs')
      const data = await response.json()
      
      // Add icons to actions
      const actionsWithIcons = data.map((action: QuickAction) => ({
        ...action,
        icon: typeIcons[action.type] || typeIcons.unknown
      }))
      
      setActions(actionsWithIcons)
    } catch (error) {
      console.error('Error fetching common logs:', error)
      
      // Fallback to localStorage if API fails
      const storedData = localStorage.getItem(`feelsharper_frequency_data${userId ? `_${userId}` : ''}`)
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          const localActions = Object.entries(parsed.activities || {})
            .filter(([_, count]) => (count as number) >= 2)
            .map(([text, count], index) => ({
              id: `local-${index}`,
              text,
              type: detectType(text),
              count: count as number,
              icon: typeIcons[detectType(text)]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, maxItems)
          
          setActions(localActions)
        } catch (e) {
          console.error('Error parsing local data:', e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const detectType = (text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('food') || lower.includes('ate') || lower.includes('meal')) return 'nutrition'
    if (lower.includes('run') || lower.includes('walk') || lower.includes('cardio')) return 'cardio'
    if (lower.includes('lift') || lower.includes('gym') || lower.includes('workout')) return 'strength'
    if (lower.includes('weight') || lower.includes('lbs') || lower.includes('kg')) return 'weight'
    if (lower.includes('sleep') || lower.includes('slept')) return 'sleep'
    if (lower.includes('water') || lower.includes('drank')) return 'water'
    if (lower.includes('mood') || lower.includes('feeling')) return 'mood'
    return 'unknown'
  }

  const displayedActions = showAll ? actions : actions.slice(0, 5)

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#4169E1]" />
          <h2 className="text-sm font-medium text-gray-400">Quick Actions</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="min-w-[120px] h-12 bg-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (actions.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#4169E1]" />
          <h2 className="text-sm font-medium text-gray-400">Quick Actions</h2>
        </div>
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            Your frequent activities will appear here after a few logs
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#4169E1]" />
          <h2 className="text-sm font-medium text-gray-400">Quick Actions</h2>
        </div>
        {actions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-[#4169E1] hover:text-[#4169E1]/80 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${actions.length})`}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {displayedActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickLog(action)}
            className={`
              group relative p-3 rounded-lg border transition-all
              ${typeColors[action.type]}
              flex flex-col items-center gap-1.5
            `}
          >
            {/* Usage Badge */}
            {action.count > 5 && (
              <div className="absolute -top-1 -right-1 bg-[#4169E1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {action.count}
              </div>
            )}
            
            {/* Icon */}
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            
            {/* Text */}
            <span className="text-xs font-medium line-clamp-2 text-center">
              {action.text}
            </span>
            
            {/* Trending Indicator */}
            {action.count > 10 && (
              <TrendingUp className="absolute top-1 left-1 w-3 h-3 text-[#4169E1]" />
            )}
          </button>
        ))}
        
        {/* Add Custom Action Button */}
        <button
          onClick={() => {
            // This could open a modal to create a custom quick action
            console.log('Add custom action')
          }}
          className="
            p-3 rounded-lg border transition-all
            bg-white/5 hover:bg-white/10 border-white/10
            flex flex-col items-center gap-1.5
            opacity-50 hover:opacity-100
          "
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-medium">Custom</span>
        </button>
      </div>
    </div>
  )
}