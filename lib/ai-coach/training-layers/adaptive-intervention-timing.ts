/**
 * Phase 5.6.5: Layer 5 - Adaptive Intervention Timing (JITAI)
 * Just-In-Time Adaptive Interventions that deliver personalized support when users need it most
 */

import { createClient } from '@/lib/supabase/server';

export interface JITAIContext {
  userId: string;
  timestamp: Date;
  location: string;
  activity: string;
  emotionalState: number; // -100 (negative) to +100 (positive)
  stressLevel: number; // 0-100
  energyLevel: number; // 0-100
  motivationLevel: number; // 0-100
  socialContext: 'alone' | 'with_friends' | 'with_family' | 'public' | 'work';
  environmentalFactors: {
    weather: string;
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    isWeekend: boolean;
    isHoliday: boolean;
  };
  recentEvents: Array<{
    event: string;
    impact: number; // -100 to +100
    timestamp: Date;
  }>;
  proximityToGoals: {
    shortTerm: number; // 0-100% complete
    longTerm: number; // 0-100% complete
  };
  behaviorHistory: {
    streakCount: number;
    recentLapse: boolean;
    lastActivity: Date;
    consistency: number; // 0-100
  };
}

export interface InterventionTrigger {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    parameter: keyof JITAIContext | string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: any;
    weight: number; // 0-1 importance
  }>;
  priority: number; // 1-10
  cooldownPeriod: number; // minutes
  maxDailyTriggers: number;
  personalizedFactors: string[];
}

export interface AdaptiveIntervention {
  id: string;
  userId: string;
  triggerId: string;
  type: 'encouragement' | 'reminder' | 'suggestion' | 'challenge' | 'celebration' | 'support' | 'redirection';
  content: string;
  deliveryMethod: 'push_notification' | 'in_app_message' | 'voice_prompt' | 'visual_cue';
  timing: {
    optimal: boolean;
    contextScore: number; // 0-100
    predictedEffectiveness: number; // 0-100
  };
  personalization: {
    motivationAlignment: number; // 0-100
    habituationRisk: number; // 0-100
    previousEffectiveness: number; // 0-100
  };
  constraints: {
    notBefore: Date;
    notAfter: Date;
    minInterval: number; // minutes since last intervention
    contextualRestrictions: string[];
  };
}

export interface JITAIEffectiveness {
  interventionId: string;
  userId: string;
  context: JITAIContext;
  userResponse: 'engaged' | 'ignored' | 'dismissed' | 'completed';
  behaviorChange: boolean;
  immediateEffect: number; // -100 to +100
  sustainedEffect?: number; // measured later
  feedbackProvided: boolean;
  userSatisfaction: number; // 1-5
  contextualFactors: {
    interferenceLevel: number; // 0-100
    receptiveness: number; // 0-100
    competing_priorities: string[];
  };
}

export class AdaptiveInterventionEngine {
  private supabase: any;
  private triggerLibrary: Map<string, InterventionTrigger>;

  constructor() {
    this.supabase = createClient();
    this.triggerLibrary = this.initializeTriggerLibrary();
  }

