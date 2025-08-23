/**
 * BJ Fogg Behavior Model (B=MAP) Implementation
 * B = Behavior, M = Motivation, A = Ability, P = Prompt
 * 
 * This module implements the scientific framework for behavior change,
 * focusing on habit formation through tiny behaviors, appropriate triggers,
 * and identity-based change.
 */

export interface BehaviorTrigger {
  id: string;
  name: string;
  type: 'time' | 'location' | 'emotional' | 'social' | 'after_behavior';
  description: string;
  effectiveness_score: number; // 0-100
  user_specific: boolean;
}

export interface TinyHabit {
  id: string;
  behavior: string;
  trigger: BehaviorTrigger;
  reward: string;
  difficulty_level: 1 | 2 | 3; // 1 = ridiculously easy, 3 = challenging but doable
  identity_connection: string; // "A person like me who..."
  completion_rate: number; // 0-100%
  streak_count: number;
  created_at: Date;
  last_completed: Date | null;
}

export interface HabitLoop {
  cue: BehaviorTrigger;
  routine: string;
  reward: string;
  identity_reinforcement: string;
}

export interface MotivationProfile {
  intrinsic_motivators: string[]; // autonomy, mastery, purpose
  extrinsic_motivators: string[]; // social approval, competition, rewards
  motivation_style: 'data_driven' | 'emotional' | 'social' | 'competitive';
  energy_patterns: {
    high_motivation_times: string[];
    low_motivation_triggers: string[];
  };
}

export interface AbilityFactors {
  physical_capability: number; // 1-10
  time_availability: number; // 1-10
  cognitive_load: number; // 1-10 (lower is better)
  social_support: number; // 1-10
  resource_access: number; // 1-10
  overall_ability: number; // calculated average
}

export interface BehaviorAnalysis {
  behavior_score: number; // B = M * A * P (0-1000)
  motivation_level: number; // 0-100
  ability_level: number; // 0-100
  prompt_effectiveness: number; // 0-100
  likelihood_of_success: 'high' | 'medium' | 'low';
  recommended_adjustments: string[];
  habit_formation_prediction: {
    days_to_habit: number; // estimated days (21-66)
    success_probability: number; // 0-100%
    key_risk_factors: string[];
  };
}

export class BehaviorModel {
  /**
   * Calculate behavior likelihood using B=MAP formula
   * B = Motivation × Ability × Prompt
   */
  static calculateBehaviorScore(
    motivation: number,
    ability: number,
    promptEffectiveness: number
  ): BehaviorAnalysis {
    // Normalize inputs to 0-10 scale
    const m = Math.max(0, Math.min(10, motivation));
    const a = Math.max(0, Math.min(10, ability));
    const p = Math.max(0, Math.min(10, promptEffectiveness));
    
    // B = M × A × P (max score = 1000)
    const behaviorScore = m * a * p;
    
    // Convert to percentages for easier understanding
    const motivationLevel = (m / 10) * 100;
    const abilityLevel = (a / 10) * 100;
    const promptLevel = (p / 10) * 100;
    
    // Determine likelihood
    let likelihood: 'high' | 'medium' | 'low';
    if (behaviorScore >= 600) likelihood = 'high';
    else if (behaviorScore >= 250) likelihood = 'medium';
    else likelihood = 'low';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(m, a, p);
    
    // Predict habit formation
    const habitPrediction = this.predictHabitFormation(behaviorScore, m, a, p);
    
    return {
      behavior_score: behaviorScore,
      motivation_level: motivationLevel,
      ability_level: abilityLevel,
      prompt_effectiveness: promptLevel,
      likelihood_of_success: likelihood,
      recommended_adjustments: recommendations,
      habit_formation_prediction: habitPrediction
    };
  }

