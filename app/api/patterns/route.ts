/**
 * Pattern Detection API Endpoint
 * Phase 5.2: Behavioral pattern analysis with JITAI (Just-In-Time Adaptive Interventions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { patternDetectionService, PatternDetectionResult } from '@/lib/ai-coach/pattern-detection';
import { createClient } from '@/lib/supabase/server';
import { UserContext } from '@/lib/ai-coach/coaching-engine';

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
    const daysBack = parseInt(searchParams.get('days') || '14');
    const patternType = searchParams.get('type'); // Optional filter: 'sleep_performance', 'nutrition_gap', etc.

    // Build comprehensive user context for pattern analysis
    const userContext = await buildExtendedUserContext(user.id, supabase, daysBack);

    if (userContext.recentLogs.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient data for pattern analysis',
        message: 'Need at least 10 activity logs for reliable pattern detection',
        data_points: userContext.recentLogs.length,
        recommendation: 'Continue logging activities for 3-5 more days'
      });
    }

    // Run pattern analysis
    const patternResults = await patternDetectionService.analyzePatterns(userContext);

    // Filter by pattern type if requested
    if (patternType) {
      patternResults.patterns = patternResults.patterns.filter(p => p.type === patternType);
      patternResults.interventions = patternResults.interventions.filter(i => 
        patternResults.patterns.some(p => p.type === patternType)
      );
      patternResults.recommendations = patternResults.recommendations.filter(r => 
        r.category === patternType.split('_')[0] // Extract category from pattern type
      );
    }

    // Log pattern detection request for analytics
    await logPatternDetection(user.id, patternResults, supabase);

    return NextResponse.json({
      success: true,
      patterns: patternResults.patterns,
      interventions: patternResults.interventions,
      recommendations: patternResults.recommendations,
      confidence: patternResults.confidence,
      analysis_metadata: {
        data_points: userContext.recentLogs.length,
        analysis_period: `${daysBack} days`,
        user_type: userContext.profile.userType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pattern detection API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze patterns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for requesting specific pattern analysis or interventions
 */
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
    const { 
      pattern_focus, 
      intervention_request,
      days_back = 14,
      current_mood,
      immediate_context 
    } = await request.json();

    // Build user context
    const userContext = await buildExtendedUserContext(user.id, supabase, days_back);

    // Add immediate context if provided
    if (current_mood) {
      userContext.recentLogs.unshift({
        id: 'immediate',
        timestamp: new Date(),
        type: 'mood',
        data: { score: current_mood, context: immediate_context },
        confidenceLevel: 'high',
        originalText: `Current mood: ${current_mood}/10`
      });
    }

    // Run focused pattern analysis
    const patternResults = await patternDetectionService.analyzePatterns(userContext);

    // If intervention requested, prioritize JITAI responses
    if (intervention_request) {
      const immediateInterventions = patternResults.interventions.filter(i => 
        i.intervention.urgency === 'immediate' ||
        (current_mood && current_mood < 5 && i.trigger.when_to_show === 'during_low_mood')
      );

      const adaptiveRecommendation = patternResults.recommendations.find(r => 
        pattern_focus ? r.category === pattern_focus : true
      );

      return NextResponse.json({
        success: true,
        immediate_intervention: immediateInterventions[0] || null,
        adaptive_recommendation: adaptiveRecommendation || null,
        pattern_insights: patternResults.patterns.slice(0, 3), // Top 3 most relevant
        confidence: patternResults.confidence,
        context_aware: {
          current_mood: current_mood,
          intervention_timing: 'just_in_time',
          personalized: true
        }
      });
    }

    // Standard pattern analysis response
    const focusedPatterns = pattern_focus ? 
      patternResults.patterns.filter(p => p.type === pattern_focus) :
      patternResults.patterns;

    return NextResponse.json({
      success: true,
      patterns: focusedPatterns,
      insights: {
        top_pattern: focusedPatterns[0] || null,
        actionable_recommendations: patternResults.recommendations.slice(0, 2),
        behavioral_interventions: patternResults.interventions.slice(0, 1)
      },
      confidence: patternResults.confidence
    });

  } catch (error) {
    console.error('Pattern analysis POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process pattern analysis request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Build extended user context for comprehensive pattern analysis
 */
async function buildExtendedUserContext(
  userId: string,
  supabase: any,
  daysBack: number = 14
): Promise<UserContext> {
  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Fetch user profile with all preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      user_type,
      preferences,
      detected_patterns,
      dashboard_config,
      common_logs,
      context_cache
    `)
    .eq('user_id', userId)
    .single();

  // Fetch extended activity logs
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(200); // Increased limit for pattern analysis

  // Fetch habit tracking data
  const { data: habitData } = await supabase
    .from('user_habits')
    .select(`
      *,
      habit_completions(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  // Get recent coaching interactions for context
  const { data: recentCoaching } = await supabase
    .from('coaching_interactions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  // Build comprehensive context
  const context: UserContext = {
    profile: {
      userType: profile?.user_type || 'sport',
      dietary: profile?.preferences?.dietary || [],
      goals: profile?.preferences?.goals || [],
      constraints: profile?.preferences?.constraints || [],
      identity_goals: profile?.preferences?.identity_goals || [],
      motivation_profile: profile?.preferences?.motivation_profile || {
        intrinsic_motivators: ['health', 'energy'],
        extrinsic_motivators: ['appearance'],
        motivation_style: 'data_driven',
        energy_patterns: {
          high_motivation_times: ['morning'],
          low_motivation_triggers: ['stress']
        }
      },
      ability_factors: profile?.preferences?.ability_factors || {
        physical_capability: 7,
        time_availability: 6,
        cognitive_load: 5,
        social_support: 6,
        resource_access: 8,
        overall_ability: 6.4
      }
    },
    recentLogs: (activityLogs || []).map((log: any) => ({
      id: log.id,
      timestamp: new Date(log.created_at),
      type: log.activity_type,
      data: log.structured_data || {},
      confidenceLevel: log.confidence_level >= 80 ? 'high' : 
                      log.confidence_level >= 60 ? 'medium' : 'low',
      originalText: log.original_text || '',
      subjectiveNotes: log.subjective_notes
    })),
    patterns: profile?.detected_patterns || {},
    habitTracking: habitData ? {
      current_habits: habitData.map((habit: any) => ({
        id: habit.id,
        behavior: habit.habit_name,
        trigger: {
          type: habit.trigger_type || 'time',
          description: habit.trigger_description || 'After breakfast'
        },
        reward: habit.reward_description || 'Feel accomplished',
        identity_connection: habit.identity_connection || 'I am consistent',
        difficulty: habit.difficulty_level || 5
      })),
      habit_loops: habitData.map((habit: any) => ({
        cue: habit.trigger_description || 'After breakfast',
        routine: habit.habit_name,
        reward: habit.reward_description || 'Feel accomplished',
        identity_reinforcement: habit.identity_connection || 'I am consistent'
      })),
      streak_data: habitData.reduce((streaks: any, habit: any) => {
        streaks[habit.id] = habit.current_streak || 0;
        return streaks;
      }, {}),
      completion_rates: habitData.reduce((rates: any, habit: any) => {
        const completions = habit.habit_completions?.length || 0;
        const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(habit.created_at).getTime()) / (24 * 60 * 60 * 1000)));
        rates[habit.id] = completions / daysActive;
        return rates;
      }, {})
    } : undefined
  };

  // Add last meal, workout, sleep from logs
  const nutritionLogs = context.recentLogs.filter(log => log.type === 'nutrition');
  const exerciseLogs = context.recentLogs.filter(log => ['cardio', 'strength', 'sport'].includes(log.type));
  const sleepLogs = context.recentLogs.filter(log => log.type === 'sleep');

  if (nutritionLogs.length > 0) {
    context.lastMeal = {
      timestamp: nutritionLogs[0].timestamp,
      description: nutritionLogs[0].originalText
    };
  }

  if (exerciseLogs.length > 0) {
    context.lastWorkout = {
      timestamp: exerciseLogs[0].timestamp,
      type: exerciseLogs[0].type,
      intensity: exerciseLogs[0].data.intensity || 5
    };
  }

  if (sleepLogs.length > 0) {
    context.lastSleep = {
      hours: sleepLogs[0].data.hours || 0,
      quality: sleepLogs[0].data.quality || 5
    };
  }

  return context;
}

/**
 * Log pattern detection request for analytics and improvement
 */
async function logPatternDetection(
  userId: string,
  results: PatternDetectionResult,
  supabase: any
): Promise<void> {
  try {
    await supabase.from('pattern_detection_logs').insert({
      user_id: userId,
      patterns_found: results.patterns.length,
      interventions_generated: results.interventions.length,
      confidence_score: results.confidence,
      pattern_types: results.patterns.map(p => p.type),
      high_significance_patterns: results.patterns.filter(p => p.significance === 'high').length,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log pattern detection:', error);
    // Don't throw - logging failure shouldn't break the API
  }
}