import { SupabaseClient } from '@supabase/supabase-js';
import { ParsedActivity } from '@/lib/ai/services/openai-parser';
import { CoachResponse } from '@/lib/ai/services/claude-coach';

export interface ActivityLog {
  id: string;
  user_id: string;
  type: string;
  data: any;
  raw_text: string;
  confidence: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  food_count: number;
  workout_count: number;
  weight_count: number;
  avg_weight?: number;
  avg_energy?: number;
  avg_sleep_hours?: number;
  total_water_oz?: number;
  total_activities: number;
}

export class ActivityLogger {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Log a new activity
   */
  async logActivity(
    userId: string,
    parsedActivity: ParsedActivity,
    coachResponse?: CoachResponse
  ): Promise<ActivityLog | null> {
    try {
      const { data, error } = await this.supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          type: parsedActivity.type,
          data: parsedActivity.data,
          raw_text: parsedActivity.rawText,
          confidence: parsedActivity.confidence,
          metadata: coachResponse ? { coachResponse } : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception logging activity:', error);
      return null;
    }
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(
    userId: string,
    limit: number = 10,
    type?: string
  ): Promise<ActivityLog[]> {
    try {
      let query = this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching activities:', error);
      return [];
    }
  }

  /**
   * Get activities for a specific date range
   */
  async getActivitiesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: string
  ): Promise<ActivityLog[]> {
    try {
      let query = this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities by date:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching activities by date:', error);
      return [];
    }
  }

  /**
   * Get today's activities
   */
  async getTodayActivities(userId: string, type?: string): Promise<ActivityLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getActivitiesByDateRange(userId, today, tomorrow, type);
  }

  /**
   * Get daily summary
   */
  async getDailySummary(userId: string, date: Date): Promise<DailySummary | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('daily_activity_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching daily summary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching daily summary:', error);
      return null;
    }
  }

  /**
   * Get weekly summaries
   */
  async getWeeklySummaries(userId: string, weeksBack: number = 4): Promise<DailySummary[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeksBack * 7));

      const { data, error } = await this.supabase
        .from('daily_activity_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching weekly summaries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching weekly summaries:', error);
      return [];
    }
  }

  /**
   * Update an activity
   */
  async updateActivity(
    activityId: string,
    updates: Partial<ActivityLog>
  ): Promise<ActivityLog | null> {
    try {
      const { data, error } = await this.supabase
        .from('activity_logs')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception updating activity:', error);
      return null;
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('activity_logs')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting activity:', error);
      return false;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(userId: string, days: number = 30): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    averageConfidence: number;
    streakDays: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await this.getActivitiesByDateRange(
        userId,
        startDate,
        new Date()
      );

      // Calculate stats
      const activitiesByType: Record<string, number> = {};
      let totalConfidence = 0;

      activities.forEach(activity => {
        activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
        totalConfidence += activity.confidence;
      });

      // Calculate streak
      const summaries = await this.getWeeklySummaries(userId, Math.ceil(days / 7));
      let streakDays = 0;
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasActivity = summaries.some(s => s.date === dateStr && s.total_activities > 0);
        if (hasActivity) {
          streakDays++;
        } else if (i > 0) { // Don't break streak if today has no activities yet
          break;
        }
      }

      return {
        totalActivities: activities.length,
        activitiesByType,
        averageConfidence: activities.length > 0 ? totalConfidence / activities.length : 0,
        streakDays
      };
    } catch (error) {
      console.error('Exception calculating stats:', error);
      return {
        totalActivities: 0,
        activitiesByType: {},
        averageConfidence: 0,
        streakDays: 0
      };
    }
  }

  /**
   * Search activities by text
   */
  async searchActivities(
    userId: string,
    searchText: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .ilike('raw_text', `%${searchText}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception searching activities:', error);
      return [];
    }
  }
}

export default ActivityLogger;