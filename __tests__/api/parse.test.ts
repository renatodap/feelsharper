/**
 * Unified Parse Endpoint Tests
 * 
 * IMPORTANT: This file contains mock implementations as per TDD requirements.
 * Mocks are clearly prefixed with "Mock" and documented.
 * These tests are written BEFORE the implementation.
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/parse/route';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          } 
        },
        error: null
      }))
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-activity-id' },
            error: null
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-user-id', secondary_goals: {} },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}));

// Mock parsers
jest.mock('@/lib/ai/parsers/EnhancedFoodParser');
jest.mock('@/lib/ai/parsers/WorkoutParser');
jest.mock('@/lib/ai/natural-language-parser');

describe('POST /api/parse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Parsing', () => {
    it('should parse weight input correctly', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'weight 175 lbs' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.type).toBe('weight');
      expect(data.fields.weight).toBe(175);
      expect(data.fields.unit).toBe('lbs');
      expect(data.confidence).toBeGreaterThan(90);
    });

    it('should parse food input correctly', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'ate 2 eggs and toast for breakfast' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.type).toBe('nutrition');
      expect(data.fields.foods).toBeDefined();
      expect(Array.isArray(data.fields.foods)).toBe(true);
      expect(data.confidence).toBeGreaterThan(80);
    });

    it('should parse cardio workout correctly', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'ran 5k in 25 minutes' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.type).toBe('cardio');
      expect(data.fields.activity).toContain('ran');
      expect(data.confidence).toBeGreaterThan(80);
    });

    it('should parse strength training correctly', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'bench press 3 sets of 10 reps at 135 lbs' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.type).toBe('strength');
      expect(data.fields.exercise).toContain('bench');
      expect(data.confidence).toBeGreaterThan(80);
    });
  });

  describe('Type Override', () => {
    it('should respect type override for ambiguous input', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw: '175',
          type: 'weight'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe('weight');
      expect(data.fields.weight).toBe(175);
    });

    it('should reject invalid type override', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw: 'ate pizza for lunch',
          type: 'weight'  // Invalid override
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Should parse as food despite override attempt
      expect(response.status).toBe(200);
      expect(data.type).toBe('nutrition');
    });
  });

  describe('Backdating with occurred_at', () => {
    it('should accept and use occurred_at timestamp', async () => {
      const pastDate = '2024-01-01T10:00:00Z';
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw: 'ran 5k',
          occurred_at: pastDate
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timestamp).toBe(pastDate);
    });

    it('should reject future dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw: 'ran 5k',
          occurred_at: futureDate.toISOString()
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use current time instead of future date
      expect(new Date(data.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for empty input', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: '' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should return 401 for unauthenticated requests', async () => {
      // Mock unauthenticated user
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockImplementationOnce(() => Promise.resolve({
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { user: null },
            error: { message: 'Not authenticated' }
          }))
        }
      }));

      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'test input' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication');
    });
  });

  describe('Multiple Activities', () => {
    it('should parse multiple activities in one input', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          raw: 'weight 175, ran 5k, ate chicken salad'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      expect(Array.isArray(data.activities)).toBe(true);
      expect(data.activities.length).toBe(3);
      expect(data.activities[0].type).toBe('weight');
      expect(data.activities[1].type).toBe('cardio');
      expect(data.activities[2].type).toBe('nutrition');
    });
  });

  describe('Confidence Levels', () => {
    it('should return low confidence for ambiguous input', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'feeling good today' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.confidence).toBeLessThan(50);
      expect(data.type).toBe('mood');
    });
  });
});