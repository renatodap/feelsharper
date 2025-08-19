import OpenAI from 'openai';

interface ParsedActivity {
  type: 'weight' | 'food' | 'workout' | 'mood' | 'energy' | 'sleep' | 'water' | 'unknown';
  data: any;
  confidence: number;
  rawText: string;
}

interface WeightData {
  weight: number;
  unit: 'lbs' | 'kg';
}

interface FoodData {
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    calories?: number;
  }>;
  meal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface WorkoutData {
  activity: string;
  duration?: number;
  distance?: number;
  distanceUnit?: string;
  sets?: Array<{
    reps?: number;
    weight?: number;
    weightUnit?: string;
  }>;
  intensity?: 'low' | 'medium' | 'high';
}

interface MoodData {
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  notes?: string;
}

interface EnergyData {
  level: number; // 1-10
  notes?: string;
}

interface SleepData {
  hours: number;
  quality?: 'great' | 'good' | 'poor';
}

interface WaterData {
  amount: number;
  unit: 'oz' | 'ml' | 'cups' | 'liters';
}

export class OpenAIParser {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async parse(text: string): Promise<ParsedActivity> {
    try {
      // Quick pattern matching for common cases
      const quickParse = this.quickPatternMatch(text);
      if (quickParse && quickParse.confidence >= 0.8) {
        return quickParse;
      }

      // Use OpenAI for complex parsing
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a fitness activity parser. Parse user input into structured data.
            
            Return JSON with:
            - type: one of [weight, food, workout, mood, energy, sleep, water, unknown]
            - data: structured data based on type
            - confidence: 0-1 confidence score
            
            Examples:
            "weight 175" -> {"type": "weight", "data": {"weight": 175, "unit": "lbs"}, "confidence": 0.95}
            "had eggs for breakfast" -> {"type": "food", "data": {"items": [{"name": "eggs"}], "meal": "breakfast"}, "confidence": 0.9}
            "ran 5k in 25 minutes" -> {"type": "workout", "data": {"activity": "running", "distance": 5, "distanceUnit": "km", "duration": 25}, "confidence": 0.95}
            "feeling great today" -> {"type": "mood", "data": {"mood": "great", "notes": "feeling great today"}, "confidence": 0.85}
            "energy 8/10" -> {"type": "energy", "data": {"level": 8}, "confidence": 0.95}
            "slept 8 hours" -> {"type": "sleep", "data": {"hours": 8}, "confidence": 0.95}
            "drank 64 oz water" -> {"type": "water", "data": {"amount": 64, "unit": "oz"}, "confidence": 0.95}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        ...result,
        rawText: text
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      return this.fallbackParse(text);
    }
  }

