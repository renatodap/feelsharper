/**
 * Test Coach API Endpoint - NO AUTH REQUIRED
 * Used for testing phase 5.1 coaching functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { coachingEngine, UserContext } from '@/lib/ai-coach/coaching-engine';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { message, testUserId = 'test-user-123' } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Create mock user context for testing
    const mockUserContext: UserContext = {
      profile: {
        userType: 'sport',
        dietary: ['no-dairy'],
        goals: ['improve tennis performance', 'build consistent habits'],
        constraints: ['busy schedule'],
        identity_goals: ['I am someone who prioritizes their health', 'I am an athlete who trains smart'],
        motivation_profile: {
          intrinsic_motivators: ['health', 'energy', 'performance'],
          extrinsic_motivators: ['competition results', 'social approval'],
          motivation_style: 'data_driven',
          energy_patterns: {
            high_motivation_times: ['morning', 'after coffee'],
            low_motivation_triggers: ['stress', 'fatigue', 'evening']
          }
        },
        ability_factors: {
          physical_capability: 8,
          time_availability: 6,
          cognitive_load: 4,
          social_support: 7,
          resource_access: 9,
          overall_ability: 6.8
        }
      },
      recentLogs: [
        {
          id: 'log1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          type: 'nutrition',
          data: { type: 'meal', description: 'banana with peanut butter' },
          confidenceLevel: 'high',
          originalText: 'had banana with peanut butter',
          subjectiveNotes: 'felt good energy boost'
        },
        {
          id: 'log2',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
          type: 'exercise',
          data: { type: 'tennis', intensity: 8, duration: 90 },
          confidenceLevel: 'high',
          originalText: 'played tennis for 90 minutes, high intensity',
          subjectiveNotes: 'felt great, good match'
        },
        {
          id: 'log3',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          type: 'sleep',
          data: { hours: 7.5, quality: 8 },
          confidenceLevel: 'high',
          originalText: 'slept 7.5 hours, good quality',
          subjectiveNotes: 'woke up refreshed'
        }
      ],
      patterns: {
        preMatchMeals: ['banana with peanut butter', 'oatmeal with berries'],
        recoveryStrategies: ['protein shake', 'stretching', 'ice bath'],
        typicalSleepHours: 7.5,
        exerciseFrequency: 5,
        stressResponse: 'exercise helps reduce stress'
      },
      habitTracking: {
        current_habits: [
          {
            id: 'habit1',
            behavior: 'drink one glass of water after waking up',
            trigger: {
              id: 'trigger1',
              name: 'After waking up',
              type: 'time',
              description: 'When I get out of bed',
              effectiveness_score: 85,
              user_specific: true
            },
            reward: 'I feel proud of starting my day right',
            difficulty_level: 1,
            identity_connection: 'I am someone who takes care of their body',
            completion_rate: 78,
            streak_count: 12,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            last_completed: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        habit_loops: [
          {
            cue: {
              id: 'cue1',
              name: 'Morning routine',
              type: 'time',
              description: 'After brushing teeth',
              effectiveness_score: 90,
              user_specific: true
            },
            routine: 'Do 5 push-ups',
            reward: 'Feel accomplished',
            identity_reinforcement: 'I am someone who exercises daily'
          }
        ],
        streak_data: {
          'habit1': 12,
          'morning_exercise': 8
        },
        completion_rates: {
          'habit1': 78,
          'morning_exercise': 65
        }
      },
      lastMeal: {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'banana with peanut butter'
      },
      lastWorkout: {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'sport',
        intensity: 8
      },
      lastSleep: {
        hours: 7.5,
        quality: 8
      }
    };
    
    console.log('🧪 Testing coaching engine with message:', message);
    
    // Generate coaching response
    const response = await coachingEngine.generateResponse(message, mockUserContext);
    
    console.log('✅ Coaching response generated:', {
      message: response.message.substring(0, 100) + '...',
      confidence: response.confidence,
      hasActionItems: !!response.actionItems,
      hasIdentityReinforcement: !!response.identityReinforcement,
      hasBehaviorAnalysis: !!response.behaviorAnalysis,
      hasTinyHabit: !!response.tinyHabit
    });
    
    return NextResponse.json({
      success: true,
      response,
      testUserId,
      mockContext: {
        userType: mockUserContext.profile.userType,
        recentLogsCount: mockUserContext.recentLogs.length,
        habitsCount: mockUserContext.habitTracking?.current_habits.length || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test coaching API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate coaching response',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing coaching scenarios
 */
export async function GET() {
  const testScenarios = [
    {
      id: 1,
      message: "I want to start working out consistently",
      expectedResponse: "Habit formation with tiny behavior design"
    },
    {
      id: 2,
      message: "I'm struggling with my current workout routine",
      expectedResponse: "Habit struggle analysis and adjustment"
    },
    {
      id: 3,
      message: "I completed my morning workout today!",
      expectedResponse: "Celebration with identity reinforcement"
    },
    {
      id: 4,
      message: "I have a tennis match in 3 hours, what should I eat?",
      expectedResponse: "Pre-activity nutrition with confidence-based advice"
    },
    {
      id: 5,
      message: "I'm feeling really sore after yesterday's workout",
      expectedResponse: "Post-workout recovery guidance"
    }
  ];

  return NextResponse.json({
    message: "Phase 5.1 Coach Test Scenarios",
    testEndpoint: "/api/coach/test",
    scenarios: testScenarios,
    instructions: [
      "POST to /api/coach/test with { \"message\": \"your test message\" }",
      "Each response should include behavior analysis, habit recommendations, and identity reinforcement",
      "Test all 5 scenarios to verify phase 5.1 completion"
    ]
  });
}