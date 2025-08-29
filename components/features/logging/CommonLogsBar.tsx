'use client';

/**
 * CommonLogsBar Component
 * TDD Step 5: Feature Implementation
 * 
 * Provides one-tap quick logging for frequently used activities.
 * NO MOCKS IN PRODUCTION CODE as per TDD requirements.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Coffee, 
  Dumbbell, 
  Scale, 
  Moon, 
  Heart, 
  MoreHorizontal,
  Pin,
  X,
  Check
} from 'lucide-react';
import type { 
  CommonLogsBarProps, 
  QuickLog, 
  QuickLogButtonProps,
  STORAGE_KEYS,
  QUICK_LOG_CONSTANTS 
} from './types';

// Icon mapping for activity types
const ACTIVITY_ICONS = {
  food: Coffee,
  exercise: Dumbbell,
  weight: Scale,
  sleep: Moon,
  mood: Heart,
  other: MoreHorizontal,
} as const;

// Storage keys
const STORAGE = {
  QUICK_LOGS: 'feelsharper_quick_logs',
  PREFERENCES: 'feelsharper_quick_log_preferences',
  FREQUENCY_DATA: 'feelsharper_frequency_data',
};

// Constants
const CONSTANTS = {
  MIN_FREQUENCY: 3,
  MAX_DISPLAY: 10,
  MIN_DISPLAY: 5,
  LONG_PRESS_DURATION: 500,
  SYNC_INTERVAL: 30000,
  CACHE_DURATION: 3600000,
};

/**
 * Individual Quick Log Button Component
 */
const QuickLogButton: React.FC<QuickLogButtonProps> = ({
  log,
  onClick,
  onLongPress,
  onDelete,
  loading = false,
  disabled = false,
  showLastLogged = false,
  showFrequency = false,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const Icon = ACTIVITY_ICONS[log.type] || ACTIVITY_ICONS.other;

  const handleMouseDown = () => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(log);
      }
    }, CONSTANTS.LONG_PRESS_DURATION);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = () => {
    if (!loading && !disabled) {
      onClick(log);
    }
  };

  const formatLastLogged = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <button
      className={`
        quick-log-button relative group
        bg-gray-900/50 backdrop-blur-xl 
        border border-blue-500/20 hover:border-blue-500/40
        transition-all duration-200
        p-3 min-w-[80px] min-h-[80px]
        flex flex-col items-center justify-center gap-1
        ${isPressed ? 'scale-95 brightness-110' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${log.isPinned ? 'pinned border-blue-500/40' : ''}
        ${className}
      `}
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' 
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        // Context menu for pin/delete
      }}
      disabled={disabled || loading}
      aria-label={`Quick log: ${log.activity}`}
      aria-busy={loading}
      role="button"
      data-testid={`quick-log-${log.id}`}
    >
      {/* Pin indicator */}
      {log.isPinned && (
        <Pin className="absolute top-1 right-1 w-3 h-3 text-blue-400" />
      )}

      {/* Icon */}
      <Icon 
        className="w-6 h-6 text-blue-400"
        data-testid={`icon-${log.icon}`}
      />

      {/* Label */}
      <span className="text-xs text-gray-300 text-center line-clamp-2">
        {log.activity}
      </span>

      {/* Last logged time */}
      {showLastLogged && log.lastLogged && (
        <span className="text-xs text-gray-500">
          {formatLastLogged(log.lastLogged)}
        </span>
      )}

      {/* Frequency badge */}
      {showFrequency && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {log.frequency}
        </span>
      )}

      {/* Success indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Check className="w-6 h-6 text-green-400 animate-pulse" />
        </div>
      )}

      {/* Electric glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-blue-400/10 blur-xl" />
      </div>
    </button>
  );
};

/**
 * Main CommonLogsBar Component
 */
export const CommonLogsBar: React.FC<CommonLogsBarProps> = ({
  userId,
  quickLogs: propQuickLogs,
  onQuickLog,
  onLogsUpdate,
  loading: propLoading = false,
  className = '',
  maxDisplay = CONSTANTS.MAX_DISPLAY,
  disabled = false,
}) => {
  const [quickLogs, setQuickLogs] = useState<QuickLog[]>(propQuickLogs || []);
  const [loading, setLoading] = useState(propLoading);
  const [loadingLogId, setLoadingLogId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!propQuickLogs) {
      loadQuickLogsFromStorage();
    }
  }, [propQuickLogs]);

  // Save to localStorage when logs change
  useEffect(() => {
    if (quickLogs.length > 0) {
      saveQuickLogsToStorage(quickLogs);
    }
  }, [quickLogs]);

  const loadQuickLogsFromStorage = () => {
    try {
      // Use user-specific storage key
      const storageKey = userId ? `${STORAGE.QUICK_LOGS}_${userId}` : STORAGE.QUICK_LOGS;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const logs = parsed.map((log: any) => ({
          ...log,
          lastLogged: log.lastLogged ? new Date(log.lastLogged) : null,
        }));
        setQuickLogs(logs);
      }
    } catch (error) {
      console.error('Failed to load quick logs from storage:', error);
    }
  };

  const saveQuickLogsToStorage = (logs: QuickLog[]) => {
    try {
      // Use user-specific storage key
      const storageKey = userId ? `${STORAGE.QUICK_LOGS}_${userId}` : STORAGE.QUICK_LOGS;
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      if (error instanceof Error && error.message.includes('QuotaExceeded')) {
        // Clear old data and retry
        localStorage.clear();
        try {
          localStorage.setItem(STORAGE.QUICK_LOGS, JSON.stringify(logs));
        } catch (retryError) {
          console.error('Failed to save quick logs after clearing:', retryError);
        }
      } else {
        console.error('Failed to save quick logs to storage:', error);
      }
    }
  };

  const handleQuickLog = async (log: QuickLog) => {
    setLoadingLogId(log.id);

    try {
      if (onQuickLog) {
        await onQuickLog(log);
      } else {
        // Default implementation - call parse API
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: log.data.raw_text,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to log activity');
        }
      }

      // Update frequency and last logged
      const updatedLogs = quickLogs.map(l =>
        l.id === log.id
          ? { ...l, frequency: l.frequency + 1, lastLogged: new Date() }
          : l
      );
      setQuickLogs(updatedLogs);

      // Show success feedback
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success('Activity logged!');
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error('Failed to log activity. Please try again.');
      }
    } finally {
      setLoadingLogId(null);
    }
  };

  // Sort logs: pinned first, then by frequency
  const sortedLogs = [...quickLogs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.frequency - a.frequency;
  });

  // Limit display
  const displayLogs = sortedLogs.slice(0, maxDisplay);

  if (displayLogs.length === 0) {
    return (
      <div className="common-logs-bar bg-gray-900/30 backdrop-blur rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-gray-400">No quick logs yet. Log activities 3+ times to see them here!</p>
      </div>
    );
  }

  // Determine layout based on viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      className={`
        common-logs-bar
        bg-[#0A0A0A] p-4 
        ${isMobile ? 'overflow-x-auto flex flex-nowrap gap-3' : 'grid grid-cols-auto-fit gap-4'}
        ${className}
      `}
      style={{ backgroundColor: 'rgb(10, 10, 10)' }}
    >
      {displayLogs.map((log) => (
        <QuickLogButton
          key={log.id}
          log={log}
          onClick={handleQuickLog}
          loading={loadingLogId === log.id}
          disabled={disabled}
          showLastLogged={false}
          showFrequency={false}
        />
      ))}
    </div>
  );
};