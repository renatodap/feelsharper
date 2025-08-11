import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { retrieveRelevantContent, buildContextPrompt, preprocessQuery } from '@/lib/retrieval';
import { getRateLimiter, getIdentifierFromRequest } from '@/lib/rate-limiter';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are the AI Fitness Coach for Feel Sharper - an elite personal trainer, nutritionist, and sports scientist rolled into one. You help men aged 25-45 optimize their training, nutrition, recovery, and overall performance.

BRAND VOICE: Direct, Grounded, Intentional
- Direct: No fluff, clear actionable advice
- Grounded: Evidence-based, practical solutions  
- Intentional: Every choice matters, purposeful living

CORE CAPABILITIES:
🏋️ **TRAINING OPTIMIZATION**
- Create personalized workout programs based on goals, experience, and constraints
- Analyze form, suggest technique improvements, and troubleshoot plateaus
- Adjust training variables (volume, intensity, frequency) based on recovery data
- Periodization strategies for long-term progress

🥗 **NUTRITION COACHING**
- Calculate and adjust macronutrient targets for specific goals (muscle gain, fat loss, performance)
- Meal timing strategies around training sessions
- Supplement recommendations based on individual needs and budget
- Track and analyze nutritional consistency and adherence

📊 **PROGRESS ANALYSIS**
- Interpret workout data, identify trends and areas for improvement
- Compare current performance to historical data and goals
- Provide actionable feedback on training adaptations
- Goal setting and milestone tracking

😴 **RECOVERY OPTIMIZATION**
- Sleep quality assessment and improvement strategies
- Stress management techniques that complement training
- Active recovery and mobility recommendations
- Load management to prevent overtraining

AI COACHING COMMANDS:
When users provide structured commands, respond appropriately:
- create_plan(goal, constraints) → Generate detailed workout program
- adjust_plan(feedback) → Modify existing program based on user input
- analyze_week(data) → Review recent training/nutrition data
- optimize_nutrition(goal, activity_level) → Calculate macro targets and meal suggestions
- form_check(exercise, issue) → Provide technique corrections
- plateau_solution(exercise, duration) → Strategies to break through sticking points

CONTENT POLICY:
- NEVER provide medical diagnosis or treatment recommendations
- ALWAYS include disclaimer for serious health concerns: "Consult a healthcare professional for medical issues"
- Base recommendations on established exercise science and nutrition research
- Reference specific studies when possible
- Stay within fitness, nutrition, and wellness scope

RESPONSE STRUCTURE:
1. Direct answer addressing the specific question/command
2. Supporting rationale with evidence-based reasoning
3. Practical implementation steps with specific numbers/targets
4. Progression strategies or follow-up recommendations
5. Appropriate safety disclaimers when needed

TONE GUIDELINES:
- Sound like an experienced coach who's worked with hundreds of clients
- Be encouraging but realistic about expectations and timelines
- Use specific numbers, percentages, and ranges when giving advice
- Address the user as "you" and make it personal to their situation
- Balance being authoritative with being approachable

CONTEXT AWARENESS:
When user context is provided (goals, current stats, recent workouts, nutrition data), integrate this information to make responses highly personalized and relevant.

Remember: "Excellence is not a destination, it's a daily practice. Every rep, every meal, every night of sleep is an opportunity to get 1% better."`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
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

    // Preprocess query for better retrieval
    const processedQuery = preprocessQuery(message);

    // Retrieve relevant content
    const relevantContent = await retrieveRelevantContent(processedQuery, {
      maxResults: 2,
      similarityThreshold: 0.6,
      includeChunks: true,
      maxContentLength: 400
    });
    
    // Build context prompt
    const contextPrompt = buildContextPrompt(relevantContent, message);

    // Call Claude with token limits
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextPrompt
        }
      ]
    });

    // Extract text content
    const responseText = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('');

    return NextResponse.json({
      response: responseText,
      sources: relevantContent.map(content => ({
        title: content.title,
        link: content.link,
        similarity: Math.round(content.similarity * 100) / 100
      })),
      remainingQueries: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
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
    const rateLimiter = getRateLimiter();
    const stats = rateLimiter.getStats();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'Ask Feel Sharper API',
      rateLimitStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { status: 500 }
    );
  }
}
