/**
 * Integration tests for Natural Language Parser
 * These tests verify the actual parsing logic works correctly
 */

import { OpenAIParser } from '@/lib/ai/services/openai-parser';

describe('OpenAIParser Integration Tests', () => {
  let parser: OpenAIParser;

  beforeAll(() => {
    // Use a test API key or mock for integration tests
    parser = new OpenAIParser('test-key');
  });

  describe('Weight Parsing', () => {
    test.each([
      ['weight 175', { weight: 175, unit: 'lbs' }],
      ['175 lbs', { weight: 175, unit: 'lbs' }],
      ['80 kg', { weight: 80, unit: 'kg' }],
      ['weight 175.5', { weight: 175.5, unit: 'lbs' }],
      ['82.5 kilos', { weight: 82.5, unit: 'kg' }],
      ['165 pounds', { weight: 165, unit: 'lbs' }],
    ])('parses "%s" correctly', async (input, expectedData) => {
      const result = await parser.parse(input);
      expect(result.type).toBe('weight');
      expect(result.data).toEqual(expectedData);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.rawText).toBe(input);
    });
  });

  describe('Food Parsing', () => {
    test.each([
      ['had eggs for breakfast', { meal: 'breakfast', items: [{ name: 'eggs' }] }],
      ['ate chicken salad for lunch', { meal: 'lunch', items: expect.arrayContaining([{ name: 'chicken' }, { name: 'salad' }]) }],
      ['steak and vegetables for dinner', { meal: 'dinner', items: expect.arrayContaining([{ name: 'steak' }, { name: 'vegetables' }]) }],
      ['apple as a snack', { meal: 'snack', items: [{ name: 'apple' }] }],
      ['had eggs and toast for breakfast', { meal: 'breakfast', items: expect.arrayContaining([{ name: 'eggs' }, { name: 'toast' }]) }],
    ])('parses "%s" correctly', async (input, expectedData) => {
      const result = await parser.parse(input);
      expect(result.type).toBe('food');
      expect(result.data.meal).toBe(expectedData.meal);
      if (Array.isArray(expectedData.items)) {
        expect(result.data.items).toEqual(expect.arrayContaining(expectedData.items));
      }
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Workout Parsing', () => {
    test.each([
      ['ran 5k', { activity: 'running', distance: 5, distanceUnit: 'km' }],
      ['ran 5k in 25 minutes', { activity: 'running', distance: 5, distanceUnit: 'km', duration: 25 }],
      ['walked 2 miles', { activity: 'walking', distance: 2, distanceUnit: 'miles' }],
      ['cycled 10km', { activity: 'cycling', distance: 10, distanceUnit: 'km' }],
      ['ran for 30 minutes', { activity: 'running', duration: 30 }],
      ['ran for 1.5 hours', { activity: 'running', duration: 90 }],
    ])('parses "%s" correctly', async (input, expectedData) => {
      const result = await parser.parse(input);
      expect(result.type).toBe('workout');
      expect(result.data.activity).toBe(expectedData.activity);
      if (expectedData.distance) {
        expect(result.data.distance).toBe(expectedData.distance);
        expect(result.data.distanceUnit).toBe(expectedData.distanceUnit);
      }
      if (expectedData.duration) {
        expect(result.data.duration).toBe(expectedData.duration);
      }
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Mood and Energy Parsing', () => {
    test.each([
      ['feeling great today', { type: 'mood', data: { mood: 'great', notes: 'feeling great today' } }],
      ['feeling good', { type: 'mood', data: { mood: 'good', notes: 'feeling good' } }],
      ['feeling terrible', { type: 'mood', data: { mood: 'terrible', notes: 'feeling terrible' } }],
      ['energy 8/10', { type: 'energy', data: { level: 8 } }],
      ['energy 5', { type: 'energy', data: { level: 5 } }],
    ])('parses "%s" correctly', async (input, expected) => {
      const result = await parser.parse(input);
      expect(result.type).toBe(expected.type);
      expect(result.data).toEqual(expected.data);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Sleep and Water Parsing', () => {
    test.each([
      ['slept 8 hours', { type: 'sleep', data: { hours: 8 } }],
      ['slept 7.5 hours', { type: 'sleep', data: { hours: 7.5 } }],
      ['got 6 hrs sleep', { type: 'sleep', data: { hours: 6 } }],
      ['drank 64 oz water', { type: 'water', data: { amount: 64, unit: 'oz' } }],
      ['had 2 liters of water', { type: 'water', data: { amount: 2, unit: 'liters' } }],
      ['drank 8 cups water', { type: 'water', data: { amount: 8, unit: 'cups' } }],
    ])('parses "%s" correctly', async (input, expected) => {
      const result = await parser.parse(input);
      expect(result.type).toBe(expected.type);
      expect(result.data).toEqual(expected.data);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Edge Cases', () => {
    test('handles mixed case input', async () => {
      const result = await parser.parse('WeIgHt 175 LbS');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(175);
    });

    test('handles extra whitespace', async () => {
      const result = await parser.parse('  weight   175   ');
      expect(result.type).toBe('weight');
      expect(result.data.weight).toBe(175);
    });

    test('returns unknown for gibberish', async () => {
      const result = await parser.parse('asdfghjkl qwerty');
      expect(result.type).toBe('unknown');
      expect(result.confidence).toBeLessThanOrEqual(0.5);
    });

    test('preserves raw text in all cases', async () => {
      const input = 'Weight 175 Lbs';
      const result = await parser.parse(input);
      expect(result.rawText).toBe(input);
    });
  });

  describe('Batch Processing', () => {
    test('processes multiple inputs correctly', async () => {
      const inputs = [
        'weight 175',
        'had eggs for breakfast',
        'ran 5k',
        'feeling great',
        'slept 8 hours'
      ];

      const results = await parser.parseBatch(inputs);
      
      expect(results).toHaveLength(5);
      expect(results[0].type).toBe('weight');
      expect(results[1].type).toBe('food');
      expect(results[2].type).toBe('workout');
      expect(results[3].type).toBe('mood');
      expect(results[4].type).toBe('sleep');
    });
  });

  describe('Real-world Examples', () => {
    test.each([
      ['just weighed myself - 172', { type: 'weight', weight: 172 }],
      ['Morning run, 5k in about 28 min', { type: 'workout', activity: 'running' }],
      ['Had a great breakfast - eggs, bacon, toast', { type: 'food', meal: 'breakfast' }],
      ["Didn't sleep well, maybe 5 hours", { type: 'sleep', hours: 5 }],
      ['Energy is low today, like 3/10', { type: 'energy', level: 3 }],
    ])('handles natural language: "%s"', async (input, expected) => {
      const result = await parser.parse(input);
      expect(result.type).toBe(expected.type);
      // Verify key data points are extracted
      if (expected.weight) expect(result.data.weight).toBeDefined();
      if (expected.activity) expect(result.data.activity).toBe(expected.activity);
      if (expected.meal) expect(result.data.meal).toBe(expected.meal);
      if (expected.hours) expect(result.data.hours).toBeDefined();
      if (expected.level) expect(result.data.level).toBeDefined();
    });
  });
});