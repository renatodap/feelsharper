/**
 * MVP Type Definitions
 * TDD Step 3: Interface Definitions
 * 
 * Core types for the MVP UI structure implementation.
 * NO IMPLEMENTATION - Only type definitions as per TDD requirements.
 */

// ============================================================================
// Core Data Types
// ============================================================================

export type ActivityType = 'weight' | 'food' | 'exercise' | 'sleep' | 'water' | 'mood' | 'energy' | 'other';
export type SeverityLevel = 'info' | 'warning' | 'critical';
export type PersonaType = 'auto' | 'endurance' | 'strength' | 'tennis' | 'weight' | 'wellness';
export type CoachingStyle = 'direct' | 'supportive';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

// ============================================================================
// Database Models (matching Supabase schema)
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id: string;
  type: ActivityType;
  raw_text: string;
  data: Record<string, any>;
  parsed_data?: Record<string, any>;
  confidence?: number;
  metadata?: Record<string, any>;
  auto_logged?: boolean;
  ai_response?: string;
  timestamp: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Insight {
  id: string;
  user_id: string;
  rule_id: string;
  title: string;
  body: string;
  severity: SeverityLevel;
  evidence_json: Record<string, any>;
  snoozed_until?: Date | string | null;
  created_at: Date | string;
}

