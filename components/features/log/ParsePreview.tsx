'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, AlertCircle, Calendar, ChevronDown } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import * as Popover from '@radix-ui/react-popover'

interface ParsedData {
  type: string
  fields: Record<string, any>
  confidence: number
  raw_text: string
  occurred_at?: string
}

interface ParsePreviewProps {
  data: ParsedData
  onConfirm: (data: ParsedData) => Promise<void>
  onCancel: () => void
  onTypeChange?: (newType: string) => void
}

const typeLabels: Record<string, string> = {
  nutrition: 'Food',
  cardio: 'Cardio',
  strength: 'Strength Training',
  weight: 'Weight',
  sleep: 'Sleep',
  water: 'Water',
  mood: 'Mood',
  unknown: 'Other'
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

export function ParsePreview({ data: initialData, onConfirm, onCancel, onTypeChange }: ParsePreviewProps) {
  const [data, setData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [occurredAt, setOccurredAt] = useState(() => {
    const date = data.occurred_at ? new Date(data.occurred_at) : new Date()
    return format(date, "yyyy-MM-dd'T'HH:mm")
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleTypeChange = (newType: string) => {
    setData({ ...data, type: newType })
    onTypeChange?.(newType)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm({
        ...data,
        occurred_at: occurredAt
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (confidence >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  const renderFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(item => 
          typeof item === 'object' ? item.name || JSON.stringify(item) : item
        ).join(', ')
      }
      return JSON.stringify(value, null, 2)
    }
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(2)
    }
    return value.toString()
  }

  const formatFieldName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#1A1A1B] rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Confirm Log Details</h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(data.confidence)}`}>
              {data.confidence}% Confident
            </span>
            {data.confidence < 80 && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please verify details</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Raw Text */}
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Original Text</p>
            <p className="font-medium">{data.raw_text}</p>
          </div>

          {/* Type Selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Activity Type</label>
            <Select.Root value={data.type} onValueChange={handleTypeChange}>
              <Select.Trigger className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeIcons[data.type]}</span>
                  <span>{typeLabels[data.type] || data.type}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-[#1A1A1B] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                  <Select.Viewport className="p-2">
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <Select.Item
                        key={value}
                        value={value}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors outline-none"
                      >
                        <span className="text-xl">{typeIcons[value]}</span>
                        <Select.ItemText>{label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Date/Time Picker */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">When did this happen?</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="w-full px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Extracted Fields */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Extracted Information</p>
            <div className="space-y-2">
              {Object.entries(data.fields).map(([key, value]) => {
                // Skip internal or redundant fields
                if (key === 'raw' || key === 'occurred_at') return null
                
                return (
                  <div key={key} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-gray-400">{formatFieldName(key)}</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">
                      {renderFieldValue(key, value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirm & Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}