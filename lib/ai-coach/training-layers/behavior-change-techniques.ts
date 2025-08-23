/**
 * Phase 5.6.2: Layer 2 - Evidence-Based Behavior Change Techniques
 * Implements scientific behavior change methods: self-monitoring, goal-setting, feedback, implementation intentions
 */

import { createClient } from '@/lib/supabase/server';

// Evidence-based techniques from Michie et al. Behavior Change Technique Taxonomy
export enum BehaviorChangeTechnique {
  SELF_MONITORING = 'self_monitoring',
  GOAL_SETTING = 'goal_setting_behavior',
  GOAL_SETTING_OUTCOME = 'goal_setting_outcome',
  ACTION_PLANNING = 'action_planning',
  IMPLEMENTATION_INTENTIONS = 'implementation_intentions',
  FEEDBACK_BEHAVIOR = 'feedback_behavior',
  FEEDBACK_OUTCOME = 'feedback_outcome',
  SOCIAL_SUPPORT = 'social_support_practical',
  INSTRUCTION = 'instruction_behavior',
  DEMONSTRATION = 'demonstration_behavior',
  GRADED_TASKS = 'graded_tasks',
  BEHAVIORAL_SUBSTITUTION = 'behavioral_substitution',
  HABIT_FORMATION = 'habit_formation',
  BEHAVIORAL_PRACTICE = 'behavioral_practice_rehearsal',
  SOCIAL_REWARD = 'social_reward',
  NON_SPECIFIC_REWARD = 'non_specific_reward',
  MATERIAL_INCENTIVE = 'material_incentive',
  SOCIAL_INCENTIVE = 'social_incentive',
  RESTRUCTURING_ENVIRONMENT = 'restructuring_social_environment',
  ADDING_OBJECTS = 'adding_objects_environment',
  REDUCE_PROMPTS = 'reduce_prompts_cues',
  RESTRUCTURING_PHYSICAL = 'restructuring_physical_environment',
  AVOIDANCE = 'avoidance_exposure_cues',
  DISTRACTION = 'distraction',
  SELF_TALK = 'self_talk',
  IMAGERY = 'imagery',
  RELAPSE_PREVENTION = 'relapse_prevention_coping_planning'
}

export interface TechniqueImplementation {
  technique: BehaviorChangeTechnique;
  description: string;
  instructions: string[];
  contextualFactors: string[];
  effectivenessScore: number; // 0-100 based on research
  personalizedInstructions?: string[];
  applicationTriggers: string[];
}

export interface BehaviorChangeIntervention {
  userId: string;
  goalId: string;
  techniques: BehaviorChangeTechnique[];
  implementation: {
    selfMonitoring: SelfMonitoringPlan;
    goalSetting: GoalSettingPlan;
    feedbackSystem: FeedbackPlan;
    implementationIntentions: ImplementationIntention[];
  };
  personalization: {
    userType: string;
    motivationStyle: string;
    previousSuccesses: BehaviorChangeTechnique[];
    barriers: string[];
  };
  effectiveness: {
    adherenceRate: number;
    outcomeAchievement: number;
    userSatisfaction: number;
    techniqueRankings: Array<{
      technique: BehaviorChangeTechnique;
      effectiveness: number;
    }>;
  };
}

export interface SelfMonitoringPlan {
  targetBehaviors: string[];
  monitoringMethod: 'app_logging' | 'voice_notes' | 'photo_documentation' | 'wearable_sync';
  frequency: 'real_time' | 'daily' | 'weekly';
  feedback: {
    immediate: boolean;
    summary: 'daily' | 'weekly' | 'monthly';
    visualizations: string[];
  };
  barriers: string[];
  facilitators: string[];
}

