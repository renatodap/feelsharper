/**
 * Pattern Detection Service for Behavior Change
 * Phase 5.2: Implements sleep-performance correlation, nutrition gap analysis,
 * recovery patterns, and mood-activity correlation for Just-In-Time interventions
 */

import { ActivityLog, UserContext } from './coaching-engine';
import { BehaviorModel, TinyHabit } from './behavior-model';
import { getCoachingResponse } from '../ai/ai-client';

export interface PatternDetectionResult {
  patterns: DetectedPattern[];
  interventions: JustInTimeIntervention[];
  recommendations: AdaptiveRecommendation[];
  confidence: number; // 0-100
}

export interface DetectedPattern {
  type: 'sleep_performance' | 'nutrition_gap' | 'recovery_pattern' | 'mood_activity';
  pattern: string;
  strength: number; // 0-1
  data_points: number;
  time_range: string;
  correlation_score?: number;
  significance: 'high' | 'medium' | 'low';
}

export interface JustInTimeIntervention {
  trigger: {
    condition: string;
    when_to_show: 'before_activity' | 'after_activity' | 'during_low_mood' | 'poor_recovery';
    timing_hours: number[];
  };
  intervention: {
    message: string;
    action_type: 'tiny_habit' | 'implementation_intention' | 'environmental_cue' | 'social_reminder';
    urgency: 'immediate' | 'today' | 'this_week';
  };
  personalization: {
    user_type_specific: boolean;
    motivation_style_adapted: boolean;
    habit_context: string;
  };
}

export interface AdaptiveRecommendation {
  category: 'sleep' | 'nutrition' | 'recovery' | 'mood';
  goal_adjustment: {
    current_goal: string;
    recommended_change: string;
    rationale: string;
  };
  tiny_habit: TinyHabit;
  implementation_intention: {
    if_situation: string;
    then_behavior: string;
    identity_connection: string;
  };
}

export interface CorrelationAnalysis {
  sleep_performance: {
    correlation: number; // -1 to 1
    optimal_sleep_range: { min: number; max: number };
    performance_dropoff_threshold: number;
    sample_size: number;
  };
  nutrition_gaps: {
    pre_workout_timing: { optimal_hours: number; current_average: number };
    post_workout_recovery: { protein_window: number; current_delay: number };
    hydration_patterns: { daily_target: number; average_intake: number };
  };
  recovery_patterns: {
    subjective_recovery_score: number;
    objective_recovery_indicators: string[];
    recovery_time_by_intensity: Record<string, number>;
  };
  mood_activity_correlation: {
    mood_exercise_correlation: number;
    best_mood_activities: string[];
    mood_boosting_patterns: string[];
  };
}

export class PatternDetectionService {
  /**
   * Main entry point for pattern detection analysis
   */
  async analyzePatterns(context: UserContext): Promise<PatternDetectionResult> {
    // Get sufficient data (minimum 14 days of logs)
    const recentLogs = this.getExtendedLogs(context.recentLogs, 14);
    
    if (recentLogs.length < 10) {
      return this.getInsufficientDataResponse();
    }

    // Analyze each pattern type
    const [sleepPatterns, nutritionPatterns, recoveryPatterns, moodPatterns] = await Promise.all([
      this.analyzeSleepPerformanceCorrelation(recentLogs),
      this.analyzeNutritionGaps(recentLogs),
      this.analyzeRecoveryPatterns(recentLogs),
      this.analyzeMoodActivityCorrelation(recentLogs)
    ]);

    // Combine all patterns
    const allPatterns = [
      ...sleepPatterns,
      ...nutritionPatterns,
      ...recoveryPatterns,
      ...moodPatterns
    ];

    // Generate Just-In-Time interventions
    const interventions = await this.generateJustInTimeInterventions(allPatterns, context);

    // Create adaptive recommendations
    const recommendations = await this.generateAdaptiveRecommendations(allPatterns, context);

    // Calculate overall confidence
    const confidence = this.calculatePatternConfidence(allPatterns, recentLogs.length);

    return {
      patterns: allPatterns,
      interventions,
      recommendations,
      confidence
    };
  }

  /**
   * 5.2.1: Sleep-performance correlation with implementation intentions
   */
  private async analyzeSleepPerformanceCorrelation(logs: ActivityLog[]): Promise<DetectedPattern[]> {
    const sleepLogs = logs.filter(log => log.type === 'sleep');
    const performanceLogs = logs.filter(log => 
      ['exercise', 'sport'].includes(log.type) && 
      log.data.intensity !== undefined
    );

    if (sleepLogs.length < 5 || performanceLogs.length < 5) {
      return [];
    }

    // Calculate correlation between sleep hours and next-day performance
    const correlationData: Array<{ sleep: number; performance: number; date: string }> = [];
    
    for (const perfLog of performanceLogs) {
      const previousNight = this.findPreviousNightSleep(perfLog, sleepLogs);
      if (previousNight && previousNight.data.hours) {
        correlationData.push({
          sleep: previousNight.data.hours,
          performance: perfLog.data.intensity || perfLog.data.perceived_exertion || 5,
          date: perfLog.timestamp.toDateString()
        });
      }
    }

    if (correlationData.length < 3) {
      return [];
    }

    const correlation = this.calculateCorrelation(
      correlationData.map(d => d.sleep),
      correlationData.map(d => d.performance)
    );

    // Find optimal sleep range
    const optimalRange = this.findOptimalSleepRange(correlationData);
    
    // Determine pattern significance
    const significance = Math.abs(correlation) > 0.5 ? 'high' : 
                        Math.abs(correlation) > 0.3 ? 'medium' : 'low';

    const patterns: DetectedPattern[] = [];

    if (significance !== 'low') {
      patterns.push({
        type: 'sleep_performance',
        pattern: correlation > 0 ? 
          `Better sleep correlates with improved performance (r=${correlation.toFixed(2)})` :
          `Poor sleep significantly impacts performance (r=${correlation.toFixed(2)})`,
        strength: Math.abs(correlation),
        data_points: correlationData.length,
        time_range: `${correlationData.length} activities over ${Math.ceil((Date.now() - new Date(correlationData[0].date).getTime()) / (1000 * 60 * 60 * 24))} days`,
        correlation_score: correlation,
        significance
      });

      // Add specific pattern for optimal sleep range
      if (optimalRange.min > 0) {
        patterns.push({
          type: 'sleep_performance',
          pattern: `Optimal performance occurs with ${optimalRange.min}-${optimalRange.max} hours of sleep`,
          strength: 0.8,
          data_points: correlationData.length,
          time_range: `Based on ${correlationData.length} sleep-performance pairs`,
          significance
        });
      }
    }

    return patterns;
  }

