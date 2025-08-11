import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { retrieveRelevantContent, buildContextPrompt, preprocessQuery } from '@/lib/retrieval';
import { getRateLimiter, getIdentifierFromRequest } from '@/lib/rate-limiter';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

async function getUserContext(userId: string) {
  const supabase = createRouteHandlerClient({ cookies });
  const context: string[] = [];
  
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_goal, goal_notes, preferred_units_weight, preferred_units_distance')
      .eq('user_id', userId)
      .single();
    
    if (profile) {
      context.push(`USER PROFILE:`);
      if (profile.current_goal) context.push(`- Current Goal: ${profile.current_goal}`);
      if (profile.goal_notes) context.push(`- Goal Notes: ${profile.goal_notes}`);
      context.push(`- Units: ${profile.preferred_units_weight || 'kg'}, ${profile.preferred_units_distance || 'km'}`);
    }

    // Get recent workouts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: workouts } = await supabase
      .from('workouts')
      .select('name, started_at, ended_at, total_volume, total_sets')
      .eq('user_id', userId)
      .gte('started_at', weekAgo.toISOString())
      .order('started_at', { ascending: false })
      .limit(5);
    
    if (workouts && workouts.length > 0) {
      context.push(`\nRECENT WORKOUTS (Last 7 Days):`);
      workouts.forEach((w: any) => {
        const duration = w.ended_at ? 
          Math.round((new Date(w.ended_at).getTime() - new Date(w.started_at).getTime()) / 60000) : 0;
        context.push(`- ${w.name}: ${w.total_sets || 0} sets, ${w.total_volume || 0}kg volume${duration ? `, ${duration} min` : ''}`);
      });
    }

    // Get today's nutrition
    const today = new Date().toISOString().split('T')[0];
    const { data: meals } = await supabase
      .from('meals')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('consumed_at', `${today}T00:00:00`)
      .lte('consumed_at', `${today}T23:59:59`);
    
    if (meals && meals.length > 0) {
      const totals = meals.reduce((acc: any, meal: any) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      context.push(`\nTODAY'S NUTRITION:`);
      context.push(`- Calories: ${totals.calories} | Protein: ${totals.protein}g | Carbs: ${totals.carbs}g | Fat: ${totals.fat}g`);
    }

    // Get latest body metrics
    const { data: metrics } = await supabase
      .from('body_metrics')
      .select('weight, body_fat_percentage, measured_at')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(2);
    
    if (metrics && metrics.length > 0) {
      context.push(`\nBODY METRICS:`);
      context.push(`- Current Weight: ${metrics[0].weight}kg${metrics[0].body_fat_percentage ? ` | Body Fat: ${metrics[0].body_fat_percentage}%` : ''}`);
      if (metrics.length > 1) {
        const weightChange = metrics[0].weight - metrics[1].weight;
        context.push(`- Weight Change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg`);
      }
    }

    // Get recent sleep data
    const { data: sleep } = await supabase
      .from('sleep_logs')
      .select('sleep_duration, quality, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(3);
    
    if (sleep && sleep.length > 0) {
      const avgSleep = sleep.reduce((sum: number, s: any) => sum + (s.sleep_duration || 0), 0) / sleep.length;
      const avgQuality = sleep.reduce((sum: number, s: any) => sum + (s.quality || 0), 0) / sleep.length;
      context.push(`\nRECENT SLEEP:`);
      context.push(`- Avg Duration: ${avgSleep.toFixed(1)}h | Avg Quality: ${avgQuality.toFixed(1)}/10`);
    }

  } catch (error) {
    console.error('Error fetching user context:', error);
  }

  return context.length > 0 ? context.join('\n') : null;
}

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

    // Check for authenticated user and get their context
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    let userContext = null;
    if (user) {
      userContext = await getUserContext(user.id);
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
    
    // Build context prompt with user data if available
    let contextPrompt = buildContextPrompt(relevantContent, message);
    
    if (userContext) {
      contextPrompt = `USER DATA CONTEXT:
${userContext}

${contextPrompt}

IMPORTANT: Use the user's actual data above to provide personalized recommendations and insights. Reference their specific workouts, nutrition, and metrics when relevant.`;
    }

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