export interface GoalSettingPlan {
  behaviorGoals: Array<{
    behavior: string;
    specificity: string; // SMART criteria
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>;
  outcomeGoals: Array<{
    outcome: string;
    targetValue: number;
    targetDate: Date;
    milestones: Array<{
      value: number;
      date: Date;
    }>;
  }>;
  hierarchicalStructure: {
    longTerm: string[];
    shortTerm: string[];
    daily: string[];
  };
}

export interface FeedbackPlan {
  behaviorFeedback: {
    frequency: string;
    type: 'performance' | 'progress' | 'comparison';
    delivery: 'visual' | 'auditory' | 'haptic';
    timing: 'immediate' | 'delayed';
  };
  outcomeFeedback: {
    metrics: string[];
    visualization: string;
    comparison: 'self_previous' | 'peer_group' | 'expert_recommendations';
  };
  motivationalElements: {
    celebrations: string[];
    encouragement: string[];
    social_sharing: boolean;
  };
}

export interface ImplementationIntention {
  situation: string; // "When/if X happens..."
  response: string;  // "...then I will do Y"
  behaviorLink: string;
  contextCues: string[];
  barrierAnticipation: string[];
  copingStrategies: string[];
}

export class BehaviorChangeTechniqueEngine {
  private supabase: any;
  private techniqueLibrary: Map<BehaviorChangeTechnique, TechniqueImplementation>;

  constructor() {
    this.supabase = createClient();
    this.techniqueLibrary = this.initializeTechniqueLibrary();
  }

  /**
   * Select optimal behavior change techniques for a user and goal
   */
  async selectOptimalTechniques(
    userId: string,
    goalType: string,
    userProfile: any,
    currentBehaviors: any[]
  ): Promise<BehaviorChangeTechnique[]> {
    try {
      // Get user's historical technique effectiveness
      const { data: history } = await this.supabase
        .from('behavior_change_history')
        .select('*')
        .eq('user_id', userId);

      // Analyze user's preferred learning style and motivation
      const userPreferences = this.analyzeUserPreferences(userProfile, history || []);

      // Select techniques based on evidence and personalization
      const techniques = this.selectEvidenceBasedTechniques(
        goalType,
        userPreferences,
        currentBehaviors
      );

      // Rank by predicted effectiveness
      const rankedTechniques = await this.rankTechniquesByEffectiveness(
        userId,
        techniques,
        userProfile
      );

      return rankedTechniques.slice(0, 5); // Top 5 most effective

    } catch (error) {
      console.error('Error selecting optimal techniques:', error);
      throw error;
    }
  }

  /**
   * Create comprehensive self-monitoring plan
   */
  async createSelfMonitoringPlan(
    userId: string,
    targetBehaviors: string[],
    userPreferences: any
  ): Promise<SelfMonitoringPlan> {
    try {
      // Analyze current monitoring capabilities
      const { data: deviceData } = await this.supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId);

      // Determine optimal monitoring method
      const monitoringMethod = this.selectMonitoringMethod(deviceData, userPreferences);

      // Create feedback system
      const feedback = this.designFeedbackSystem(targetBehaviors, userPreferences);

      // Identify barriers and facilitators
      const barriers = await this.identifyMonitoringBarriers(userId, targetBehaviors);
      const facilitators = await this.identifyMonitoringFacilitators(userId, targetBehaviors);

      const plan: SelfMonitoringPlan = {
        targetBehaviors,
        monitoringMethod,
        frequency: 'real_time', // Default to real-time for best results
        feedback,
        barriers,
        facilitators
      };

      // Save the plan
      await this.supabase.from('self_monitoring_plans').insert({
        user_id: userId,
        plan_data: plan,
        created_at: new Date().toISOString()
      });

      return plan;

    } catch (error) {
      console.error('Error creating self-monitoring plan:', error);
      throw error;
    }
  }

