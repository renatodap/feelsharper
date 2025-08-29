/**
 * InBody Scanner Parser Type Definitions
 * TDD Step 3: Interface Definitions
 */

/**
 * Supported InBody device models
 */
export type InBodyModel = 'InBody270' | 'InBody570' | 'InBody770' | 'Unknown';

/**
 * Core body composition metrics from InBody scan
 */
export interface InBodyMetrics {
  // Identification
  measurementId: string;
  measurementDate: Date;
  deviceModel: InBodyModel;
  
  // Basic Measurements
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  
  // Body Composition
  bodyFatMass: number; // kg
  bodyFatPercentage: number; // %
  skeletalMuscleMass: number; // kg
  musclePercentage: number; // %
  visceralFatLevel: number; // 1-20 scale
  
  // Water & Minerals
  totalBodyWater: number; // liters
  intracellularWater: number; // liters
  extracellularWater: number; // liters
  minerals: number; // kg
  protein: number; // kg
  
  // Segmental Analysis
  segmentalMuscle: SegmentalData;
  segmentalFat: SegmentalData;
  
  // Calculated Metrics
  bmi: number;
  bmr: number; // basal metabolic rate in kcal
  bodyType?: string;
  fitnessScore?: number; // 0-100
  
  // Imbalance Detection
  muscleImbalance: ImbalanceMetrics;
}

/**
 * Segmental body composition data
 */
export interface SegmentalData {
  rightArm: number; // kg
  leftArm: number; // kg
  trunk: number; // kg
  rightLeg: number; // kg
  leftLeg: number; // kg
}

/**
 * Muscle imbalance analysis
 */
export interface ImbalanceMetrics {
  upperBody: number; // % difference between arms
  lowerBody: number; // % difference between legs
  leftRight: number; // % overall left/right difference
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

/**
 * Parser result with success/error handling
 */
export interface ParseResult {
  success: boolean;
  data?: InBodyMetrics;
  error?: ParseError;
  warnings?: string[];
}

/**
 * Parse error details
 */
export interface ParseError {
  code: ParseErrorCode;
  message: string;
  details?: string[];
  partialData?: Partial<InBodyMetrics>;
}

/**
 * Error codes for parsing failures
 */
export type ParseErrorCode = 
  | 'INVALID_FORMAT'
  | 'MISSING_FIELDS' 
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_FORMAT'
  | 'VALIDATION_ERROR'
  | 'FILE_CORRUPTED';

/**
 * CSV parsing options
 */
export interface CsvParseOptions {
  delimiter?: ',' | ';' | '\t';
  hasHeader?: boolean;
  dateFormat?: string;
  skipEmptyRows?: boolean;
}

/**
 * PDF parsing options
 */
export interface PdfParseOptions {
  model?: InBodyModel;
  language?: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko';
  extractCharts?: boolean;
}

/**
 * Validation rules for metrics
 */
export interface ValidationRules {
  bodyFatPercentage: { min: number; max: number };
  muscleMass: { min: number; max: number };
  visceralFat: { min: number; max: number };
  bmi: { min: number; max: number };
  age: { min: number; max: number };
  weight: { min: number; max: number };
  maxImbalance: number; // Maximum acceptable % difference
}

/**
 * Field mapping for CSV columns
 */
export interface CsvFieldMapping {
  [csvColumn: string]: keyof InBodyMetrics | string;
}

/**
 * Parser configuration
 */
export interface ParserConfig {
  validationRules: ValidationRules;
  csvFieldMapping: CsvFieldMapping;
  strictMode: boolean; // Fail on any validation error vs. best effort
  calculateDerived: boolean; // Calculate BMI, percentages if missing
}

/**
 * Batch parsing result
 */
export interface BatchParseResult {
  successful: number;
  failed: number;
  results: ParseResult[];
  totalProcessingTime: number;
}

/**
 * Imbalance recommendation
 */
export interface ImbalanceRecommendation {
  bodyPart: 'upperBody' | 'lowerBody' | 'core';
  side?: 'left' | 'right';
  severity: 'mild' | 'moderate' | 'severe';
  recommendation: string;
  exercises: string[];
}

/**
 * Body composition trend analysis
 */
export interface CompositionTrend {
  metric: keyof InBodyMetrics;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  changeAbsolute: number;
  periodDays: number;
  dataPoints: number;
}

/**
 * Athletic norm comparison
 */
export interface NormComparison {
  metric: string;
  userValue: number;
  normRange: { min: number; max: number };
  percentile: number;
  category: 'below' | 'normal' | 'above' | 'excellent';
  sportSpecific?: string;
}