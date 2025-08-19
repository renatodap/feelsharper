import { OpenAIParser } from '@/lib/ai/services/openai-parser';

// Mock OpenAI
jest.mock('openai', () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                type: 'unknown',
                data: {},
                confidence: 0.5
              })
            }
          }]
        })
      }
    };
    
    constructor(config: any) {
      // Mock constructor
    }
  }
  
  return { OpenAI: MockOpenAI };
});

describe('OpenAIParser', () => {
  let parser: OpenAIParser;

  beforeEach(() => {
    parser = new OpenAIParser('test-api-key');
  });

  describe('Quick Pattern Matching', () => {
    test('parses weight in pounds', async () => {
      const result = await parser.parse('weight 175');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(175);
      expect(result.data.unit).toBe('lbs');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('parses weight in kg', async () => {
      const result = await parser.parse('80 kg');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(80);
      expect(result.data.unit).toBe('kg');
    });

    test('parses weight with "pounds" word', async () => {
      const result = await parser.parse('175 pounds');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(175);
      expect(result.data.unit).toBe('lbs');
    });

    test('parses energy level', async () => {
      const result = await parser.parse('energy 8/10');
      expect(result.type).toBe('energy');
      expect(result.data.level).toBe(8);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('parses sleep hours', async () => {
      const result = await parser.parse('slept 8 hours');
      expect(result.type).toBe('sleep');
      expect(result.data.hours).toBe(8);
    });

    test('parses water intake in oz', async () => {
      const result = await parser.parse('drank 64 oz water');
      expect(result.type).toBe('water');
      expect(result.data.amount).toBe(64);
      expect(result.data.unit).toBe('oz');
    });

    test('parses water intake in liters', async () => {
      const result = await parser.parse('had 2 liters of water');
      expect(result.type).toBe('water');
      expect(result.data.amount).toBe(2);
      expect(result.data.unit).toBe('liters');
    });
  });

  describe('Food Parsing', () => {
    test('parses breakfast with food items', async () => {
      const result = await parser.parse('had eggs and toast for breakfast');
      expect(result.type).toBe('food');
      expect(result.data.meal).toBe('breakfast');
      expect(result.data.items).toContainEqual({ name: 'eggs' });
      expect(result.data.items).toContainEqual({ name: 'toast' });
    });

    test('parses lunch', async () => {
      const result = await parser.parse('chicken salad for lunch');
      expect(result.type).toBe('food');
      expect(result.data.meal).toBe('lunch');
      expect(result.data.items).toContainEqual({ name: 'chicken' });
      expect(result.data.items).toContainEqual({ name: 'salad' });
    });

    test('parses dinner', async () => {
      const result = await parser.parse('steak and vegetables for dinner');
      expect(result.type).toBe('food');
      expect(result.data.meal).toBe('dinner');
      expect(result.data.items.length).toBeGreaterThan(0);
    });

    test('parses snack', async () => {
      const result = await parser.parse('apple as a snack');
      expect(result.type).toBe('food');
      expect(result.data.meal).toBe('snack');
      expect(result.data.items).toContainEqual({ name: 'apple' });
    });
  });

  describe('Workout Parsing', () => {
    test('parses running with distance and time', async () => {
      const result = await parser.parse('ran 5k in 25 minutes');
      expect(result.type).toBe('workout');
      expect(result.data.activity).toBe('running');
      expect(result.data.distance).toBe(5);
      expect(result.data.distanceUnit).toBe('km');
      expect(result.data.duration).toBe(25);
    });

    test('parses walking distance', async () => {
      const result = await parser.parse('walked 2 miles');
      expect(result.type).toBe('workout');
      expect(result.data.activity).toBe('walking');
      expect(result.data.distance).toBe(2);
      expect(result.data.distanceUnit).toBe('miles');
    });

    test('parses cycling', async () => {
      const result = await parser.parse('cycled 10km');
      expect(result.type).toBe('workout');
      expect(result.data.activity).toBe('cycling');
      expect(result.data.distance).toBe(10);
      expect(result.data.distanceUnit).toBe('km');
    });

    test('parses workout duration in hours', async () => {
      const result = await parser.parse('ran for 1.5 hours');
      expect(result.type).toBe('workout');
      expect(result.data.duration).toBe(90); // Converted to minutes
    });
  });

  describe('Mood Parsing', () => {
    test('parses feeling great', async () => {
      const result = await parser.parse('feeling great today');
      expect(result.type).toBe('mood');
      expect(result.data.mood).toBe('great');
      expect(result.data.notes).toBe('feeling great today');
    });

    test('parses feeling good', async () => {
      const result = await parser.parse('I feel good');
      expect(result.type).toBe('mood');
      expect(result.data.mood).toBe('good');
    });

    test('parses feeling bad', async () => {
      const result = await parser.parse('feeling bad');
      expect(result.type).toBe('mood');
      expect(result.data.mood).toBe('bad');
    });

    test('parses feeling terrible', async () => {
      const result = await parser.parse('feeling terrible today');
      expect(result.type).toBe('mood');
      expect(result.data.mood).toBe('terrible');
    });
  });

  describe('Batch Processing', () => {
    test('processes multiple inputs in batch', async () => {
      const inputs = [
        'weight 175',
        'had eggs for breakfast',
        'ran 5k'
      ];

      const results = await parser.parseBatch(inputs);
      expect(results).toHaveLength(3);
      expect(results[0].type).toBe('weight');
      expect(results[1].type).toBe('food');
      expect(results[2].type).toBe('workout');
    });
  });

  describe('Edge Cases', () => {
    test('handles decimal weights', async () => {
      const result = await parser.parse('weight 175.5');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(175.5);
    });

    test('handles decimal sleep hours', async () => {
      const result = await parser.parse('slept 7.5 hours');
      expect(result.type).toBe('sleep');
      expect(result.data.hours).toBe(7.5);
    });

    test('returns unknown for unrecognized input', async () => {
      const result = await parser.parse('random gibberish text');
      expect(result.type).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
    });

    test('preserves raw text in all responses', async () => {
      const text = 'weight 175 lbs';
      const result = await parser.parse(text);
      expect(result.rawText).toBe(text);
    });
  });
});