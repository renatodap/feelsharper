import { NextRequest, NextResponse } from 'next/server';
import { testAllConnections, getServiceUsageStats } from '@/lib/ai/ai-client';
import { testGeminiConnection } from '@/lib/ai/gemini-client';
import { testOpenAIConnection } from '@/lib/ai/openai-client';
import { testClaudeConnection } from '@/lib/ai/claude-client';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AI service connections...');
    
    // Test all three services
    const connectionResults = await testAllConnections();
    const serviceStats = getServiceUsageStats();

    const results = {
      timestamp: new Date().toISOString(),
      services: {
        gemini: {
          status: connectionResults.gemini ? 'connected' : 'failed',
          model: 'gemini-1.5-flash',
          purpose: 'Primary AI service (free tier)',
          priority: 1
        },
        openai: {
          status: connectionResults.openai ? 'connected' : 'failed',
          model: 'gpt-4',
          purpose: 'Complex parsing and analysis',
          priority: 2
        },
        claude: {
          status: connectionResults.claude ? 'connected' : 'failed',
          model: 'claude-3-5-sonnet-20241022',
          purpose: 'Advanced coaching and creative tasks',
          priority: 3
        }
      },
      overall_status: connectionResults.overall ? 'operational' : 'degraded',
      service_strategy: serviceStats,
      environment: {
        gemini_key_configured: !!process.env.GOOGLE_AI_API_KEY,
        openai_key_configured: !!process.env.OPENAI_API_KEY,
        anthropic_key_configured: !!process.env.ANTHROPIC_API_KEY,
        keys_length: {
          gemini: process.env.GOOGLE_AI_API_KEY?.length || 0,
          openai: process.env.OPENAI_API_KEY?.length || 0,
          anthropic: process.env.ANTHROPIC_API_KEY?.length || 0
        }
      }
    };

    console.log('AI Connection Test Results:', results);

    return NextResponse.json(results, { 
      status: connectionResults.overall ? 200 : 207 // 207 = Multi-Status
    });

  } catch (error) {
    console.error('AI connection test error:', error);
    
    return NextResponse.json({
      error: 'Failed to test AI connections',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}