  /**
   * 5.2.2: Nutrition gap analysis with tiny habit recommendations
   */
  private async analyzeNutritionGaps(logs: ActivityLog[]): Promise<DetectedPattern[]> {
    const nutritionLogs = logs.filter(log => log.type === 'nutrition');
    const exerciseLogs = logs.filter(log => ['exercise', 'sport'].includes(log.type));

    const patterns: DetectedPattern[] = [];

    // Analyze pre-workout nutrition timing
    const preWorkoutGaps = this.analyzePreWorkoutNutritionTiming(nutritionLogs, exerciseLogs);
    if (preWorkoutGaps.significant) {
      patterns.push({
        type: 'nutrition_gap',
        pattern: `Pre-workout nutrition gap: Average ${preWorkoutGaps.averageGap.toFixed(1)} hours between last meal and exercise`,
        strength: preWorkoutGaps.strength,
        data_points: preWorkoutGaps.dataPoints,
        time_range: 'Last 2 weeks',
        significance: preWorkoutGaps.strength > 0.7 ? 'high' : preWorkoutGaps.strength > 0.4 ? 'medium' : 'low'
      });
    }

    // Analyze post-workout recovery nutrition
    const postWorkoutGaps = this.analyzePostWorkoutNutritionTiming(nutritionLogs, exerciseLogs);
    if (postWorkoutGaps.significant) {
      patterns.push({
        type: 'nutrition_gap',
        pattern: `Post-workout recovery gap: Average ${postWorkoutGaps.averageDelay.toFixed(1)} hours delay in recovery nutrition`,
        strength: postWorkoutGaps.strength,
        data_points: postWorkoutGaps.dataPoints,
        time_range: 'Last 2 weeks',
        significance: postWorkoutGaps.strength > 0.7 ? 'high' : postWorkoutGaps.strength > 0.4 ? 'medium' : 'low'
      });
    }

    // Analyze hydration patterns (if water tracking available)
    const hydrationGaps = this.analyzeHydrationPatterns(nutritionLogs);
    if (hydrationGaps.significant) {
      patterns.push({
        type: 'nutrition_gap',
        pattern: `Hydration pattern: ${hydrationGaps.pattern}`,
        strength: hydrationGaps.strength,
        data_points: hydrationGaps.dataPoints,
        time_range: 'Last 2 weeks',
        significance: hydrationGaps.strength > 0.6 ? 'high' : 'medium'
      });
    }

    return patterns;
  }

  /**
   * 5.2.3: Recovery patterns with adaptive goal adjustment
   */
  private async analyzeRecoveryPatterns(logs: ActivityLog[]): Promise<DetectedPattern[]> {
    const exerciseLogs = logs.filter(log => ['exercise', 'sport'].includes(log.type));
    const moodLogs = logs.filter(log => log.type === 'mood');

    const patterns: DetectedPattern[] = [];

    // Analyze recovery time by exercise intensity
    const recoveryByIntensity = this.analyzeRecoveryTimeByIntensity(exerciseLogs, moodLogs);
    if (recoveryByIntensity.significant) {
      patterns.push({
        type: 'recovery_pattern',
        pattern: `Recovery time varies by intensity: ${recoveryByIntensity.pattern}`,
        strength: recoveryByIntensity.strength,
        data_points: recoveryByIntensity.dataPoints,
        time_range: 'Last 4 weeks',
        significance: recoveryByIntensity.strength > 0.6 ? 'high' : 'medium'
      });
    }

    // Analyze overtraining indicators
    const overtrainingRisk = this.analyzeOvertrainingRisk(exerciseLogs, moodLogs);
    if (overtrainingRisk.risk > 0.3) {
      patterns.push({
        type: 'recovery_pattern',
        pattern: `Potential overtraining signs detected: ${overtrainingRisk.indicators.join(', ')}`,
        strength: overtrainingRisk.risk,
        data_points: overtrainingRisk.dataPoints,
        time_range: 'Last 2 weeks',
        significance: overtrainingRisk.risk > 0.7 ? 'high' : overtrainingRisk.risk > 0.5 ? 'medium' : 'low'
      });
    }

    // Analyze optimal training frequency
    const trainingFrequency = this.analyzeOptimalTrainingFrequency(exerciseLogs, moodLogs);
    if (trainingFrequency.confidence > 0.5) {
      patterns.push({
        type: 'recovery_pattern',
        pattern: `Optimal training frequency: ${trainingFrequency.pattern}`,
        strength: trainingFrequency.confidence,
        data_points: trainingFrequency.dataPoints,
        time_range: 'Last 4 weeks',
        significance: trainingFrequency.confidence > 0.7 ? 'high' : 'medium'
      });
    }

    return patterns;
  }

