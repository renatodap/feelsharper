/**
 * Layer 1: Habit Formation Data Tracking
 * Tracks streaks, lapses, identity markers, and routine consistency
 * Based on BJ Fogg's behavior model and James Clear's identity-based habits
 */

export interface HabitFormationData {
  userId: string;
  habitId: string;
  habitName: string;
  
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  streakStartDate: Date;
  lastCompletionDate: Date | null;
  
  // Lapse analysis
  lapseCount: number;
  averageLapseLength: number;
  lastLapseDate: Date | null;
  recoveryTime: number; // days to recover from lapse
  
  // Identity markers (self-talk, language patterns)
  identityStatements: string[]; // "I am someone who...", "I'm the type of person who..."
  identityStrength: number; // 1-10 scale
  identityEvolution: Array<{
    date: Date;
    statement: string;
    confidence: number;
  }>;
  
  // Routine consistency
  preferredTime: string; // "morning", "evening", "after work"
  consistencyScore: number; // 0-100
  routineStack: string[]; // habit chains
  contextualCues: Array<{
    type: 'location' | 'time' | 'emotion' | 'social' | 'preceding_action';
    value: string;
    effectiveness: number;
  }>;
  
  // Behavioral patterns
  weekdayPerformance: number[]; // 0-6 (Sun-Sat) success rates
  seasonalPatterns: Record<string, number>;
  motivationSources: Array<{
    type: 'intrinsic' | 'extrinsic' | 'social' | 'identity';
    description: string;
    effectiveness: number;
  }>;
  
  // Progress metrics
  difficultyLevel: number; // 1-10
  enjoymentLevel: number; // 1-10
  perceivedBenefit: number; // 1-10
  effortRequired: number; // 1-10
  socialSupport: number; // 1-10
}

export interface HabitFormationMetrics {
  // Formation indicators
  automaticityScore: number; // how automatic the habit feels (1-10)
  daysToFormation: number | null; // null if not formed yet
  formationPrediction: number; // days predicted to formation
  
  // Maintenance indicators
  vulnerabilityScore: number; // risk of habit breakdown (1-10)
  resilienceFactors: string[];
  triggerStrength: number; // how strong the cues are (1-10)
  
  // Identity integration
  identityAlignment: number; // how well habit aligns with identity (1-10)
  identityLanguageFrequency: number; // how often they use identity language
  
  // Environmental factors
  environmentSupport: number; // how supportive environment is (1-10)
  socialAccountability: number; // level of social support (1-10)
  
  // Psychological factors
  selfefficacy: number; // confidence in ability to maintain (1-10)
  outcomeExpectancy: number; // belief in benefits (1-10)
  intrinsicMotivation: number; // internal drive (1-10)
}

