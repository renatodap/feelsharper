/**
 * Phase 5.6.1: Layer 1 - Habit Formation Data
 * Tracks streaks, lapses, identity markers, and routine consistency for AI training
 */

import { createClient } from '@/lib/supabase/server';

export interface HabitFormationData {
  userId: string;
  habitId: string;
  
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  streakStartDate: Date;
  totalCompletions: number;
  
  // Lapse analysis
  lapseCount: number;
  averageLapseDuration: number; // hours between lapses
  recoveryRate: number; // percentage of times user returns after lapse
  lastLapseDate?: Date;
  
  // Identity markers
  identityGoals: string[]; // "I am someone who..."
  identityReinforcements: string[];
  identityStrength: number; // 0-100 how strongly user identifies with habit
  
  // Routine consistency
  preferredTimes: number[]; // hours of day (0-23)
  consistencyScore: number; // 0-100 how consistent timing is
  contextualCues: string[]; // environmental triggers
  
  // Behavioral patterns
  motivationLevels: Array<{
    date: Date;
    level: number; // 1-10
    context: string;
  }>;
  
  difficultyRatings: Array<{
    date: Date;
    rating: number; // 1-10
    factors: string[];
  }>;
  
  // Metadata for AI learning
  learningData: {
    successfulInterventions: string[];
    failedInterventions: string[];
    personalizedTriggers: string[];
    optimalReinforcementTiming: number; // minutes after completion
  };
}

export interface HabitAnalytics {
  formationStage: 'initiation' | 'development' | 'maintenance' | 'instability';
  predictedFormationDate: Date | null;
  riskFactors: string[];
  strengthFactors: string[];
  nextOptimalIntervention: Date;
  personalizedRecommendations: string[];
}

export class HabitFormationTracker {
  private supabase: any;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Track habit completion with context
   */
  async recordHabitCompletion(
    userId: string,
    habitId: string,
    context: {
      completedAt: Date;
      difficulty: number;
      motivation: number;
      environmentalContext: string;
      timeOfDay: number;
      mood?: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      // Update habit tracking table
      await this.supabase.from('habit_tracking').insert({
        user_id: userId,
        habit_id: habitId,
        completed_at: context.completedAt.toISOString(),
        difficulty_rating: context.difficulty,
        motivation_level: context.motivation,
        environmental_context: context.environmentalContext,
        time_of_day: context.timeOfDay,
        mood: context.mood,
        notes: context.notes,
        is_completed: true
      });

      // Update streak data
      await this.updateStreakData(userId, habitId, context.completedAt);

      // Update routine consistency
      await this.updateRoutineConsistency(userId, habitId, context.timeOfDay);

      // Learn from this completion
      await this.processCompletionForLearning(userId, habitId, context);

    } catch (error) {
      console.error('Error recording habit completion:', error);
      throw error;
    }
  }

  /**
   * Record habit lapse with analysis
   */
  async recordHabitLapse(
    userId: string,
    habitId: string,
    context: {
      missedDate: Date;
      reason: string;
      circumstances: string[];
      recoveryIntent: number; // 1-10 how likely to restart
      notes?: string;
    }
  ): Promise<void> {
    try {
      // Record the lapse
      await this.supabase.from('habit_lapses').insert({
        user_id: userId,
        habit_id: habitId,
        missed_date: context.missedDate.toISOString(),
        reason: context.reason,
        circumstances: context.circumstances,
        recovery_intent: context.recoveryIntent,
        notes: context.notes
      });

      // Break current streak
      await this.breakStreak(userId, habitId, context.missedDate);

      // Analyze lapse patterns
      await this.analyzeLapsePatterns(userId, habitId);

    } catch (error) {
      console.error('Error recording habit lapse:', error);
      throw error;
    }
  }

