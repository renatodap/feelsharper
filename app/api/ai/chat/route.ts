import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AI_PROVIDERS, TIER_CONFIG, calculateCost, estimateTokens } from '@/lib/ai/providers';
import type { Database } from '@/lib/types/database';

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, tier: string): boolean {
  const now = Date.now();
  const limit = tier === 'free' ? 10 : tier === 'starter' ? 50 : 100; // Requests per hour
  const window = 60 * 60 * 1000; // 1 hour in milliseconds
  
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + window });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, context = [] } = body;
  
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's subscription tier (default to free)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    const tier = (profile?.subscription_tier || 'free') as 'free' | 'starter' | 'pro';
    
    // Check rate limit
    if (!checkRateLimit(user.id, tier)) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 3600 // seconds
      }, { status: 429 });
    }
    
    // Check monthly quota (simplified for MVP)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usageSummary } = await supabase
      .from('user_usage_summary')
      .select('total_cost_usd, total_queries')
      .eq('user_id', user.id)
      .gte('billing_period_start', `${currentMonth}-01`)
      .single();
    
    const tierConfig = TIER_CONFIG[tier];
    
    // Check if user has exceeded their monthly limits
    if (usageSummary) {
      if (usageSummary.total_cost_usd >= tierConfig.maxCostPerMonth) {
        return NextResponse.json({ 
          error: 'Monthly AI usage limit reached. Please upgrade your plan.',
          currentUsage: usageSummary.total_cost_usd,
          limit: tierConfig.maxCostPerMonth,
          tier
        }, { status: 403 });
      }
      
      if (tierConfig.maxQueriesPerMonth && usageSummary.total_queries >= tierConfig.maxQueriesPerMonth) {
        return NextResponse.json({ 
          error: 'Monthly query limit reached. Please upgrade your plan.',
          currentQueries: usageSummary.total_queries,
          limit: tierConfig.maxQueriesPerMonth,
          tier
        }, { status: 403 });
      }
    }
    
    // Get user's recent fitness data for context
    const today = new Date().toISOString().split('T')[0];
    const [foodLogs, weightLogs] = await Promise.all([
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .order('logged_at', { ascending: false })
        .limit(5),
      supabase
        .from('body_weight')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(1)
    ]);
    
    // Build system prompt with user context
    let systemPrompt = `You are FeelSharper AI, a helpful fitness and nutrition assistant. Be concise, friendly, and supportive.`;
    
    if (foodLogs.data && foodLogs.data.length > 0) {
      const totalCalories = foodLogs.data.reduce((sum, log) => sum + (log.kcal || 0), 0);
      systemPrompt += `\n\nToday's nutrition: ${Math.round(totalCalories)} calories logged.`;
    }
    
    if (weightLogs.data && weightLogs.data.length > 0) {
      systemPrompt += `\n\nCurrent weight: ${weightLogs.data[0].weight_kg.toFixed(1)} kg.`;
    }
    
    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ];
    
    // Estimate tokens for cost calculation
    const inputTokens = estimateTokens(JSON.stringify(messages));
    
    // Call appropriate AI provider based on tier
    const provider = tierConfig.provider;
    let response;
    let outputTokens = 0;
    let aiResponse = '';
    
    if (provider.name === 'groq') {
      // For MVP, using a simpler response for free tier
      // In production, integrate actual Groq API
      aiResponse = generateSimpleResponse(message);
      outputTokens = estimateTokens(aiResponse);
    } else if (provider.name === 'openai') {
      // Call OpenAI API
      const openaiResponse = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          max_tokens: Math.min(500, provider.maxTokens),
          temperature: 0.7
        })
      });
      
      if (!openaiResponse.ok) {
        throw new Error('AI service temporarily unavailable');
      }
      
      const data = await openaiResponse.json();
      aiResponse = data.choices[0].message.content;
      outputTokens = data.usage?.completion_tokens || estimateTokens(aiResponse);
    } else if (provider.name === 'anthropic') {
      // Call Anthropic API
      const anthropicResponse = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: provider.model,
          messages: messages.slice(1), // Anthropic doesn't use system message in same way
          system: systemPrompt,
          max_tokens: Math.min(500, provider.maxTokens)
        })
      });
      
      if (!anthropicResponse.ok) {
        throw new Error('AI service temporarily unavailable');
      }
      
      const data = await anthropicResponse.json();
      aiResponse = data.content[0].text;
      outputTokens = data.usage?.output_tokens || estimateTokens(aiResponse);
    }
    
    // Calculate cost
    const cost = calculateCost(provider, inputTokens, outputTokens);
    
    // Track usage in database (simplified for MVP)
    // In production, use the track_ai_usage function from migration
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      provider: provider.name,
      model: provider.model,
      feature: 'chat',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      estimated_cost: cost
    });
    
    return NextResponse.json({
      message: aiResponse,
      usage: {
        inputTokens,
        outputTokens,
        cost: cost.toFixed(6),
        tier
      }
    });
    
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simple response generator for free tier (when Groq is not available)
function generateSimpleResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('calorie') || lowerMessage.includes('food')) {
    return "To track your calories, use the 'Log Food' feature. I can help you understand your nutrition goals and suggest healthy meal options. What specific nutritional guidance are you looking for?";
  } else if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('gain')) {
    return "Weight management is about consistent tracking and sustainable habits. Log your weight daily to see trends over time. Would you like tips on setting realistic weight goals?";
  } else if (lowerMessage.includes('protein') || lowerMessage.includes('carb') || lowerMessage.includes('fat')) {
    return "Balancing macronutrients is key to achieving your fitness goals. A general guideline is 30% protein, 40% carbs, and 30% fats, but this varies by individual. What are your current fitness goals?";
  } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return "Regular exercise combined with proper nutrition is the foundation of fitness. Workout tracking is coming soon! For now, focus on consistency with your current routine. What type of workouts do you enjoy?";
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your FeelSharper AI assistant. I can help you with nutrition advice, weight tracking insights, and fitness guidance. What would you like to know about today?";
  } else if (lowerMessage.includes('help')) {
    return "I can help you with:\n• Nutrition and calorie tracking advice\n• Weight management strategies\n• Understanding your fitness data\n• Setting and achieving health goals\n\nWhat would you like to focus on?";
  } else {
    return "I'm here to help with your fitness journey! You can ask me about nutrition, weight management, healthy habits, or any fitness-related questions. What would you like to know?";
  }
}