  /**
   * 5.2.4: Mood-activity correlation for Just-In-Time interventions
   */
  private async analyzeMoodActivityCorrelation(logs: ActivityLog[]): Promise<DetectedPattern[]> {
    const moodLogs = logs.filter(log => log.type === 'mood');
    const activityLogs = logs.filter(log => ['exercise', 'sport'].includes(log.type));

    if (moodLogs.length < 5) {
      return [];
    }

    const patterns: DetectedPattern[] = [];

    // Analyze mood-exercise correlation
    const moodExerciseCorrelation = this.analyzeMoodExerciseCorrelation(moodLogs, activityLogs);
    if (Math.abs(moodExerciseCorrelation.correlation) > 0.3) {
      patterns.push({
        type: 'mood_activity',
        pattern: moodExerciseCorrelation.correlation > 0 ?
          `Exercise improves mood significantly (r=${moodExerciseCorrelation.correlation.toFixed(2)})` :
          `Low mood associated with reduced exercise motivation (r=${moodExerciseCorrelation.correlation.toFixed(2)})`,
        strength: Math.abs(moodExerciseCorrelation.correlation),
        data_points: moodExerciseCorrelation.dataPoints,
        time_range: 'Last 3 weeks',
        correlation_score: moodExerciseCorrelation.correlation,
        significance: Math.abs(moodExerciseCorrelation.correlation) > 0.5 ? 'high' : 'medium'
      });
    }

    // Identify mood-boosting activities
    const moodBoostingActivities = this.identifyMoodBoostingActivities(moodLogs, activityLogs);
    if (moodBoostingActivities.length > 0) {
      patterns.push({
        type: 'mood_activity',
        pattern: `Most mood-boosting activities: ${moodBoostingActivities.slice(0, 3).join(', ')}`,
        strength: 0.7,
        data_points: moodLogs.length,
        time_range: 'Last 4 weeks',
        significance: 'high'
      });
    }

    // Analyze low mood triggers and recovery patterns
    const lowMoodTriggers = this.analyzeLowMoodTriggers(moodLogs, logs);
    if (lowMoodTriggers.patterns.length > 0) {
      patterns.push({
        type: 'mood_activity',
        pattern: `Low mood triggers: ${lowMoodTriggers.patterns.join(', ')}`,
        strength: lowMoodTriggers.confidence,
        data_points: lowMoodTriggers.dataPoints,
        time_range: 'Last 4 weeks',
        significance: lowMoodTriggers.confidence > 0.6 ? 'high' : 'medium'
      });
    }

    return patterns;
  }

  /**
   * Generate Just-In-Time Adaptive Interventions (JITAI)
   */
  private async generateJustInTimeInterventions(
    patterns: DetectedPattern[],
    context: UserContext
  ): Promise<JustInTimeIntervention[]> {
    const interventions: JustInTimeIntervention[] = [];

    for (const pattern of patterns) {
      if (pattern.significance === 'high') {
        switch (pattern.type) {
          case 'sleep_performance':
            interventions.push(await this.createSleepIntervention(pattern, context));
            break;
          case 'nutrition_gap':
            interventions.push(await this.createNutritionIntervention(pattern, context));
            break;
          case 'recovery_pattern':
            interventions.push(await this.createRecoveryIntervention(pattern, context));
            break;
          case 'mood_activity':
            interventions.push(await this.createMoodIntervention(pattern, context));
            break;
        }
      }
    }

    return interventions.filter(Boolean);
  }