  /**
   * Update identity markers from user interactions
   */
  async updateIdentityMarkers(
    userId: string,
    habitId: string,
    identityData: {
      identityGoal: string;
      reinforcement: string;
      strength: number;
      context: string;
    }
  ): Promise<void> {
    try {
      // Get current identity data
      const { data: existingData } = await this.supabase
        .from('habit_identity_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .single();

      const updatedData = {
        user_id: userId,
        habit_id: habitId,
        identity_goals: existingData 
          ? [...(existingData.identity_goals || []), identityData.identityGoal]
          : [identityData.identityGoal],
        reinforcements: existingData
          ? [...(existingData.reinforcements || []), identityData.reinforcement]
          : [identityData.reinforcement],
        identity_strength: identityData.strength,
        last_reinforced_at: new Date().toISOString(),
        context: identityData.context
      };

      await this.supabase
        .from('habit_identity_tracking')
        .upsert(updatedData, { onConflict: 'user_id,habit_id' });

    } catch (error) {
      console.error('Error updating identity markers:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive habit analytics for AI training
   */
  async getHabitAnalytics(userId: string, habitId: string): Promise<HabitAnalytics> {
    try {
      // Get all habit data
      const [streakData, lapseData, identityData, completionData] = await Promise.all([
        this.getStreakData(userId, habitId),
        this.getLapseData(userId, habitId),
        this.getIdentityData(userId, habitId),
        this.getCompletionData(userId, habitId)
      ]);

      // Analyze formation stage
      const formationStage = this.determineFormationStage(streakData, completionData);

      // Predict formation date using behavioral science models
      const predictedFormationDate = this.predictHabitFormation(completionData, lapseData);

      // Identify risk and strength factors
      const riskFactors = this.identifyRiskFactors(lapseData, completionData);
      const strengthFactors = this.identifyStrengthFactors(streakData, identityData);

      // Calculate next intervention timing
      const nextOptimalIntervention = this.calculateNextIntervention(
        completionData,
        identityData
      );

      // Generate personalized recommendations
      const personalizedRecommendations = this.generateRecommendations(
        formationStage,
        riskFactors,
        strengthFactors,
        identityData
      );

      return {
        formationStage,
        predictedFormationDate,
        riskFactors,
        strengthFactors,
        nextOptimalIntervention,
        personalizedRecommendations
      };

    } catch (error) {
      console.error('Error getting habit analytics:', error);
      throw error;
    }
  }

  /**
   * Extract training data for AI models
   */
  async extractTrainingData(userId: string): Promise<any[]> {
    try {
      // Get all user habits with comprehensive data
      const { data: habits } = await this.supabase
        .from('habit_tracking')
        .select(`
          *,
          habit_lapses(*),
          habit_identity_tracking(*)
        `)
        .eq('user_id', userId);

      if (!habits) return [];

      // Transform into training examples
      const trainingData = habits.map(habit => ({
        // Input features
        features: {
          streak_length: habit.current_streak || 0,
          lapse_count: habit.habit_lapses?.length || 0,
          identity_strength: habit.habit_identity_tracking?.identity_strength || 0,
          consistency_score: this.calculateConsistencyScore(habit),
          motivation_trend: this.calculateMotivationTrend(habit),
          difficulty_trend: this.calculateDifficultyTrend(habit),
          time_consistency: this.calculateTimeConsistency(habit),
          environmental_stability: this.calculateEnvironmentalStability(habit)
        },
        
        // Output labels
        labels: {
          formation_stage: this.determineFormationStage(habit, habit),
          success_probability: this.calculateSuccessProbability(habit),
          optimal_intervention_type: this.determineOptimalIntervention(habit),
          risk_level: this.calculateRiskLevel(habit)
        },
        
        // Context for personalization
        context: {
          user_type: habit.user_type,
          habit_category: habit.category,
          environmental_factors: habit.environmental_context,
          social_support: habit.social_context
        }
      }));

      return trainingData;

    } catch (error) {
      console.error('Error extracting training data:', error);
      throw error;
    }
  }

  // Private helper methods

  private async updateStreakData(userId: string, habitId: string, completedAt: Date): Promise<void> {
    const { data: currentStreak } = await this.supabase
      .from('habit_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .single();

    const yesterday = new Date(completedAt);
    yesterday.setDate(yesterday.getDate() - 1);

    if (currentStreak && this.isSameDay(new Date(currentStreak.last_completed), yesterday)) {
      // Continue streak
      await this.supabase
        .from('habit_streaks')
        .update({
          current_streak: currentStreak.current_streak + 1,
          longest_streak: Math.max(currentStreak.longest_streak, currentStreak.current_streak + 1),
          last_completed: completedAt.toISOString()
        })
        .eq('user_id', userId)
        .eq('habit_id', habitId);
    } else {
      // Start new streak
      await this.supabase
        .from('habit_streaks')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          current_streak: 1,
          longest_streak: Math.max(currentStreak?.longest_streak || 0, 1),
          streak_start_date: completedAt.toISOString(),
          last_completed: completedAt.toISOString()
        }, { onConflict: 'user_id,habit_id' });
    }
  }

  private async updateRoutineConsistency(userId: string, habitId: string, timeOfDay: number): Promise<void> {
    const { data: routine } = await this.supabase
      .from('habit_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .single();

    const updatedTimes = routine 
      ? [...(routine.preferred_times || []), timeOfDay]
      : [timeOfDay];

    // Calculate consistency score
    const consistencyScore = this.calculateTimeConsistencyScore(updatedTimes);

    await this.supabase
      .from('habit_routines')
      .upsert({
        user_id: userId,
        habit_id: habitId,
        preferred_times: updatedTimes.slice(-30), // Keep last 30 entries
        consistency_score: consistencyScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,habit_id' });
  }

  private calculateTimeConsistencyScore(times: number[]): number {
    if (times.length < 2) return 100;

    const variance = this.calculateVariance(times);
    return Math.max(0, 100 - variance * 4); // Scale variance to 0-100
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private determineFormationStage(streakData: any, completionData: any): HabitAnalytics['formationStage'] {
    const streak = streakData?.current_streak || 0;
    const totalCompletions = completionData?.total_completions || 0;
    const lapseRate = (completionData?.lapse_count || 0) / Math.max(1, totalCompletions);

    if (streak >= 66 && lapseRate < 0.1) return 'maintenance';
    if (streak >= 21 && lapseRate < 0.3) return 'development';
    if (streak >= 7 && lapseRate < 0.5) return 'initiation';
    return 'instability';
  }

  private predictHabitFormation(completionData: any, lapseData: any): Date | null {
    // Simplified prediction model - in real implementation would use ML
    const averageProgress = completionData?.consistency_score || 50;
    const lapseRate = lapseData?.length / Math.max(1, completionData?.total_completions || 1);
    
    if (averageProgress < 30 || lapseRate > 0.6) return null;

    const daysToFormation = Math.max(21, 66 - (averageProgress - 50) * 0.5);
    const formationDate = new Date();
    formationDate.setDate(formationDate.getDate() + daysToFormation);
    
    return formationDate;
  }

  private identifyRiskFactors(lapseData: any[], completionData: any): string[] {
    const factors: string[] = [];
    
    if (lapseData.length > 3) factors.push('High lapse frequency');
    if (completionData?.consistency_score < 40) factors.push('Low timing consistency');
    if (completionData?.motivation_trend < 0) factors.push('Declining motivation');
    if (completionData?.difficulty_trend > 0) factors.push('Increasing difficulty');
    
    return factors;
  }

  private identifyStrengthFactors(streakData: any, identityData: any): string[] {
    const factors: string[] = [];
    
    if (streakData?.current_streak > 7) factors.push('Strong current streak');
    if (identityData?.identity_strength > 70) factors.push('Strong identity alignment');
    if (streakData?.longest_streak > 21) factors.push('Previous long streak success');
    
    return factors;
  }

  private calculateNextIntervention(completionData: any, identityData: any): Date {
    // Calculate optimal timing based on patterns
    const lastCompletion = new Date(completionData?.last_completed || Date.now());
    const optimalHours = identityData?.optimal_reinforcement_timing || 24;
    
    const nextIntervention = new Date(lastCompletion);
    nextIntervention.setHours(nextIntervention.getHours() + optimalHours);
    
    return nextIntervention;
  }

  private generateRecommendations(
    stage: HabitAnalytics['formationStage'],
    riskFactors: string[],
    strengthFactors: string[],
    identityData: any
  ): string[] {
    const recommendations: string[] = [];
    
    switch (stage) {
      case 'initiation':
        recommendations.push('Focus on making the habit smaller and easier');
        recommendations.push('Establish consistent environmental cues');
        break;
      case 'development':
        recommendations.push('Maintain consistency while gradually increasing difficulty');
        recommendations.push('Strengthen identity reinforcement');
        break;
      case 'maintenance':
        recommendations.push('Focus on identity-based motivation');
        recommendations.push('Prepare for challenging situations');
        break;
      case 'instability':
        recommendations.push('Simplify the habit to the smallest possible version');
        recommendations.push('Address underlying barriers');
        break;
    }
    
    return recommendations;
  }

  // Placeholder methods for training data extraction
  private calculateConsistencyScore(habit: any): number {
    return habit.consistency_score || 50;
  }

  private calculateMotivationTrend(habit: any): number {
    return habit.motivation_trend || 0;
  }

  private calculateDifficultyTrend(habit: any): number {
    return habit.difficulty_trend || 0;
  }

  private calculateTimeConsistency(habit: any): number {
    return habit.time_consistency || 50;
  }

  private calculateEnvironmentalStability(habit: any): number {
    return habit.environmental_stability || 50;
  }

  private calculateSuccessProbability(habit: any): number {
    return habit.success_probability || 0.5;
  }

  private determineOptimalIntervention(habit: any): string {
    return habit.optimal_intervention || 'encouragement';
  }

  private calculateRiskLevel(habit: any): number {
    return habit.risk_level || 0.3;
  }

  private async getStreakData(userId: string, habitId: string): Promise<any> {
    const { data } = await this.supabase
      .from('habit_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .single();
    return data;
  }

  private async getLapseData(userId: string, habitId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('habit_lapses')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId);
    return data || [];
  }

  private async getIdentityData(userId: string, habitId: string): Promise<any> {
    const { data } = await this.supabase
      .from('habit_identity_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .single();
    return data;
  }

  private async getCompletionData(userId: string, habitId: string): Promise<any> {
    const { data } = await this.supabase
      .from('habit_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId);
    return data;
  }

  private async processCompletionForLearning(userId: string, habitId: string, context: any): Promise<void> {
    // This would implement learning algorithms to improve AI recommendations
    console.log('Processing completion for learning:', { userId, habitId, context });
  }

  private async breakStreak(userId: string, habitId: string, missedDate: Date): Promise<void> {
    await this.supabase
      .from('habit_streaks')
      .update({
        current_streak: 0,
        last_lapse: missedDate.toISOString()
      })
      .eq('user_id', userId)
      .eq('habit_id', habitId);
  }

  private async analyzeLapsePatterns(userId: string, habitId: string): Promise<void> {
    // Analyze patterns in lapses to improve interventions
    const { data: lapses } = await this.supabase
      .from('habit_lapses')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('missed_date', { ascending: false })
      .limit(10);

    if (lapses) {
      // Extract patterns and update learning data
      console.log('Analyzing lapse patterns:', lapses);
    }
  }
}