// Body composition calculations and analysis

export interface BodyCompositionData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  boneMass?: number;
  metabolicAge?: number;
  visceralFat?: number;
}

export interface BodyCompositionTrends {
  weightTrend: 'up' | 'down' | 'stable';
  bodyFatTrend: 'up' | 'down' | 'stable';
  muscleTrend: 'up' | 'down' | 'stable';
  weeklyWeightChange: number;
  monthlyWeightChange: number;
  projectedWeightIn30Days: number;
}

export interface BodyCompositionGoals {
  targetWeight?: number;
  targetBodyFat?: number;
  targetMuscle?: number;
  weeksToGoal?: number;
  requiredWeeklyChange?: number;
}

// Calculate BMI
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// BMI Category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Calculate lean body mass
export function calculateLeanMass(weight: number, bodyFatPercentage: number): number {
  return Math.round(weight * (1 - bodyFatPercentage / 100) * 10) / 10;
}

// Calculate fat mass
export function calculateFatMass(weight: number, bodyFatPercentage: number): number {
  return Math.round(weight * (bodyFatPercentage / 100) * 10) / 10;
}

// Calculate FFMI (Fat-Free Mass Index)
export function calculateFFMI(leanMass: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((leanMass / (heightM * heightM)) * 10) / 10;
}

// Get body fat category
export function getBodyFatCategory(bodyFat: number, gender: 'male' | 'female'): string {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Essential';
    if (bodyFat < 14) return 'Athletes';
    if (bodyFat < 18) return 'Fitness';
    if (bodyFat < 25) return 'Average';
    return 'Above Average';
  } else {
    if (bodyFat < 14) return 'Essential';
    if (bodyFat < 21) return 'Athletes';
    if (bodyFat < 25) return 'Fitness';
    if (bodyFat < 32) return 'Average';
    return 'Above Average';
  }
}

// Calculate trend from data points
export function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  // Simple linear regression slope
  const n = values.length;
  const xSum = (n * (n - 1)) / 2;
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
  const ySum = values.reduce((sum, y) => sum + y, 0);
  const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
  
  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  
  // Threshold for considering stable (0.1 kg per week)
  const threshold = 0.1;
  
  if (Math.abs(slope) < threshold) return 'stable';
  return slope > 0 ? 'up' : 'down';
}

// Project future weight based on trend
export function projectWeight(currentWeight: number, weeklyChange: number, weeks: number): number {
  return Math.round((currentWeight + weeklyChange * weeks) * 10) / 10;
}

// Calculate time to goal
export function calculateWeeksToGoal(
  current: number,
  target: number,
  weeklyChange: number
): number | null {
  if (weeklyChange === 0) return null;
  if ((target > current && weeklyChange < 0) || (target < current && weeklyChange > 0)) {
    return null; // Wrong direction
  }
  
  const weeks = Math.abs((target - current) / weeklyChange);
  return Math.round(weeks);
}

// Calculate required weekly change for goal
export function calculateRequiredWeeklyChange(
  current: number,
  target: number,
  weeks: number
): number {
  return Math.round(((target - current) / weeks) * 100) / 100;
}

// Get health recommendations based on body composition
export function getHealthRecommendations(data: BodyCompositionData, gender: 'male' | 'female'): string[] {
  const recommendations: string[] = [];
  
  if (data.bodyFat) {
    const category = getBodyFatCategory(data.bodyFat, gender);
    if (category === 'Above Average') {
      recommendations.push('Consider reducing body fat through caloric deficit and cardio');
    } else if (category === 'Essential') {
      recommendations.push('Body fat may be too low for optimal health');
    }
  }
  
  if (data.visceralFat && data.visceralFat > 10) {
    recommendations.push('High visceral fat detected - increase cardiovascular exercise');
  }
  
  if (data.waterPercentage && data.waterPercentage < 50) {
    recommendations.push('Hydration levels appear low - increase water intake');
  }
  
  if (data.metabolicAge && data.metabolicAge > 30) {
    recommendations.push('Metabolic age is higher than ideal - focus on strength training');
  }
  
  return recommendations;
}

// Calculate body composition score (0-100)
export function calculateBodyCompositionScore(
  data: BodyCompositionData,
  gender: 'male' | 'female'
): number {
  let score = 50; // Base score
  
  if (data.bodyFat) {
    const category = getBodyFatCategory(data.bodyFat, gender);
    if (category === 'Fitness' || category === 'Athletes') score += 20;
    else if (category === 'Average') score += 10;
    else if (category === 'Above Average') score -= 10;
  }
  
  if (data.visceralFat) {
    if (data.visceralFat <= 5) score += 10;
    else if (data.visceralFat <= 10) score += 5;
    else score -= 5;
  }
  
  if (data.waterPercentage) {
    if (data.waterPercentage >= 55) score += 10;
    else if (data.waterPercentage >= 50) score += 5;
    else score -= 5;
  }
  
  if (data.metabolicAge) {
    if (data.metabolicAge <= 25) score += 10;
    else if (data.metabolicAge <= 30) score += 5;
    else score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}