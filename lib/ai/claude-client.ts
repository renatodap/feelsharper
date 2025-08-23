import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 100,
  requestsPerHour: 3000,
};

// In-memory cache for coaching insights (1 hour TTL)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface CoachingRequest {
  message: string;
  context?: {
    user_profile?: any;
    recent_activities?: any[];
    user_goals?: any;
    user_constraints?: string[];
  };
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  coaching_mode?: 'insight' | 'conversation' | 'analysis' | 'recommendation';
}

export interface CoachingResponse {
  response: string;
  insights?: string[];
  recommendations?: string[];
  questions?: string[];
  confidence: number;
  coaching_type: 'motivational' | 'analytical' | 'educational' | 'supportive';
  follow_up_suggestions?: string[];
}

/**
 * Test Claude connection
 */
export async function testClaudeConnection(): Promise<boolean> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 10,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: "Test connection. Respond with exactly: 'Connection successful'"
        }
      ]
    });

    const result = response.content[0];
    if (result.type === 'text') {
      return result.text.trim() === 'Connection successful';
    }
    return false;
  } catch (error) {
    console.error('Claude connection test failed:', error);
    return false;
  }
}

/**
 * Get AI coaching response from Claude
 */
export async function getCoachingResponse(request: CoachingRequest): Promise<CoachingResponse> {
  const { 
    message, 
    context = {}, 
    conversation_history = [], 
    coaching_mode = 'conversation' 
  } = request;

  // Check cache for insights (not conversations)
  if (coaching_mode === 'insight') {
    const cacheKey = `insight:${message}:${JSON.stringify(context)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
  }

  const systemPrompt = `You are FeelSharper's AI fitness coach - an expert in exercise physiology, nutrition, sleep science, and behavioral psychology. You help users optimize their health and fitness through personalized, science-based advice.

CORE PRINCIPLES:
1. Evidence-based recommendations (cite ACSM, WHO, ISSN guidelines when relevant)
2. Personalized advice based on user context and goals
3. Safety first - always recommend consulting professionals for medical issues
4. Motivational but realistic tone
5. Actionable, specific advice over generic platitudes
6. Confidence-aware responses (be transparent about uncertainty)

COACHING MODES:
- insight: Generate 2-3 key insights from recent data
- conversation: Natural dialogue with follow-up questions
- analysis: Deep dive into patterns and trends
- recommendation: Specific action items

USER CONTEXT:
${context.user_profile ? `Profile: ${JSON.stringify(context.user_profile)}` : 'No profile data'}
${context.recent_activities?.length ? `Recent Activities: ${JSON.stringify(context.recent_activities)}` : 'No recent activity data'}
${context.user_goals ? `Goals: ${JSON.stringify(context.user_goals)}` : 'No specific goals set'}
${context.user_constraints?.length ? `Constraints: ${context.user_constraints.join(', ')}` : 'No known constraints'}

CONVERSATION HISTORY:
${conversation_history.map(h => `${h.role}: ${h.content}`).join('\n')}

Current mode: ${coaching_mode}

Respond in JSON format:
{
  "response": "Main coaching response (2-4 sentences max for conversation, longer for analysis)",
  "insights": ["Key insight 1", "Key insight 2"],
  "recommendations": ["Specific action 1", "Specific action 2"],
  "questions": ["Follow-up question to understand user better"],
  "confidence": 0-100,
  "coaching_type": "motivational|analytical|educational|supportive",
  "follow_up_suggestions": ["What we could explore next"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        { role: "user", content: systemPrompt },
        { role: "assistant", content: "I understand. I'm ready to provide personalized fitness coaching. What would you like to discuss?" },
        { role: "user", content: message }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    let parsed: CoachingResponse;
    try {
      parsed = JSON.parse(content.text);
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        response: content.text,
        confidence: 70,
        coaching_type: 'supportive',
        insights: [],
        recommendations: [],
        questions: [],
        follow_up_suggestions: []
      };
    }

    // Cache insights for reuse
    if (coaching_mode === 'insight') {
      const cacheKey = `insight:${message}:${JSON.stringify(context)}`;
      cache.set(cacheKey, {
        data: parsed,
        expires: Date.now() + CACHE_TTL
      });
    }

    return parsed;
  } catch (error) {
    console.error('Claude coaching error:', error);
    
    // Fallback response for failed requests
    return {
      response: "I'm having trouble connecting right now, but I'm here to help! Could you tell me more about what you're working on with your fitness journey?",
      confidence: 0,
      coaching_type: 'supportive',
      insights: [],
      recommendations: [],
      questions: ["What's your main fitness goal right now?"],
      follow_up_suggestions: ["Let's start with the basics - what does your current routine look like?"]
    };
  }
}

/**
 * Generate daily insights based on user data
 */
export async function generateDailyInsights(userData: {
  recent_activities: any[];
  user_profile: any;
  goals: any;
}): Promise<string[]> {
  const cacheKey = `daily:${JSON.stringify(userData)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const request: CoachingRequest = {
      message: "Generate 2-3 key insights from my recent activity data for today's dashboard",
      context: {
        user_profile: userData.user_profile,
        recent_activities: userData.recent_activities,
        user_goals: userData.goals
      },
      coaching_mode: 'insight'
    };

    const response = await getCoachingResponse(request);
    const insights = response.insights || [];

    // Cache for 1 hour
    cache.set(cacheKey, {
      data: insights,
      expires: Date.now() + CACHE_TTL
    });

    return insights;
  } catch (error) {
    console.error('Daily insights error:', error);
    return [
      "Keep up the consistency! Your recent activity shows good commitment.",
      "Consider tracking how you feel after workouts to optimize recovery.",
      "Small improvements add up - focus on one thing at a time."
    ];
  }
}

/**
 * Analyze patterns and provide recommendations
 */
export async function analyzeUserPatterns(data: {
  activities: any[];
  timeframe: 'week' | 'month';
  focus_area?: 'performance' | 'recovery' | 'nutrition' | 'general';
}): Promise<CoachingResponse> {
  try {
    const request: CoachingRequest = {
      message: `Analyze my ${data.timeframe} patterns and provide recommendations focusing on ${data.focus_area || 'general'} improvement`,
      context: {
        recent_activities: data.activities
      },
      coaching_mode: 'analysis'
    };

    return await getCoachingResponse(request);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return {
      response: "I'd love to analyze your patterns! Could you share more details about what you'd like me to focus on?",
      confidence: 0,
      coaching_type: 'supportive',
      insights: [],
      recommendations: [],
      questions: ["What aspect of your fitness would you like me to analyze?"],
      follow_up_suggestions: []
    };
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now >= value.expires) {
      cache.delete(key);
    }
  }
}

// Clean up cache every 30 minutes
setInterval(clearExpiredCache, 30 * 60 * 1000);

export { anthropic };