import { ActivityLogger } from '@/lib/services/ActivityLogger';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn()
  }))
}));

describe('ActivityLogger', () => {
  let logger: ActivityLogger;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn()
    };
    logger = new ActivityLogger(mockSupabase);
  });

  describe('logActivity', () => {
    test('successfully logs an activity', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'test-id',
          user_id: 'user-123',
          type: 'weight',
          data: { weight: 175, unit: 'lbs' },
          raw_text: 'weight 175',
          confidence: 0.95,
          created_at: new Date().toISOString()
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      const parsedActivity = {
        type: 'weight' as const,
        data: { weight: 175, unit: 'lbs' },
        confidence: 0.95,
        rawText: 'weight 175'
      };

      const result = await logger.logActivity('user-123', parsedActivity);

      expect(mockSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        type: 'weight',
        data: { weight: 175, unit: 'lbs' },
        raw_text: 'weight 175',
        confidence: 0.95,
        metadata: null
      });
      expect(result).toHaveProperty('id', 'test-id');
    });

    test('includes coach response in metadata when provided', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'test-id' },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      const parsedActivity = {
        type: 'food' as const,
        data: { items: [{ name: 'eggs' }], meal: 'breakfast' },
        confidence: 0.85,
        rawText: 'had eggs for breakfast'
      };

      const coachResponse = {
        message: 'Great job logging your breakfast!',
        encouragement: 'Keep tracking your meals'
      };

      await logger.logActivity('user-123', parsedActivity, coachResponse);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { coachResponse }
        })
      );
    });

    test('handles database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      const parsedActivity = {
        type: 'unknown' as const,
        data: {},
        confidence: 0,
        rawText: 'test'
      };

      const result = await logger.logActivity('user-123', parsedActivity);
      expect(result).toBeNull();
    });
  });

  describe('getRecentActivities', () => {
    test('fetches recent activities', async () => {
      const mockData = [
        { id: '1', type: 'weight', created_at: '2024-01-01' },
        { id: '2', type: 'food', created_at: '2024-01-01' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      const result = await logger.getRecentActivities('user-123', 10);

      expect(mockSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(result).toEqual(mockData);
    });

    test('filters by type when specified', async () => {
      const mockEq = jest.fn().mockReturnThis();
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: mockEq,
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      await logger.getRecentActivities('user-123', 10, 'weight');

      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq).toHaveBeenCalledWith('type', 'weight');
    });
  });

  describe('getTodayActivities', () => {
    test('fetches activities for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockData = [
        { id: '1', type: 'weight', created_at: new Date().toISOString() }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      const result = await logger.getTodayActivities('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(result).toEqual(mockData);
    });
  });

  describe('getDailySummary', () => {
    test('fetches daily summary', async () => {
      const mockSummary = {
        date: '2024-01-01',
        food_count: 3,
        workout_count: 1,
        weight_count: 1,
        avg_weight: 175,
        avg_energy: 7,
        total_activities: 5
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSummary,
          error: null
        })
      });

      const result = await logger.getDailySummary('user-123', new Date('2024-01-01'));

      expect(mockSupabase.from).toHaveBeenCalledWith('daily_activity_summary');
      expect(result).toEqual(mockSummary);
    });

    test('handles no data gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' }
        })
      });

      const result = await logger.getDailySummary('user-123', new Date());
      expect(result).toBeNull();
    });
  });

  describe('getActivityStats', () => {
    test('calculates activity statistics', async () => {
      const mockActivities = [
        { type: 'weight', confidence: 0.95 },
        { type: 'food', confidence: 0.85 },
        { type: 'food', confidence: 0.9 },
        { type: 'workout', confidence: 0.8 }
      ];

      const mockSummaries = [
        { date: new Date().toISOString().split('T')[0], total_activities: 5 }
      ];

      // Mock getActivitiesByDateRange
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'activity_logs') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockActivities,
              error: null
            })
          };
        } else if (table === 'daily_activity_summary') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockSummaries,
              error: null
            })
          };
        }
      });

      const stats = await logger.getActivityStats('user-123', 30);

      expect(stats.totalActivities).toBe(4);
      expect(stats.activitiesByType).toEqual({
        weight: 1,
        food: 2,
        workout: 1
      });
      expect(stats.averageConfidence).toBeCloseTo(0.875);
      expect(stats.streakDays).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchActivities', () => {
    test('searches activities by text', async () => {
      const mockData = [
        { id: '1', raw_text: 'ran 5k this morning' },
        { id: '2', raw_text: 'ran 3 miles' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      const result = await logger.searchActivities('user-123', 'ran');

      expect(mockSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(result).toEqual(mockData);
    });
  });

  describe('updateActivity', () => {
    test('updates an activity', async () => {
      const mockUpdated = {
        id: 'test-id',
        data: { weight: 180, unit: 'lbs' }
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdated,
          error: null
        })
      });

      const result = await logger.updateActivity('test-id', {
        data: { weight: 180, unit: 'lbs' }
      });

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteActivity', () => {
    test('deletes an activity', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });

      const result = await logger.deleteActivity('test-id');

      expect(mockSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(result).toBe(true);
    });

    test('returns false on delete error', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' }
        })
      });

      const result = await logger.deleteActivity('test-id');
      expect(result).toBe(false);
    });
  });
});