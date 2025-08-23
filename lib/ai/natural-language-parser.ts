import { parseNaturalLanguage as parseWithAI } from './ai-client';

export interface ParsedActivity {
  type: 'cardio' | 'strength' | 'sport' | 'wellness' | 'nutrition' | 'sleep' | 'mood' | 'weight';
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low'; // Phase 8.3: Categorical confidence
  structuredData: Record<string, any>;
  subjectiveNotes?: string;
  timestamp?: Date;
  // Phase 8.3: Enhanced confidence details
  confidenceFactors?: {
    data_completeness: number; // 0-100: How complete the extracted data is
    intent_clarity: number;    // 0-100: How clear the user's intent is
    context_match: number;     // 0-100: How well it matches expected patterns
    ambiguity_score: number;   // 0-100: How ambiguous the input is (lower = better)
  };
  missingContext?: string[];   // What context would improve confidence
}

export async function parseNaturalLanguage(input: string, userId?: string): Promise<ParsedActivity> {
  try {
    const result = await parseWithAI({
      text: input,
      taskType: 'parse',
      userId
    });

    if (result.success && result.data) {
      const baseActivity = {
        type: result.data.structured_data?.activity_type || 'wellness',
        confidence: result.confidence,
        structuredData: result.data.structured_data || {},
        subjectiveNotes: result.data.subjective_notes,
        timestamp: result.data.timestamp ? new Date(result.data.timestamp) : undefined
      };

      // Phase 8.3: Calculate enhanced confidence metrics
      return enhanceWithConfidenceMetrics(baseActivity, input, result);
    } else {
      throw new Error(result.error || 'AI parsing failed');
    }
  } catch (error) {
    console.error('Natural language parsing error:', error);
    
    // Fallback parsing for common patterns
    const fallback = fallbackParser(input);
    return enhanceWithConfidenceMetrics(fallback, input);
  }
}

function fallbackParser(input: string): ParsedActivity {
  const lowerInput = input.toLowerCase();
  
  // Weight patterns
  if (lowerInput.includes('weight') || lowerInput.includes('weigh')) {
    const weightMatch = input.match(/(\d+\.?\d*)\s*(lbs?|kg|pounds?|kilos?)?/i);
    if (weightMatch) {
      return {
        type: 'weight',
        confidence: 70,
        confidenceLevel: 'medium',
        structuredData: {
          weight: parseFloat(weightMatch[1]),
          unit: weightMatch[2]?.includes('k') ? 'kg' : 'lbs'
        }
      };
    }
  }
  
  // Sleep patterns
  if (lowerInput.includes('slept') || lowerInput.includes('sleep')) {
    const hoursMatch = input.match(/(\d+\.?\d*)\s*hours?/i);
    if (hoursMatch) {
      return {
        type: 'sleep',
        confidence: 70,
        confidenceLevel: 'medium',
        structuredData: {
          hours: parseFloat(hoursMatch[1]),
          quality: lowerInput.includes('well') ? 8 : 5
        }
      };
    }
  }
  
  // Exercise patterns
  if (lowerInput.includes('ran') || lowerInput.includes('run')) {
    const distanceMatch = input.match(/(\d+\.?\d*)\s*(k|km|mi|miles?)?/i);
    const timeMatch = input.match(/(\d+):?(\d+)?/);
    
    return {
      type: 'cardio',
      confidence: 60,
      confidenceLevel: 'medium',
      structuredData: {
        activity: 'running',
        distance: distanceMatch ? parseFloat(distanceMatch[1]) : undefined,
        distanceUnit: distanceMatch?.[2]?.includes('mi') ? 'miles' : 'km',
        duration: timeMatch ? parseInt(timeMatch[1]) + (timeMatch[2] ? parseInt(timeMatch[2])/60 : 0) : undefined
      }
    };
  }
  
  // Default to mood if unclear
  return {
    type: 'mood',
    confidence: 30,
    confidenceLevel: 'low',
    structuredData: {
      mood: 'neutral',
      notes: input
    },
    subjectiveNotes: input
  };
}

/**
 * Phase 8.3: Enhanced confidence scoring system
 * Calculates detailed confidence metrics and categorical levels
 */
