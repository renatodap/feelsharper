import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedActivity {
  type: 'cardio' | 'strength' | 'sport' | 'wellness' | 'nutrition' | 'sleep' | 'mood' | 'weight';
  confidence: number;
  structuredData: Record<string, any>;
  subjectiveNotes?: string;
  timestamp?: Date;
}

const PARSING_PROMPT = `You are an expert fitness and wellness data parser. Parse the user's natural language input into structured data.

CRITICAL: Return ONLY valid JSON, no markdown, no explanation.

Activity types: cardio, strength, sport, wellness, nutrition, sleep, mood, weight

For each input, extract:
1. Activity type (most relevant category)
2. Confidence level (0-100)
3. Structured data (specific to activity type)
4. Subjective notes (feelings, observations)
5. Timestamp if mentioned

Examples:
"ran 5k in 25 minutes" → {
  "type": "cardio",
  "confidence": 95,
  "structuredData": {
    "activity": "running",
    "distance": 5,
    "distanceUnit": "km",
    "duration": 25,
    "durationUnit": "minutes",
    "pace": 5.0
  }
}

"had eggs and toast for breakfast" → {
  "type": "nutrition",
  "confidence": 90,
  "structuredData": {
    "meal": "breakfast",
    "foods": ["eggs", "toast"],
    "estimatedCalories": 350,
    "protein": 20,
    "carbs": 30
  }
}

"weight 175 feeling good" → {
  "type": "weight",
  "confidence": 95,
  "structuredData": {
    "weight": 175,
    "unit": "lbs"
  },
  "subjectiveNotes": "feeling good"
}`;

export async function parseNaturalLanguage(input: string): Promise<ParsedActivity> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: PARSING_PROMPT },
        { role: "user", content: input }
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const parsed = JSON.parse(response);
    
    return {
      type: parsed.type,
      confidence: parsed.confidence,
      structuredData: parsed.structuredData,
      subjectiveNotes: parsed.subjectiveNotes,
      timestamp: parsed.timestamp ? new Date(parsed.timestamp) : undefined
    };
  } catch (error) {
    console.error('Natural language parsing error:', error);
    
    // Fallback parsing for common patterns
    return fallbackParser(input);
  }
}

function fallbackParser(input: string): ParsedActivity {
  const lowerInput = input.toLowerCase();
  
  // Weight patterns
  if (lowerInput.includes('weight') || lowerInput.includes('weigh')) {
    const weightMatch = input.match(/(\d+\.?\d*)\s*(lbs?|kg|pounds?|kilos?)?/i);
    if (weightMatch) {
      return {
        type: 'weight',
        confidence: 70,
        structuredData: {
          weight: parseFloat(weightMatch[1]),
          unit: weightMatch[2]?.includes('k') ? 'kg' : 'lbs'
        }
      };
    }
  }
  
  // Sleep patterns
  if (lowerInput.includes('slept') || lowerInput.includes('sleep')) {
    const hoursMatch = input.match(/(\d+\.?\d*)\s*hours?/i);
    if (hoursMatch) {
      return {
        type: 'sleep',
        confidence: 70,
        structuredData: {
          hours: parseFloat(hoursMatch[1]),
          quality: lowerInput.includes('well') ? 8 : 5
        }
      };
    }
  }
  
  // Exercise patterns
  if (lowerInput.includes('ran') || lowerInput.includes('run')) {
    const distanceMatch = input.match(/(\d+\.?\d*)\s*(k|km|mi|miles?)?/i);
    const timeMatch = input.match(/(\d+):?(\d+)?/);
    
    return {
      type: 'cardio',
      confidence: 60,
      structuredData: {
        activity: 'running',
        distance: distanceMatch ? parseFloat(distanceMatch[1]) : undefined,
        distanceUnit: distanceMatch?.[2]?.includes('mi') ? 'miles' : 'km',
        duration: timeMatch ? parseInt(timeMatch[1]) + (timeMatch[2] ? parseInt(timeMatch[2])/60 : 0) : undefined
      }
    };
  }
  
  // Default to mood if unclear
  return {
    type: 'mood',
    confidence: 30,
    structuredData: {
      mood: 'neutral',
      notes: input
    },
    subjectiveNotes: input
  };
}