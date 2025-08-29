'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Mic, MicOff, RefreshCw, Utensils, Weight, Activity, Moon, Heart, Ruler } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ParsePreview } from '@/components/features/log/ParsePreview'
import { QuickActions } from '@/components/features/log/QuickActions'
import { LogHistory } from '@/components/features/log/LogHistory'

interface ParsedResult {
  type: string
  fields: Record<string, any>
  confidence: number
  message?: string
  raw_text?: string
  timestamp?: string
}

export default function QuickLogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const recognitionRef = useRef<any>(null)
  

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
        setError('Speech recognition failed. Please try again.')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setError('')
    }
  }

  const handleSubmit = async (text?: string, skipPreview?: boolean) => {
    const logText = text || input
    if (!logText.trim()) return

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: logText,
          userId: user?.id  // Pass user ID for proper association
        })
      })

      if (!response.ok) {
        throw new Error('Failed to parse input')
      }

      const result = await response.json()
      
      // Show parse preview for confirmation
      setParsedResult({
        ...result,
        raw_text: logText
      })
      setShowPreview(true)
    } catch (err) {
      console.error('Error parsing input:', err)
      setError('Failed to parse activity. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmLog = async (data: ParsedResult) => {
    try {
      // Save the log to the database
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: data.type,
          raw_text: data.raw_text,
          data: data.fields,
          confidence: data.confidence / 100,
          timestamp: data.timestamp || new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save log')
      }

      // Update frequency data for quick actions
      const frequencyKey = user?.id ? `feelsharper_frequency_data_${user.id}` : 'feelsharper_frequency_data'
      const frequencyData = localStorage.getItem(frequencyKey)
      let frequency = { activities: {}, lastUpdated: new Date().toISOString(), totalLogs: 0 }
      
      if (frequencyData) {
        try {
          frequency = JSON.parse(frequencyData)
        } catch (e) {}
      }
      
      // Increment frequency for this activity
      const activityText = data.raw_text || ''
      frequency.activities[activityText] = (frequency.activities[activityText] || 0) + 1
      frequency.lastUpdated = new Date().toISOString()
      frequency.totalLogs++
      
      localStorage.setItem(frequencyKey, JSON.stringify(frequency))

      // Clear input and close preview
      setInput('')
      setShowPreview(false)
      setParsedResult(null)
      
      // Refresh the history and quick actions
      setRefreshKey(prev => prev + 1)
      
      // Show success message briefly
      setParsedResult({
        type: data.type,
        fields: {},
        confidence: 100,
        message: 'Logged successfully!'
      })
      
      setTimeout(() => {
        setParsedResult(null)
      }, 2000)
    } catch (err) {
      console.error('Error saving log:', err)
      setError('Failed to save activity. Please try again.')
    }
  }

  const handleQuickLog = async (action: any) => {
    // Pre-fill and show preview with the quick action
    setInput(action.text)
    await handleSubmit(action.text)
  }

  const handleEditLog = (log: any) => {
    // Pre-fill the input with the log's text for editing
    setInput(log.raw_text)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReportBadParse = async (log: any) => {
    // Could send feedback to improve the parser
    console.log('Reporting bad parse for:', log)
    // In a real implementation, this would send feedback to your backend
  }

  const manualLogOptions = [
    { icon: Utensils, label: 'Food', route: '/log/food', color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20' },
    { icon: Weight, label: 'Weight', route: '/log/weight', color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
    { icon: Activity, label: 'Exercise', route: '/log/exercise', color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' },
    { icon: Moon, label: 'Sleep', route: '/log/sleep', color: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20' },
    { icon: Heart, label: 'Mood', route: '/log/mood', color: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
    { icon: Ruler, label: 'Measurements', route: '/log/measurements', color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20' }
  ]

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

        {/* Quick Actions */}
        <QuickActions
          key={refreshKey}
          userId={user?.id}
          onQuickLog={handleQuickLog}
        />

        {/* Chat Input Box */}
        <div className="bg-[#1A1A1B] rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder='Try "ran 5k this morning" or "had chicken and rice for lunch"'
              className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4169E1] transition-all"
              disabled={isProcessing}
            />
            <button
              onClick={toggleVoiceInput}
              className={`p-3 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Status Messages */}
          {isListening && (
            <p className="mt-3 text-sm text-blue-400 animate-pulse">
              Listening... Speak now
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {parsedResult && parsedResult.message && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">
                  {parsedResult.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Logging Options */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Or log manually:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {manualLogOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.label}
                  onClick={() => router.push(option.route)}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${option.color}
                    flex flex-col items-center gap-2
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Log History */}
        <LogHistory
          key={refreshKey}
          userId={user?.id}
          limit={30}
          onEdit={handleEditLog}
          onReportBadParse={handleReportBadParse}
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

      {/* Parse Preview Modal */}
      {showPreview && parsedResult && (
        <ParsePreview
          data={parsedResult}
          onConfirm={handleConfirmLog}
          onCancel={() => {
            setShowPreview(false)
            setParsedResult(null)
          }}
          onTypeChange={(newType) => {
            setParsedResult(prev => prev ? { ...prev, type: newType } : null)
          }}
        />
      )}
    </div>
  )
}