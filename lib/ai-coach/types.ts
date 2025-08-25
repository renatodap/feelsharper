/**
 * Type definitions for AI Coach system
 */

export interface ActivityLog {
  id?: string;
  user_id?: string;
  activity_type: string;
  type?: string; // alias for activity_type
  raw_input: string;
  originalText?: string; // alias for raw_input
  parsed_data: any;
  data?: any; // alias for parsed_data
  confidence_level: number;
  subjective_notes?: string;
  source: 'chat' | 'voice' | 'device' | 'manual';
  device_data?: any;
  logged_at?: string;
  created_at?: string;
  date?: string; // Added for streak system compatibility
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  user_type: 'endurance' | 'strength' | 'sport' | 'professional' | 'weight_mgmt';
  dashboard_config?: any;
  common_logs?: any;
  preferences?: any;
  detected_patterns?: any;
  context_cache?: any;
  created_at?: string;
  updated_at?: string;
  // Additional profile fields
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  fitness_level?: string;
  goals?: string[];
  dietary_restrictions?: string[];
  health_conditions?: string[];
  health?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  medications?: string[];
  avg_daily_calories?: number;
}

export interface CoachingContext {
  recentActivities: ActivityLog[];
  userProfile: UserProfile;
  currentStreaks: Array<{
    type: string;
    count: number;
    current_days?: number;
    label: string;
  }>;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
    pattern?: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionable: boolean;
    action?: string;
    expected_impact?: string;
  }>;
}

export interface CoachingResponse {
  message: string;
  confidence: number;
  actionItems?: string[];
  clarifyingQuestion?: string;
  behaviorAnalysis?: any;
  tinyHabit?: string;
  identityReinforcement?: string;
  motivationalDesign?: any;
  references?: string[];
  action_items?: string[];
}

export interface SafetyAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  recommendations: string[];
  requiresProfessional?: boolean;
}

export interface Workout {
  id?: string;
  user_id?: string;
  name: string;
  date?: string;
  duration_minutes?: number;
  exercises?: any[];
  notes?: string;
  intensity_score?: number;
  total_volume?: number;
  logged_at?: string;
  created_at?: string;
}

// ===== Phase 9: Personalization Types =====

export enum UserPersonaType {
  ENDURANCE = 'endurance',
  STRENGTH = 'strength',
  SPORT = 'sport',
  PROFESSIONAL = 'professional',
  WEIGHT_MGMT = 'weight_mgmt'
}

export interface UserPersona {
  type: UserPersonaType;
  confidence: number; // 0-100
  indicators: {
    vocabulary: string[];
    activityPatterns: string[];
    goalTypes: string[];
    frequencyPatterns: string[];
  };
  detectedAt: string;
  lastUpdated: string;
}

export interface BehavioralContext {
  timeOfDay: string;
  dayOfWeek: string;
  recentActivity: string[]; // Last 5 activity types
  environmentalFactors: {
    location: string;
    weather: string;
    calendar: string[];
  };
  lastInteraction: string;
}

export interface PersonaDashboardConfig {
  primaryWidgets: string[];
  secondaryWidgets: string[];
  layout: 'grid' | 'list' | 'compact';
  defaultTimeframe: '7d' | '30d' | '90d';
  customization?: {
    showTrends: boolean;
    showComparisons: boolean;
    showPredictions: boolean;
    preferredMetrics: string[];
  };
}

export interface AdaptiveIntervention {
  id: string;
  templateId: string;
  type: 'motivation' | 'reminder' | 'suggestion' | 'celebration';
  message: string;
  content: {
    title: string;
    body: string;
    actionText?: string;
  };
  actionPrompt?: string;
  intensity: 'low' | 'medium' | 'high';
  personalizedFor: UserPersonaType;
  contextMatch: number; // 0-1 score
  effectivenessScore: number; // 0-1 based on past performance
  effectiveness: number; // 0-1 based on past performance (alias for effectivenessScore)
  cooldownMinutes: number;
  maxDailyUses: number;
  currentUses: number;
  trigger?: {
    type: string;
    condition: string;
  };
}

