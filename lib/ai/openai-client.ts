import OpenAI from 'openai';

// Initialize OpenAI client with configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 100,
  requestsPerHour: 3000,
};

// In-memory cache for common queries (24 hour TTL)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface ParseRequest {
  text: string;
  context?: 'fitness' | 'nutrition' | 'wellness' | 'general';
  userId?: string;
}

export interface ParseResponse {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  structured_data: any;
  original_text: string;
  subjective_notes?: string;
}

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a test assistant. Respond with exactly: 'Connection successful'"
        },
        {
          role: "user", 
          content: "Test connection"
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const result = response.choices[0]?.message?.content?.trim();
    return result === 'Connection successful';
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}

/**
 * Parse natural language input using OpenAI GPT-4
 */
export async function parseNaturalLanguage(request: ParseRequest): Promise<ParseResponse> {
  const { text, context = 'general', userId } = request;
  
  // Check cache first
  const cacheKey = `parse:${text}:${context}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const systemPrompt = `You are an expert fitness and wellness data parser. Parse the user's natural language input into structured data.

Context: ${context}

Return a JSON object with this exact structure:
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
    // Structured format for database storage
    "activity_type": "cardio|strength|sport|wellness|nutrition|sleep|mood|weight",
    "value": number,
    "unit": "string",
    "notes": "string"
  },
  "subjective_notes": "Any subjective feelings, mood, or qualitative observations"
}

Be conservative with confidence scores. Only use 90+ for very clear, unambiguous inputs.
Extract subjective feelings and mood separately from objective data.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this: "${text}"` }
      ],
      max_tokens: 500,
      temperature: 0
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    const parsed = JSON.parse(content) as ParseResponse;
    parsed.original_text = text;

    // Cache the result
    cache.set(cacheKey, {
      data: parsed,
      expires: Date.now() + CACHE_TTL
    });

    return parsed;
  } catch (error) {
    console.error('OpenAI parsing error:', error);
    
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
 * Generate food suggestions based on user input
 */
export async function suggestFoods(query: string): Promise<string[]> {
  const cacheKey = `foods:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Given a food query, return a JSON array of 5 specific food suggestions with common portion sizes. Example: ['Chicken breast (100g)', 'Brown rice (1 cup cooked)', 'Broccoli (1 cup)']"
        },
        {
          role: "user",
          content: `Suggest foods for: ${query}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const result = JSON.parse(content);
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

    // Cache the result
    cache.set(cacheKey, {
      data: suggestions,
      expires: Date.now() + CACHE_TTL
    });

    return suggestions;
  } catch (error) {
    console.error('OpenAI food suggestions error:', error);
    return [];
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

export { openai };