export interface UserPreferences {
  user_id: string;
  units_weight: 'lbs' | 'kg';
  units_distance: 'mi' | 'km';
  units_volume: 'oz' | 'ml';
  time_format: '12h' | '24h';
  persona_preset: PersonaType;
  goals_json?: {
    target_weight?: number;
    weekly_training_days?: number;
    sleep_hours?: number;
    hydration_liters?: number;
  };
  coaching_style: CoachingStyle;
  reminder_time?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface CommonLog {
  activity: string;
  frequency: number;
  last_logged?: Date | string;
  type: ActivityType;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ParseRequest {
  text: string;
  userId?: string;
  source?: 'text' | 'voice' | 'manual';
}

export interface ParseResponse {
  type: ActivityType;
  fields: Record<string, any>;
  confidence: number;
  raw_text: string;
  message?: string;
}

export interface InsightsRequest {
  userId: string;
  dateRange?: number; // days
  limit?: number;
}

export interface InsightsResponse {
  insights: Insight[];
  criticalQuestion?: {
    id: string;
    question: string;
    options: string[];
  };
}

export interface CoachAnswerRequest {
  userId: string;
  questionId: string;
  answer: string;
}

export interface CoachQARequest {
  userId: string;
  question: string;
  context?: ActivityLog[];
}

export interface CoachQAResponse {
  answer: string;
  relatedLogs?: string[]; // log IDs
  confidence: number;
}

export interface DashboardRequest {
  userId: string;
  range: '7D' | '14D' | '30D';
  persona?: PersonaType;
}

export interface DashboardResponse {
  persona: PersonaType;
  widgets: DashboardWidget[];
  lastUpdated: Date | string;
}

// ============================================================================
// Component Props Types
// ============================================================================

// Insights Page Components
export interface InsightCardProps {
  insight: Insight;
  onExpand: () => void;
  onAction: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  expanded?: boolean;
}

export interface CriticalQuestionProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  loading?: boolean;
}

export interface AskCoachProps {
  onAsk: (question: string) => Promise<CoachQAResponse>;
  loading?: boolean;
  placeholder?: string;
}

// Log Page Components
export interface UnifiedNaturalInputProps {
  onParse: (text: string, source: 'text' | 'voice') => Promise<ParseResponse>;
  onConfirm: (parsed: ParseResponse) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export interface ParsePreviewProps {
  parsed: ParseResponse;
  onConfirm: () => void;
  onEdit: (field: string, value: any) => void;
  onCancel: () => void;
  onBackdate: (date: Date) => void;
}

export interface HistoryFeedProps {
  logs: ActivityLog[];
  onEdit: (log: ActivityLog) => void;
  onDelete: (logId: string) => void;
  onReportBadParse: (logId: string) => void;
  filters?: ActivityType[];
  searchQuery?: string;
}

export interface ManualFormProps {
  type: ActivityType;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Record<string, any>;
}

// Dashboard Components
export interface DashboardWidget {
  id: string;
  type: 'streak' | 'weight' | 'volume' | 'recovery' | 'hydration' | 'protein' | 'tennis' | 'adherence';
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  data?: any[];
  enabled: boolean;
  order: number;
}

export interface WidgetProps {
  widget: DashboardWidget;
  onToggle?: (widgetId: string) => void;
  onReorder?: (widgetId: string, newOrder: number) => void;
}

export interface PresetSelectorProps {
  current: PersonaType;
  onChange: (preset: PersonaType) => void;
  autoDetected?: PersonaType;
}

export interface SidePanelProps {
  widgets: DashboardWidget[];
  onToggle: (widgetId: string) => void;
  onRestoreDefaults: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Settings Components
export interface SettingsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name?: string;
    provider?: string;
  };
  preferences: UserPreferences;
  onSave: (preferences: Partial<UserPreferences>) => Promise<void>;
  onExport: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export interface ProfileSectionProps {
  name?: string;
  email: string;
  provider?: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
}

export interface UnitsSectionProps {
  units: Pick<UserPreferences, 'units_weight' | 'units_distance' | 'units_volume' | 'time_format'>;
  onChange: (units: Partial<UnitsSectionProps['units']>) => void;
}

export interface GoalsSectionProps {
  goals: UserPreferences['goals_json'];
  onChange: (goals: UserPreferences['goals_json']) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  cursor?: string;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Context Types
// ============================================================================

export interface AuthContextValue {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

export interface PreferencesContextValue {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export interface InsightsContextValue {
  insights: Insight[];
  criticalQuestion: InsightsResponse['criticalQuestion'] | null;
  loading: boolean;
  refresh: () => Promise<void>;
  snoozeInsight: (insightId: string) => Promise<void>;
  dismissInsight: (insightId: string) => Promise<void>;
  answerQuestion: (answer: string) => Promise<void>;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseParseReturn {
  parse: (text: string) => Promise<ParseResponse>;
  parsing: boolean;
  error: Error | null;
  lastParsed: ParseResponse | null;
}

export interface UseCommonLogsReturn {
  commonLogs: CommonLog[];
  loading: boolean;
  refresh: () => Promise<void>;
  logActivity: (activity: string) => Promise<void>;
}

export interface UseDashboardReturn {
  widgets: DashboardWidget[];
  persona: PersonaType;
  loading: boolean;
  toggleWidget: (widgetId: string) => void;
  reorderWidget: (widgetId: string, newOrder: number) => void;
  changePersona: (persona: PersonaType) => void;
  refresh: () => Promise<void>;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: Error | null;
}

// ============================================================================
// Rule Engine Types (for Insights)
// ============================================================================

export interface InsightRule {
  id: string;
  name: string;
  description: string;
  evaluate: (logs: ActivityLog[]) => InsightResult | null;
  severity: SeverityLevel;
  category: string;
}

export interface InsightResult {
  triggered: boolean;
  title: string;
  body: string;
  evidence: ActivityLog[];
  action?: {
    label: string;
    type: 'log' | 'navigate' | 'external';
    payload: any;
  };
}

// ============================================================================
// Analytics Event Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export type TrackedEvents = 
  | 'insight_view'
  | 'insight_expand'
  | 'insight_action_click'
  | 'insight_snooze'
  | 'coach_q_shown'
  | 'coach_q_answered'
  | 'coach_qa_submit'
  | 'log_parse_start'
  | 'log_parse_confirm'
  | 'log_quick_repeat'
  | 'log_manual_submit'
  | 'log_edit'
  | 'log_delete'
  | 'log_bad_parse'
  | 'dashboard_preset_auto'
  | 'dashboard_preset_override'
  | 'widget_toggle'
  | 'widget_open_logs';

// ============================================================================
// Export all types for easy import
// ============================================================================

export type * from './mvp';