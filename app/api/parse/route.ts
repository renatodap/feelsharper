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
    
    // Parse request body
    const { text, source = 'chat' } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }
    
    // Simple router to detect input type
    let parsed;
    
    // Check for food-related keywords
    const foodKeywords = ['ate', 'eaten', 'breakfast', 'lunch', 'dinner', 'snack', 
                          'eggs', 'toast', 'chicken', 'rice', 'salad', 'pizza', 
                          'coffee', 'water', 'juice', 'calories', 'meal'];
    
    // Check for workout-related keywords
    const workoutKeywords = ['ran', 'run', 'walked', 'walk', 'lifted', 'workout', 
                            'exercise', 'gym', 'squat', 'bench', 'deadlift', 
                            'cardio', 'bike', 'swim', 'yoga', 'sets', 'reps', 'km', 'miles'];
    
    // Check for weight keywords
    const weightKeywords = ['weight', 'weigh', 'kg', 'lbs', 'pounds', 'kilos'];
    
    const lowerText = text.toLowerCase();
    const hasFood = foodKeywords.some(keyword => lowerText.includes(keyword));
    const hasWorkout = workoutKeywords.some(keyword => lowerText.includes(keyword));
    const hasWeight = weightKeywords.some(keyword => lowerText.includes(keyword));
    
    // Route to appropriate parser
    if (hasFood && !hasWorkout) {
      // Use EnhancedFoodParser
      const foodParser = new EnhancedFoodParser();
      const foodResult = await foodParser.parseNaturalLanguage(text);
      
      parsed = {
        type: 'nutrition',
        confidence: foodResult.confidence,
        structuredData: {
          foods: foodResult.foods,
          meal_type: foodResult.meal_type,
          calories: foodResult.total_calories,
          protein: foodResult.total_protein,
          carbs: foodResult.total_carbs,
          fat: foodResult.total_fat
        },
        subjectiveNotes: foodResult.suggestions?.join(', '),
        timestamp: new Date()
      };
    } else if (hasWorkout && !hasFood) {
      // Use WorkoutParser (simplified for MVP)
      const workoutParser = new WorkoutParser();
      // For MVP, create minimal valid context
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
      
      try {
        const workoutResult = await workoutParser.process(text, context, config);
        parsed = {
          type: 'cardio', // Default to cardio for MVP
          confidence: workoutResult.confidence,
          structuredData: workoutResult.data,
          timestamp: new Date()
        };
      } catch (workoutError) {
        // Fallback to simple parsing
        parsed = {
          type: 'cardio',
          confidence: 70,
          structuredData: {
            activity: text,
            duration_minutes: 30
          },
          timestamp: new Date()
        };
      }
    } else if (hasWeight) {
      // Simple weight parsing
      const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?|kilos?)?/i);
      if (weightMatch) {
        const value = parseFloat(weightMatch[1]);
        const unit = weightMatch[2]?.toLowerCase().includes('lb') || 
                    weightMatch[2]?.toLowerCase().includes('pound') ? 'lbs' : 'kg';
        
        parsed = {
          type: 'weight',
          confidence: 95,
          structuredData: {
            weight: value,
            unit: unit
          },
          timestamp: new Date()
        };
      } else {
        // Fallback to original parser
        parsed = await parseNaturalLanguage(text, user.id);
      }
    } else {
      // Fallback to original parser for complex or unclear inputs
      parsed = await parseNaturalLanguage(text, user.id);
    }
    
    // Store in database - using actual Supabase schema columns
    // Ensure sport/exercise names are preserved in the data
    const dataToStore = {
      ...parsed.structuredData,
      // Preserve sport_name or exercise_name if present (cast to any for flexibility)
      sport_name: (parsed.structuredData as any)?.sport_name,
      exercise_name: (parsed.structuredData as any)?.exercise_name
    };

    const { data: activityLog, error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        type: parsed.type,  // Use correct type field
        raw_text: text,     // Use correct raw_text field
        confidence: parsed.confidence / 100,  // Convert to 0-1 range as per schema
        data: dataToStore,  // Use correct data field with sport/exercise preserved
        metadata: {
          source,
          subjective_notes: parsed.subjectiveNotes,
          sport_name: (parsed.structuredData as any)?.sport_name,  // Also store in metadata for easy access
          exercise_name: (parsed.structuredData as any)?.exercise_name
        },
        timestamp: parsed.timestamp || new Date()  // Use correct timestamp field
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
    
    // Update user's common logs if this is a frequent pattern
    await updateCommonLogs(user.id, text, supabase);
    
    return NextResponse.json({
      success: true,
      activity: activityLog,
      parsed,
      message: generateConfirmationMessage(parsed)
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