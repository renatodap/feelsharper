/**
 * AI Coach Types
 * User personas and dashboard widget types
 */

export enum UserPersonaType {
  ENDURANCE = 'endurance',
  STRENGTH = 'strength', 
  WEIGHT_LOSS = 'weight_loss',
  GENERAL = 'general'
}

export enum DASHBOARD_WIDGETS {
  HR_ZONES = 'hr_zones',
  WEIGHT_TREND = 'weight_trend',
  TRAINING_LOAD = 'training_load',
  NUTRITION_BALANCE = 'nutrition_balance',
  SLEEP_QUALITY = 'sleep_quality',
  MOOD_TRACKING = 'mood_tracking'
}

export interface PersonaConfiguration {
  id: string;
  name: string;
  description: string;
  widgets: DASHBOARD_WIDGETS[];
  goals: string[];
}

export interface UserPersonaData {
  persona: UserPersonaType;
  customizations?: {
    preferredMetrics: string[];
    goals: string[];
  };
}