function enhanceWithConfidenceMetrics(
  activity: Partial<ParsedActivity>, 
  input: string, 
  aiResult?: any
): ParsedActivity {
  const inputLength = input.trim().length;
  const wordCount = input.trim().split(/\s+/).length;
  const structuredData = activity.structuredData || {};
  
  // Calculate confidence factors (0-100 scale)
  const confidenceFactors = {
    // Data completeness: How much structured data was extracted
    data_completeness: calculateDataCompleteness(structuredData, activity.type!),
    
    // Intent clarity: How clear the user's intent is based on keywords and structure
    intent_clarity: calculateIntentClarity(input, activity.type!),
    
    // Context match: How well the input matches expected patterns for this activity type
    context_match: calculateContextMatch(input, activity.type!, structuredData),
    
    // Ambiguity score: How ambiguous the input is (lower = better)
    ambiguity_score: calculateAmbiguityScore(input, aiResult)
  };
  
  // Calculate overall confidence if not already provided
  let finalConfidence = activity.confidence || 50;
  if (!activity.confidence) {
    finalConfidence = Math.round(
      (confidenceFactors.data_completeness * 0.3 +
       confidenceFactors.intent_clarity * 0.3 +
       confidenceFactors.context_match * 0.25 +
       (100 - confidenceFactors.ambiguity_score) * 0.15)
    );
  }
  
  // Determine categorical confidence level
  const confidenceLevel: 'high' | 'medium' | 'low' = 
    finalConfidence >= 80 ? 'high' :
    finalConfidence >= 60 ? 'medium' : 'low';
  
  // Identify missing context that would improve confidence
  const missingContext = identifyMissingContext(activity.type!, structuredData, input);
  
  return {
    ...activity,
    confidence: finalConfidence,
    confidenceLevel,
    confidenceFactors,
    missingContext
  } as ParsedActivity;
}

/**
 * Calculate how complete the extracted structured data is for the activity type
 */
function calculateDataCompleteness(data: Record<string, any>, activityType: string): number {
  const requiredFields = getRequiredFieldsByType(activityType);
  const optionalFields = getOptionalFieldsByType(activityType);
  
  let score = 0;
  let requiredFound = 0;
  let optionalFound = 0;
  
  // Check required fields (70% of score)
  for (const field of requiredFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      requiredFound++;
    }
  }
  score += (requiredFound / Math.max(requiredFields.length, 1)) * 70;
  
  // Check optional fields (30% of score)
  for (const field of optionalFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      optionalFound++;
    }
  }
  score += (optionalFound / Math.max(optionalFields.length, 1)) * 30;
  
  return Math.min(100, score);
}

/**
 * Calculate how clear the user's intent is based on keywords and structure
 */
function calculateIntentClarity(input: string, activityType: string): number {
  const lowerInput = input.toLowerCase();
  const strongKeywords = getStrongKeywordsByType(activityType);
  const weakKeywords = getWeakKeywordsByType(activityType);
  
  let score = 40; // Base score
  
  // Check for strong keywords (50 points max)
  let strongMatches = 0;
  for (const keyword of strongKeywords) {
    if (lowerInput.includes(keyword)) {
      strongMatches++;
    }
  }
  score += Math.min(50, strongMatches * 15);
  
  // Check for weak keywords (20 points max)
  let weakMatches = 0;
  for (const keyword of weakKeywords) {
    if (lowerInput.includes(keyword)) {
      weakMatches++;
    }
  }
  score += Math.min(20, weakMatches * 5);
  
  // Sentence structure bonus
  if (input.includes('did') || input.includes('went') || input.includes('ate') || input.includes('slept')) {
    score += 10; // Clear past tense action
  }
  
  return Math.min(100, score);
}

/**
 * Calculate how well the input matches expected patterns for this activity type
 */
function calculateContextMatch(input: string, activityType: string, data: Record<string, any>): number {
  const lowerInput = input.toLowerCase();
  let score = 50; // Base score
  
  switch (activityType) {
    case 'cardio':
      // Look for time, distance, pace, heart rate
      if (/\d+:\d+|\d+\s*min/.test(input)) score += 20; // Time format
      if (/\d+\.?\d*\s*(mi|km|k)/.test(input)) score += 20; // Distance
      if (/\d+\s*mph|pace|bpm/.test(lowerInput)) score += 15; // Pace/HR
      break;
      
    case 'strength':
      // Look for sets, reps, weight
      if (/\d+\s*x\s*\d+|\d+\s*sets|\d+\s*reps/.test(lowerInput)) score += 25;
      if (/\d+\s*(lbs?|kg|pounds?)/.test(lowerInput)) score += 20;
      if (/bench|squat|deadlift|press|curl/.test(lowerInput)) score += 15;
      break;
      
    case 'nutrition':
      // Look for meal names, food items, quantities
      if (/(breakfast|lunch|dinner|snack)/.test(lowerInput)) score += 20;
      if (/\d+\s*(cups?|oz|grams?|servings?)/.test(lowerInput)) score += 15;
      if (/(ate|had|consumed|drank)/.test(lowerInput)) score += 15;
      break;
      
    case 'sleep':
      // Look for hours, quality indicators
      if (/\d+\.?\d*\s*hours?/.test(lowerInput)) score += 30;
      if (/(well|poorly|tired|rested|quality)/.test(lowerInput)) score += 15;
      break;
      
    case 'weight':
      // Look for weight values and units
      if (/\d+\.?\d*\s*(lbs?|kg|pounds?)/.test(lowerInput)) score += 40;
      if (/(weigh|weight|scale)/.test(lowerInput)) score += 15;
      break;
  }
  
  return Math.min(100, score);
}