  /**
   * Design a tiny habit using Fogg's principles
   */
  static designTinyHabit(
    desiredBehavior: string,
    userContext: {
      current_habits: string[];
      motivation_profile: MotivationProfile;
      ability_factors: AbilityFactors;
      identity_goals: string[];
    }
  ): TinyHabit {
    // Break down behavior to smallest possible action
    const tinyBehavior = this.makeBehaviorTiny(desiredBehavior);
    
    // Find best trigger from existing habits
    const trigger = this.findBestTrigger(userContext.current_habits, userContext.ability_factors);
    
    // Design immediate reward
    const reward = this.designReward(userContext.motivation_profile);
    
    // Connect to identity
    const identityConnection = this.connectToIdentity(tinyBehavior, userContext.identity_goals);
    
    return {
      id: `habit_${Date.now()}`,
      behavior: tinyBehavior,
      trigger,
      reward,
      difficulty_level: 1, // Always start ridiculously easy
      identity_connection: identityConnection,
      completion_rate: 0,
      streak_count: 0,
      created_at: new Date(),
      last_completed: null
    };
  }

  /**
   * Create habit loops with cue-routine-reward structure
   */
  static createHabitLoop(habit: TinyHabit): HabitLoop {
    return {
      cue: habit.trigger,
      routine: habit.behavior,
      reward: habit.reward,
      identity_reinforcement: habit.identity_connection
    };
  }

  /**
   * Analyze and optimize existing habits
   */
  static optimizeHabit(
    habit: TinyHabit,
    recentData: {
      completion_rate: number;
      struggle_points: string[];
      user_feedback: string;
    }
  ): {
    optimization_suggestions: string[];
    adjusted_habit: TinyHabit;
    intervention_needed: boolean;
  } {
    const suggestions: string[] = [];
    let interventionNeeded = false;
    let adjustedHabit = { ...habit };

    // If completion rate < 80%, habit is too hard
    if (recentData.completion_rate < 80) {
      interventionNeeded = true;
      
      // Make it even tinier
      adjustedHabit.behavior = this.makeBehaviorEvenTinier(habit.behavior);
      adjustedHabit.difficulty_level = 1;
      
      suggestions.push("Habit was too challenging - making it ridiculously easy");
      suggestions.push(`New behavior: ${adjustedHabit.behavior}`);
    }

    // If completion rate > 95% for 7+ days, can gradually increase
    if (recentData.completion_rate > 95 && habit.streak_count > 7) {
      suggestions.push("Ready to slightly expand this habit");
      suggestions.push("Consider adding one small element to the routine");
    }

    // Trigger optimization
    if (recentData.struggle_points.includes('remembering')) {
      suggestions.push("Consider changing your trigger to something more obvious");
      suggestions.push("Try linking to a habit you never forget (like brushing teeth)");
    }

    // Reward optimization
    if (recentData.struggle_points.includes('motivation')) {
      adjustedHabit.reward = this.enhanceReward(habit.reward);
      suggestions.push(`Enhanced reward: ${adjustedHabit.reward}`);
    }

    return {
      optimization_suggestions: suggestions,
      adjusted_habit: adjustedHabit,
      intervention_needed: interventionNeeded
    };
  }

  // Private helper methods
  private static generateRecommendations(m: number, a: number, p: number): string[] {
    const recommendations: string[] = [];
    
    if (m < 6) {
      recommendations.push("Increase motivation: Connect to deeper 'why' or identity");
      recommendations.push("Start with intrinsic motivators rather than external rewards");
    }
    
    if (a < 6) {
      recommendations.push("Increase ability: Make the behavior ridiculously small");
      recommendations.push("Remove barriers and simplify the process");
    }
    
    if (p < 6) {
      recommendations.push("Improve prompts: Make triggers more obvious and reliable");
      recommendations.push("Stack new habit after an existing strong habit");
    }

    if (recommendations.length === 0) {
      recommendations.push("Great foundation - focus on consistency over perfection");
    }
    
    return recommendations;
  }

