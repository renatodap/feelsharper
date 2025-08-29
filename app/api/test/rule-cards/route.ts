import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test endpoint for rule cards - returns test status
    return NextResponse.json({
      success: true,
      message: 'Rule cards test endpoint is operational',
      status: 'Tests should be run through proper test framework, not API endpoint'
    });

  } catch (error) {
    console.error('Rule cards test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run rule cards tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { input, userContext } = await request.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Import the rule cards engine
    const { ruleCardsEngine } = await import('@/lib/ai-coach/rule-cards');
    
    // Create default context if not provided
    const context = userContext || {
      profile: {
        userType: 'sport',
        dietary: [],
        goals: ['fitness'],
        constraints: []
      },
      recentLogs: [],
      patterns: {},
      lastMeal: null,
      lastWorkout: null, 
      lastSleep: null
    };

    // Test rule card matching
    const ruleMatch = ruleCardsEngine.findBestMatch(input, context);
    
    if (!ruleMatch) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: 'No rule card matched this input',
        input,
        fallback_used: true
      });
    }

    // Generate response
    const response = ruleCardsEngine.generateRuleCardResponse(ruleMatch, context);

    return NextResponse.json({
      success: true,
      matched: true,
      input,
      rule_card: {
        id: ruleMatch.card.id,
        name: ruleMatch.card.name,
        match_score: ruleMatch.match_score,
        confidence: ruleMatch.confidence,
        missing_context: ruleMatch.missing_context
      },
      response: {
        message: response.message,
        action_items: response.actionItems,
        clarifying_question: response.clarifyingQuestion,
        identity_reinforcement: response.identityReinforcement,
        safety_warnings: response.safetyWarnings,
        follow_up_suggested: response.followUpSuggested
      }
    });

  } catch (error) {
    console.error('Rule cards API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process rule card request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}