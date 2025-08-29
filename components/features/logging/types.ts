/**
 * CommonLogsBar Type Definitions
 * TDD Step 3: Interface Definitions
 */

/**
 * Represents a single quick log entry
 */
export interface QuickLog {
  /** Unique identifier for the log */
  id: string;
  
  /** Display label for the activity */
  activity: string;
  
  /** Type of activity for icon selection */
  type: 'food' | 'exercise' | 'weight' | 'sleep' | 'mood' | 'other';
  
  /** Number of times this activity has been logged */
  frequency: number;
  
  /** When this was last logged */
  lastLogged: Date | null;
  
  /** Whether user has pinned this log */
  isPinned: boolean;
  
  /** Whether user has hidden this log */
  isHidden: boolean;
  
  /** Icon name for display */
  icon: string;
  
  /** Original parsed data to re-send */
  data: {
    raw_text: string;
    parsed_data: any;
    confidence: number;
  };
}

/**
 * User preferences for CommonLogsBar
 */
export interface QuickLogPreferences {
  /** Maximum number of quick logs to display (5-10) */
  maxQuickLogs: number;
  
  /** IDs of pinned logs */
  pinnedLogs: string[];
  
  /** IDs of hidden logs */
  hiddenLogs: string[];
  
  /** Custom order of logs (if user reordered) */
  customOrder: string[] | null;
  
  /** Whether to show last logged time */
  showLastLogged: boolean;
  
  /** Whether to show frequency badges */
  showFrequency: boolean;
}

/**
 * Props for CommonLogsBar component
 */
export interface CommonLogsBarProps {
  /** User ID for fetching logs */
  userId?: string;
  
  /** Override quick logs (for testing) */
  quickLogs?: QuickLog[];
  
  /** Callback when a quick log is tapped */
  onQuickLog?: (log: QuickLog) => void;
  
  /** Callback when logs are updated */
  onLogsUpdate?: (logs: QuickLog[]) => void;
  
  /** Whether to show loading state */
  loading?: boolean;
  
  /** Custom class name */
  className?: string;
  
  /** Maximum number to display (overrides user pref) */
  maxDisplay?: number;
  
  /** Whether component is disabled */
  disabled?: boolean;
}

/**
 * Props for individual QuickLogButton
 */
export interface QuickLogButtonProps {
  /** The quick log data */
  log: QuickLog;
  
  /** Click handler */
  onClick: (log: QuickLog) => void;
  
  /** Long press handler for edit */
  onLongPress?: (log: QuickLog) => void;
  
  /** Swipe/delete handler */
  onDelete?: (log: QuickLog) => void;
  
  /** Whether button is loading */
  loading?: boolean;
  
  /** Whether button is disabled */
  disabled?: boolean;
  
  /** Show last logged time */
  showLastLogged?: boolean;
  
  /** Show frequency badge */
  showFrequency?: boolean;
  
  /** Custom class name */
  className?: string;
}

/**
 * Frequency tracking data structure
 */
export interface FrequencyData {
  /** Map of activity hash to frequency count */
  activities: Map<string, number>;
  
  /** When the data was last updated */
  lastUpdated: Date;
  
  /** Total number of logs tracked */
  totalLogs: number;
  
  /** Version for migration purposes */
  version: number;
}

/**
 * API response for logging activity
 */
export interface LogActivityResponse {
  /** Whether the log was successful */
  success: boolean;
  
  /** The saved activity log */
  activityLog?: {
    id: string;
    user_id: string;
    activity: string;
    timestamp: string;
  };
  
  /** Error message if failed */
  error?: string;
}

/**
 * Hook return type for useQuickLogs
 */
export interface UseQuickLogsReturn {
  /** List of quick logs to display */
  quickLogs: QuickLog[];
  
  /** Whether data is loading */
  loading: boolean;
  
  /** Any error that occurred */
  error: string | null;
  
  /** Log an activity */
  logActivity: (log: QuickLog) => Promise<void>;
  
  /** Remove a quick log */
  removeQuickLog: (id: string) => void;
  
  /** Pin/unpin a log */
  togglePin: (id: string) => void;
  
  /** Hide/unhide a log */
  toggleHide: (id: string) => void;
  
  /** Reorder logs */
  reorderLogs: (logs: QuickLog[]) => void;
  
  /** Refresh data from server */
  refresh: () => Promise<void>;
}

/**
 * Event types for analytics
 */
export type QuickLogEvent = 
  | { type: 'quick_log_clicked'; logId: string; activity: string }
  | { type: 'quick_log_added'; activity: string; frequency: number }
  | { type: 'quick_log_removed'; logId: string }
  | { type: 'quick_log_pinned'; logId: string }
  | { type: 'quick_log_reordered'; newOrder: string[] }
  | { type: 'quick_log_error'; error: string };

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  QUICK_LOGS: 'feelsharper_quick_logs',
  PREFERENCES: 'feelsharper_quick_log_preferences',
  FREQUENCY_DATA: 'feelsharper_frequency_data',
} as const;

/**
 * Constants for CommonLogsBar
 */
export const QUICK_LOG_CONSTANTS = {
  MIN_FREQUENCY: 3, // Minimum uses before appearing
  MAX_DISPLAY: 10, // Maximum logs to show
  MIN_DISPLAY: 5, // Minimum logs to show
  LONG_PRESS_DURATION: 500, // ms for long press
  SYNC_INTERVAL: 30000, // ms between syncs
  CACHE_DURATION: 3600000, // 1 hour cache
} as const;