export class HabitFormationTracker {
  /**
   * Track completion of a habit
   */
  static trackCompletion(
    habitData: HabitFormationData,
    completedAt: Date = new Date()
  ): HabitFormationData {
    const daysSinceLastCompletion = habitData.lastCompletionDate
      ? Math.floor((completedAt.getTime() - habitData.lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Update streak
    if (daysSinceLastCompletion <= 1) {
      habitData.currentStreak += 1;
    } else {
      // Lapse occurred
      habitData.lapseCount += 1;
      habitData.lastLapseDate = habitData.lastCompletionDate;
      habitData.currentStreak = 1;
    }

    habitData.longestStreak = Math.max(habitData.longestStreak, habitData.currentStreak);
    habitData.totalCompletions += 1;
    habitData.lastCompletionDate = completedAt;

    return habitData;
  }

  /**
   * Analyze habit formation progress
   */
  static analyzeFormationProgress(habitData: HabitFormationData): HabitFormationMetrics {
    const daysSinceStart = habitData.streakStartDate
      ? Math.floor((Date.now() - habitData.streakStartDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate automaticity based on streak and consistency
    const automaticityScore = Math.min(10, 
      (habitData.currentStreak * 0.3) + 
      (habitData.consistencyScore * 0.05) +
      (habitData.identityStrength * 0.2)
    );

    // Predict days to formation (based on research: 21-66 days average)
    const baseFormationDays = 30; // median
    const difficultyMultiplier = habitData.difficultyLevel * 0.1;
    const enjoymentBonus = (10 - habitData.enjoymentLevel) * 0.05;
    const formationPrediction = Math.round(
      baseFormationDays * (1 + difficultyMultiplier + enjoymentBonus)
    );

    // Vulnerability score (higher = more likely to break)
    const vulnerabilityScore = Math.max(1, 
      (habitData.effortRequired * 0.4) +
      ((10 - habitData.enjoymentLevel) * 0.3) +
      ((10 - habitData.socialSupport) * 0.2) +
      (habitData.lapseCount * 0.1)
    );

    return {
      automaticityScore: Math.round(automaticityScore * 10) / 10,
      daysToFormation: automaticityScore >= 7 ? daysSinceStart : null,
      formationPrediction: formationPrediction - daysSinceStart,
      vulnerabilityScore: Math.round(vulnerabilityScore * 10) / 10,
      resilienceFactors: this.identifyResilienceFactors(habitData),
      triggerStrength: this.calculateTriggerStrength(habitData),
      identityAlignment: habitData.identityStrength,
      identityLanguageFrequency: habitData.identityStatements.length / Math.max(1, daysSinceStart / 7),
      environmentSupport: this.calculateEnvironmentSupport(habitData),
      socialAccountability: habitData.socialSupport,
      selfefficacy: Math.min(10, habitData.currentStreak * 0.2 + habitData.consistencyScore * 0.05),
      outcomeExpectancy: habitData.perceivedBenefit,
      intrinsicMotivation: this.calculateIntrinsicMotivation(habitData)
    };
  }

  /**
   * Generate habit coaching insights based on formation data
   */
  static generateCoachingInsights(
    habitData: HabitFormationData,
    metrics: HabitFormationMetrics
  ): Array<{
    type: 'celebration' | 'concern' | 'suggestion' | 'identity_reinforcement';
    message: string;
    priority: number;
    scientificBasis: string;
  }> {
    const insights = [];

    // Celebration insights
    if (habitData.currentStreak >= 7) {
      insights.push({
        type: 'celebration' as const,
        message: `🎉 Amazing! You've maintained your ${habitData.habitName} habit for ${habitData.currentStreak} days. You're ${Math.round((habitData.currentStreak / 30) * 100)}% of the way to full habit formation!`,
        priority: metrics.automaticityScore >= 7 ? 9 : 7,
        scientificBasis: 'Research shows that celebrating small wins releases dopamine and reinforces habit loops.'
      });
    }

    // Identity reinforcement
    if (metrics.identityAlignment >= 7) {
      insights.push({
        type: 'identity_reinforcement' as const,
        message: `You're becoming someone who ${habitData.habitName}s consistently. This identity shift is the strongest predictor of long-term habit maintenance.`,
        priority: 8,
        scientificBasis: 'James Clear research: Identity-based habits are 3x more likely to persist than outcome-based habits.'
      });
    }

    // Concern insights
    if (metrics.vulnerabilityScore >= 7) {
      insights.push({
        type: 'concern' as const,
        message: `I notice this habit might be challenging to maintain. Let's identify what's making it difficult and adjust.`,
        priority: 9,
        scientificBasis: 'BJ Fogg model: When ability is low, motivation must be high, or the behavior won\'t occur.'
      });
    }

    // Lapse recovery
    if (habitData.lapseCount > 0 && habitData.lastLapseDate) {
      const daysSinceLapse = Math.floor((Date.now() - habitData.lastLapseDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLapse <= 3) {
        insights.push({
          type: 'suggestion' as const,
          message: `Recovery after a lapse is normal and shows resilience. Focus on your identity: "I'm someone who gets back on track quickly."`,
          priority: 8,
          scientificBasis: 'Research shows that self-compassion after lapses predicts better long-term adherence than self-criticism.'
        });
      }
    }

    // Trigger strengthening
    if (metrics.triggerStrength < 6) {
      insights.push({
        type: 'suggestion' as const,
        message: `Let's strengthen your habit trigger. What specific cue could remind you to ${habitData.habitName}?`,
        priority: 7,
        scientificBasis: 'MIT research: Strong contextual cues are the #1 predictor of automatic habit execution.'
      });
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  private static identifyResilienceFactors(habitData: HabitFormationData): string[] {
    const factors = [];
    
    if (habitData.identityStrength >= 7) factors.push('Strong identity alignment');
    if (habitData.socialSupport >= 7) factors.push('Good social support');
    if (habitData.enjoymentLevel >= 7) factors.push('High enjoyment');
    if (habitData.routineStack.length > 0) factors.push('Habit stacking');
    if (habitData.consistencyScore >= 80) factors.push('Consistent timing');
    
    return factors;
  }

  private static calculateTriggerStrength(habitData: HabitFormationData): number {
    const cueEffectiveness = habitData.contextualCues.reduce((sum, cue) => sum + cue.effectiveness, 0) / 
                            Math.max(1, habitData.contextualCues.length);
    const stackingBonus = habitData.routineStack.length > 0 ? 2 : 0;
    return Math.min(10, cueEffectiveness + stackingBonus);
  }

  private static calculateEnvironmentSupport(habitData: HabitFormationData): number {
    // Calculate based on contextual cues and social support
    const locationCues = habitData.contextualCues.filter(cue => cue.type === 'location');
    const socialCues = habitData.contextualCues.filter(cue => cue.type === 'social');
    
    const environmentScore = (locationCues.length * 2) + (socialCues.length * 3) + habitData.socialSupport;
    return Math.min(10, environmentScore);
  }

  private static calculateIntrinsicMotivation(habitData: HabitFormationData): number {
    const intrinsicSources = habitData.motivationSources.filter(source => 
      source.type === 'intrinsic' || source.type === 'identity'
    );
    
    const intrinsicScore = intrinsicSources.reduce((sum, source) => sum + source.effectiveness, 0);
    return Math.min(10, intrinsicScore + habitData.enjoymentLevel * 0.3);
  }
}

/**
 * Training prompts for AI coach based on habit formation data
 */
export const HabitFormationPrompts = {
  // Early stage (days 1-7)
  earlyStage: `
    Focus on:
    - Celebrating ANY completion ("You did it today!")
    - Making it easier ("What's the smallest version?")
    - Identity language ("You're becoming someone who...")
    - Cue strengthening ("When/where will you do this?")
    
    Avoid:
    - Perfectionism pressure
    - Long-term outcome focus
    - Difficulty increases
  `,

  // Formation stage (days 8-30)
  formationStage: `
    Focus on:
    - Streak celebration with specific numbers
    - Identity reinforcement ("You're the type of person who...")
    - Pattern recognition ("I notice you prefer mornings")
    - Gentle difficulty progression
    - Lapse forgiveness and quick recovery
    
    Monitor:
    - Automaticity development
    - Enjoyment levels
    - Environmental barriers
  `,

  // Maintenance stage (30+ days)
  maintenanceStage: `
    Focus on:
    - Identity consolidation
    - Habit stacking opportunities
    - Advanced optimization
    - Teaching others (social proof)
    - Long-term vision alignment
    
    Watch for:
    - Complacency
    - Environmental changes
    - Life transitions that might disrupt
  `,

  // Lapse recovery
  lapseRecovery: `
    Immediate response:
    - Normalize the lapse ("This is completely normal")
    - Self-compassion over self-criticism
    - Identity reminder ("You're still someone who...")
    - Immediate tiny restart ("What's one small thing you could do right now?")
    
    Research basis: Self-compassion after lapses predicts 40% better long-term adherence than self-criticism.
  `
};