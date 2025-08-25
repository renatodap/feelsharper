/**
 * Comprehensive Phase 5.1 Testing - All Coaching Scenarios
 * Tests all aspects of the AI Coach Implementation with Habit Formation Framework
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const testScenarios = [
    {
      scenario: "Habit Formation - New Habit",
      message: "I want to start working out consistently",
      expectedFeatures: ["tinyHabit", "behaviorAnalysis", "identityReinforcement", "motivationalDesign"]
    },
    {
      scenario: "Habit Struggle - Recovery",
      message: "I'm struggling to keep up with my morning routine, I keep forgetting",
      expectedFeatures: ["clarifyingQuestion", "actionItems", "identityReinforcement"]
    },
    {
      scenario: "Habit Completion - Celebration",
      message: "I completed my morning workout for the 5th day in a row!",
      expectedFeatures: ["motivationalDesign", "identityReinforcement", "actionItems"]
    },
    {
      scenario: "Pre-Activity Nutrition",
      message: "I have a tennis match in 2 hours, what should I eat?",
      expectedFeatures: ["actionItems", "confidence"]
    },
    {
      scenario: "Post-Workout Recovery", 
      message: "I'm super sore after yesterday's intense workout",
      expectedFeatures: ["actionItems", "confidence"]
    },
    {
      scenario: "Sleep-Affected Training",
      message: "I only got 4 hours of sleep, should I still work out today?",
      expectedFeatures: ["clarifyingQuestion", "actionItems"]
    },
    {
      scenario: "General Habit Coaching",
      message: "How can I be more consistent with my habits?",
      expectedFeatures: ["actionItems", "identityReinforcement", "motivationalDesign"]
    }
  ];

  const results = [];
  let passedTests = 0;
  let totalTests = 0;

  for (const test of testScenarios) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/coach/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: test.message })
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        const coachingResponse = data.response;
        const testResult = {
          scenario: test.scenario,
          message: test.message,
          passed: true,
          confidence: coachingResponse.confidence,
          hasMessage: !!coachingResponse.message,
          features: {} as Record<string, boolean>,
          issues: [] as string[]
        };

        // Check each expected feature
        for (const feature of test.expectedFeatures) {
          const hasFeature = !!(coachingResponse as any)[feature];
          testResult.features[feature] = hasFeature;
          totalTests++;
          
          if (hasFeature) {
            passedTests++;
          } else {
            testResult.issues.push(`Missing ${feature}`);
            testResult.passed = false;
          }
        }

        // Additional validation
        if (!coachingResponse.message || coachingResponse.message.length < 10) {
          testResult.issues.push("Message too short or missing");
          testResult.passed = false;
        }

        // Check for BJ Fogg behavior model integration
        if (test.scenario.includes("Habit Formation") && !(coachingResponse as any).tinyHabit) {
          testResult.issues.push("Missing tiny habit for habit formation scenario");
          testResult.passed = false;
        }

        // Check for identity-based messaging
        if ((coachingResponse as any).identityReinforcement && 
            !(coachingResponse as any).identityReinforcement.includes("someone who")) {
          testResult.issues.push("Identity reinforcement should use 'someone who' pattern");
        }

        results.push(testResult);
      } else {
        results.push({
          scenario: test.scenario,
          message: test.message,
          passed: false,
          error: data.error || 'Unknown error',
          issues: ['API call failed']
        });
      }
    } catch (error) {
      results.push({
        scenario: test.scenario,
        message: test.message,
        passed: false,
        error: error instanceof Error ? error.message : 'Test execution failed',
        issues: ['Test execution error']
      });
    }
  }

  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const allTestsPassed = results.every(r => r.passed);

  const summary = {
    phase: "5.1 - AI Coach Implementation with Habit Formation Framework",
    status: allTestsPassed ? "✅ FULLY COMPLETE" : "⚠️ NEEDS ATTENTION",
    successRate: `${successRate}% (${passedTests}/${totalTests})`,
    testResults: results,
    coreFeatures: {
      "BJ Fogg Behavior Model": results.some(r => (r as any).features?.behaviorAnalysis),
      "Habit Formation Framework": results.some(r => (r as any).features?.tinyHabit),
      "Identity-Based Habits": results.some(r => (r as any).features?.identityReinforcement),
      "Confidence-Based Responses": results.every(r => (r as any).confidence),
      "Motivational Design": results.some(r => (r as any).features?.motivationalDesign),
      "Contextual Coaching": results.some(r => (r as any).features?.actionItems)
    },
    recommendations: allTestsPassed ? [
      "Phase 5.1 is fully implemented and working!",
      "All coaching scenarios respond appropriately", 
      "Behavior model integration is functional",
      "Identity reinforcement is working",
      "Ready to move to Phase 5.2 or production deployment"
    ] : [
      "Fix missing features identified in test results",
      "Ensure all scenarios have proper coaching responses",
      "Verify behavior model calculations",
      "Test with real user authentication"
    ]
  };

  return NextResponse.json(summary);
}

export async function GET() {
  return NextResponse.json({
    message: "Phase 5.1 Comprehensive Test Suite",
    endpoint: "/api/coach/test-all",
    instructions: [
      "POST to run all Phase 5.1 tests",
      "Tests habit formation, coaching scenarios, behavior model integration",
      "Returns detailed report on Phase 5.1 completion status"
    ]
  });
}