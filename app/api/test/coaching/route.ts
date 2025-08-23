import { NextRequest, NextResponse } from 'next/server';
import { getCoachingResponse, generateDailyInsights } from '@/lib/ai/claude-client';
import { coachingEngine } from '@/lib/ai-coach/coaching-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      context = {}, 
      mode = 'conversation',
      test_type = 'coaching',
      use_enhanced = false // New flag to test enhanced behavior model
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        error: 'Message parameter is required and must be a string'
      }, { status: 400 });
    }

    console.log('Testing AI coaching:', { message, mode, test_type });

    let result;

    if (test_type === 'daily_insights') {
      // Test daily insights generation
      const mockUserData = {
        recent_activities: [
          { type: 'workout', activity: 'running', duration: 30, date: new Date() },
          { type: 'nutrition', food: 'chicken salad', calories: 450, date: new Date() }
        ],
        user_profile: { 
          fitness_level: 'intermediate', 
          goals: ['weight_loss', 'endurance'],
          preferences: { workout_time: 'morning' }
        },
        goals: { primary: 'lose_weight', target_weight: 160 }
      };

      result = await generateDailyInsights({
        ...mockUserData,
        ...context
      });

      return NextResponse.json({
        success: true,
        insights: result,
        test_info: {
          test_type: 'daily_insights',
          mock_data_used: true,
          timestamp: new Date().toISOString()
        }
      });
    } else if (use_enhanced && test_type === 'coaching') {
      // Test enhanced coaching with BJ Fogg Behavior Model
      const testUserContext = {
        profile: {
          userType: 'sport' as const,
          goals: ['improve fitness', 'build consistency'],
          identity_goals: ['I am someone who prioritizes my health'],
          motivation_profile: {
            intrinsic_motivators: ['health', 'energy', 'confidence'],
            extrinsic_motivators: ['appearance', 'social approval'],
            motivation_style: 'data_driven' as const,
            energy_patterns: {
              high_motivation_times: ['morning', 'after coffee'],
              low_motivation_triggers: ['stress', 'fatigue']
            }
          },
          ability_factors: {
            physical_capability: 7,
            time_availability: 6,
            cognitive_load: 5,
            social_support: 6,
            resource_access: 8,
            overall_ability: 6.4
          }
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
        },
        ...context
      };

      result = await coachingEngine.generateResponse(message, testUserContext);

      return NextResponse.json({
        success: true,
        coaching_response: result,
        test_info: {
          input_message: message,
          mode_used: 'enhanced_behavioral_coaching',
          enhanced_features: {
            behavior_model: !!result.behaviorAnalysis,
            tiny_habit: !!result.tinyHabit,
            identity_reinforcement: !!result.identityReinforcement,
            motivational_design: !!result.motivationalDesign,
            habit_optimization: !!result.habitOptimization
          },
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Test regular coaching conversation
      result = await getCoachingResponse({
        message,
        context,
        coaching_mode: mode
      });

      return NextResponse.json({
        success: true,
        coaching_response: result,
        test_info: {
          input_message: message,
          mode_used: mode,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Coaching test error:', error);
    
    return NextResponse.json({
      error: 'Failed to get coaching response',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Sample test cases for GET request
export async function GET() {
  const sampleTests = [
    // Original tests
    {
      message: "I'm feeling unmotivated to workout today",
      mode: "conversation",
      expected_type: "motivational"
    },
    {
      message: "Can you analyze my workout patterns from last week?",
      mode: "analysis", 
      expected_type: "analytical"
    },
    {
      message: "What should I eat after my workout?",
      mode: "recommendation",
      expected_type: "educational"
    },
    {
      test_type: "daily_insights",
      message: "Generate insights from my recent activity",
      mode: "insight"
    },
    // Enhanced Behavior Model tests
    {
      message: "I want to start working out consistently",
      mode: "conversation",
      use_enhanced: true,
      expected_features: ["tiny_habit", "behavior_model", "identity_reinforcement"]
    },
    {
      message: "I'm struggling to remember my morning routine",
      mode: "conversation", 
      use_enhanced: true,
      expected_features: ["habit_optimization", "motivational_design"]
    },
    {
      message: "I completed my workout today!",
      mode: "conversation",
      use_enhanced: true,
      expected_features: ["identity_reinforcement", "motivational_design"]
    },
    {
      message: "Help me build a habit of drinking more water",
      mode: "conversation",
      use_enhanced: true,
      expected_features: ["tiny_habit", "behavior_model"]
    }
  ];

  return NextResponse.json({
    message: 'AI Coaching Test Endpoint - Now with Enhanced Behavior Model!',
    usage: 'POST with {"message": "your message", "mode": "conversation|analysis|recommendation|insight", "test_type": "coaching|daily_insights", "use_enhanced": true}',
    new_features: {
      'BJ Fogg Behavior Model': 'B=MAP formula for habit success prediction',
      'Tiny Habits': 'Start ridiculously small for guaranteed success',
      'Identity-Based Change': 'Become the person, not just do the task',
      'Motivational Design': 'Celebration, streaks, and progress visualization',
      'Habit Loop Tracking': 'Cue-routine-reward pattern optimization'
    },
    sample_tests: sampleTests,
    endpoint: '/api/test/coaching'
  });
}