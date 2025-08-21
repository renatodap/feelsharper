/**
 * AI Coach API Endpoint
 * Handles coaching queries with confidence-based responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { coachingEngine, UserContext } from '@/lib/ai-coach/coaching-engine';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
    const { message, context: providedContext } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Build user context from database
    const userContext = await buildUserContext(user.id, supabase, providedContext);
    
    // Generate coaching response
    const response = await coachingEngine.generateResponse(message, userContext);
    
    // Log the interaction for learning
    await logCoachingInteraction(user.id, message, response, supabase);
    
    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Coaching API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching response' },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive user context from database
 */
async function buildUserContext(
  userId: string,
  supabase: any,
  providedContext?: Partial<UserContext>
): Promise<UserContext> {
  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Fetch recent activity logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);
  
  // Get last meal
  const { data: lastMeal } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_type', 'nutrition')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // Get last workout
  const { data: lastWorkout } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .in('activity_type', ['cardio', 'strength', 'sport'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // Get last sleep log
  const { data: lastSleep } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_type', 'sleep')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // Extract patterns from user's detected_patterns
  const patterns = profile?.detected_patterns || {};
  
  // Build the context object
  const context: UserContext = {
    profile: {
      userType: profile?.user_type || 'sport', // Default to sport for tennis players
      dietary: profile?.preferences?.dietary || [],
      goals: profile?.preferences?.goals || [],
      constraints: profile?.preferences?.constraints || []
    },
    recentLogs: recentLogs?.map((log: any) => ({
      id: log.id,
      timestamp: new Date(log.created_at),
      type: log.activity_type,
      data: log.structured_data,
      confidenceLevel: log.confidence_level,
      originalText: log.original_text,
      subjectiveNotes: log.subjective_notes
    })) || [],
    patterns: {
      preMatchMeals: patterns.preMatchMeals,
      recoveryStrategies: patterns.recoveryStrategies,
      typicalSleepHours: patterns.typicalSleepHours,
      exerciseFrequency: patterns.exerciseFrequency,
      stressResponse: patterns.stressResponse
    },
    lastMeal: lastMeal ? {
      timestamp: new Date(lastMeal.created_at),
      description: lastMeal.original_text
    } : undefined,
    lastWorkout: lastWorkout ? {
      timestamp: new Date(lastWorkout.created_at),
      type: lastWorkout.activity_type,
      intensity: lastWorkout.structured_data?.intensity || 5
    } : undefined,
    lastSleep: lastSleep ? {
      hours: lastSleep.structured_data?.hours || 0,
      quality: lastSleep.structured_data?.quality || 5
    } : undefined
  };
  
  // Merge with any provided context
  if (providedContext) {
    return { ...context, ...providedContext };
  }
  
  return context;
}

/**
 * Log coaching interaction for continuous learning
 */
async function logCoachingInteraction(
  userId: string,
  message: string,
  response: any,
  supabase: any
): Promise<void> {
  try {
    await supabase.from('coaching_interactions').insert({
      user_id: userId,
      user_message: message,
      coach_response: response.message,
      confidence_level: response.confidence,
      clarifying_question: response.clarifyingQuestion,
      action_items: response.actionItems,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log coaching interaction:', error);
    // Don't throw - logging failure shouldn't break the response
  }
}

/**
 * GET endpoint for retrieving coaching history
 */
export async function GET(request: NextRequest) {
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch coaching history
    const { data: interactions, error } = await supabase
      .from('coaching_interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      interactions,
      pagination: {
        limit,
        offset,
        hasMore: interactions?.length === limit
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch coaching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching history' },
      { status: 500 }
    );
  }
}