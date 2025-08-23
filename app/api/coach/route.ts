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
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // Fetch recent activity logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', sevenDaysAgo.toISOString())
    .order('timestamp', { ascending: false })
    .limit(100);
  
  // Get last meal
  const { data: lastMeal } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'food')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  // Get last workout
  const { data: lastWorkout } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'exercise')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  // Get last sleep log
  const { data: lastSleep } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'sleep')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  // Extract patterns from user's secondary_goals or detected patterns
  const patterns = profile?.secondary_goals?.detected_patterns || {};
  
  // Build the context object
  const context: UserContext = {
    profile: {
      userType: profile?.primary_goal || 'sport', // Default to sport for tennis players
      dietary: profile?.secondary_goals?.dietary || [],
      goals: [profile?.primary_goal].filter(Boolean) || [],
      constraints: profile?.secondary_goals?.constraints || []
    },
    recentLogs: recentLogs?.map((log: any) => ({
      id: log.id,
      timestamp: new Date(log.timestamp),
      type: log.type,
      data: log.data,
      confidenceLevel: log.confidence,
      originalText: log.raw_text,
      subjectiveNotes: log.metadata?.subjective_notes
    })) || [],
    patterns: {
      preMatchMeals: patterns.preMatchMeals,
      recoveryStrategies: patterns.recoveryStrategies,
      typicalSleepHours: patterns.typicalSleepHours,
      exerciseFrequency: patterns.exerciseFrequency,
      stressResponse: patterns.stressResponse
    },
    lastMeal: lastMeal ? {
      timestamp: new Date(lastMeal.timestamp),
      description: lastMeal.raw_text
    } : undefined,
    lastWorkout: lastWorkout ? {
      timestamp: new Date(lastWorkout.timestamp),
      type: lastWorkout.type,
      intensity: lastWorkout.data?.intensity || 5
    } : undefined,
    lastSleep: lastSleep ? {
      hours: lastSleep.data?.hours || 0,
      quality: lastSleep.data?.quality || 5
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