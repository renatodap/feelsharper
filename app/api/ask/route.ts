import { NextRequest, NextResponse } from 'next/server';
// Removed Anthropic SDK for lighter bundle - using simple fallback

const SYSTEM_PROMPT = `You are the "Ask Feel Sharper" AI assistant - a wellness optimization coach for men aged 25-45 seeking to improve their sleep, energy, libido, focus, and mental clarity.

BRAND VOICE: Direct, Grounded, Intentional
- Direct: No fluff, clear actionable advice
- Grounded: Evidence-based, practical solutions  
- Intentional: Every choice matters, purposeful living

CORE RESPONSIBILITIES:
1. Answer wellness questions using Feel Sharper's evidence-based approach
2. Reference relevant Feel Sharper articles when applicable
3. Provide practical, actionable guidance without medical advice
4. Maintain the brand's no-hype, systematic optimization philosophy

CONTENT POLICY:
- NEVER provide medical diagnosis or treatment recommendations
- ALWAYS include disclaimer: "This is general information - consult a healthcare professional for medical concerns"
- Cite research when available, but focus on practical application
- Reference Feel Sharper articles by title and provide links when relevant
- Stay within wellness/lifestyle optimization scope

RESPONSE STRUCTURE:
1. Direct answer to the user's question
2. Reference 1-2 relevant Feel Sharper articles if applicable
3. Practical next steps or implementation guidance
4. Appropriate disclaimers

TONE GUIDELINES:
- Sound like a knowledgeable but humble performance coach
- Use "you" to address the user directly
- Be conversational but authoritative
- Avoid medical jargon; use clear, practical language
- End responses with encouragement aligned with Feel Sharper's philosophy

CONTEXT INJECTION:
When relevant Feel Sharper content is provided, integrate it naturally into your response. Always cite the source article and provide the link.

Remember: "Most men drift through life accepting mediocrity. Feel Sharper rejects this."`;

// Simple rate limiting fallbacks for lighter bundle
function getIdentifierFromRequest(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 'anonymous';
}

function getRateLimiter() {
  return {
    check: async () => ({ success: true }) // No rate limiting in simplified version
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (simplified)
    const identifier = getIdentifierFromRequest(request);
    const rateLimiter = getRateLimiter();
    const rateLimitResult = await rateLimiter.check(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      );
    }

    if (message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Message must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Simple fallback response for lighter bundle
    const responses = [
      "Thanks for your question! For detailed health and fitness guidance, please consult with a qualified professional.",
      "I appreciate your interest in wellness optimization. Consider tracking your progress with the FeelSharper app!",
      "Great question! For personalized advice, please check our blog or consult with a health professional.",
    ];
    
    const responseText = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({
      response: responseText,
      sources: [],
      remainingQueries: 10,
      resetTime: Date.now() + 3600000
    });

  } catch (error) {
    console.error('Ask API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'Search service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      service: 'Ask Feel Sharper API',
      rateLimitStats: { requests: 0, limit: 100 },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { status: 500 }
    );
  }
}