  /**
   * Generate adaptive recommendations with goal adjustments
   */
  private async generateAdaptiveRecommendations(
    patterns: DetectedPattern[],
    context: UserContext
  ): Promise<AdaptiveRecommendation[]> {
    const recommendations: AdaptiveRecommendation[] = [];

    for (const pattern of patterns) {
      if (pattern.significance !== 'low') {
        const recommendation = await this.createAdaptiveRecommendation(pattern, context);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  // Helper methods for pattern analysis

  private getExtendedLogs(recentLogs: ActivityLog[], days: number): ActivityLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return recentLogs.filter(log => log.timestamp >= cutoffDate);
  }

  private findPreviousNightSleep(
    performanceLog: ActivityLog,
    sleepLogs: ActivityLog[]
  ): ActivityLog | null {
    // Find sleep log from the previous night (within 12 hours before activity)
    const activityStart = performanceLog.timestamp.getTime();
    const searchStart = activityStart - (12 * 60 * 60 * 1000); // 12 hours before
    
    const candidateSleeps = sleepLogs.filter(sleep => {
      const sleepTime = sleep.timestamp.getTime();
      return sleepTime >= searchStart && sleepTime <= activityStart;
    });

    // Return the most recent sleep log
    return candidateSleeps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private findOptimalSleepRange(data: Array<{ sleep: number; performance: number }>): { min: number; max: number } {
    // Group by sleep hours and find average performance for each
    const sleepPerformance: Record<number, number[]> = {};
    
    data.forEach(({ sleep, performance }) => {
      const sleepRounded = Math.round(sleep);
      if (!sleepPerformance[sleepRounded]) {
        sleepPerformance[sleepRounded] = [];
      }
      sleepPerformance[sleepRounded].push(performance);
    });

    // Calculate average performance for each sleep duration
    const avgPerformance = Object.entries(sleepPerformance).map(([sleep, performances]) => ({
      sleep: parseInt(sleep),
      avgPerformance: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      count: performances.length
    }));

    // Find the range with best average performance (minimum 2 data points)
    const validRanges = avgPerformance.filter(sp => sp.count >= 2);
    if (validRanges.length === 0) return { min: 0, max: 0 };

    const bestPerformance = Math.max(...validRanges.map(sp => sp.avgPerformance));
    const topPerformers = validRanges.filter(sp => sp.avgPerformance >= bestPerformance * 0.9);

    if (topPerformers.length === 0) return { min: 0, max: 0 };

    const sleepHours = topPerformers.map(tp => tp.sleep).sort((a, b) => a - b);
    return {
      min: sleepHours[0],
      max: sleepHours[sleepHours.length - 1]
    };
  }

  // Nutrition gap analysis helpers
  private analyzePreWorkoutNutritionTiming(
    nutritionLogs: ActivityLog[],
    exerciseLogs: ActivityLog[]
  ): { significant: boolean; averageGap: number; strength: number; dataPoints: number } {
    const gaps: number[] = [];

    for (const exercise of exerciseLogs) {
      const previousMeals = nutritionLogs.filter(meal => 
        meal.timestamp.getTime() < exercise.timestamp.getTime() &&
        exercise.timestamp.getTime() - meal.timestamp.getTime() < (8 * 60 * 60 * 1000) // Within 8 hours
      );

      if (previousMeals.length > 0) {
        const lastMeal = previousMeals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        const gapHours = (exercise.timestamp.getTime() - lastMeal.timestamp.getTime()) / (1000 * 60 * 60);
        gaps.push(gapHours);
      }
    }

    if (gaps.length < 3) {
      return { significant: false, averageGap: 0, strength: 0, dataPoints: 0 };
    }

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const isProblematic = averageGap < 1 || averageGap > 4; // Too close or too far
    const strength = isProblematic ? Math.min(1, Math.abs(averageGap - 2.5) / 2.5) : 0;

    return {
      significant: strength > 0.3,
      averageGap,
      strength,
      dataPoints: gaps.length
    };
  }

  private analyzePostWorkoutNutritionTiming(
    nutritionLogs: ActivityLog[],
    exerciseLogs: ActivityLog[]
  ): { significant: boolean; averageDelay: number; strength: number; dataPoints: number } {
    const delays: number[] = [];

    for (const exercise of exerciseLogs) {
      const nextMeals = nutritionLogs.filter(meal => 
        meal.timestamp.getTime() > exercise.timestamp.getTime() &&
        meal.timestamp.getTime() - exercise.timestamp.getTime() < (4 * 60 * 60 * 1000) // Within 4 hours
      );

      if (nextMeals.length > 0) {
        const firstMeal = nextMeals.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
        const delayHours = (firstMeal.timestamp.getTime() - exercise.timestamp.getTime()) / (1000 * 60 * 60);
        delays.push(delayHours);
      }
    }

    if (delays.length < 3) {
      return { significant: false, averageDelay: 0, strength: 0, dataPoints: 0 };
    }

    const averageDelay = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
    const isProblematic = averageDelay > 2; // More than 2 hours is suboptimal for recovery
    const strength = isProblematic ? Math.min(1, (averageDelay - 2) / 2) : 0;

    return {
      significant: strength > 0.3,
      averageDelay,
      strength,
      dataPoints: delays.length
    };
  }

  private analyzeHydrationPatterns(
    nutritionLogs: ActivityLog[]
  ): { significant: boolean; pattern: string; strength: number; dataPoints: number } {
    // This would be enhanced with actual water intake tracking
    // For now, provide basic analysis based on meal frequency and notes
    const waterEntries = nutritionLogs.filter(log => 
      log.originalText.toLowerCase().includes('water') ||
      log.originalText.toLowerCase().includes('drink') ||
      log.data.type === 'hydration'
    );

    if (waterEntries.length < 5) {
      return { significant: false, pattern: '', strength: 0, dataPoints: 0 };
    }

    // Basic pattern detection - could be enhanced with more sophisticated analysis
    const dailyWaterEntries = this.groupByDay(waterEntries);
    const averageDailyEntries = Object.values(dailyWaterEntries).reduce((sum, entries) => sum + entries.length, 0) / Object.keys(dailyWaterEntries).length;
    
    let pattern = '';
    let strength = 0;

    if (averageDailyEntries < 3) {
      pattern = 'Low hydration tracking frequency suggests potential dehydration risk';
      strength = 0.7;
    } else if (averageDailyEntries > 8) {
      pattern = 'High hydration awareness - good tracking consistency';
      strength = 0.5;
    }

    return {
      significant: strength > 0.4,
      pattern,
      strength,
      dataPoints: waterEntries.length
    };
  }

  // Recovery pattern analysis helpers
  private analyzeRecoveryTimeByIntensity(
    exerciseLogs: ActivityLog[],
    moodLogs: ActivityLog[]
  ): { significant: boolean; pattern: string; strength: number; dataPoints: number } {
    // Group exercises by intensity and analyze recovery time
    const intensityGroups: Record<string, ActivityLog[]> = {
      low: exerciseLogs.filter(log => (log.data.intensity || 5) <= 3),
      medium: exerciseLogs.filter(log => (log.data.intensity || 5) > 3 && (log.data.intensity || 5) <= 7),
      high: exerciseLogs.filter(log => (log.data.intensity || 5) > 7)
    };

    const recoveryTimes: Record<string, number[]> = {};

    for (const [intensity, exercises] of Object.entries(intensityGroups)) {
      recoveryTimes[intensity] = [];
      
      for (const exercise of exercises) {
        // Find next positive mood indicator or next exercise (whichever comes first)
        const recoveryTime = this.calculateRecoveryTime(exercise, moodLogs, exerciseLogs);
        if (recoveryTime > 0) {
          recoveryTimes[intensity].push(recoveryTime);
        }
      }
    }

    // Calculate average recovery times and detect patterns
    const avgRecoveryTimes: Record<string, number> = {};
    for (const [intensity, times] of Object.entries(recoveryTimes)) {
      if (times.length > 0) {
        avgRecoveryTimes[intensity] = times.reduce((sum, time) => sum + time, 0) / times.length;
      }
    }

    if (Object.keys(avgRecoveryTimes).length < 2) {
      return { significant: false, pattern: '', strength: 0, dataPoints: 0 };
    }

    const totalDataPoints = Object.values(recoveryTimes).reduce((sum, times) => sum + times.length, 0);
    const pattern = `Low: ${(avgRecoveryTimes.low || 0).toFixed(1)}h, Medium: ${(avgRecoveryTimes.medium || 0).toFixed(1)}h, High: ${(avgRecoveryTimes.high || 0).toFixed(1)}h`;
    
    // Calculate strength based on clear pattern differences
    const recoveryValues = Object.values(avgRecoveryTimes);
    const range = Math.max(...recoveryValues) - Math.min(...recoveryValues);
    const strength = Math.min(1, range / 24); // Normalize to 24 hours

    return {
      significant: strength > 0.3 && totalDataPoints >= 5,
      pattern,
      strength,
      dataPoints: totalDataPoints
    };
  }

  private analyzeOvertrainingRisk(
    exerciseLogs: ActivityLog[],
    moodLogs: ActivityLog[]
  ): { risk: number; indicators: string[]; dataPoints: number } {
    const recentExercises = exerciseLogs.filter(log => 
      new Date().getTime() - log.timestamp.getTime() < (14 * 24 * 60 * 60 * 1000) // Last 14 days
    );

    const recentMoods = moodLogs.filter(log =>
      new Date().getTime() - log.timestamp.getTime() < (14 * 24 * 60 * 60 * 1000)
    );

    const indicators: string[] = [];
    let riskScore = 0;

    // Check training frequency
    const dailyExercises = this.groupByDay(recentExercises);
    const activeDays = Object.keys(dailyExercises).length;
    const avgExercisesPerActiveDay = recentExercises.length / Math.max(activeDays, 1);

    if (avgExercisesPerActiveDay > 2) {
      indicators.push('High training frequency');
      riskScore += 0.3;
    }

    if (activeDays > 12) {
      indicators.push('Insufficient rest days');
      riskScore += 0.2;
    }

    // Check intensity patterns
    const avgIntensity = recentExercises.reduce((sum, ex) => sum + (ex.data.intensity || 5), 0) / recentExercises.length;
    if (avgIntensity > 7.5) {
      indicators.push('Consistently high intensity');
      riskScore += 0.2;
    }

    // Check mood trends
    if (recentMoods.length >= 3) {
      const moodValues = recentMoods.map(mood => mood.data.score || mood.data.rating || 5);
      const avgMood = moodValues.reduce((sum, mood) => sum + mood, 0) / moodValues.length;
      
      if (avgMood < 4) {
        indicators.push('Declining mood/motivation');
        riskScore += 0.3;
      }
    }

    return {
      risk: Math.min(riskScore, 1),
      indicators,
      dataPoints: recentExercises.length + recentMoods.length
    };
  }

  private analyzeOptimalTrainingFrequency(
    exerciseLogs: ActivityLog[],
    moodLogs: ActivityLog[]
  ): { confidence: number; pattern: string; dataPoints: number } {
    const weeklyData = this.groupByWeek(exerciseLogs);
    
    if (Object.keys(weeklyData).length < 3) {
      return { confidence: 0, pattern: '', dataPoints: 0 };
    }

    // Analyze performance and mood by training frequency
    const frequencyPerformance: Array<{ frequency: number; avgPerformance: number; avgMood: number }> = [];

    for (const [week, exercises] of Object.entries(weeklyData)) {
      const weekMoods = moodLogs.filter(mood => this.isSameWeek(mood.timestamp, new Date(week)));
      const avgPerformance = exercises.reduce((sum, ex) => sum + (ex.data.intensity || 5), 0) / exercises.length;
      const avgMood = weekMoods.length > 0 ? 
        weekMoods.reduce((sum, mood) => sum + (mood.data.score || 5), 0) / weekMoods.length : 5;

      frequencyPerformance.push({
        frequency: exercises.length,
        avgPerformance,
        avgMood
      });
    }

    // Find optimal frequency
    const sortedByPerformance = frequencyPerformance.sort((a, b) => b.avgPerformance - a.avgPerformance);
    const topPerformance = sortedByPerformance.slice(0, Math.ceil(sortedByPerformance.length * 0.5));
    const avgOptimalFrequency = topPerformance.reduce((sum, fp) => sum + fp.frequency, 0) / topPerformance.length;

    const pattern = `${Math.round(avgOptimalFrequency)} sessions per week shows best performance`;
    const confidence = topPerformance.length / frequencyPerformance.length;

    return {
      confidence,
      pattern,
      dataPoints: frequencyPerformance.length
    };
  }

  // Mood-activity correlation helpers
  private analyzeMoodExerciseCorrelation(
    moodLogs: ActivityLog[],
    activityLogs: ActivityLog[]
  ): { correlation: number; dataPoints: number } {
    const correlationData: Array<{ mood: number; exerciseIntensity: number }> = [];

    for (const mood of moodLogs) {
      // Find exercises within 24 hours after mood entry
      const nextExercises = activityLogs.filter(activity =>
        activity.timestamp.getTime() > mood.timestamp.getTime() &&
        activity.timestamp.getTime() - mood.timestamp.getTime() < (24 * 60 * 60 * 1000)
      );

      if (nextExercises.length > 0) {
        const avgIntensity = nextExercises.reduce((sum, ex) => sum + (ex.data.intensity || 5), 0) / nextExercises.length;
        correlationData.push({
          mood: mood.data.score || mood.data.rating || 5,
          exerciseIntensity: avgIntensity
        });
      }
    }

    const correlation = correlationData.length >= 3 ? 
      this.calculateCorrelation(
        correlationData.map(d => d.mood),
        correlationData.map(d => d.exerciseIntensity)
      ) : 0;

    return {
      correlation,
      dataPoints: correlationData.length
    };
  }

  private identifyMoodBoostingActivities(
    moodLogs: ActivityLog[],
    activityLogs: ActivityLog[]
  ): string[] {
    const activityMoodImpact: Record<string, { pre: number[]; post: number[]; }> = {};

    for (const activity of activityLogs) {
      const activityType = activity.data.type || activity.data.exercise_name || 'general';
      
      if (!activityMoodImpact[activityType]) {
        activityMoodImpact[activityType] = { pre: [], post: [] };
      }

      // Find mood before activity (within 4 hours)
      const preMood = moodLogs.find(mood =>
        mood.timestamp.getTime() < activity.timestamp.getTime() &&
        activity.timestamp.getTime() - mood.timestamp.getTime() < (4 * 60 * 60 * 1000)
      );

      // Find mood after activity (within 4 hours)
      const postMood = moodLogs.find(mood =>
        mood.timestamp.getTime() > activity.timestamp.getTime() &&
        mood.timestamp.getTime() - activity.timestamp.getTime() < (4 * 60 * 60 * 1000)
      );

      if (preMood && postMood) {
        activityMoodImpact[activityType].pre.push(preMood.data.score || 5);
        activityMoodImpact[activityType].post.push(postMood.data.score || 5);
      }
    }

    // Calculate mood boost for each activity
    const moodBoosts: Array<{ activity: string; boost: number; count: number }> = [];

    for (const [activity, data] of Object.entries(activityMoodImpact)) {
      if (data.pre.length >= 2) {
        const avgPre = data.pre.reduce((sum, score) => sum + score, 0) / data.pre.length;
        const avgPost = data.post.reduce((sum, score) => sum + score, 0) / data.post.length;
        const boost = avgPost - avgPre;

        if (boost > 0.5) {
          moodBoosts.push({ activity, boost, count: data.pre.length });
        }
      }
    }

    // Return top mood-boosting activities
    return moodBoosts
      .sort((a, b) => b.boost - a.boost)
      .slice(0, 5)
      .map(mb => mb.activity);
  }

  private analyzeLowMoodTriggers(
    moodLogs: ActivityLog[],
    allLogs: ActivityLog[]
  ): { patterns: string[]; confidence: number; dataPoints: number } {
    const lowMoodEntries = moodLogs.filter(mood => (mood.data.score || 5) < 3);
    
    if (lowMoodEntries.length < 3) {
      return { patterns: [], confidence: 0, dataPoints: 0 };
    }

    const triggers: Record<string, number> = {};

    for (const lowMood of lowMoodEntries) {
      // Look for patterns in the 24 hours before low mood
      const recentActivity = allLogs.filter(log =>
        log.timestamp.getTime() < lowMood.timestamp.getTime() &&
        lowMood.timestamp.getTime() - log.timestamp.getTime() < (24 * 60 * 60 * 1000)
      );

      // Check for potential triggers
      const highIntensityExercise = recentActivity.find(log => 
        ['exercise', 'sport'].includes(log.type) && (log.data.intensity || 5) > 8
      );
      
      const poorSleep = recentActivity.find(log =>
        log.type === 'sleep' && (log.data.hours || 8) < 6
      );

      const missedMeal = recentActivity.filter(log => log.type === 'nutrition').length === 0;

      if (highIntensityExercise) triggers['high_intensity_exercise'] = (triggers['high_intensity_exercise'] || 0) + 1;
      if (poorSleep) triggers['poor_sleep'] = (triggers['poor_sleep'] || 0) + 1;
      if (missedMeal) triggers['meal_timing_issues'] = (triggers['meal_timing_issues'] || 0) + 1;

      // Check day of week patterns
      const dayOfWeek = lowMood.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      triggers[`${dayOfWeek.toLowerCase()}_pattern`] = (triggers[`${dayOfWeek.toLowerCase()}_pattern`] || 0) + 1;
    }

    // Identify significant triggers (appearing in >30% of low mood instances)
    const significantTriggers = Object.entries(triggers)
      .filter(([trigger, count]) => count / lowMoodEntries.length > 0.3)
      .map(([trigger, count]) => trigger.replace('_', ' '))
      .slice(0, 3);

    const confidence = significantTriggers.length > 0 ? 
      Math.max(...Object.values(triggers)) / lowMoodEntries.length : 0;

    return {
      patterns: significantTriggers,
      confidence,
      dataPoints: lowMoodEntries.length
    };
  }

  // Intervention creation methods
  private async createSleepIntervention(
    pattern: DetectedPattern,
    context: UserContext
  ): Promise<JustInTimeIntervention> {
    return {
      trigger: {
        condition: 'Sleep hours < optimal range OR late bedtime detected',
        when_to_show: 'before_activity',
        timing_hours: [21, 22] // 9-10 PM reminder
      },
      intervention: {
        message: pattern.pattern.includes('optimal') ?
          `Your data shows best performance with ${pattern.pattern.match(/(\d+)-(\d+)/)?.[0]} hours of sleep. Tonight's your chance to nail it!` :
          'Your performance data shows a strong sleep connection. Let\'s prioritize recovery tonight.',
        action_type: 'implementation_intention',
        urgency: 'today'
      },
      personalization: {
        user_type_specific: true,
        motivation_style_adapted: context.profile.motivation_profile?.motivation_style === 'data_driven',
        habit_context: 'sleep_performance_optimization'
      }
    };
  }

  private async createNutritionIntervention(
    pattern: DetectedPattern,
    context: UserContext
  ): Promise<JustInTimeIntervention> {
    const isPreWorkout = pattern.pattern.includes('Pre-workout');
    
    return {
      trigger: {
        condition: isPreWorkout ? 'Workout scheduled in next 4 hours' : 'Post-workout recovery window',
        when_to_show: isPreWorkout ? 'before_activity' : 'after_activity',
        timing_hours: isPreWorkout ? [16, 17, 18] : [19, 20]
      },
      intervention: {
        message: isPreWorkout ?
          `Based on your pattern data: fuel up 2-3 hours before your workout for optimal performance` :
          `Recovery window open! Your data shows best results when you eat within 2 hours post-workout`,
        action_type: 'tiny_habit',
        urgency: 'immediate'
      },
      personalization: {
        user_type_specific: context.profile.userType === 'sport',
        motivation_style_adapted: true,
        habit_context: 'nutrition_timing_optimization'
      }
    };
  }

  private async createRecoveryIntervention(
    pattern: DetectedPattern,
    context: UserContext
  ): Promise<JustInTimeIntervention> {
    const isOvertraining = pattern.pattern.includes('overtraining');
    
    return {
      trigger: {
        condition: isOvertraining ? 'Multiple high-intensity days detected' : 'Recovery metrics below optimal',
        when_to_show: 'during_low_mood',
        timing_hours: [8, 9, 18, 19] // Morning or evening check-ins
      },
      intervention: {
        message: isOvertraining ?
          'Your pattern data suggests recovery focus today. Your future self will thank you for this rest.' :
          `Based on your recovery patterns, today might benefit from ${pattern.pattern.includes('frequency') ? 'active recovery' : 'complete rest'}`,
        action_type: 'environmental_cue',
        urgency: 'today'
      },
      personalization: {
        user_type_specific: true,
        motivation_style_adapted: context.profile.motivation_profile?.motivation_style !== 'competitive',
        habit_context: 'recovery_optimization'
      }
    };
  }

  private async createMoodIntervention(
    pattern: DetectedPattern,
    context: UserContext
  ): Promise<JustInTimeIntervention> {
    return {
      trigger: {
        condition: 'Low mood detected OR mood tracking missed for 2+ days',
        when_to_show: 'during_low_mood',
        timing_hours: [14, 15, 16] // Afternoon energy dip
      },
      intervention: {
        message: pattern.pattern.includes('mood-boosting') ?
          `Your data shows ${pattern.pattern.split(': ')[1]} consistently improves your mood. 5-minute version?` :
          'Pattern recognition: movement tends to shift your mood positively. Even 2 minutes counts.',
        action_type: 'tiny_habit',
        urgency: 'immediate'
      },
      personalization: {
        user_type_specific: false,
        motivation_style_adapted: true,
        habit_context: 'mood_regulation_through_movement'
      }
    };
  }

  private async createAdaptiveRecommendation(
    pattern: DetectedPattern,
    context: UserContext
  ): Promise<AdaptiveRecommendation | null> {
    // Create recommendation based on pattern type and user context
    switch (pattern.type) {
      case 'sleep_performance':
        return this.createSleepRecommendation(pattern, context);
      case 'nutrition_gap':
        return this.createNutritionRecommendation(pattern, context);
      case 'recovery_pattern':
        return this.createRecoveryRecommendation(pattern, context);
      case 'mood_activity':
        return this.createMoodRecommendation(pattern, context);
      default:
        return null;
    }
  }

  private createSleepRecommendation(
    pattern: DetectedPattern,
    context: UserContext
  ): AdaptiveRecommendation {
    const optimalRange = pattern.pattern.match(/(\d+)-(\d+) hours/);
    const targetSleep = optimalRange ? parseInt(optimalRange[1]) : 8;

    const tinyHabit = BehaviorModel.designTinyHabit(
      'get better sleep',
      {
        current_habits: [],
        motivation_profile: context.profile.motivation_profile || this.getDefaultMotivationProfile(),
        ability_factors: context.profile.ability_factors || this.getDefaultAbilityFactors(),
        identity_goals: ['I am someone who prioritizes recovery']
      }
    );

    return {
      category: 'sleep',
      goal_adjustment: {
        current_goal: context.profile.goals?.find(g => g.toLowerCase().includes('sleep')) || 'Get 8 hours of sleep',
        recommended_change: `Target ${targetSleep} hours based on your performance data`,
        rationale: `Your data shows ${pattern.strength > 0.7 ? 'strong' : 'moderate'} correlation between sleep and performance`
      },
      tiny_habit: {
        ...tinyHabit,
        behavior: 'Set phone to airplane mode and place it outside bedroom',
        trigger: {
          ...tinyHabit.trigger,
          description: 'After brushing teeth'
        },
        reward: 'Say "I am someone who prioritizes recovery"'
      },
      implementation_intention: {
        if_situation: `It's ${targetSleep === 8 ? '10' : '9'}:30 PM and I haven't started my bedtime routine`,
        then_behavior: 'I will immediately put my phone in airplane mode and start winding down',
        identity_connection: 'I am a person who makes decisions that serve my future performance'
      }
    };
  }

  private createNutritionRecommendation(
    pattern: DetectedPattern,
    context: UserContext
  ): AdaptiveRecommendation {
    const isPreWorkout = pattern.pattern.includes('Pre-workout');
    const category = 'nutrition';

    const tinyHabit = BehaviorModel.designTinyHabit(
      isPreWorkout ? 'eat before workouts' : 'eat after workouts',
      {
        current_habits: [],
        motivation_profile: context.profile.motivation_profile || this.getDefaultMotivationProfile(),
        ability_factors: context.profile.ability_factors || this.getDefaultAbilityFactors(),
        identity_goals: ['I am someone who fuels their body properly']
      }
    );

    return {
      category,
      goal_adjustment: {
        current_goal: context.profile.goals?.find(g => g.toLowerCase().includes('nutrition')) || 'Eat healthy',
        recommended_change: isPreWorkout ?
          'Focus on pre-workout fuel timing (2-3 hours before)' :
          'Prioritize post-workout recovery nutrition (within 2 hours)',
        rationale: `Your data shows ${pattern.strength > 0.7 ? 'significant' : 'noticeable'} gaps in workout nutrition timing`
      },
      tiny_habit: {
        ...tinyHabit,
        behavior: isPreWorkout ?
          'Eat one piece of fruit when I see my workout clothes' :
          'Drink one glass of milk immediately after workout',
        trigger: {
          ...tinyHabit.trigger,
          description: isPreWorkout ? 'When I lay out workout clothes' : 'Immediately after workout ends'
        }
      },
      implementation_intention: {
        if_situation: isPreWorkout ?
          'I have a workout planned and it\'s 2-3 hours beforehand' :
          'I just finished a workout',
        then_behavior: isPreWorkout ?
          'I will eat something light and carb-focused' :
          'I will have protein + carbs within 30 minutes',
        identity_connection: 'I am someone who properly fuels their performance'
      }
    };
  }

  private createRecoveryRecommendation(
    pattern: DetectedPattern,
    context: UserContext
  ): AdaptiveRecommendation {
    const isOvertraining = pattern.pattern.includes('overtraining');

    const tinyHabit = BehaviorModel.designTinyHabit(
      isOvertraining ? 'take recovery seriously' : 'optimize recovery timing',
      {
        current_habits: [],
        motivation_profile: context.profile.motivation_profile || this.getDefaultMotivationProfile(),
        ability_factors: context.profile.ability_factors || this.getDefaultAbilityFactors(),
        identity_goals: ['I am someone who trains smart, not just hard']
      }
    );

    return {
      category: 'recovery',
      goal_adjustment: {
        current_goal: context.profile.goals?.find(g => g.toLowerCase().includes('recovery') || g.toLowerCase().includes('train')) || 'Train consistently',
        recommended_change: isOvertraining ?
          'Build in mandatory rest days based on your pattern data' :
          'Adjust training frequency based on recovery indicators',
        rationale: isOvertraining ?
          'Your data shows potential overtraining signs' :
          `Your recovery patterns suggest ${pattern.pattern}`
      },
      tiny_habit: {
        ...tinyHabit,
        behavior: isOvertraining ?
          'Do 5 deep breaths when I feel the urge to train on rest days' :
          'Rate my energy level (1-10) before each workout',
        trigger: {
          ...tinyHabit.trigger,
          description: isOvertraining ? 'When I think about training on a scheduled rest day' : 'When I put on workout clothes'
        }
      },
      implementation_intention: {
        if_situation: isOvertraining ?
          'I feel like I should train but it\'s a scheduled rest day' :
          'My energy/mood is below 6 before a planned workout',
        then_behavior: isOvertraining ?
          'I will remind myself that rest is part of training' :
          'I will reduce intensity or switch to active recovery',
        identity_connection: isOvertraining ?
          'I am someone who makes decisions based on data, not emotions' :
          'I am someone who trains intelligently'
      }
    };
  }

  private createMoodRecommendation(
    pattern: DetectedPattern,
    context: UserContext
  ): AdaptiveRecommendation {
    const moodBoostingActivities = pattern.pattern.includes('Most mood-boosting');
    const activities = moodBoostingActivities ? 
      pattern.pattern.split(': ')[1].split(', ') : ['light movement'];

    const tinyHabit = BehaviorModel.designTinyHabit(
      'use movement for mood regulation',
      {
        current_habits: [],
        motivation_profile: context.profile.motivation_profile || this.getDefaultMotivationProfile(),
        ability_factors: context.profile.ability_factors || this.getDefaultAbilityFactors(),
        identity_goals: ['I am someone who takes care of their mental health']
      }
    );

    return {
      category: 'mood',
      goal_adjustment: {
        current_goal: context.profile.goals?.find(g => g.toLowerCase().includes('mood') || g.toLowerCase().includes('mental')) || 'Stay positive',
        recommended_change: `Use ${activities[0]} as your go-to mood regulation tool`,
        rationale: `Your data shows ${pattern.correlation_score?.toFixed(2) || 'positive'} correlation between activity and mood`
      },
      tiny_habit: {
        ...tinyHabit,
        behavior: `Do 2 minutes of ${activities[0].toLowerCase()} when feeling low`,
        trigger: {
          ...tinyHabit.trigger,
          description: 'When I notice my mood dropping'
        },
        reward: 'Acknowledge: "I am taking care of myself"'
      },
      implementation_intention: {
        if_situation: 'I notice my mood is below a 5/10',
        then_behavior: `I will do ${activities[0].toLowerCase()} for just 2 minutes`,
        identity_connection: 'I am someone who uses healthy strategies to regulate their mood'
      }
    };
  }

  // Helper methods for calculations
  private calculatePatternConfidence(patterns: DetectedPattern[], totalDataPoints: number): number {
    if (patterns.length === 0) return 0;

    const avgStrength = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
    const dataPointsScore = Math.min(1, totalDataPoints / 50); // Normalize to 50 data points max
    const significanceScore = patterns.filter(p => p.significance === 'high').length / patterns.length;

    return Math.round((avgStrength * 0.4 + dataPointsScore * 0.3 + significanceScore * 0.3) * 100);
  }

  private calculateRecoveryTime(
    exercise: ActivityLog,
    moodLogs: ActivityLog[],
    exerciseLogs: ActivityLog[]
  ): number {
    // Find next positive mood or next exercise
    const nextPositiveMood = moodLogs.find(mood =>
      mood.timestamp.getTime() > exercise.timestamp.getTime() &&
      (mood.data.score || mood.data.rating || 5) >= 7
    );

    const nextExercise = exerciseLogs.find(nextEx =>
      nextEx.timestamp.getTime() > exercise.timestamp.getTime()
    );

    if (nextPositiveMood && (!nextExercise || nextPositiveMood.timestamp.getTime() < nextExercise.timestamp.getTime())) {
      return (nextPositiveMood.timestamp.getTime() - exercise.timestamp.getTime()) / (1000 * 60 * 60); // Hours
    }

    if (nextExercise) {
      return (nextExercise.timestamp.getTime() - exercise.timestamp.getTime()) / (1000 * 60 * 60); // Hours
    }

    return 0; // No recovery indicator found
  }

  private groupByDay(logs: ActivityLog[]): Record<string, ActivityLog[]> {
    return logs.reduce((groups, log) => {
      const day = log.timestamp.toDateString();
      if (!groups[day]) groups[day] = [];
      groups[day].push(log);
      return groups;
    }, {} as Record<string, ActivityLog[]>);
  }

  private groupByWeek(logs: ActivityLog[]): Record<string, ActivityLog[]> {
    return logs.reduce((groups, log) => {
      const week = this.getWeekStart(log.timestamp).toDateString();
      if (!groups[week]) groups[week] = [];
      groups[week].push(log);
      return groups;
    }, {} as Record<string, ActivityLog[]>);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    return this.getWeekStart(date1).getTime() === this.getWeekStart(date2).getTime();
  }

  private getInsufficientDataResponse(): PatternDetectionResult {
    return {
      patterns: [],
      interventions: [],
      recommendations: [],
      confidence: 0
    };
  }

  // Additional helper methods as needed...
  private getDefaultMotivationProfile(): any {
    return {
      intrinsic_motivators: ['health', 'energy'],
      extrinsic_motivators: ['appearance'],
      motivation_style: 'data_driven',
      energy_patterns: {
        high_motivation_times: ['morning'],
        low_motivation_triggers: ['stress']
      }
    };
  }

  private getDefaultAbilityFactors(): any {
    return {
      physical_capability: 7,
      time_availability: 6,
      cognitive_load: 5,
      social_support: 6,
      resource_access: 8,
      overall_ability: 6.4
    };
  }
}

// Export singleton instance
export const patternDetectionService = new PatternDetectionService();