  private static predictHabitFormation(score: number, m: number, a: number, p: number): {
    days_to_habit: number;
    success_probability: number;
    key_risk_factors: string[];
  } {
    // Base prediction on Philippa Lally's research (21-254 days, average 66)
    let daysToHabit = 66; // Default average
    let successProbability = 50; // Base rate
    const riskFactors: string[] = [];

    // Adjust based on behavior score
    if (score >= 700) {
      daysToHabit = 25; // Very easy habits
      successProbability = 95;
    } else if (score >= 500) {
      daysToHabit = 35;
      successProbability = 85;
    } else if (score >= 300) {
      daysToHabit = 50;
      successProbability = 70;
    } else {
      daysToHabit = 80;
      successProbability = 40;
      riskFactors.push("Low overall behavior score - consider making it easier");
    }

    // Factor-specific risks
    if (m < 5) riskFactors.push("Low motivation may cause early dropout");
    if (a < 5) riskFactors.push("Low ability increases abandonment risk");
    if (p < 5) riskFactors.push("Weak prompts lead to forgetting");

    // Complexity penalty
    if (m < 6 && a < 6 && p < 6) {
      daysToHabit += 20;
      successProbability -= 25;
      riskFactors.push("Multiple weak factors compound difficulty");
    }

    return {
      days_to_habit: Math.max(21, Math.min(254, daysToHabit)),
      success_probability: Math.max(10, Math.min(95, successProbability)),
      key_risk_factors: riskFactors
    };
  }

  private static makeBehaviorTiny(behavior: string): string {
    const tinyVersions: Record<string, string> = {
      'exercise': 'do 1 pushup',
      'workout': 'put on workout clothes',
      'run': 'put on running shoes',
      'eat healthy': 'eat 1 piece of fruit',
      'drink water': 'drink 1 sip of water',
      'meditate': 'take 1 deep breath',
      'read': 'read 1 paragraph',
      'journal': 'write 1 sentence',
      'stretch': 'stretch 1 muscle for 10 seconds',
      'sleep better': 'put phone in another room'
    };

    const lowerBehavior = behavior.toLowerCase();
    for (const [key, tinyVersion] of Object.entries(tinyVersions)) {
      if (lowerBehavior.includes(key)) {
        return tinyVersion;
      }
    }

    return `do the first step of: ${behavior}`;
  }

  private static makeBehaviorEvenTinier(behavior: string): string {
    // If habit is still too hard, make it even smaller
    if (behavior.includes('1 pushup')) return 'get in pushup position';
    if (behavior.includes('put on workout clothes')) return 'touch workout clothes';
    if (behavior.includes('1 piece of fruit')) return 'touch a piece of fruit';
    if (behavior.includes('1 sip of water')) return 'fill a water glass';
    
    return `think about: ${behavior}`;
  }

  private static findBestTrigger(currentHabits: string[], abilityFactors: AbilityFactors): BehaviorTrigger {
    // Default reliable triggers
    const reliableTriggers: BehaviorTrigger[] = [
      {
        id: 'after_brushing_teeth',
        name: 'After brushing teeth',
        type: 'after_behavior',
        description: 'Right after morning teeth brushing',
        effectiveness_score: 90,
        user_specific: false
      },
      {
        id: 'before_coffee',
        name: 'Before first coffee',
        type: 'after_behavior',
        description: 'Before making/drinking first coffee',
        effectiveness_score: 85,
        user_specific: false
      },
      {
        id: 'when_sit_down_work',
        name: 'When sitting down to work',
        type: 'location',
        description: 'Upon arriving at desk/workplace',
        effectiveness_score: 80,
        user_specific: false
      }
    ];

    // TODO: In full implementation, analyze user's current habits to find best anchor
    // For now, return highest scoring default trigger
    return reliableTriggers[0];
  }

  private static designReward(motivationProfile: MotivationProfile): string {
    if (motivationProfile.motivation_style === 'social') {
      return 'Say "I did it!" out loud with a fist pump';
    } else if (motivationProfile.motivation_style === 'competitive') {
      return 'Mark an X on calendar and count your streak';
    } else if (motivationProfile.motivation_style === 'data_driven') {
      return 'Log it immediately and see your progress';
    } else {
      return 'Take a moment to feel proud and say "I am becoming healthier"';
    }
  }

