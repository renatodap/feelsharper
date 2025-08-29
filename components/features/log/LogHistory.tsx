'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { MoreVertical, Edit2, Trash2, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import * as Dialog from '@radix-ui/react-dialog'

interface LogEntry {
  id: string
  type: string
  raw_text: string
  data: Record<string, any>
  confidence: number
  timestamp: string
  created_at: string
  metadata?: Record<string, any>
}

interface LogHistoryProps {
  userId?: string
  limit?: number
  onEdit?: (log: LogEntry) => void
  onDelete?: (logId: string) => Promise<void>
  onReportBadParse?: (log: LogEntry) => void
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

export function LogHistory({ userId, limit = 30, onEdit, onDelete, onReportBadParse }: LogHistoryProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [userId, limit])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (logId: string) => {
    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(logId)
      } else {
        const response = await fetch(`/api/logs?id=${logId}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete log')
      }
      
      // Remove from local state
      setLogs(logs.filter(log => log.id !== logId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting log:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatLogSummary = (log: LogEntry): string => {
    const { type, data } = log
    
    switch (type) {
      case 'nutrition':
        if (data.foods && Array.isArray(data.foods)) {
          return data.foods.map((f: any) => f.name).join(', ')
        }
        return data.meal || log.raw_text
      
      case 'cardio':
      case 'strength':
        return data.exercise || data.activity || log.raw_text
      
      case 'weight':
        return `${data.weight} ${data.unit || 'lbs'}`
      
      case 'sleep':
        return `${data.hours || data.duration} hours`
      
      case 'water':
        return `${data.amount} ${data.unit || 'oz'}`
      
      case 'mood':
        return data.mood || data.notes || log.raw_text
      
      default:
        return log.raw_text
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="bg-[#1A1A1B] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-white/30 border-t-[#4169E1] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-[#1A1A1B] rounded-xl border border-white/10 p-6">
        <div className="text-center py-8">
          <p className="text-gray-400">No activity logs yet</p>
          <p className="text-sm text-gray-500 mt-2">Start logging to see your history here</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[#1A1A1B] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-gray-400 mt-1">Your last {limit} logged activities</p>
        </div>
        
        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => {
                setSelectedLog(log)
                setShowDetails(true)
              }}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className="text-2xl mt-1">
                  {typeIcons[log.type] || typeIcons.unknown}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {formatLogSummary(log)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.timestamp || log.created_at), { addSuffix: true })}
                        </span>
                        {log.confidence < 0.8 && (
                          <span className={`text-xs ${getConfidenceColor(log.confidence)}`}>
                            {Math.round(log.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="bg-[#1A1A1B] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50"
                          sideOffset={5}
                        >
                          <div className="p-1">
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(log)
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(log.id)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm">Delete</span>
                            </button>
                            
                            {log.confidence < 0.8 && onReportBadParse && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onReportBadParse(log)
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left text-yellow-400"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Report Bad Parse</span>
                              </button>
                            )}
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                </div>
                
                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog.Root open={showDetails} onOpenChange={setShowDetails}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1A1A1B] rounded-2xl border border-white/10 p-6 z-50">
            {selectedLog && (
              <>
                <Dialog.Title className="text-xl font-bold mb-4">Log Details</Dialog.Title>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Raw Text */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Original Text</p>
                    <p className="font-medium">{selectedLog.raw_text}</p>
                  </div>
                  
                  {/* Type and Confidence */}
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      {typeIcons[selectedLog.type]} {selectedLog.type}
                    </span>
                    <span className={`text-sm ${getConfidenceColor(selectedLog.confidence)}`}>
                      {Math.round(selectedLog.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Logged At</p>
                    <p className="font-medium">
                      {format(new Date(selectedLog.timestamp || selectedLog.created_at), 'PPpp')}
                    </p>
                  </div>
                  
                  {/* Data Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Extracted Data</p>
                    {Object.entries(selectedLog.data).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-400">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="text-sm font-medium text-right max-w-[60%]">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Dialog.Close asChild>
                    <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors">
                      Close
                    </button>
                  </Dialog.Close>
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(selectedLog)
                        setShowDetails(false)
                      }}
                      className="flex-1 px-4 py-3 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1A1A1B] rounded-2xl border border-white/10 p-6 z-50">
            <Dialog.Title className="text-xl font-bold mb-2">Delete Log?</Dialog.Title>
            <Dialog.Description className="text-gray-400 mb-6">
              This action cannot be undone. The log will be permanently deleted from your history.
            </Dialog.Description>
            
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}