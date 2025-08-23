import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/ai/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, context = 'general' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        error: 'Text parameter is required and must be a string'
      }, { status: 400 });
    }

    console.log('Testing natural language parsing:', { text, context });

    const result = await parseNaturalLanguage({
      text,
      context,
      userId: 'test-user',
      taskType: 'parse'
    });

    console.log('Parse result:', result);

    return NextResponse.json({
      success: true,
      parse_result: result,
      test_info: {
        input_text: text,
        context_used: context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Parse test error:', error);
    
    return NextResponse.json({
      error: 'Failed to parse text',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Sample test cases for GET request
export async function GET() {
  const sampleTests = [
    {
      text: "I ran 5k in 25 minutes this morning",
      context: "fitness",
      expected_intent: "fitness"
    },
    {
      text: "Had eggs and toast for breakfast",
      context: "nutrition", 
      expected_intent: "nutrition"
    },
    {
      text: "Slept 7 hours, feeling great",
      context: "wellness",
      expected_intent: "wellness"
    },
    {
      text: "Weight is 175 lbs today",
      context: "general",
      expected_intent: "measurement"
    },
    {
      text: "Bench press 225x5, 245x3, 255x1",
      context: "fitness",
      expected_intent: "fitness"
    }
  ];

  return NextResponse.json({
    message: 'Natural Language Parse Test Endpoint',
    usage: 'POST with {"text": "your text here", "context": "fitness|nutrition|wellness|general"}',
    sample_tests: sampleTests,
    endpoint: '/api/test/parse'
  });
}