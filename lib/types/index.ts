/**
 * FeelSharper Type Definitions
 * Comprehensive type definitions for the application
 */

// Re-export database types
export * from './database'

// Notification types
export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  silent?: boolean
  renotify?: boolean
  requireInteraction?: boolean
  timestamp?: number
  // Note: vibrate is not part of standard NotificationOptions but may be used by some implementations
}

// Sync and offline types
export interface SyncResult {
  success: boolean
  itemsSynced: number
  errors: string[]
  lastSyncDate: Date
}

// Health and fitness data types
export interface SleepData {
  id: string
  userId: string
  date: string
  bedtime: string
  wakeTime: string
  duration: number // minutes
  quality: number // 1-10 scale
  deepSleepMinutes?: number
  remSleepMinutes?: number
  createdAt: string
  updatedAt: string
}

export interface SocialData {
  id: string
  userId: string
  platform: string
  activity: string
  data: any
  timestamp: string
}

export interface AchievementData {
  id: string
  userId: string
  type: string
  title: string
  description: string
  points: number
  unlockedAt: string
  category: string
}

// User presence and realtime types
export interface UserPresence {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  deviceInfo?: {
    type: string
    platform: string
    userAgent?: string
  }
}

// Offline data management types
export interface OfflineItem {
  id: string
  type: 'food_log' | 'workout' | 'body_measurement' | 'custom_food'
  data: any
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  userId: string
  createdAt: string
  recordedAt?: string
  timestamp?: string
}

// Progress prediction types
export interface ProgressPrediction {
  currentValue: number
  predictedValue: number
  timeframe: number // days
  confidence: number // 0-1
  factors: string[]
}

// Nutrition optimizer types
export interface NutritionProfile {
  userId: string
  budgetConstraint?: number | string
  dietaryRestrictions: string[]
  preferences: string[]
  goals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export interface OptimizedMeal {
  foods: {
    id: number
    quantity: number
    cost: number
  }[]
  totalCost: number
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string | null
  success: boolean
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Form types
export interface FormError {
  field: string
  message: string
}

export interface FormState {
  isSubmitting: boolean
  errors: FormError[]
  success: boolean
}

// Export/import types
export interface ExportData {
  profile: any
  workouts: any[]
  nutrition: any[]
  measurements: any[]
  timestamp: string
  version: string
}

export interface WorkoutData {
  id: string
  userId: string
  name: string
  type: string
  duration: number
  exercises: any[]
  calories: number
  date: string
  completed: boolean
  notes?: string
}

export interface NutritionData {
  id: string
  userId: string
  date: string
  mealType: string
  foods: any[]
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface BodyMetricData {
  id: string
  userId: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  measurements: Record<string, number>
  notes?: string
}

export interface UserData {
  id: string
  email: string
  profile: any
  preferences: any
  subscription: any
}

// Progress tracking types
export interface ProgressMetrics {
  weight: {
    current: number
    change: number
    trend: 'up' | 'down' | 'stable'
  }
  strength: {
    totalLifted: number
    personalRecords: number
    improvementRate: number
  }
  endurance: {
    totalDistance: number
    avgPace: number
    improvementRate: number
  }
  consistency: {
    streakDays: number
    weeklyGoalCompletion: number
    monthlyGoalCompletion: number
  }
}

// AI coach types
export interface CoachingContext {
  userId: string
  profile: any
  recentWorkouts: any[]
  recentNutrition: any[]
  goals: any[]
  preferences: any
}

export interface CoachingResponse {
  message: string
  suggestions: string[]
  actionItems: string[]
  motivation: string
  confidence: number
}

// Error types
export class FeelSharperError extends Error {
  code: string
  details?: any

  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = 'FeelSharperError'
    this.code = code
    this.details = details
  }
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>

// Date and time utilities
export type DateString = string // ISO 8601 date string
export type TimeString = string // HH:MM format
export type TimestampString = string // ISO 8601 datetime string

// Status enums
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing', 
  SYNCED = 'synced',
  FAILED = 'failed'
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down', 
  STABLE = 'stable'
}

// IndexedDB store names for type safety
export const DB_STORES = {
  FOOD_LOGS: 'foodLogs',
  WORKOUTS: 'workouts',
  BODY_MEASUREMENTS: 'bodyMeasurements',
  ACTIVITIES: 'activities'
} as const

export type DbStoreName = typeof DB_STORES[keyof typeof DB_STORES]