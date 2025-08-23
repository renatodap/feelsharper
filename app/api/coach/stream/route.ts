/**
 * Streaming AI Coach API Endpoint
 * Provides real-time streaming responses with immediate positive feedback
 * Implements Just-In-Time feedback for habit formation
 */

import { NextRequest, NextResponse } from 'next/server';
import { coachingEngine } from '@/lib/ai-coach/coaching-engine';
import { createClient } from '@/lib/supabase/server';

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
    
    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send immediate positive acknowledgment
          const immediateResponse = {
            type: 'immediate_feedback',
            message: getImmediateFeedback(message),
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(immediateResponse)}\n\n`)
          );
          
          // Build user context from database
          const userContext = await buildUserContext(user.id, supabase, providedContext);
          
          // Send context acknowledgment
          const contextResponse = {
            type: 'context_loaded',
            message: 'Got it! I\'m looking at your recent activity and patterns...',
            context_summary: {
              recent_logs: userContext.recentLogs.length,
              habits_tracked: userContext.habitTracking?.current_habits.length || 0,
              user_type: userContext.profile.userType
            },
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(contextResponse)}\n\n`)
          );
          
          // Generate coaching response with enhanced features
          const response = await coachingEngine.generateResponse(message, userContext);
          
          // Stream the main response
          const mainResponse = {
            type: 'coaching_response',
            ...response,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(mainResponse)}\n\n`)
          );
          
          // If there's a tiny habit, stream celebration
          if (response.tinyHabit) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for effect
            
            const celebrationResponse = {
              type: 'celebration',
              message: '🎉 Your tiny habit is ready! Remember: Start ridiculously small.',
              habit_celebration: response.motivationalDesign?.celebration,
              timestamp: new Date().toISOString()
            };
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(celebrationResponse)}\n\n`)
            );
          }
          
          // Log the interaction for learning
          await logCoachingInteraction(user.id, message, response, supabase);
          
          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );
          
          controller.close();
          
        } catch (error) {
          console.error('Streaming coaching error:', error);
          
          const errorResponse = {
            type: 'error',
            message: 'I\'m having trouble right now, but I\'m still here to help!',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(errorResponse)}\n\n`)
          );
          
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Streaming coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize streaming response' },
      { status: 500 }
    );
  }
}

/**
 * Generate immediate positive feedback based on input
 */
function getImmediateFeedback(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Habit formation messages
  if (lowerMessage.includes('want to') || lowerMessage.includes('start')) {
    return 'Great! Starting something new takes courage. Let me help you succeed...';
  }
  
  // Completion/success messages
  if (lowerMessage.includes('completed') || lowerMessage.includes('did') || lowerMessage.includes('finished')) {
    return 'YES! 🎉 You did it! That\'s evidence of who you\'re becoming...';
  }
  
  // Struggle messages
  if (lowerMessage.includes('struggling') || lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
    return 'I hear you. Struggles are normal and part of the process. Let me help...';
  }
  
  // Question messages
  if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('?')) {
    return 'Good question! Let me think about the best approach for you...';
  }
  
  // Default positive acknowledgment
  return 'I\'m here to help! Let me look at your situation...';
}

/**
 * Build comprehensive user context from database
 */
async function buildUserContext(
  userId: string,
  supabase: any,
  providedContext?: any
): Promise<any> {
  // This would be the same as in the main coach endpoint
  // For now, return a simple context
  return {
    profile: {
      userType: 'sport',
      goals: ['improve fitness', 'build consistency'],
      identity_goals: ['I am someone who prioritizes my health']
    },
    recentLogs: [],
    patterns: {
      exerciseFrequency: 3,
      typicalSleepHours: 7.5
    },
    habitTracking: {
      current_habits: [],
      habit_loops: [],
      streak_data: {},
      completion_rates: {}
    }
  };
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
      coaching_type: 'streaming',
      metadata: {
        tiny_habit: response.tinyHabit,
        identity_reinforcement: response.identityReinforcement,
        behavior_analysis: response.behaviorAnalysis
      },
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log streaming coaching interaction:', error);
  }
}