  private quickPatternMatch(text: string): ParsedActivity | null {
    const normalizedText = text.toLowerCase().trim();

    // Weight patterns
    const weightMatch = normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg|kilos?|pounds?)?$/i);
    if (weightMatch) {
      const weight = parseFloat(weightMatch[1]);
      const unit = weightMatch[2]?.includes('k') ? 'kg' : 'lbs';
      return {
        type: 'weight',
        data: { weight, unit } as WeightData,
        confidence: 0.95,
        rawText: text
      };
    }

    // Energy patterns
    const energyMatch = normalizedText.match(/energy\s+(\d+)(?:\/10)?/i);
    if (energyMatch) {
      return {
        type: 'energy',
        data: { level: parseInt(energyMatch[1]) } as EnergyData,
        confidence: 0.95,
        rawText: text
      };
    }

    // Sleep patterns
    const sleepMatch = normalizedText.match(/slept?\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?/i);
    if (sleepMatch) {
      return {
        type: 'sleep',
        data: { hours: parseFloat(sleepMatch[1]) } as SleepData,
        confidence: 0.95,
        rawText: text
      };
    }

    // Water patterns
    const waterMatch = normalizedText.match(/(?:drank|had|drink|water)?\s*(\d+(?:\.\d+)?)\s*(oz|ml|cups?|liters?|l)\s*(?:of\s*)?(?:water)?/i);
    if (waterMatch && (normalizedText.includes('water') || normalizedText.includes('drank') || normalizedText.includes('drink'))) {
      const amount = parseFloat(waterMatch[1]);
      let unit: 'oz' | 'ml' | 'cups' | 'liters' = 'oz';
      if (waterMatch[2]) {
        if (waterMatch[2].includes('ml')) unit = 'ml';
        else if (waterMatch[2].includes('cup')) unit = 'cups';
        else if (waterMatch[2].includes('liter') || waterMatch[2] === 'l') unit = 'liters';
        else if (waterMatch[2].includes('oz')) unit = 'oz';
      }
      return {
        type: 'water',
        data: { amount, unit } as WaterData,
        confidence: 0.9,
        rawText: text
      };
    }

    // Simple food patterns
    const mealKeywords = ['breakfast', 'lunch', 'dinner', 'snack'];
    const hasMealKeyword = mealKeywords.some(keyword => normalizedText.includes(keyword));
    const foodItems = this.extractFoodItems(normalizedText);
    
    if (hasMealKeyword || (foodItems.length > 0 && (normalizedText.includes('had') || normalizedText.includes('ate') || normalizedText.includes('for')))) {
      const meal = normalizedText.includes('breakfast') ? 'breakfast' :
                   normalizedText.includes('lunch') ? 'lunch' :
                   normalizedText.includes('dinner') ? 'dinner' :
                   normalizedText.includes('snack') ? 'snack' : undefined;
      
      if (foodItems.length > 0 || hasMealKeyword) {
        return {
          type: 'food',
          data: { items: foodItems.length > 0 ? foodItems : [{name: 'meal'}], meal } as FoodData,
          confidence: 0.85,
          rawText: text
        };
      }
    }

    // Workout patterns - check for actual workout words, not just substrings
    const workoutWords = ['ran', 'run', 'running', 'walked', 'walking', 'cycled', 'cycling', 'biked', 'biking'];
    const hasWorkoutWord = workoutWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(normalizedText);
    });
    
    if (hasWorkoutWord) {
      return this.parseWorkout(normalizedText, text);
    }

    // Mood patterns
    const moodKeywords = ['feeling', 'feel', 'mood'];
    if (moodKeywords.some(keyword => normalizedText.includes(keyword))) {
      return this.parseMood(normalizedText, text);
    }

    return null;
  }

  private extractFoodItems(text: string): Array<{name: string}> {
    // Common food words
    const foodWords = [
      'eggs', 'toast', 'chicken', 'rice', 'salad', 'sandwich', 'pizza',
      'pasta', 'steak', 'fish', 'vegetables', 'fruit', 'yogurt', 'cereal',
      'oatmeal', 'coffee', 'tea', 'juice', 'milk', 'cheese', 'bread',
      'apple', 'banana', 'orange', 'berries', 'nuts', 'soup', 'burger'
    ];

    const items: Array<{name: string}> = [];
    for (const food of foodWords) {
      if (text.includes(food)) {
        items.push({ name: food });
      }
    }

    return items;
  }

  private parseWorkout(text: string, rawText: string): ParsedActivity | null {
    const activity = text.includes('ran') || text.includes('run') ? 'running' :
                    text.includes('walked') || text.includes('walk') ? 'walking' :
                    text.includes('cycled') || text.includes('cycle') || text.includes('bike') ? 'cycling' : 'exercise';

    const data: WorkoutData = { activity };

    // Extract distance - match patterns like "5k", "5km", "2 miles", etc
    const distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|meters?|m)\b/i);
    if (distanceMatch) {
      data.distance = parseFloat(distanceMatch[1]);
      const unitStr = distanceMatch[2].toLowerCase();
      if (unitStr === 'k' || unitStr === 'km') {
        data.distanceUnit = 'km';
      } else if (unitStr.includes('mi')) {
        data.distanceUnit = 'miles';
      } else {
        data.distanceUnit = 'm';
      }
    }

    // Extract duration - look for patterns like "25 minutes", "in 25 minutes", "for 1.5 hours"
    const durationMatch = text.match(/(?:in\s+|for\s+)?(\d+(?:\.\d+)?)\s*(mins?|minutes?|hours?|hrs?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      data.duration = unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
    }

    return {
      type: 'workout',
      data,
      confidence: 0.85,
      rawText
    };
  }

  private parseMood(text: string, rawText: string): ParsedActivity {
    let mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible' = 'okay';
    
    if (text.includes('great') || text.includes('excellent') || text.includes('amazing')) {
      mood = 'great';
    } else if (text.includes('good') || text.includes('fine') || text.includes('well')) {
      mood = 'good';
    } else if (text.includes('okay') || text.includes('alright') || text.includes('so-so')) {
      mood = 'okay';
    } else if (text.includes('bad') || text.includes('not good') || text.includes('poor')) {
      mood = 'bad';
    } else if (text.includes('terrible') || text.includes('awful') || text.includes('horrible')) {
      mood = 'terrible';
    }

    return {
      type: 'mood',
      data: { mood, notes: rawText } as MoodData,
      confidence: 0.8,
      rawText
    };
  }

  private fallbackParse(text: string): ParsedActivity {
    // Try basic pattern matching as fallback
    const quickParse = this.quickPatternMatch(text);
    if (quickParse) {
      return quickParse;
    }

    // If nothing matches, return unknown
    return {
      type: 'unknown',
      data: { text },
      confidence: 0.1,
      rawText: text
    };
  }

  async parseBatch(texts: string[]): Promise<ParsedActivity[]> {
    return Promise.all(texts.map(text => this.parse(text)));
  }
}

// Export types for use in other modules
export type { ParsedActivity, WeightData, FoodData, WorkoutData, MoodData, EnergyData, SleepData, WaterData };