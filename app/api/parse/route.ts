import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/ai/natural-language-parser';
import { createClient } from '@/lib/supabase/server';
import { EnhancedFoodParser } from '@/lib/ai/parsers/EnhancedFoodParser';
import { WorkoutParser } from '@/lib/ai/parsers/WorkoutParser';
import { AIContext } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body - support both old and new format
    const body = await request.json();
    const { 
      text, 
      raw, 
      type: typeOverride, 
      occurred_at, 
      source = 'chat' 
    } = body;
    
    // Support both 'text' and 'raw' field names
    const inputText = raw || text;
    
    if (!inputText) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }
    
    // Validate occurred_at if provided
    let timestamp = new Date();
    if (occurred_at) {
      const providedDate = new Date(occurred_at);
      // Reject future dates
      if (providedDate > new Date()) {
        console.warn('Future date rejected, using current time');
      } else {
        timestamp = providedDate;
      }
    }
    
    // Check if multiple activities (comma-separated)
    const hasMultiple = inputText.includes(',') && inputText.split(',').length > 1;
    
    if (hasMultiple) {
      // Parse multiple activities
      const activities = inputText.split(',').map(segment => segment.trim());
      const parsedActivities = [];
      
      for (const activity of activities) {
        const parsed = await parseActivity(activity, typeOverride, user, timestamp);
        if (parsed) {
          parsedActivities.push(parsed);
        }
      }
      
      return NextResponse.json({
        success: true,
        activities: parsedActivities,
        message: `Logged ${parsedActivities.length} activities`
      });
    }
    
    // Single activity parsing
    const parsed = await parseActivity(inputText, typeOverride, user, timestamp);
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Failed to parse input' },
        { status: 500 }
      );
    }
    
    // Store in database
    const { data: activityLog, error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        type: parsed.type,
        raw_text: inputText,
        confidence: parsed.confidence / 100,
        data: parsed.fields,
        metadata: {
          source,
          type_override: typeOverride,
          occurred_at: occurred_at
        },
        timestamp: timestamp
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save activity' },
        { status: 500 }
      );
    }
    
    // Update user's common logs
    await updateCommonLogs(user.id, inputText, supabase);
    
    return NextResponse.json({
      success: true,
      type: parsed.type,
      fields: parsed.fields,
      confidence: parsed.confidence,
      timestamp: timestamp.toISOString(),
      message: parsed.message,
      activity: activityLog
    });
    
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to parse input' },
      { status: 500 }
    );
  }
}

/**
 * Parse a single activity with optional type override
 */