  /**
   * Create SMART goals with hierarchical structure
   */
  async createGoalSettingPlan(
    userId: string,
    goalDescription: string,
    timeline: number // days
  ): Promise<GoalSettingPlan> {
    try {
      // Parse goal into SMART components
      const behaviorGoals = this.createSMARTGoals(goalDescription, timeline);

      // Create outcome goals
      const outcomeGoals = this.createOutcomeGoals(goalDescription, timeline);

      // Build hierarchical structure
      const hierarchicalStructure = this.createGoalHierarchy(behaviorGoals, outcomeGoals);

      const plan: GoalSettingPlan = {
        behaviorGoals,
        outcomeGoals,
        hierarchicalStructure
      };

      // Save the plan
      await this.supabase.from('goal_setting_plans').insert({
        user_id: userId,
        goal_description: goalDescription,
        timeline_days: timeline,
        plan_data: plan,
        created_at: new Date().toISOString()
      });

      return plan;

    } catch (error) {
      console.error('Error creating goal setting plan:', error);
      throw error;
    }
  }

  /**
   * Design personalized feedback system
   */
  async createFeedbackPlan(
    userId: string,
    behaviors: string[],
    outcomes: string[],
    userProfile: any
  ): Promise<FeedbackPlan> {
    try {
      // Determine optimal feedback preferences
      const feedbackPreferences = this.analyzeFeedbackPreferences(userProfile);

      // Create behavior feedback system
      const behaviorFeedback = {
        frequency: feedbackPreferences.frequency,
        type: feedbackPreferences.behaviorType,
        delivery: feedbackPreferences.delivery,
        timing: feedbackPreferences.timing
      };

      // Create outcome feedback system
      const outcomeFeedback = {
        metrics: outcomes,
        visualization: feedbackPreferences.visualization,
        comparison: feedbackPreferences.comparison
      };

      // Add motivational elements
      const motivationalElements = {
        celebrations: this.selectCelebrationMethods(userProfile),
        encouragement: this.selectEncouragementMethods(userProfile),
        social_sharing: userProfile.social_motivation > 70
      };

      const plan: FeedbackPlan = {
        behaviorFeedback,
        outcomeFeedback,
        motivationalElements
      };

      // Save the plan
      await this.supabase.from('feedback_plans').insert({
        user_id: userId,
        behaviors,
        outcomes,
        plan_data: plan,
        created_at: new Date().toISOString()
      });

      return plan;

    } catch (error) {
      console.error('Error creating feedback plan:', error);
      throw error;
    }
  }

  /**
   * Create implementation intentions (if-then plans)
   */
  async createImplementationIntentions(
    userId: string,
    goalBehavior: string,
    context: string,
    barriers: string[]
  ): Promise<ImplementationIntention[]> {
    try {
      const intentions: ImplementationIntention[] = [];

      // Create basic implementation intention
      const basicIntention: ImplementationIntention = {
        situation: `When I ${context}`,
        response: `then I will ${goalBehavior}`,
        behaviorLink: goalBehavior,
        contextCues: [context],
        barrierAnticipation: barriers,
        copingStrategies: barriers.map(barrier => this.createCopingStrategy(barrier))
      };
      intentions.push(basicIntention);

      // Create barrier-specific intentions
      for (const barrier of barriers) {
        const barrierIntention: ImplementationIntention = {
          situation: `When I encounter ${barrier}`,
          response: `then I will ${this.createBarrierResponse(barrier, goalBehavior)}`,
          behaviorLink: goalBehavior,
          contextCues: [barrier],
          barrierAnticipation: [barrier],
          copingStrategies: [this.createCopingStrategy(barrier)]
        };
        intentions.push(barrierIntention);
      }

      // Save the intentions
      await this.supabase.from('implementation_intentions').insert(
        intentions.map(intention => ({
          user_id: userId,
          goal_behavior: goalBehavior,
          intention_data: intention,
          created_at: new Date().toISOString()
        }))
      );

      return intentions;

    } catch (error) {
      console.error('Error creating implementation intentions:', error);
      throw error;
    }
  }

