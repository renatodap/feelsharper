/**
 * InBody CSV Parser Implementation
 * TDD Step 5: Implementation to pass tests
 */

import {
  InBodyMetrics,
  ParseResult,
  ParseError,
  CsvParseOptions,
  ValidationRules,
  ImbalanceMetrics,
  SegmentalData
} from './types';

/**
 * Default validation rules
 */
const DEFAULT_VALIDATION_RULES: ValidationRules = {
  bodyFatPercentage: { min: 2, max: 60 },
  muscleMass: { min: 10, max: 80 },
  visceralFat: { min: 1, max: 20 },
  bmi: { min: 10, max: 50 },
  age: { min: 10, max: 100 },
  weight: { min: 20, max: 300 },
  maxImbalance: 30
};

/**
 * CSV field mappings for different column names
 */
const FIELD_MAPPINGS: Record<string, keyof InBodyMetrics | string> = {
  'Date': 'measurementDate',
  'Weight': 'weight',
  'Height': 'height',
  'Age': 'age',
  'Gender': 'gender',
  'Body Fat Mass': 'bodyFatMass',
  'Skeletal Muscle Mass': 'skeletalMuscleMass',
  'Body Fat %': 'bodyFatPercentage',
  'BMI': 'bmi',
  'Visceral Fat Level': 'visceralFatLevel',
  'Total Body Water': 'totalBodyWater',
  'Intracellular Water': 'intracellularWater',
  'Extracellular Water': 'extracellularWater',
  'Protein': 'protein',
  'Minerals': 'minerals',
  'Right Arm': 'segmentalMuscle.rightArm',
  'Left Arm': 'segmentalMuscle.leftArm',
  'Trunk': 'segmentalMuscle.trunk',
  'Right Leg': 'segmentalMuscle.rightLeg',
  'Left Leg': 'segmentalMuscle.leftLeg'
};

/**
 * Parse CSV string into InBody metrics
 */
export async function parseCsv(
  csvContent: string,
  options: CsvParseOptions & { multiRow?: boolean; calculateDerived?: boolean } = {}
): Promise<ParseResult & { data?: InBodyMetrics | InBodyMetrics[] }> {
  try {
    // Check for empty content
    if (!csvContent || csvContent.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'CSV file is empty'
        }
      };
    }

    const {
      delimiter = ',',
      hasHeader = true,
      skipEmptyRows = true,
      multiRow = false,
      calculateDerived = false
    } = options;

    // Split into lines and filter empty if needed
    let lines = csvContent.trim().split('\n');
    if (skipEmptyRows) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    if (lines.length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'No valid data rows found'
        }
      };
    }

    // Parse header if present
    let headers: string[] = [];
    let dataLines = lines;
    
    if (hasHeader) {
      if (lines.length < 2) {
        return {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: 'CSV has header but no data rows'
          }
        };
      }
      headers = lines[0].split(delimiter).map(h => h.trim());
      
      // Check if this looks like a valid CSV header
      const validHeaders = headers.some(h => Object.keys(FIELD_MAPPINGS).includes(h));
      if (!validHeaders) {
        return {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: 'Invalid CSV format - no recognized column headers'
          }
        };
      }
      
      dataLines = lines.slice(1);
    } else {
      // Without header, we can't map fields properly
      return {
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'CSV must have a header row to identify fields'
        }
      };
    }

    // Parse data rows
    const results: InBodyMetrics[] = [];
    
    for (const line of dataLines) {
      const values = line.split(delimiter).map(v => v.trim());
      
      if (values.length !== headers.length) {
        continue; // Skip malformed rows
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        const fieldName = FIELD_MAPPINGS[header];
        if (fieldName) {
          const value = values[index];
          // Handle nested fields (e.g., segmentalMuscle.rightArm)
          if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            if (!rowData[parent]) {
              rowData[parent] = {};
            }
            rowData[parent][child] = parseValue(value);
          } else {
            rowData[fieldName] = parseValue(value);
          }
        }
      });

      // Check for required fields
      const missingFields = checkRequiredFields(rowData);
      if (missingFields.length > 0) {
        return {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Required fields are missing',
            details: missingFields
          }
        };
      }

      // Convert to proper types and structure
      const metrics = convertToMetrics(rowData, calculateDerived);
      
      // Validate the metrics
      const validation = validateMetrics(metrics, DEFAULT_VALIDATION_RULES);
      if (!validation.valid) {
        // For out of range test case, we should return validation error
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data validation failed',
            details: validation.errors
          }
        };
      }

      results.push(metrics);
    }

    if (results.length === 0) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'No valid data could be parsed'
        }
      };
    }

    return {
      success: true,
      data: multiRow ? results : results[0]
    };

  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown parsing error'
      }
    };
  }
}

