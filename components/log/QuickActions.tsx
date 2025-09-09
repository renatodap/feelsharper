'use client'

import { Utensils, Weight, Activity, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QuickAction {
  label: 'Food' | 'Exercise' | 'Weight' | 'Mood'
  icon: React.ElementType
  text: string
  color: string
}

const actions: QuickAction[] = [
  { label: 'Food', icon: Utensils, text: 'ate ', color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400' },
  { label: 'Exercise', icon: Activity, text: 'did ', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' },
  { label: 'Weight', icon: Weight, text: 'weighed ', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' },
  { label: 'Mood', icon: Heart, text: 'felt ', color: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400' },
]

interface QuickActionsProps {
  onAction: (text: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-white">Start with an action:</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => onAction(action.text)}
              className={`
                p-4 rounded-xl border border-white/10 transition-all
                ${action.color}
                flex flex-col items-center justify-center gap-2 aspect-square
              `}
            >
              <Icon className="w-8 h-8" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