  /**
   * Track technique effectiveness for learning
   */
  async trackTechniqueEffectiveness(
    userId: string,
    technique: BehaviorChangeTechnique,
    context: {
      goalId: string;
      adherence: number; // 0-100
      outcome: number; // 0-100
      satisfaction: number; // 1-5
      barriers: string[];
      facilitators: string[];
    }
  ): Promise<void> {
    try {
      await this.supabase.from('technique_effectiveness').insert({
        user_id: userId,
        technique,
        goal_id: context.goalId,
        adherence_rate: context.adherence,
        outcome_achievement: context.outcome,
        user_satisfaction: context.satisfaction,
        barriers: context.barriers,
        facilitators: context.facilitators,
        tracked_at: new Date().toISOString()
      });

      // Update user's technique profile
      await this.updateUserTechniqueProfile(userId, technique, context);

    } catch (error) {
      console.error('Error tracking technique effectiveness:', error);
      throw error;
    }
  }

  /**
   * Generate personalized intervention based on techniques
   */
  async generatePersonalizedIntervention(
    userId: string,
    goalId: string,
    currentSituation: string
  ): Promise<string> {
    try {
      // Get user's most effective techniques
      const { data: effectivenesss } = await this.supabase
        .from('technique_effectiveness')
        .select('*')
        .eq('user_id', userId)
        .order('outcome_achievement', { ascending: false })
        .limit(3);

      if (!effectivenesss || effectivenesss.length === 0) {
        return this.generateDefaultIntervention(currentSituation);
      }

      // Select best technique for current situation
      const bestTechnique = this.selectBestTechniqueForSituation(
        effectivenesss,
        currentSituation
      );

      // Generate personalized intervention
      const intervention = this.generateInterventionFromTechnique(
        bestTechnique,
        currentSituation,
        userId
      );

      return intervention;

    } catch (error) {
      console.error('Error generating personalized intervention:', error);
      throw error;
    }
  }

  // Private implementation methods

  private initializeTechniqueLibrary(): Map<BehaviorChangeTechnique, TechniqueImplementation> {
    const library = new Map<BehaviorChangeTechnique, TechniqueImplementation>();

    // Self-monitoring
    library.set(BehaviorChangeTechnique.SELF_MONITORING, {
      technique: BehaviorChangeTechnique.SELF_MONITORING,
      description: 'Systematic observation and recording of target behavior',
      instructions: [
        'Track your target behavior immediately after it occurs',
        'Record context, triggers, and outcomes',
        'Review patterns weekly',
        'Use data to adjust your approach'
      ],
      contextualFactors: ['digital literacy', 'motivation level', 'privacy concerns'],
      effectivenessScore: 85,
      applicationTriggers: ['goal_initiation', 'behavior_inconsistency', 'progress_plateau']
    });

    // Goal setting
    library.set(BehaviorChangeTechnique.GOAL_SETTING, {
      technique: BehaviorChangeTechnique.GOAL_SETTING,
      description: 'Setting specific, measurable, achievable, relevant, time-bound goals',
      instructions: [
        'Define specific behavioral targets',
        'Make goals measurable with clear metrics',
        'Ensure goals are achievable given current circumstances',
        'Align goals with personal values and priorities',
        'Set realistic deadlines'
      ],
      contextualFactors: ['experience level', 'time availability', 'resource access'],
      effectivenessScore: 80,
      applicationTriggers: ['program_start', 'goal_completion', 'motivation_decrease']
    });

    // Implementation intentions
    library.set(BehaviorChangeTechnique.IMPLEMENTATION_INTENTIONS, {
      technique: BehaviorChangeTechnique.IMPLEMENTATION_INTENTIONS,
      description: 'If-then plans linking situations to specific behaviors',
      instructions: [
        'Identify specific situational cues',
        'Plan exact behavioral responses',
        'Practice the if-then connection',
        'Anticipate and plan for barriers'
      ],
      contextualFactors: ['cognitive load', 'environmental consistency', 'habit strength'],
      effectivenessScore: 90,
      applicationTriggers: ['barrier_identification', 'consistency_issues', 'automation_needed']
    });

    // Add more techniques...
    return library;
  }