/**
 * Calculate how ambiguous the input is (lower = better)
 */
function calculateAmbiguityScore(input: string, aiResult?: any): number {
  let ambiguity = 0;
  
  // Short inputs are often ambiguous
  if (input.trim().length < 10) ambiguity += 30;
  else if (input.trim().length < 5) ambiguity += 50;
  
  // Very long inputs can be ambiguous
  if (input.trim().length > 200) ambiguity += 20;
  
  // Multiple activity types mentioned
  const activityKeywords = ['run', 'lift', 'eat', 'sleep', 'weight', 'workout'];
  const foundKeywords = activityKeywords.filter(keyword => 
    input.toLowerCase().includes(keyword)
  );
  if (foundKeywords.length > 2) ambiguity += 25;
  
  // Vague language
  const vagueWords = ['some', 'maybe', 'kind of', 'sort of', 'probably', 'think'];
  for (const word of vagueWords) {
    if (input.toLowerCase().includes(word)) {
      ambiguity += 10;
    }
  }
  
  // Questions are often seeking clarification
  if (input.includes('?')) ambiguity += 15;
  
  // AI confidence can indicate ambiguity
  if (aiResult && aiResult.confidence < 60) {
    ambiguity += (60 - aiResult.confidence) / 2;
  }
  
  return Math.min(100, ambiguity);
}

/**
 * Identify missing context that would improve confidence
 */
function identifyMissingContext(activityType: string, data: Record<string, any>, input: string): string[] {
  const missing: string[] = [];
  
  switch (activityType) {
    case 'cardio':
      if (!data.duration && !data.time) missing.push('workout_duration');
      if (!data.distance) missing.push('distance_covered');
      if (!data.intensity && !data.pace) missing.push('intensity_level');
      break;
      
    case 'strength':
      if (!data.sets && !data.reps) missing.push('sets_and_reps');
      if (!data.weight) missing.push('weight_used');
      if (!data.exercise_name && !data.exercises) missing.push('specific_exercises');
      break;
      
    case 'nutrition':
      if (!data.meal && !data.food) missing.push('food_items');
      if (!data.meal_type) missing.push('meal_timing');
      if (!data.quantity && !data.servings) missing.push('portion_size');
      break;
      
    case 'sleep':
      if (!data.hours && !data.duration) missing.push('sleep_duration');
      if (!data.quality) missing.push('sleep_quality');
      break;
      
    case 'weight':
      if (!data.weight) missing.push('weight_value');
      if (!data.unit) missing.push('weight_unit');
      break;
  }
  
  return missing;
}

// Helper functions for field requirements by activity type
function getRequiredFieldsByType(type: string): string[] {
  switch (type) {
    case 'cardio': return ['activity', 'duration'];
    case 'strength': return ['exercise_name'];
    case 'nutrition': return ['meal', 'food'];
    case 'sleep': return ['hours'];
    case 'weight': return ['weight'];
    case 'mood': return ['mood'];
    default: return [];
  }
}

function getOptionalFieldsByType(type: string): string[] {
  switch (type) {
    case 'cardio': return ['distance', 'pace', 'heart_rate', 'calories'];
    case 'strength': return ['sets', 'reps', 'weight', 'rest_time'];
    case 'nutrition': return ['calories', 'protein', 'carbs', 'fat', 'meal_type'];
    case 'sleep': return ['quality', 'bedtime', 'wake_time'];
    case 'weight': return ['unit', 'body_fat', 'muscle_mass'];
    case 'mood': return ['energy', 'stress', 'notes'];
    default: return [];
  }
}

function getStrongKeywordsByType(type: string): string[] {
  switch (type) {
    case 'cardio': return ['ran', 'running', 'jogged', 'cycled', 'biked', 'swam', 'swimming'];
    case 'strength': return ['lifted', 'bench', 'squat', 'deadlift', 'curls', 'press'];
    case 'nutrition': return ['ate', 'had', 'consumed', 'breakfast', 'lunch', 'dinner'];
    case 'sleep': return ['slept', 'sleep', 'bedtime', 'woke up'];
    case 'weight': return ['weigh', 'weight', 'scale', 'pounds', 'kg'];
    case 'mood': return ['feeling', 'mood', 'energy', 'stressed', 'happy', 'tired'];
    default: return [];
  }
}

function getWeakKeywordsByType(type: string): string[] {
  switch (type) {
    case 'cardio': return ['exercise', 'workout', 'training', 'cardio'];
    case 'strength': return ['gym', 'weights', 'strength', 'muscle'];
    case 'nutrition': return ['food', 'meal', 'snack', 'protein', 'calories'];
    case 'sleep': return ['tired', 'rest', 'bed', 'night'];
    case 'weight': return ['heavy', 'light', 'lost', 'gained'];
    case 'mood': return ['good', 'bad', 'okay', 'fine'];
    default: return [];
  }
}