export interface PersonalizationProfile {
  userId: string;
  persona: UserPersona;
  dashboardConfig: PersonaDashboardConfig;
  motivationalStyle: {
    preference: 'data-driven' | 'emotional' | 'social' | 'competitive';
    rewardType: 'immediate' | 'delayed' | 'variable';
    feedbackStyle: 'gentle' | 'direct' | 'analytical';
  };
  habitFormationProfile: {
    difficultyPreference: 'tiny' | 'moderate' | 'ambitious';
    consistencyPattern: 'streaks' | 'flexible' | 'routine';
    recoveryStyle: 'forgiveness' | 'restart' | 'gradual';
  };
  adaptiveInterventions: AdaptiveIntervention[];
  lastPersonalizationUpdate: string;
}

// Dashboard Widget Types
export enum DASHBOARD_WIDGETS {
  // Endurance widgets
  HR_ZONES = 'hr_zones',
  TRAINING_LOAD = 'training_load',
  WEEKLY_VOLUME = 'weekly_volume',
  VO2_MAX = 'vo2_max',
  RECOVERY_METRICS = 'recovery_metrics',
  
  // Strength widgets
  PERSONAL_RECORDS = 'personal_records',
  VOLUME_PROGRESSION = 'volume_progression',
  PROTEIN_INTAKE = 'protein_intake',
  BODY_COMPOSITION = 'body_composition',
  STRENGTH_BALANCE = 'strength_balance',
  
  // Sport widgets
  HOURS_TRAINED = 'hours_trained',
  PERFORMANCE_RATING = 'performance_rating',
  SKILL_PROGRESSION = 'skill_progression',
  MOOD_TRACKING = 'mood_tracking',
  
  // Professional widgets
  QUICK_STATS = 'quick_stats',
  EXERCISE_STREAK = 'exercise_streak',
  ENERGY_LEVELS = 'energy_levels',
  
  // Weight Management widgets
  WEIGHT_PROGRESS = 'weight_progress',
  WEIGHT_TREND = 'weight_trend',
  CALORIE_BALANCE = 'calorie_balance',
  NUTRITION_BREAKDOWN = 'nutrition_breakdown',
  PROGRESS_PHOTOS = 'progress_photos',
  MEASUREMENTS = 'measurements',
  BODY_MEASUREMENTS = 'body_measurements',
  
  // Sport specific widgets
  PRACTICE_HOURS = 'practice_hours',
  WIN_LOSS_RECORD = 'win_loss_record',
  
  // Common widgets
  HABIT_TRACKER = 'habit_tracker',
  WEEKLY_SUMMARY = 'weekly_summary',
  GOALS_PROGRESS = 'goals_progress'
}

export interface DashboardWidget {
  title: string;
  description: string;
  component: string;
  dataSource: string;
  priority: number;
  showByDefault: boolean;
  customization?: {
    chartType?: 'line' | 'bar' | 'pie' | 'gauge';
    timeframe?: string;
    metrics?: string[];
  };
}

export interface DashboardTemplate {
  persona: UserPersonaType;
  config: PersonaDashboardConfig;
  widgets: Record<string, DashboardWidget>;
  priorities?: {
    primary: string[];
    secondary: string[];
    optional: string[];
  };
}

export interface InterventionTemplate {
  id: string;
  type: 'motivation' | 'reminder' | 'suggestion' | 'celebration';
  message: string;
  actionPrompt?: string;
  intensity: 'low' | 'medium' | 'high';
  personalizedFor: UserPersonaType[];
  contextRequirements: {
    timeOfDay?: string[];
    dayOfWeek?: number[];
    recentActivity?: string[];
    minimumData?: string[];
  };
  successConditions: string[];
  cooldownMinutes: number;
  maxDailyUses: number;
}