  private analyzeUserPreferences(userProfile: any, history: any[]): any {
    return {
      learningStyle: userProfile.learning_style || 'visual',
      motivationStyle: userProfile.motivation_style || 'intrinsic',
      socialPreference: userProfile.social_preference || 'individual',
      techComfort: userProfile.tech_comfort || 'moderate',
      previousSuccesses: history.filter(h => h.outcome_achievement > 70).map(h => h.technique),
      previousFailures: history.filter(h => h.outcome_achievement < 40).map(h => h.technique)
    };
  }

  private selectEvidenceBasedTechniques(
    goalType: string,
    userPreferences: any,
    currentBehaviors: any[]
  ): BehaviorChangeTechnique[] {
    // Evidence-based selection logic
    const techniques: BehaviorChangeTechnique[] = [];

    // Always include core techniques
    techniques.push(
      BehaviorChangeTechnique.SELF_MONITORING,
      BehaviorChangeTechnique.GOAL_SETTING,
      BehaviorChangeTechnique.IMPLEMENTATION_INTENTIONS
    );

    // Add based on goal type
    if (goalType === 'habit_formation') {
      techniques.push(BehaviorChangeTechnique.HABIT_FORMATION);
      techniques.push(BehaviorChangeTechnique.RESTRUCTURING_ENVIRONMENT);
    }

    // Add based on user preferences
    if (userPreferences.socialPreference === 'group') {
      techniques.push(BehaviorChangeTechnique.SOCIAL_SUPPORT);
      techniques.push(BehaviorChangeTechnique.SOCIAL_REWARD);
    }

    return techniques;
  }

  private async rankTechniquesByEffectiveness(
    userId: string,
    techniques: BehaviorChangeTechnique[],
    userProfile: any
  ): Promise<BehaviorChangeTechnique[]> {
    // Get user's historical effectiveness
    const { data: history } = await this.supabase
      .from('technique_effectiveness')
      .select('*')
      .eq('user_id', userId);

    // Calculate scores for each technique
    const scoredTechniques = techniques.map(technique => {
      const libraryData = this.techniqueLibrary.get(technique);
      const userHistory = history?.find(h => h.technique === technique);
      
      let score = libraryData?.effectivenessScore || 50;
      
      if (userHistory) {
        score = userHistory.outcome_achievement; // Use user's actual results
      }

      return { technique, score };
    });

    // Sort by score and return techniques
    return scoredTechniques
      .sort((a, b) => b.score - a.score)
      .map(item => item.technique);
  }

  private selectMonitoringMethod(deviceData: any[], userPreferences: any): SelfMonitoringPlan['monitoringMethod'] {
    if (deviceData?.some(d => d.device_type === 'wearable')) {
      return 'wearable_sync';
    }
    if (userPreferences.techComfort === 'high') {
      return 'app_logging';
    }
    return 'voice_notes';
  }

  private designFeedbackSystem(targetBehaviors: string[], userPreferences: any): SelfMonitoringPlan['feedback'] {
    return {
      immediate: userPreferences.motivationStyle === 'immediate_gratification',
      summary: userPreferences.review_frequency || 'weekly',
      visualizations: this.selectOptimalVisualizations(targetBehaviors, userPreferences)
    };
  }

  private selectOptimalVisualizations(behaviors: string[], preferences: any): string[] {
    const visualizations = ['progress_bar', 'streak_counter', 'calendar_heatmap'];
    
    if (preferences.learningStyle === 'visual') {
      visualizations.push('charts_graphs', 'progress_photos');
    }
    
    return visualizations;
  }

  private async identifyMonitoringBarriers(userId: string, behaviors: string[]): Promise<string[]> {
    // Analyze user's past monitoring challenges
    const { data: challenges } = await this.supabase
      .from('monitoring_challenges')
      .select('*')
      .eq('user_id', userId);

    return challenges?.map(c => c.barrier) || ['forgetting_to_log', 'time_constraints'];
  }

  private async identifyMonitoringFacilitators(userId: string, behaviors: string[]): Promise<string[]> {
    return ['automated_reminders', 'social_accountability', 'immediate_feedback'];
  }

