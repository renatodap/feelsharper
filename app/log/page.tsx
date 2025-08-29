'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Mic, MicOff, RefreshCw, Utensils, Weight, Activity, Moon, Heart, Ruler } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { CommonLogsBar } from '@/components/features/logging'
import type { QuickLog } from '@/components/features/logging'

interface ParsedResult {
  intent: string
  entities: any
  confidence: number
  message?: string
}

interface RecentLog {
  id: string
  text: string
  timestamp: string
  type: string
}

export default function QuickLogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null)
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([])
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)
  
  // Generate quick logs from recent activity
  const [quickLogs, setQuickLogs] = useState<QuickLog[]>([])
  
  // Convert recent logs to quick logs format
  useEffect(() => {
    // Count frequency of similar logs
    const frequencyMap = new Map<string, QuickLog>()
    
    // Get stored frequency data
    const storedFrequency = localStorage.getItem('feelsharper_frequency_data')
    if (storedFrequency) {
      try {
        const data = JSON.parse(storedFrequency)
        // Convert to QuickLog format
        const logs: QuickLog[] = Object.entries(data.activities || {})
          .filter(([_, freq]) => (freq as number) >= 3)
          .map(([activity, freq], index) => ({
            id: `ql-${index}`,
            activity,
            type: detectActivityType(activity),
            frequency: freq as number,
            lastLogged: null,
            isPinned: false,
            isHidden: false,
            icon: getActivityIcon(activity),
            data: {
              raw_text: activity,
              parsed_data: {},
              confidence: 90,
            },
          }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 10)
        
        setQuickLogs(logs)
      } catch (error) {
        console.error('Error loading frequency data:', error)
      }
    }
  }, [recentLogs])
  
  // Helper to detect activity type from text
  const detectActivityType = (text: string): QuickLog['type'] => {
    const lower = text.toLowerCase()
    if (lower.includes('food') || lower.includes('ate') || lower.includes('coffee') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('dinner')) return 'food'
    if (lower.includes('run') || lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) return 'exercise'
    if (lower.includes('weight') || lower.includes('lbs') || lower.includes('kg')) return 'weight'
    if (lower.includes('sleep') || lower.includes('slept')) return 'sleep'
    if (lower.includes('mood') || lower.includes('feeling')) return 'mood'
    return 'other'
  }
  
  const getActivityIcon = (text: string): string => {
    const type = detectActivityType(text)
    const iconMap = {
      food: 'coffee',
      exercise: 'running',
      weight: 'scale',
      sleep: 'moon',
      mood: 'heart',
      other: 'dots',
    }
    return iconMap[type]
  }

  useEffect(() => {
    // Load recent logs from localStorage
    const logs = localStorage.getItem('recentLogs')
    if (logs) {
      setRecentLogs(JSON.parse(logs).slice(0, 5))
    }

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

  const handleSubmit = async (text?: string) => {
    const logText = text || input
    if (!logText.trim()) return

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: logText })
      })

      if (!response.ok) {
        throw new Error('Failed to parse input')
      }

      const result = await response.json()
      setParsedResult(result)

      // Save to recent logs
      const newLog: RecentLog = {
        id: Date.now().toString(),
        text: logText,
        timestamp: new Date().toISOString(),
        type: result.intent || 'unknown'
      }

      const updatedLogs = [newLog, ...recentLogs].slice(0, 5)
      setRecentLogs(updatedLogs)
      localStorage.setItem('recentLogs', JSON.stringify(updatedLogs))
      
      // Update frequency data for CommonLogsBar
      const frequencyData = localStorage.getItem('feelsharper_frequency_data')
      let frequency = { activities: {}, lastUpdated: new Date().toISOString(), totalLogs: 0 }
      
      if (frequencyData) {
        try {
          frequency = JSON.parse(frequencyData)
        } catch (e) {}
      }
      
      // Increment frequency for this activity
      frequency.activities[logText] = (frequency.activities[logText] || 0) + 1
      frequency.lastUpdated = new Date().toISOString()
      frequency.totalLogs++
      
      localStorage.setItem('feelsharper_frequency_data', JSON.stringify(frequency))

      // Clear input after successful submission
      setInput('')

      // Show success message
      setTimeout(() => {
        setParsedResult({
          ...result,
          message: 'Logged successfully!'
        })
      }, 1000)
    } catch (err) {
      console.error('Error parsing input:', err)
      setError('Failed to log activity. Please try again.')
    } finally {
      setIsProcessing(false)
    }
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

        {/* Common Logs Bar */}
        {quickLogs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Your Common Logs</h2>
            <CommonLogsBar
              quickLogs={quickLogs}
              onQuickLog={async (log) => {
                // Handle quick log
                await handleSubmit(log.data.raw_text)
              }}
              userId={user?.id}
            />
          </div>
        )}

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

          {parsedResult && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {parsedResult.message || `Detected: ${parsedResult.intent}`}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  parsedResult.confidence > 80 
                    ? 'bg-green-500/20 text-green-400' 
                    : parsedResult.confidence > 60 
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {Math.round(parsedResult.confidence)}% confident
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

        {/* Recent Logs */}
        {recentLogs.length > 0 && (
          <div className="bg-[#1A1A1B] rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm">{log.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSubmit(log.text)}
                    className="px-3 py-1 text-xs bg-[#4169E1]/20 hover:bg-[#4169E1]/30 text-[#4169E1] rounded-lg transition-colors"
                  >
                    Re-log
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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