  /**
   * Analyze current context and determine optimal intervention
   */
  async analyzeInterventionOpportunity(
    userId: string,
    currentContext: JITAIContext
  ): Promise<AdaptiveIntervention | null> {
    try {
      // Get user's intervention history and preferences
      const { data: userProfile } = await this.supabase
        .from('intervention_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get recent interventions to avoid habituation
      const { data: recentInterventions } = await this.supabase
        .from('adaptive_interventions')
        .select('*')
        .eq('user_id', userId)
        .gte('delivered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('delivered_at', { ascending: false });

      // Evaluate all triggers against current context
      const activeTrigggers = this.evaluateAllTriggers(currentContext, recentInterventions);

      if (activeTrigggers.length === 0) {
        return null;
      }

      // Select highest priority trigger
      const selectedTrigger = activeTrigggers[0];

      // Generate personalized intervention
      const intervention = await this.generateAdaptiveIntervention(
        userId,
        selectedTrigger,
        currentContext,
        userProfile,
        recentInterventions
      );

      // Validate intervention constraints
      if (!this.validateInterventionConstraints(intervention, currentContext)) {
        return null;
      }

      // Calculate optimal timing
      intervention.timing = this.calculateOptimalTiming(intervention, currentContext);

      return intervention;

    } catch (error) {
      console.error('Error analyzing intervention opportunity:', error);
      return null;
    }
  }

  /**
   * Deliver intervention at optimal time
   */
  async deliverAdaptiveIntervention(
    intervention: AdaptiveIntervention,
    context: JITAIContext
  ): Promise<boolean> {
    try {
      // Check if timing is still optimal
      if (!this.isTimingOptimal(intervention, context)) {
        // Reschedule for later
        await this.scheduleInterventionRetry(intervention, context);
        return false;
      }

      // Deliver intervention based on method
      const delivered = await this.executeDelivery(intervention, context);

      if (delivered) {
        // Record intervention delivery
        await this.supabase.from('adaptive_interventions').insert({
          user_id: intervention.userId,
          trigger_id: intervention.triggerId,
          intervention_type: intervention.type,
          content: intervention.content,
          delivery_method: intervention.deliveryMethod,
          context_data: context,
          delivered_at: new Date().toISOString(),
          timing_score: intervention.timing.contextScore,
          predicted_effectiveness: intervention.timing.predictedEffectiveness
        });

        // Schedule effectiveness tracking
        await this.scheduleEffectivenessTracking(intervention);
      }

      return delivered;

    } catch (error) {
      console.error('Error delivering adaptive intervention:', error);
      return false;
    }
  }

  /**
   * Track intervention effectiveness and learn
   */
  async trackInterventionEffectiveness(
    interventionId: string,
    effectiveness: JITAIEffectiveness
  ): Promise<void> {
    try {
      // Record effectiveness data
      await this.supabase.from('intervention_effectiveness').insert({
        intervention_id: interventionId,
        user_id: effectiveness.userId,
        user_response: effectiveness.userResponse,
        behavior_change: effectiveness.behaviorChange,
        immediate_effect: effectiveness.immediateEffect,
        user_satisfaction: effectiveness.userSatisfaction,
        context_data: effectiveness.context,
        tracked_at: new Date().toISOString()
      });

      // Update user's intervention profile
      await this.updateUserInterventionProfile(effectiveness);

      // Update trigger effectiveness
      await this.updateTriggerEffectiveness(effectiveness);

      // Learn from contextual patterns
      await this.learnFromInterventionContext(effectiveness);

    } catch (error) {
      console.error('Error tracking intervention effectiveness:', error);
    }
  }

  /**
   * Predict optimal intervention timing for planning
   */
  async predictOptimalInterventionWindows(
    userId: string,
    timeHorizon: number // hours ahead
  ): Promise<Array<{
    startTime: Date;
    endTime: Date;
    interventionTypes: string[];
    predictedReceptiveness: number;
    confidence: number;
  }>> {
    try {
      // Get user's historical patterns
      const { data: patterns } = await this.supabase
        .from('intervention_patterns')
        .select('*')
        .eq('user_id', userId);

      // Predict context for future time windows
      const predictions = [];
      const currentTime = new Date();

      for (let hour = 1; hour <= timeHorizon; hour++) {
        const futureTime = new Date(currentTime.getTime() + hour * 60 * 60 * 1000);
        
        const predictedContext = await this.predictFutureContext(userId, futureTime, patterns);
        const receptiveness = this.predictReceptiveness(predictedContext, patterns);

        if (receptiveness > 60) {
          predictions.push({
            startTime: new Date(futureTime.getTime() - 15 * 60 * 1000), // 15 min window
            endTime: new Date(futureTime.getTime() + 15 * 60 * 1000),
            interventionTypes: this.getOptimalInterventionTypes(predictedContext),
            predictedReceptiveness: receptiveness,
            confidence: this.calculatePredictionConfidence(patterns, hour)
          });
        }
      }

      return predictions;

    } catch (error) {
      console.error('Error predicting intervention windows:', error);
      return [];
    }
  }

  /**
   * Prevent intervention habituation through variety and spacing
   */
  async preventInterventionHabituation(userId: string): Promise<void> {
    try {
      // Analyze recent intervention patterns
      const { data: recentInterventions } = await this.supabase
        .from('adaptive_interventions')
        .select('*')
        .eq('user_id', userId)
        .gte('delivered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Detect habituation patterns
      const habituationRisk = this.calculateHabituationRisk(recentInterventions);

      if (habituationRisk > 70) {
        // Update intervention strategies
        await this.diversifyInterventionStrategies(userId, recentInterventions);
        
        // Implement strategic silence periods
        await this.implementSilencePeriods(userId);
        
        // Increase personalization
        await this.enhancePersonalization(userId);
      }

    } catch (error) {
      console.error('Error preventing habituation:', error);
    }
  }

  /**
   * Generate micro-moments of support
   */
  async generateMicroInterventions(
    userId: string,
    context: JITAIContext
  ): Promise<Array<{
    content: string;
    duration: number; // seconds
    trigger: string;
    effect: 'energy_boost' | 'motivation' | 'focus' | 'stress_relief';
  }>> {
    try {
      const microInterventions = [];

      // Energy boost micro-interventions
      if (context.energyLevel < 40) {
        microInterventions.push({
          content: '🌟 Take 3 deep breaths. You\'ve got this!',
          duration: 15,
          trigger: 'low_energy',
          effect: 'energy_boost' as const
        });
      }

      // Motivation micro-interventions
      if (context.motivationLevel < 50) {
        microInterventions.push({
          content: '🎯 Remember why you started. One small step forward!',
          duration: 10,
          trigger: 'low_motivation',
          effect: 'motivation' as const
        });
      }

      // Stress relief micro-interventions
      if (context.stressLevel > 70) {
        microInterventions.push({
          content: '🧘 Pause. Ground yourself. You are in control.',
          duration: 20,
          trigger: 'high_stress',
          effect: 'stress_relief' as const
        });
      }

      // Focus micro-interventions
      if (context.activity === 'distracted' || context.emotionalState < -30) {
        microInterventions.push({
          content: '🎯 What\'s the one thing you can do right now?',
          duration: 12,
          trigger: 'distraction',
          effect: 'focus' as const
        });
      }

      return microInterventions;

    } catch (error) {
      console.error('Error generating micro-interventions:', error);
      return [];
    }
  }

  // Private helper methods

  private initializeTriggerLibrary(): Map<string, InterventionTrigger> {
    const library = new Map<string, InterventionTrigger>();

    // Motivation dip trigger
    library.set('motivation_dip', {
      id: 'motivation_dip',
      name: 'Motivation Dip Detection',
      description: 'Detects when user motivation drops below optimal levels',
      conditions: [
        { parameter: 'motivationLevel', operator: 'lt', value: 40, weight: 0.8 },
        { parameter: 'stressLevel', operator: 'gt', value: 60, weight: 0.6 }
      ],
      priority: 8,
      cooldownPeriod: 120,
      maxDailyTriggers: 3,
      personalizedFactors: ['historical_motivation_patterns', 'effective_encouragement_types']
    });

    // Streak protection trigger
    library.set('streak_protection', {
      id: 'streak_protection',
      name: 'Streak Protection',
      description: 'Prevents habit streaks from breaking',
      conditions: [
        { parameter: 'behaviorHistory.streakCount', operator: 'gt', value: 3, weight: 0.7 },
        { parameter: 'behaviorHistory.lastActivity', operator: 'gt', value: 20, weight: 0.9 } // hours since last activity
      ],
      priority: 9,
      cooldownPeriod: 360,
      maxDailyTriggers: 2,
      personalizedFactors: ['streak_importance', 'preferred_reminder_style']
    });

    // Opportunity window trigger
    library.set('opportunity_window', {
      id: 'opportunity_window',
      name: 'Optimal Opportunity Window',
      description: 'High receptiveness and low competing priorities',
      conditions: [
        { parameter: 'energyLevel', operator: 'gt', value: 60, weight: 0.6 },
        { parameter: 'stressLevel', operator: 'lt', value: 50, weight: 0.5 },
        { parameter: 'socialContext', operator: 'eq', value: 'alone', weight: 0.4 }
      ],
      priority: 6,
      cooldownPeriod: 180,
      maxDailyTriggers: 4,
      personalizedFactors: ['peak_performance_times', 'preferred_activity_contexts']
    });

    return library;
  }

  private evaluateAllTriggers(
    context: JITAIContext,
    recentInterventions: any[]
  ): InterventionTrigger[] {
    const activeTriggers: Array<{ trigger: InterventionTrigger; score: number }> = [];

    for (const trigger of this.triggerLibrary.values()) {
      // Check cooldown period
      const lastTrigger = recentInterventions.find(i => i.trigger_id === trigger.id);
      if (lastTrigger) {
        const timeSinceLastTrigger = Date.now() - new Date(lastTrigger.delivered_at).getTime();
        if (timeSinceLastTrigger < trigger.cooldownPeriod * 60 * 1000) {
          continue;
        }
      }

      // Check daily limit
      const todayTriggers = recentInterventions.filter(i => 
        i.trigger_id === trigger.id && 
        new Date(i.delivered_at).toDateString() === new Date().toDateString()
      );
      if (todayTriggers.length >= trigger.maxDailyTriggers) {
        continue;
      }

      // Evaluate conditions
      const score = this.evaluateTriggerConditions(trigger, context);
      if (score > 60) {
        activeTriggers.push({ trigger, score });
      }
    }

    // Sort by priority and score
    return activeTriggers
      .sort((a, b) => (b.trigger.priority * b.score) - (a.trigger.priority * a.score))
      .map(item => item.trigger);
  }

  private evaluateTriggerConditions(trigger: InterventionTrigger, context: JITAIContext): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const condition of trigger.conditions) {
      const value = this.getContextValue(context, condition.parameter);
      const conditionMet = this.evaluateCondition(value, condition.operator, condition.value);
      
      if (conditionMet) {
        totalScore += 100 * condition.weight;
      }
      totalWeight += condition.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private getContextValue(context: JITAIContext, parameter: string): any {
    if (parameter.includes('.')) {
      const parts = parameter.split('.');
      let value: any = context;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return (context as any)[parameter];
  }

  private evaluateCondition(value: any, operator: string, target: any): boolean {
    switch (operator) {
      case 'gt': return value > target;
      case 'lt': return value < target;
      case 'gte': return value >= target;
      case 'lte': return value <= target;
      case 'eq': return value === target;
      case 'between': return value >= target[0] && value <= target[1];
      default: return false;
    }
  }

  private async generateAdaptiveIntervention(
    userId: string,
    trigger: InterventionTrigger,
    context: JITAIContext,
    userProfile: any,
    recentInterventions: any[]
  ): Promise<AdaptiveIntervention> {
    // Generate personalized content based on trigger and context
    const content = await this.generatePersonalizedContent(trigger, context, userProfile);
    
    return {
      id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      triggerId: trigger.id,
      type: this.selectInterventionType(trigger, context),
      content,
      deliveryMethod: this.selectOptimalDeliveryMethod(context, userProfile),
      timing: {
        optimal: false, // Will be calculated separately
        contextScore: 0,
        predictedEffectiveness: 0
      },
      personalization: {
        motivationAlignment: this.calculateMotivationAlignment(context, userProfile),
        habituationRisk: this.calculateHabituationRisk(recentInterventions),
        previousEffectiveness: this.calculatePreviousEffectiveness(trigger.id, recentInterventions)
      },
      constraints: {
        notBefore: new Date(),
        notAfter: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        minInterval: 60, // 1 hour
        contextualRestrictions: this.getContextualRestrictions(context)
      }
    };
  }

  private async generatePersonalizedContent(
    trigger: InterventionTrigger,
    context: JITAIContext,
    userProfile: any
  ): Promise<string> {
    // Generate content based on trigger type and personalization
    const templates: Record<string, string[]> = {
      'motivation-dip': [
        `Remember your why - you're ${context.proximityToGoals.shortTerm}% closer to your goal!`,
        `Take a moment to appreciate how far you've come. Your streak of ${context.behaviorHistory.streakCount} days is impressive!`,
        `Your future self will thank you for what you do right now. What's one small step you can take?`
      ],
      'streak-protection': [
        `🔥 Don't break that amazing ${context.behaviorHistory.streakCount}-day streak! You're so close to making this automatic.`,
        `Your consistency is building something powerful. Keep the momentum going!`,
        `${context.behaviorHistory.streakCount} days strong! Your habit is becoming part of who you are.`
      ],
      'opportunity-window': [
        `Perfect timing! Your energy is high and you have space to focus. What would move you forward?`,
        `This feels like a great moment for progress. Trust your instincts and take action.`,
        `You're in a good state right now. How can you use this energy?`
      ]
    };

    const options = templates[trigger.id] || ['You\'ve got this! Keep going.'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private selectInterventionType(trigger: InterventionTrigger, context: JITAIContext): AdaptiveIntervention['type'] {
    if (trigger.id === 'motivation_dip') return 'encouragement';
    if (trigger.id === 'streak_protection') return 'reminder';
    if (trigger.id === 'opportunity_window') return 'suggestion';
    return 'encouragement';
  }

  private selectOptimalDeliveryMethod(context: JITAIContext, userProfile: any): AdaptiveIntervention['deliveryMethod'] {
    // Select based on context and user preferences
    if (context.socialContext === 'public') return 'visual_cue';
    if (context.activity === 'driving') return 'voice_prompt';
    return 'push_notification';
  }

  private calculateMotivationAlignment(context: JITAIContext, userProfile: any): number {
    // Calculate how well intervention aligns with current motivation state
    return Math.max(0, Math.min(100, context.motivationLevel + (userProfile?.motivation_boost || 0)));
  }

  private calculateHabituationRisk(recentInterventions: any[]): number {
    if (!recentInterventions || recentInterventions.length === 0) return 0;
    
    // Look for patterns that indicate habituation
    const last7Days = recentInterventions.filter(i => 
      new Date(i.delivered_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const repetitiveContent = last7Days.filter(i => 
      last7Days.filter(j => j.content === i.content).length > 2
    ).length;

    return Math.min(100, (repetitiveContent / Math.max(1, last7Days.length)) * 100);
  }

  private calculatePreviousEffectiveness(triggerId: string, recentInterventions: any[]): number {
    const triggerInterventions = recentInterventions.filter(i => i.trigger_id === triggerId);
    if (triggerInterventions.length === 0) return 50; // Default

    const avgEffectiveness = triggerInterventions.reduce((sum, i) => 
      sum + (i.effectiveness_score || 50), 0) / triggerInterventions.length;

    return avgEffectiveness;
  }

  private getContextualRestrictions(context: JITAIContext): string[] {
    const restrictions = [];
    if (context.socialContext === 'work') restrictions.push('no_personal_content');
    if (context.stressLevel > 80) restrictions.push('gentle_tone_only');
    if (context.environmentalFactors.timeOfDay < 7 || context.environmentalFactors.timeOfDay > 22) {
      restrictions.push('quiet_delivery');
    }
    return restrictions;
  }

  private validateInterventionConstraints(intervention: AdaptiveIntervention, context: JITAIContext): boolean {
    const now = new Date();
    if (now < intervention.constraints.notBefore || now > intervention.constraints.notAfter) {
      return false;
    }
    
    // Check contextual restrictions
    for (const restriction of intervention.constraints.contextualRestrictions) {
      if (!this.validateContextualRestriction(restriction, context)) {
        return false;
      }
    }

    return true;
  }

  private validateContextualRestriction(restriction: string, context: JITAIContext): boolean {
    switch (restriction) {
      case 'no_personal_content':
        return context.socialContext !== 'work';
      case 'gentle_tone_only':
        return context.stressLevel <= 80;
      case 'quiet_delivery':
        return context.environmentalFactors.timeOfDay >= 7 && context.environmentalFactors.timeOfDay <= 22;
      default:
        return true;
    }
  }

  private calculateOptimalTiming(intervention: AdaptiveIntervention, context: JITAIContext): AdaptiveIntervention['timing'] {
    const contextScore = Math.min(100, 
      (context.energyLevel * 0.3) + 
      ((100 - context.stressLevel) * 0.3) + 
      (context.motivationLevel * 0.4)
    );

    const predictedEffectiveness = Math.min(100,
      contextScore * 0.6 + 
      intervention.personalization.previousEffectiveness * 0.3 +
      (100 - intervention.personalization.habituationRisk) * 0.1
    );

    return {
      optimal: contextScore > 70 && predictedEffectiveness > 60,
      contextScore,
      predictedEffectiveness
    };
  }

  private isTimingOptimal(intervention: AdaptiveIntervention, context: JITAIContext): boolean {
    const timing = this.calculateOptimalTiming(intervention, context);
    return timing.optimal;
  }

  private async scheduleInterventionRetry(intervention: AdaptiveIntervention, context: JITAIContext): Promise<void> {
    // Schedule for later retry when context might be better
    await this.supabase.from('intervention_queue').insert({
      user_id: intervention.userId,
      intervention_data: intervention,
      scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Retry in 30 minutes
      retry_count: 1
    });
  }

  private async executeDelivery(intervention: AdaptiveIntervention, context: JITAIContext): Promise<boolean> {
    // Mock delivery - in real implementation would integrate with notification systems
    console.log(`Delivering intervention: ${intervention.content} via ${intervention.deliveryMethod}`);
    return true;
  }

  private async scheduleEffectivenessTracking(intervention: AdaptiveIntervention): Promise<void> {
    // Schedule tracking for later (e.g., 1 hour after delivery to see immediate effects)
    await this.supabase.from('effectiveness_tracking_queue').insert({
      intervention_id: intervention.id,
      user_id: intervention.userId,
      track_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  }

  // Additional helper methods would continue here...
  private async updateUserInterventionProfile(effectiveness: JITAIEffectiveness): Promise<void> {
    // Update user's intervention preferences based on effectiveness
  }

  private async updateTriggerEffectiveness(effectiveness: JITAIEffectiveness): Promise<void> {
    // Update trigger algorithms based on effectiveness data
  }

  private async learnFromInterventionContext(effectiveness: JITAIEffectiveness): Promise<void> {
    // Learn from contextual patterns for future interventions
  }

  private async predictFutureContext(userId: string, futureTime: Date, patterns: any[]): Promise<JITAIContext> {
    // Predict future context based on historical patterns
    return {} as JITAIContext; // Simplified for now
  }

  private predictReceptiveness(context: any, patterns: any[]): number {
    // Predict how receptive user will be in given context
    return 70; // Simplified for now
  }

  private getOptimalInterventionTypes(context: any): string[] {
    return ['encouragement', 'suggestion'];
  }

  private calculatePredictionConfidence(patterns: any[], hoursAhead: number): number {
    // Confidence decreases with time horizon
    return Math.max(20, 90 - hoursAhead * 5);
  }

  private async diversifyInterventionStrategies(userId: string, interventions: any[]): Promise<void> {
    // Implement strategy diversification to prevent habituation
  }

  private async implementSilencePeriods(userId: string): Promise<void> {
    // Implement strategic silence to reset user receptiveness
  }

  private async enhancePersonalization(userId: string): Promise<void> {
    // Increase personalization to combat habituation
  }
}

// Export singleton instance
export const adaptiveInterventionEngine = new AdaptiveInterventionEngine();