  // Additional helper methods would continue here...
  private createSMARTGoals(description: string, timeline: number): GoalSettingPlan['behaviorGoals'] {
    // Implementation would parse and create SMART goals
    return [{
      behavior: description,
      specificity: 'Specific behavioral target',
      measurable: 'Clear success metrics',
      achievable: 'Realistic given current capabilities',
      relevant: 'Aligned with user values',
      timeBound: `Within ${timeline} days`
    }];
  }

  private createOutcomeGoals(description: string, timeline: number): GoalSettingPlan['outcomeGoals'] {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + timeline);

    return [{
      outcome: `Achieved: ${description}`,
      targetValue: 100,
      targetDate,
      milestones: [
        { value: 25, date: new Date(Date.now() + timeline * 0.25 * 24 * 60 * 60 * 1000) },
        { value: 50, date: new Date(Date.now() + timeline * 0.5 * 24 * 60 * 60 * 1000) },
        { value: 75, date: new Date(Date.now() + timeline * 0.75 * 24 * 60 * 60 * 1000) }
      ]
    }];
  }

  private createGoalHierarchy(behaviorGoals: any[], outcomeGoals: any[]): GoalSettingPlan['hierarchicalStructure'] {
    return {
      longTerm: outcomeGoals.map(g => g.outcome),
      shortTerm: behaviorGoals.map(g => g.behavior),
      daily: ['Complete daily tracking', 'Execute target behavior']
    };
  }

  private analyzeFeedbackPreferences(userProfile: any): any {
    return {
      frequency: userProfile.feedback_preference || 'daily',
      behaviorType: 'progress',
      delivery: 'visual',
      timing: 'immediate',
      visualization: 'charts_and_graphs',
      comparison: 'self_previous'
    };
  }

  private selectCelebrationMethods(userProfile: any): string[] {
    if (userProfile.social_motivation > 70) {
      return ['social_sharing', 'public_recognition', 'team_celebration'];
    }
    return ['personal_milestone', 'self_reward', 'progress_visualization'];
  }

  private selectEncouragementMethods(userProfile: any): string[] {
    return ['progress_acknowledgment', 'effort_recognition', 'next_step_guidance'];
  }

  private createCopingStrategy(barrier: string): string {
    const strategies: { [key: string]: string } = {
      'lack_of_time': 'Schedule specific 10-minute windows',
      'low_motivation': 'Connect to personal values and identity',
      'social_pressure': 'Prepare response scripts and find supportive community',
      'fatigue': 'Start with easier version and build gradually'
    };

    return strategies[barrier] || 'Identify specific workaround strategy';
  }

  private createBarrierResponse(barrier: string, goalBehavior: string): string {
    return `implement my backup plan: ${this.createCopingStrategy(barrier)} and still do ${goalBehavior}`;
  }

  private generateDefaultIntervention(situation: string): string {
    return `Based on your current situation (${situation}), try using implementation intentions: plan exactly when and where you'll perform your target behavior.`;
  }

  private selectBestTechniqueForSituation(effectiveness: any[], situation: string): BehaviorChangeTechnique {
    // Logic to match technique to situation
    return effectiveness[0]?.technique || BehaviorChangeTechnique.SELF_MONITORING;
  }

  private generateInterventionFromTechnique(technique: BehaviorChangeTechnique, situation: string, userId: string): string {
    const techniqueData = this.techniqueLibrary.get(technique);
    if (!techniqueData) {
      return this.generateDefaultIntervention(situation);
    }

    return `${techniqueData.description}: ${techniqueData.instructions[0]}. This works well for you based on your history.`;
  }

  private async updateUserTechniqueProfile(userId: string, technique: BehaviorChangeTechnique, context: any): Promise<void> {
    // Update user's personalized technique effectiveness profile
    await this.supabase
      .from('user_technique_profiles')
      .upsert({
        user_id: userId,
        technique,
        effectiveness_score: context.outcome,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,technique' });
  }
}

// Export singleton instance
export const behaviorChangeTechniqueEngine = new BehaviorChangeTechniqueEngine();