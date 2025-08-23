import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Cache for common queries (24 hour TTL)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface GeminiParseRequest {
  text: string;
  context?: 'fitness' | 'nutrition' | 'wellness' | 'general';
  userId?: string;
}

export interface GeminiParseResponse {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  structured_data: any;
  original_text: string;
  subjective_notes?: string;
}

export interface GeminiCoachingRequest {
  message: string;
  context?: {
    user_profile?: any;
    recent_activities?: any[];
    user_goals?: any;
  };
  conversation_history?: Array<{
    role: 'user' | 'model';
    parts: string;
  }>;
  coaching_mode?: 'insight' | 'conversation' | 'analysis' | 'recommendation';
}

export interface GeminiCoachingResponse {
  response: string;
  insights?: string[];
  recommendations?: string[];
  questions?: string[];
  confidence: number;
  coaching_type: 'motivational' | 'analytical' | 'educational' | 'supportive';
  follow_up_suggestions?: string[];
}

/**
 * Test Gemini connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Test connection. Respond with exactly: Connection successful');
    const response = result.response;
    const text = response.text();
    
    return text.trim() === 'Connection successful';
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

/**
 * Parse natural language input using Gemini (PRIMARY PARSER)
 */
export async function parseNaturalLanguageWithGemini(request: GeminiParseRequest): Promise<GeminiParseResponse> {
  const { text, context = 'general', userId } = request;
  
  // Check cache first
  const cacheKey = `gemini:parse:${text}:${context}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const prompt = `You are an expert fitness and wellness data parser. Parse this natural language input into structured JSON data.

Context: ${context}

Input: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "intent": "fitness|nutrition|wellness|measurement|mood|general",
  "entities": {
    // Extract relevant entities based on intent
    // For fitness: exercise, sets, reps, weight, duration, etc.
    // For nutrition: food, quantity, calories, macros, etc.
    // For wellness: sleep, mood, energy, stress, etc.
    // For measurement: weight, body_fat, measurements, etc.
  },
  "confidence": 0-100,
  "structured_data": {
    "activity_type": "cardio|strength|sport|wellness|nutrition|sleep|mood|weight",
    "value": number,
    "unit": "string",
    "notes": "string",
    "sport_name": "string (if activity_type is sport, specify the sport: tennis, basketball, soccer, etc.)",
    "exercise_name": "string (if activity_type is strength or cardio, specify the exercise: running, bench press, squats, etc.)"
  },
  "subjective_notes": "Any subjective feelings, mood, or qualitative observations"
}

Be conservative with confidence scores. Only use 90+ for very clear, unambiguous inputs.
Extract subjective feelings separately from objective data.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 500,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text();
    
    // Clean up the response to extract JSON
    content = content.replace(/```json\n?|\n?```/g, '').trim();
    
    const parsed = JSON.parse(content) as GeminiParseResponse;
    parsed.original_text = text;

    // Cache the result
    cache.set(cacheKey, {
      data: parsed,
      expires: Date.now() + CACHE_TTL
    });

    return parsed;
  } catch (error) {
    console.error('Gemini parsing error:', error);
    
    // Fallback response for failed parsing
    return {
      intent: 'general',
      entities: {},
      confidence: 0,
      structured_data: {
        activity_type: 'wellness',
        value: 0,
        unit: 'text',
        notes: text
      },
      original_text: text,
      subjective_notes: text
    };
  }
}

/**
 * Get AI coaching response from Gemini (PRIMARY COACH for general advice)
 */
export async function getGeminiCoachingResponse(request: GeminiCoachingRequest): Promise<GeminiCoachingResponse> {
  const { 
    message, 
    context = {}, 
    conversation_history = [], 
    coaching_mode = 'conversation' 
  } = request;

  // Check cache for insights (not conversations)
  if (coaching_mode === 'insight') {
    const cacheKey = `gemini:insight:${message}:${JSON.stringify(context)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
  }

  const prompt = `You are FeelSharper's AI fitness coach. You help users optimize their health and fitness through personalized, science-based advice.

CORE PRINCIPLES:
1. Evidence-based recommendations
2. Personalized advice based on user context
3. Safety first - recommend professionals for medical issues
4. Motivational but realistic tone
5. Actionable, specific advice
6. Be transparent about uncertainty

USER CONTEXT:
${context.user_profile ? `Profile: ${JSON.stringify(context.user_profile)}` : 'No profile data'}
${context.recent_activities?.length ? `Recent Activities: ${JSON.stringify(context.recent_activities)}` : 'No recent activity data'}
${context.user_goals ? `Goals: ${JSON.stringify(context.user_goals)}` : 'No specific goals set'}

CONVERSATION HISTORY:
${conversation_history.map(h => `${h.role}: ${h.parts}`).join('\n')}

Current mode: ${coaching_mode}
User message: ${message}

Respond ONLY in this JSON format:
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text();
    
    // Clean up the response to extract JSON
    content = content.replace(/```json\n?|\n?```/g, '').trim();

    let parsed: GeminiCoachingResponse;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        response: content,
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
      const cacheKey = `gemini:insight:${message}:${JSON.stringify(context)}`;
      cache.set(cacheKey, {
        data: parsed,
        expires: Date.now() + CACHE_TTL
      });
    }

    return parsed;
  } catch (error) {
    console.error('Gemini coaching error:', error);
    
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
 * Generate food suggestions using Gemini
 */
export async function suggestFoodsWithGemini(query: string): Promise<string[]> {
  const cacheKey = `gemini:foods:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a nutrition expert. Given a food query, return a JSON array of 5 specific food suggestions with common portion sizes. 

Query: ${query}

Return ONLY a JSON array like: ["Chicken breast (100g)", "Brown rice (1 cup cooked)", "Broccoli (1 cup)", "Salmon fillet (150g)", "Sweet potato (1 medium)"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text();
    
    // Clean up the response
    content = content.replace(/```json\n?|\n?```/g, '').trim();
    
    const suggestions = JSON.parse(content);

    // Cache the result
    cache.set(cacheKey, {
      data: suggestions,
      expires: Date.now() + CACHE_TTL
    });

    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Gemini food suggestions error:', error);
    return ['Chicken breast (100g)', 'Brown rice (1 cup)', 'Mixed vegetables (1 cup)', 'Greek yogurt (1 cup)', 'Banana (1 medium)'];
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

// Clean up cache every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);

export { genAI };