async function parseActivity(
  text: string, 
  typeOverride: string | undefined,
  user: any,
  timestamp: Date
) {
  // Check for keywords to detect type
  const foodKeywords = ['ate', 'eaten', 'breakfast', 'lunch', 'dinner', 'snack', 
                        'eggs', 'toast', 'chicken', 'rice', 'salad', 'pizza', 
                        'coffee', 'water', 'juice', 'calories', 'meal'];
  
  const workoutKeywords = ['ran', 'run', 'walked', 'walk', 'lifted', 'workout', 
                          'exercise', 'gym', 'squat', 'bench', 'deadlift', 
                          'cardio', 'bike', 'swim', 'yoga', 'sets', 'reps', 'km', 'miles'];
  
  const weightKeywords = ['weight', 'weigh', 'kg', 'lbs', 'pounds', 'kilos'];
  
  const lowerText = text.toLowerCase();
  const hasFood = foodKeywords.some(keyword => lowerText.includes(keyword));
  const hasWorkout = workoutKeywords.some(keyword => lowerText.includes(keyword));
  const hasWeight = weightKeywords.some(keyword => lowerText.includes(keyword));
  
  // Apply type override if valid
  let detectedType = 'unknown';
  if (typeOverride) {
    // Validate override makes sense for input
    const validOverride = validateTypeOverride(text, typeOverride);
    if (validOverride) {
      detectedType = typeOverride;
    }
  }
  
  // Auto-detect type if no valid override
  if (detectedType === 'unknown') {
    if (hasWeight && !hasWorkout) {
      detectedType = 'weight';
    } else if (hasFood && !hasWorkout) {
      detectedType = 'nutrition';
    } else if (hasWorkout && !hasFood) {
      const strengthKeywords = ['bench', 'squat', 'deadlift', 'press', 'sets', 'reps', 'lift'];
      const isStrength = strengthKeywords.some(k => lowerText.includes(k));
      detectedType = isStrength ? 'strength' : 'cardio';
    } else {
      detectedType = 'mood'; // Default for ambiguous
    }
  }
  
  // Parse based on detected type
  let parsed: any = null;
  
  if (detectedType === 'weight') {
    // Simple weight parsing
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?|kilos?)?/i);
    if (weightMatch) {
      const value = parseFloat(weightMatch[1]);
      const unit = weightMatch[2]?.toLowerCase().includes('kg') || 
                  weightMatch[2]?.toLowerCase().includes('kilo') ? 'kg' : 'lbs';
      
      parsed = {
        type: 'weight',
        confidence: 95,
        fields: {
          weight: value,
          unit: unit
        },
        message: `Weight logged: ${value} ${unit}`
      };
    } else if (typeOverride === 'weight') {
      // Try to parse as just a number
      const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        const value = parseFloat(numberMatch[1]);
        parsed = {
          type: 'weight',
          confidence: 80,
          fields: {
            weight: value,
            unit: 'lbs' // Default unit
          },
          message: `Weight logged: ${value} lbs`
        };
      }
    }
  } else if (detectedType === 'nutrition') {
    // Use EnhancedFoodParser
    try {
      const foodParser = new EnhancedFoodParser();
      const foodResult = await foodParser.parseNaturalLanguage(text);
      
      parsed = {
        type: 'nutrition',
        confidence: foodResult.confidence,
        fields: {
          foods: foodResult.foods,
          meal_type: foodResult.meal_type,
          calories: foodResult.total_calories,
          protein: foodResult.total_protein,
          carbs: foodResult.total_carbs,
          fat: foodResult.total_fat
        },
        message: `Food logged: ${foodResult.foods.length} item(s)`
      };
    } catch (error) {
      // Fallback parsing
      parsed = {
        type: 'nutrition',
        confidence: 70,
        fields: {
          foods: [{ name: text, quantity: 1, unit: 'serving' }],
          meal: text
        },
        message: `Food logged: ${text}`
      };
    }
  } else if (detectedType === 'cardio' || detectedType === 'strength') {
    // Use WorkoutParser for exercise
    try {
      const workoutParser = new WorkoutParser();
      const context: AIContext = {
        userId: user.id,
        profile: {
          id: user.id,
          email: user.email || '',
          tier: 'free'
        },
        recentWorkouts: [],
        recentNutrition: [],
        bodyMetrics: [],
        goals: [],
        patterns: [],
        conversations: []
      };
      const config = {
        model: 'gpt-3.5-turbo' as const,
        temperature: 0.2,
        max_tokens: 1000
      };
      
      const workoutResult = await workoutParser.process(text, context, config);
      parsed = {
        type: detectedType,
        confidence: workoutResult.confidence,
        fields: workoutResult.data,
        message: `${detectedType === 'strength' ? 'Strength training' : 'Cardio'} logged`
      };
    } catch (workoutError) {
      // Fallback to simple parsing
      parsed = {
        type: detectedType,
        confidence: 70,
        fields: {
          activity: text,
          exercise: text,
          duration_minutes: 30
        },
        message: `Exercise logged: ${text}`
      };
    }
  } else if (detectedType === 'mood') {
    // Simple mood parsing
    parsed = {
      type: 'mood',
      confidence: 60,
      fields: {
        mood: text,
        notes: text
      },
      message: 'Mood logged'
    };
  } else {
    // Unknown type
    parsed = {
      type: 'unknown',
      confidence: 30,
      fields: {
        raw: text
      },
      message: 'Activity logged (unclear type)'
    };
  }
  
  return parsed;
}

