import OpenAI from 'openai';
import { ParsedHealthLog } from '../types';

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
 * Parses a natural language health log into a structured ParsedHealthLog object.
 * This function is specifically tailored for health and wellness related inputs.
 *
 * @param text The natural language text to parse.
 * @returns A promise that resolves to a ParsedHealthLog object.
 */
export async function parseHealthLogWithOpenAI(text: string): Promise<ParsedHealthLog> {
  const cacheKey = `healthlog:${text}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const systemPrompt = `You are an expert health and wellness data parser. Your task is to parse the user's natural language input into a structured JSON object.

The output JSON object must conform to the following TypeScript interface:
\`\`\`typescript
interface ParsedHealthLog {
  type: 'exercise' | 'nutrition' | 'wellness' | 'measurement' | 'mood' | 'general';
  activity?: string;
  distance?: number;
  distance_unit?: string;
  duration?: number;
  duration_unit?: string;
  mood?: string;
  [key: string]: any;
}
\`\`\`

Here are some examples to guide you:
- Input: "Ran 5k in 25 minutes, feeling great"
- Output: { "type": "exercise", "activity": "running", "distance": 5, "distance_unit": "km", "duration": 25, "duration_unit": "minutes", "mood": "positive" }

- Input: "ate a chicken salad for lunch"
- Output: { "type": "nutrition", "activity": "ate", "food": "chicken salad", "meal": "lunch" }

- Input: "weighed myself this morning, 80kg"
- Output: { "type": "measurement", "activity": "weigh-in", "weight": 80, "weight_unit": "kg" }

- Input: "slept for 8 hours, feel rested"
- Output: { "type": "wellness", "activity": "sleep", "duration": 8, "duration_unit": "hours", "mood": "rested" }

- Input: "feeling stressed today"
- Output: { "type": "mood", "mood": "stressed" }

Key Guidelines:
1.  **Mandatory 'type' field**: The 'type' property must always be present.
2.  **Contextual Extraction**: For 'exercise', extract details like 'activity', 'distance', 'duration'. For 'nutrition', identify food items and meal types. For 'measurement', capture the metric and its value/unit. For 'wellness', note activities such as sleep or meditation.
3.  **Mood Detection**: Extract 'mood' whenever mentioned, regardless of the 'type'.
4.  **Ambiguity Handling**: If the input is unclear or doesn't fit a specific category, set 'type' to 'general' and include the original text in a 'notes' field.
5.  **Field Presence**: Only include fields for which data is present in the input. If a detail like 'duration' is not mentioned, the 'duration' field should not be in the output.
6.  **Unit Standardization**: Standardize units where possible (e.g., convert 'k' or 'kms' to 'km').

Now, parse the following user input.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 500,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    const parsed = JSON.parse(content) as Omit<ParsedHealthLog, 'raw_text'>;
    const result: ParsedHealthLog = {
        ...parsed,
        raw_text: text
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL
    });

    return result;
  } catch (error) {
    console.error('OpenAI health log parsing error:', error);

    // Fallback response for failed parsing
    return {
      raw_text: text,
      type: 'general',
      notes: text
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