/**
 * Parse a string value to appropriate type
 */
function parseValue(value: string): any {
  if (!value || value === '') return null;
  
  // Try to parse as number
  const num = parseFloat(value);
  if (!isNaN(num)) return num;
  
  // Check for date
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date;
  
  // Handle gender
  if (value.toLowerCase() === 'male' || value.toLowerCase() === 'm') return 'male';
  if (value.toLowerCase() === 'female' || value.toLowerCase() === 'f') return 'female';
  
  return value;
}

/**
 * Check for required fields
 */
function checkRequiredFields(data: any): string[] {
  const required = ['weight', 'height', 'age', 'gender', 'bodyFatMass', 'skeletalMuscleMass'];
  const missing: string[] = [];
  
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'));
    }
  }
  
  return missing;
}

/**
 * Convert raw data to InBodyMetrics
 */
function convertToMetrics(data: any, calculateDerived: boolean): InBodyMetrics {
  const metrics: InBodyMetrics = {
    measurementId: data.measurementId || `inbody-${Date.now()}`,
    measurementDate: data.measurementDate || new Date(),
    deviceModel: data.deviceModel || 'Unknown',
    
    weight: data.weight,
    height: data.height,
    age: data.age,
    gender: data.gender,
    
    bodyFatMass: data.bodyFatMass,
    bodyFatPercentage: data.bodyFatPercentage || (data.bodyFatMass / data.weight * 100),
    skeletalMuscleMass: data.skeletalMuscleMass,
    musclePercentage: calculateDerived ? (data.skeletalMuscleMass / data.weight * 100) : 
                      data.musclePercentage || (data.skeletalMuscleMass / data.weight * 100),
    visceralFatLevel: data.visceralFatLevel || 1,
    
    totalBodyWater: data.totalBodyWater || 0,
    intracellularWater: data.intracellularWater || 0,
    extracellularWater: data.extracellularWater || 0,
    minerals: data.minerals || 0,
    protein: data.protein || 0,
    
    segmentalMuscle: data.segmentalMuscle || {
      rightArm: 0,
      leftArm: 0,
      trunk: 0,
      rightLeg: 0,
      leftLeg: 0
    },
    
    segmentalFat: data.segmentalFat || {
      rightArm: 0,
      leftArm: 0,
      trunk: 0,
      rightLeg: 0,
      leftLeg: 0
    },
    
    bmi: calculateDerived && !data.bmi ? 
         calculateBMI(data.weight, data.height) : 
         data.bmi || calculateBMI(data.weight, data.height),
    bmr: data.bmr || 0,
    bodyType: data.bodyType,
    fitnessScore: data.fitnessScore,
    
    muscleImbalance: calculateImbalance({ segmentalMuscle: data.segmentalMuscle } as InBodyMetrics)
  };
  
  return metrics;
}

/**
 * Calculate BMI
 */
function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

/**
 * Calculate muscle imbalance
 */