  private static connectToIdentity(behavior: string, identityGoals: string[]): string {
    // Default identity connections
    const identityMap: Record<string, string> = {
      'exercise': 'I am someone who prioritizes my health',
      'eat healthy': 'I am someone who nourishes my body well',
      'drink water': 'I am someone who takes care of my body',
      'sleep': 'I am someone who values recovery and rest',
      'track': 'I am someone who is intentional about my health'
    };

    const lowerBehavior = behavior.toLowerCase();
    for (const [key, identity] of Object.entries(identityMap)) {
      if (lowerBehavior.includes(key)) {
        return identity;
      }
    }

    return 'I am someone who follows through on commitments to myself';
  }

  private static enhanceReward(currentReward: string): string {
    // Add celebration element to existing rewards
    const enhancements = [
      'and do a little victory dance',
      'and smile while saying "Yes!"',
      'and give yourself a mental high-five',
      'and take a moment to appreciate your consistency'
    ];
    
    return `${currentReward} ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
  }
}

/**
 * Identity-Based Habit Formation
 * "Every action is a vote for the type of person you wish to become" - James Clear
 */
export class IdentityBasedHabits {
  /**
   * Convert outcome goals to identity goals
   */
  static convertToIdentityGoal(outcomeGoal: string): {
    identity: string;
    supporting_habits: string[];
    daily_votes: string[];
  } {
    const identityConversions: Record<string, any> = {
      'lose weight': {
        identity: 'I am someone who takes care of their body',
        supporting_habits: ['Track meals mindfully', 'Move my body daily', 'Prioritize sleep'],
        daily_votes: ['Choose smaller portions', 'Take stairs', 'Drink water first']
      },
      'get fit': {
        identity: 'I am an athlete in training',
        supporting_habits: ['Show up for workouts', 'Fuel properly', 'Prioritize recovery'],
        daily_votes: ['Wear workout clothes', 'Pack gym bag', 'Choose protein']
      },
      'eat healthy': {
        identity: 'I am someone who nourishes my body well',
        supporting_habits: ['Choose whole foods', 'Plan meals ahead', 'Listen to hunger cues'],
        daily_votes: ['Add vegetables to meals', 'Choose water over soda', 'Cook at home']
      },
      'improve tennis': {
        identity: 'I am a dedicated tennis player',
        supporting_habits: ['Practice consistently', 'Study the game', 'Maintain peak fitness'],
        daily_votes: ['Visualize shots', 'Practice footwork', 'Analyze matches']
      }
    };

    const lowerGoal = outcomeGoal.toLowerCase();
    for (const [key, conversion] of Object.entries(identityConversions)) {
      if (lowerGoal.includes(key)) {
        return conversion;
      }
    }

    // Default conversion
    return {
      identity: `I am someone who is committed to ${outcomeGoal}`,
      supporting_habits: [`Take daily action toward ${outcomeGoal}`],
      daily_votes: [`Make choices aligned with ${outcomeGoal}`]
    };
  }

  /**
   * Reinforce identity with each habit completion
   */
  static generateIdentityReinforcement(
    completedHabit: string,
    targetIdentity: string,
    streakCount: number
  ): string {
    if (streakCount === 1) {
      return `You're becoming ${targetIdentity.toLowerCase()} - this is evidence!`;
    } else if (streakCount < 7) {
      return `${streakCount} days of evidence that you are ${targetIdentity.toLowerCase()}.`;
    } else if (streakCount < 30) {
      return `${streakCount} days strong! You're proving to yourself that you are ${targetIdentity.toLowerCase()}.`;
    } else {
      return `${streakCount} days of being ${targetIdentity.toLowerCase()}. This is who you are now!`;
    }
  }
}