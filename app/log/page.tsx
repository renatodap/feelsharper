'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Utensils, Weight, Activity, Heart } from 'lucide-react'
import UnifiedNaturalInput, { UnifiedNaturalInputRef } from '@/components/UnifiedNaturalInput'
import { QuickActions } from '@/components/log/QuickActions'

export default function QuickLogPage() {
  const router = useRouter()
  const [quickAction, setQuickAction] = useState<{ text: string, timestamp: number }>()
  const unifiedInputRef = useRef<UnifiedNaturalInputRef>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleQuickAction = (text: string) => {
    setQuickAction({ text, timestamp: Date.now() });
    setTimeout(() => {
      unifiedInputRef.current?.focusInput();
    }, 100);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quick Log</h1>
          <p className="text-gray-400">
            Tell me what you did - I'll handle the rest
          </p>
        </div>

        <div className="mb-6">
          <QuickActions onAction={handleQuickAction} />
        </div>

        <UnifiedNaturalInput
          ref={unifiedInputRef}
          quickAction={quickAction}
          onActivityLogged={() => {
            // Refresh history or other components if needed
            setRefreshKey(prev => prev + 1)
          }}
        />

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">Pro Tips:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Just type naturally: "ran 5 miles" or "bench pressed 185 lbs"</li>
            <li>• Include details: "felt great during my run" or "struggled with the last set"</li>
            <li>• Voice input works great in the gym - just tap the mic!</li>
            <li>• The AI learns your patterns over time for better suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}