export function calculateImbalance(metrics: InBodyMetrics): ImbalanceMetrics {
  const { segmentalMuscle } = metrics;
  
  if (!segmentalMuscle || Object.values(segmentalMuscle).every(v => v === 0)) {
    return {
      upperBody: 0,
      lowerBody: 0,
      leftRight: 0,
      severity: 'none'
    };
  }
  
  // Calculate upper body imbalance (arms)
  const upperDiff = Math.abs(segmentalMuscle.rightArm - segmentalMuscle.leftArm);
  const upperAvg = (segmentalMuscle.rightArm + segmentalMuscle.leftArm) / 2;
  const upperImbalance = upperAvg > 0 ? (upperDiff / upperAvg) * 100 : 0;
  
  // Calculate lower body imbalance (legs)
  const lowerDiff = Math.abs(segmentalMuscle.rightLeg - segmentalMuscle.leftLeg);
  const lowerAvg = (segmentalMuscle.rightLeg + segmentalMuscle.leftLeg) / 2;
  const lowerImbalance = lowerAvg > 0 ? (lowerDiff / lowerAvg) * 100 : 0;
  
  // Calculate overall left-right imbalance
  const totalRight = segmentalMuscle.rightArm + segmentalMuscle.rightLeg;
  const totalLeft = segmentalMuscle.leftArm + segmentalMuscle.leftLeg;
  const totalDiff = Math.abs(totalRight - totalLeft);
  const totalAvg = (totalRight + totalLeft) / 2;
  const leftRightImbalance = totalAvg > 0 ? (totalDiff / totalAvg) * 100 : 0;
  
  // Determine severity
  const maxImbalance = Math.max(upperImbalance, lowerImbalance, leftRightImbalance);
  let severity: 'none' | 'mild' | 'moderate' | 'severe';
  
  if (maxImbalance < 5) severity = 'none';
  else if (maxImbalance < 15) severity = 'mild';
  else if (maxImbalance < 25) severity = 'moderate';
  else severity = 'severe';
  
  return {
    upperBody: upperImbalance,
    lowerBody: lowerImbalance,
    leftRight: leftRightImbalance,
    severity
  };
}

/**
 * Validate metrics against rules
 */
export function validateMetrics(
  metrics: InBodyMetrics,
  rules: ValidationRules
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate body fat percentage
  if (metrics.bodyFatPercentage < rules.bodyFatPercentage.min || 
      metrics.bodyFatPercentage > rules.bodyFatPercentage.max) {
    errors.push(`Body fat percentage out of range (${rules.bodyFatPercentage.min}-${rules.bodyFatPercentage.max}%)`);
  }
  
  // Validate muscle mass
  if (metrics.skeletalMuscleMass < rules.muscleMass.min || 
      metrics.skeletalMuscleMass > rules.muscleMass.max) {
    errors.push(`Muscle mass out of range (${rules.muscleMass.min}-${rules.muscleMass.max}kg)`);
  }
  
  // Validate visceral fat
  if (metrics.visceralFatLevel < rules.visceralFat.min || 
      metrics.visceralFatLevel > rules.visceralFat.max) {
    errors.push(`Visceral fat level out of range (${rules.visceralFat.min}-${rules.visceralFat.max})`);
  }
  
  // Validate BMI
  if (metrics.bmi < rules.bmi.min || metrics.bmi > rules.bmi.max) {
    errors.push(`BMI out of range (${rules.bmi.min}-${rules.bmi.max})`);
  }
  
  // Validate age
  if (metrics.age < rules.age.min || metrics.age > rules.age.max) {
    errors.push(`Age out of range (${rules.age.min}-${rules.age.max})`);
  }
  
  // Validate weight
  if (metrics.weight < rules.weight.min || metrics.weight > rules.weight.max) {
    errors.push(`Weight out of range (${rules.weight.min}-${rules.weight.max}kg)`);
  }
  
  // Validate muscle imbalance
  if (metrics.muscleImbalance) {
    const maxImbalance = Math.max(
      metrics.muscleImbalance.upperBody,
      metrics.muscleImbalance.lowerBody,
      metrics.muscleImbalance.leftRight
    );
    
    if (maxImbalance > rules.maxImbalance) {
      errors.push(`Muscle imbalance exceeds maximum (${rules.maxImbalance}%)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normalize units from imperial to metric
 */
export function normalizeUnits(data: any): any {
  const normalized = { ...data };
  
  if (data.unit === 'lbs' || data.unit === 'imperial') {
    // Convert pounds to kg
    if (normalized.weight) {
      normalized.weight = normalized.weight * 0.453592;
    }
  }
  
  if (data.unit === 'inches' || data.unit === 'imperial') {
    // Convert inches to cm
    if (normalized.height) {
      normalized.height = normalized.height * 2.54;
    }
  }
  
  return normalized;
}