/**
 * Validate if type override makes sense for the input
 */
function validateTypeOverride(text: string, typeOverride: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Don't allow overriding obvious food as weight
  if (typeOverride === 'weight') {
    const foodIndicators = ['ate', 'breakfast', 'lunch', 'dinner', 'pizza', 'salad'];
    if (foodIndicators.some(word => lowerText.includes(word))) {
      return false;
    }
    // Allow if it's just numbers or contains weight keywords
    if (/^\d+(\.\d+)?$/.test(text.trim()) || lowerText.includes('weight')) {
      return true;
    }
  }
  
  // Don't allow overriding obvious weight as food
  if (typeOverride === 'nutrition') {
    if (/^weight\s+\d+/.test(lowerText) || /^\d+\s*(kg|lbs?)$/.test(lowerText)) {
      return false;
    }
  }
  
  // Generally allow other overrides
  return true;
}

/**
 * Update user's common logs for quick actions
 */
async function updateCommonLogs(userId: string, text: string, supabase: any) {
  try {
    // Get user profile - using 'profiles' table (not user_profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)  // profiles uses 'id' not 'user_id'
      .single();
    
    const commonLogs = profile?.secondary_goals?.common_logs || [];
    
    // Find if this log already exists
    const existingIndex = commonLogs.findIndex((log: any) => 
      log.text.toLowerCase() === text.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Increment count
      commonLogs[existingIndex].count += 1;
      commonLogs[existingIndex].lastUsed = new Date();
    } else if (commonLogs.length < 10) {
      // Add new common log
      commonLogs.push({
        text,
        count: 1,
        lastUsed: new Date()
      });
    }
    
    // Sort by count and recency
    commonLogs.sort((a: any, b: any) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
    
    // Keep only top 10
    const topLogs = commonLogs.slice(0, 10);
    
    // Update profile - using 'profiles' table
    const currentSecondaryGoals = profile?.secondary_goals || {};
    await supabase
      .from('profiles')
      .update({ 
        secondary_goals: { 
          ...currentSecondaryGoals, 
          common_logs: topLogs 
        } 
      })  // Store in secondary_goals JSONB field
      .eq('id', userId);
      
  } catch (error) {
    console.error('Failed to update common logs:', error);
    // Non-critical, don't throw
  }
}

/**
 * Generate a user-friendly confirmation message
 */
function generateConfirmationMessage(parsed: any): string {
  const confidenceText = parsed.confidence >= 90 ? 'Got it!' : 
                         parsed.confidence >= 70 ? 'Logged!' : 
                         'Recorded (let me know if I misunderstood)';
  
  switch (parsed.type) {
    case 'cardio':
      const cardioName = parsed.structuredData.exercise_name || parsed.structuredData.activity || 'Cardio';
      return `${confidenceText} ${cardioName} logged.`;
    case 'strength':
      const strengthName = parsed.structuredData.exercise_name || 'Strength training';
      return `${confidenceText} ${strengthName} logged.`;
    case 'sport':
      const sportName = parsed.structuredData.sport_name || 'Sport activity';
      return `${confidenceText} ${sportName} session logged.`;
    case 'nutrition':
      return `${confidenceText} ${parsed.structuredData.meal || 'Meal'} recorded.`;
    case 'weight':
      return `${confidenceText} Weight updated to ${parsed.structuredData.weight} ${parsed.structuredData.unit}.`;
    case 'sleep':
      return `${confidenceText} ${parsed.structuredData.hours} hours of sleep logged.`;
    case 'mood':
      return `${confidenceText} Mood noted.`;
    default:
      return `${confidenceText} Activity logged.`;
  }
}