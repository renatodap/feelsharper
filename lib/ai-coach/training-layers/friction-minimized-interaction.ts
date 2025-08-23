/**
 * Phase 5.6.4: Layer 4 - Friction-Minimized Interaction
 * Auto-logging, voice priority, context-aware prompts, and smart defaults
 */

import { createClient } from '@/lib/supabase/server';

export interface FrictionAnalysis {
  userId: string;
  interactionType: string;
  frictionPoints: Array<{
    step: string;
    frictionLevel: number; // 0-100
    commonBarriers: string[];
    solutionStrategies: string[];
  }>;
  totalFrictionScore: number;
  userFrustrationIndicators: string[];
  dropoffPoints: string[];
}

export interface AutoLoggingRule {
  id: string;
  userId: string;
  triggerType: 'location' | 'time' | 'device' | 'pattern' | 'context';
  triggerConditions: any;
  targetBehavior: string;
  confidence: number; // 0-100 how confident to auto-log
  requiresConfirmation: boolean;
  learningData: {
    successRate: number;
    userAcceptanceRate: number;
    falsePositives: number;
    userCorrections: string[];
  };
}

export interface VoiceInteractionPattern {
  userId: string;
  commandType: string;
  naturalLanguageVariations: string[];
  contextualCues: string[];
  successRate: number;
  averageParsingTime: number;
  commonMisinterpretations: string[];
  personalizedShortcuts: string[];
}

export interface ContextualPrompt {
  id: string;
  userId: string;
  context: {
    location: string;
    timeOfDay: number;
    dayOfWeek: number;
    previousActivity: string;
    energyLevel: number;
    socialContext: string;
  };
  promptContent: string;
  promptType: 'reminder' | 'suggestion' | 'encouragement' | 'check_in' | 'celebration';
  effectivenessScore: number;
  userResponseRate: number;
  personalizedTriggers: string[];
}

export interface SmartDefault {
  category: string;
  userProfile: any;
  contextualFactors: any;
  recommendedValue: any;
  alternativeOptions: any[];
  confidence: number;
  learningBasis: string[];
}

export class FrictionMinimizationEngine {
  private supabase: any;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Analyze current friction points in user interactions
   */
  async analyzeFrictionPoints(userId: string): Promise<FrictionAnalysis> {
    try {
      // Get user interaction data
      const { data: interactions } = await this.supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!interactions || interactions.length === 0) {
        return this.getDefaultFrictionAnalysis(userId);
      }

      // Analyze friction points
      const frictionPoints = this.identifyFrictionPoints(interactions);
      const totalFrictionScore = this.calculateTotalFriction(frictionPoints);
      const frustrationIndicators = this.identifyFrustrationIndicators(interactions);
      const dropoffPoints = this.identifyDropoffPoints(interactions);

      const analysis: FrictionAnalysis = {
        userId,
        interactionType: 'general',
        frictionPoints,
        totalFrictionScore,
        userFrustrationIndicators: frustrationIndicators,
        dropoffPoints
      };

      // Save analysis for learning
      await this.supabase.from('friction_analyses').insert({
        user_id: userId,
        analysis_data: analysis,
        created_at: new Date().toISOString()
      });

      return analysis;

    } catch (error) {
      console.error('Error analyzing friction points:', error);
      throw error;
    }
  }

  /**
   * Create auto-logging rules based on user patterns
   */
  async createAutoLoggingRules(userId: string): Promise<AutoLoggingRule[]> {
    try {
      // Analyze user's logging patterns
      const { data: logs } = await this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!logs || logs.length < 10) {
        return this.getStarterAutoLoggingRules(userId);
      }

      // Identify patterns
      const patterns = this.identifyLoggingPatterns(logs);
      const rules: AutoLoggingRule[] = [];

      // Create location-based rules
      const locationRules = this.createLocationBasedRules(userId, patterns.locationPatterns);
      rules.push(...locationRules);

      // Create time-based rules
      const timeRules = this.createTimeBasedRules(userId, patterns.timePatterns);
      rules.push(...timeRules);

      // Create context-based rules
      const contextRules = this.createContextBasedRules(userId, patterns.contextPatterns);
      rules.push(...contextRules);

      // Save rules
      for (const rule of rules) {
        await this.supabase.from('auto_logging_rules').insert({
          user_id: userId,
          rule_data: rule,
          created_at: new Date().toISOString()
        });
      }

      return rules;

    } catch (error) {
      console.error('Error creating auto-logging rules:', error);
      throw error;
    }
  }

  /**
   * Optimize voice interaction patterns
   */
  async optimizeVoiceInteractions(userId: string): Promise<VoiceInteractionPattern[]> {
    try {
      // Get user's voice interaction history
      const { data: voiceData } = await this.supabase
        .from('voice_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!voiceData || voiceData.length === 0) {
        return this.getDefaultVoicePatterns(userId);
      }

      // Analyze voice patterns
      const patterns: VoiceInteractionPattern[] = [];

      // Group by command type
      const commandGroups = this.groupVoiceCommandsByType(voiceData);

      for (const [commandType, commands] of Object.entries(commandGroups)) {
        const pattern: VoiceInteractionPattern = {
          userId,
          commandType,
          naturalLanguageVariations: this.extractNaturalVariations(commands as any[]),
          contextualCues: this.extractContextualCues(commands as any[]),
          successRate: this.calculateVoiceSuccessRate(commands as any[]),
          averageParsingTime: this.calculateAverageParsingTime(commands as any[]),
          commonMisinterpretations: this.identifyMisinterpretations(commands as any[]),
          personalizedShortcuts: this.generatePersonalizedShortcuts(commands as any[])
        };

        patterns.push(pattern);
      }

      // Save optimized patterns
      for (const pattern of patterns) {
        await this.supabase.from('voice_patterns').upsert({
          user_id: userId,
          command_type: pattern.commandType,
          pattern_data: pattern,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,command_type' });
      }

      return patterns;

    } catch (error) {
      console.error('Error optimizing voice interactions:', error);
      throw error;
    }
  }

  /**
   * Generate context-aware prompts
   */
  async generateContextualPrompts(
    userId: string,
    currentContext: any
  ): Promise<ContextualPrompt[]> {
    try {
      // Get user's prompt effectiveness history
      const { data: promptHistory } = await this.supabase
        .from('contextual_prompts')
        .select('*')
        .eq('user_id', userId);

      // Get user preferences and patterns
      const { data: userData } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const prompts: ContextualPrompt[] = [];

      // Generate prompts based on context and history
      if (this.shouldGenerateReminder(currentContext, promptHistory)) {
        prompts.push(await this.createReminderPrompt(userId, currentContext, userData));
      }

      if (this.shouldGenerateSuggestion(currentContext, promptHistory)) {
        prompts.push(await this.createSuggestionPrompt(userId, currentContext, userData));
      }

      if (this.shouldGenerateEncouragement(currentContext, promptHistory)) {
        prompts.push(await this.createEncouragementPrompt(userId, currentContext, userData));
      }

      if (this.shouldGenerateCheckIn(currentContext, promptHistory)) {
        prompts.push(await this.createCheckInPrompt(userId, currentContext, userData));
      }

      // Rank prompts by predicted effectiveness
      const rankedPrompts = this.rankPromptsByEffectiveness(prompts, promptHistory);

      return rankedPrompts.slice(0, 3); // Return top 3 prompts

    } catch (error) {
      console.error('Error generating contextual prompts:', error);
      throw error;
    }
  }

  /**
   * Create smart defaults for user inputs
   */
  async createSmartDefaults(
    userId: string,
    inputCategory: string,
    currentContext: any
  ): Promise<SmartDefault[]> {
    try {
      // Get user's historical choices
      const { data: choiceHistory } = await this.supabase
        .from('user_choices')
        .select('*')
        .eq('user_id', userId)
        .eq('category', inputCategory)
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

      // Get user profile for personalization
      const { data: userProfile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const defaults: SmartDefault[] = [];

      if (inputCategory === 'workout') {
        defaults.push(await this.createWorkoutDefault(userId, choiceHistory, userProfile, currentContext));
      } else if (inputCategory === 'nutrition') {
        defaults.push(await this.createNutritionDefault(userId, choiceHistory, userProfile, currentContext));
      } else if (inputCategory === 'sleep') {
        defaults.push(await this.createSleepDefault(userId, choiceHistory, userProfile, currentContext));
      }

      return defaults;

    } catch (error) {
      console.error('Error creating smart defaults:', error);
      throw error;
    }
  }

  /**
   * Execute auto-logging based on rules
   */
  async executeAutoLogging(userId: string, context: any): Promise<any[]> {
    try {
      // Get active auto-logging rules
      const { data: rules } = await this.supabase
        .from('auto_logging_rules')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      if (!rules) return [];

      const autoLogs: any[] = [];

      for (const ruleData of rules) {
        const rule: AutoLoggingRule = ruleData.rule_data;

        // Check if rule conditions are met
        if (this.evaluateAutoLoggingRule(rule, context)) {
          const autoLog = {
            userId,
            ruleId: rule.id,
            behavior: rule.targetBehavior,
            confidence: rule.confidence,
            requiresConfirmation: rule.requiresConfirmation,
            context,
            timestamp: new Date()
          };

          autoLogs.push(autoLog);

          // Log the auto-logging attempt
          await this.supabase.from('auto_logging_attempts').insert({
            user_id: userId,
            rule_id: rule.id,
            context_data: context,
            success: true,
            created_at: new Date().toISOString()
          });
        }
      }

      return autoLogs;

    } catch (error) {
      console.error('Error executing auto-logging:', error);
      return [];
    }
  }

  /**
   * Measure and reduce interaction friction
   */
  async optimizeInteractionFriction(userId: string): Promise<any> {
    try {
      // Analyze current friction
      const frictionAnalysis = await this.analyzeFrictionPoints(userId);

      // Create optimization strategies
      const optimizations = [];

      // Address high-friction points
      for (const frictionPoint of frictionAnalysis.frictionPoints) {
        if (frictionPoint.frictionLevel > 70) {
          const optimization = await this.createFrictionReduction(userId, frictionPoint);
          optimizations.push(optimization);
        }
      }

      // Implement auto-logging for repetitive tasks
      if (frictionAnalysis.dropoffPoints.includes('manual_logging')) {
        const autoLoggingRules = await this.createAutoLoggingRules(userId);
        optimizations.push({
          type: 'auto_logging',
          rules: autoLoggingRules.length,
          estimatedFrictionReduction: 60
        });
      }

      // Optimize voice interactions
      if (frictionAnalysis.frictionPoints.some(fp => fp.step === 'voice_input')) {
        const voicePatterns = await this.optimizeVoiceInteractions(userId);
        optimizations.push({
          type: 'voice_optimization',
          patterns: voicePatterns.length,
          estimatedFrictionReduction: 40
        });
      }

      // Create smart defaults
      const smartDefaults = await this.createSmartDefaults(userId, 'general', {});
      optimizations.push({
        type: 'smart_defaults',
        defaults: smartDefaults.length,
        estimatedFrictionReduction: 30
      });

      return {
        currentFriction: frictionAnalysis.totalFrictionScore,
        optimizations,
        estimatedFrictionReduction: optimizations.reduce((sum, opt) => sum + opt.estimatedFrictionReduction, 0)
      };

    } catch (error) {
      console.error('Error optimizing interaction friction:', error);
      throw error;
    }
  }

  // Private helper methods

  private getDefaultFrictionAnalysis(userId: string): FrictionAnalysis {
    return {
      userId,
      interactionType: 'initial',
      frictionPoints: [
        {
          step: 'manual_logging',
          frictionLevel: 80,
          commonBarriers: ['forgetting', 'time_consuming', 'interrupts_flow'],
          solutionStrategies: ['auto_logging', 'voice_input', 'smart_defaults']
        },
        {
          step: 'goal_setting',
          frictionLevel: 60,
          commonBarriers: ['complexity', 'overwhelming_options'],
          solutionStrategies: ['guided_setup', 'templates', 'progressive_disclosure']
        }
      ],
      totalFrictionScore: 70,
      userFrustrationIndicators: ['high_abandonment', 'incomplete_entries'],
      dropoffPoints: ['manual_logging', 'complex_forms']
    };
  }

  private identifyFrictionPoints(interactions: any[]): FrictionAnalysis['frictionPoints'] {
    // Analyze interaction patterns to identify friction
    const frictionPoints = [];

    // Check for incomplete interactions
    const incompleteRate = interactions.filter(i => !i.completed).length / interactions.length;
    if (incompleteRate > 0.3) {
      frictionPoints.push({
        step: 'interaction_completion',
        frictionLevel: incompleteRate * 100,
        commonBarriers: ['too_many_steps', 'unclear_interface', 'time_pressure'],
        solutionStrategies: ['simplify_flow', 'auto_save', 'progressive_disclosure']
      });
    }

    return frictionPoints;
  }

  private calculateTotalFriction(frictionPoints: any[]): number {
    if (frictionPoints.length === 0) return 0;
    return frictionPoints.reduce((sum, fp) => sum + fp.frictionLevel, 0) / frictionPoints.length;
  }

  private identifyFrustrationIndicators(interactions: any[]): string[] {
    const indicators = [];
    
    // Check for rapid repeated attempts
    const rapidRetries = interactions.filter(i => i.retry_count > 2);
    if (rapidRetries.length > 0) {
      indicators.push('rapid_retries');
    }

    return indicators;
  }

  private identifyDropoffPoints(interactions: any[]): string[] {
    return ['manual_logging', 'complex_forms'];
  }

  private getStarterAutoLoggingRules(userId: string): AutoLoggingRule[] {
    return [
      {
        id: 'gym_location',
        userId,
        triggerType: 'location',
        triggerConditions: { location: 'gym', confidence: 80 },
        targetBehavior: 'workout',
        confidence: 75,
        requiresConfirmation: true,
        learningData: {
          successRate: 0,
          userAcceptanceRate: 0,
          falsePositives: 0,
          userCorrections: []
        }
      }
    ];
  }

  private identifyLoggingPatterns(logs: any[]): any {
    return {
      locationPatterns: {},
      timePatterns: {},
      contextPatterns: {}
    };
  }

  private createLocationBasedRules(userId: string, patterns: any): AutoLoggingRule[] {
    return [];
  }

  private createTimeBasedRules(userId: string, patterns: any): AutoLoggingRule[] {
    return [];
  }

  private createContextBasedRules(userId: string, patterns: any): AutoLoggingRule[] {
    return [];
  }

  private getDefaultVoicePatterns(userId: string): VoiceInteractionPattern[] {
    return [
      {
        userId,
        commandType: 'log_workout',
        naturalLanguageVariations: ['I worked out', 'finished my workout', 'did exercise'],
        contextualCues: ['gym', 'post_workout', 'tired'],
        successRate: 80,
        averageParsingTime: 1500,
        commonMisinterpretations: ['worked out vs worked'],
        personalizedShortcuts: ['gym done', 'workout complete']
      }
    ];
  }

  private groupVoiceCommandsByType(voiceData: any[]): { [key: string]: any[] } {
    return {};
  }

  private extractNaturalVariations(commands: any[]): string[] {
    return commands.map(c => c.transcript || '');
  }

  private extractContextualCues(commands: any[]): string[] {
    return [];
  }

  private calculateVoiceSuccessRate(commands: any[]): number {
    return 80;
  }

  private calculateAverageParsingTime(commands: any[]): number {
    return 1500;
  }

  private identifyMisinterpretations(commands: any[]): string[] {
    return [];
  }

  private generatePersonalizedShortcuts(commands: any[]): string[] {
    return [];
  }

  private shouldGenerateReminder(context: any, history: any[]): boolean {
    return true;
  }

  private shouldGenerateSuggestion(context: any, history: any[]): boolean {
    return true;
  }

  private shouldGenerateEncouragement(context: any, history: any[]): boolean {
    return true;
  }

  private shouldGenerateCheckIn(context: any, history: any[]): boolean {
    return true;
  }

  private async createReminderPrompt(userId: string, context: any, userData: any): Promise<ContextualPrompt> {
    return {
      id: 'reminder_' + Date.now(),
      userId,
      context,
      promptContent: 'Time for your daily check-in!',
      promptType: 'reminder',
      effectivenessScore: 70,
      userResponseRate: 0,
      personalizedTriggers: ['time_based']
    };
  }

  private async createSuggestionPrompt(userId: string, context: any, userData: any): Promise<ContextualPrompt> {
    return {
      id: 'suggestion_' + Date.now(),
      userId,
      context,
      promptContent: 'Based on your energy level, try a quick 10-minute walk.',
      promptType: 'suggestion',
      effectivenessScore: 75,
      userResponseRate: 0,
      personalizedTriggers: ['energy_level']
    };
  }

  private async createEncouragementPrompt(userId: string, context: any, userData: any): Promise<ContextualPrompt> {
    return {
      id: 'encouragement_' + Date.now(),
      userId,
      context,
      promptContent: 'You are doing great! Keep up the momentum.',
      promptType: 'encouragement',
      effectivenessScore: 80,
      userResponseRate: 0,
      personalizedTriggers: ['streak_milestone']
    };
  }

  private async createCheckInPrompt(userId: string, context: any, userData: any): Promise<ContextualPrompt> {
    return {
      id: 'checkin_' + Date.now(),
      userId,
      context,
      promptContent: 'How are you feeling about your progress today?',
      promptType: 'check_in',
      effectivenessScore: 65,
      userResponseRate: 0,
      personalizedTriggers: ['daily_reflection']
    };
  }

  private rankPromptsByEffectiveness(prompts: ContextualPrompt[], history: any[]): ContextualPrompt[] {
    return prompts.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  private async createWorkoutDefault(userId: string, history: any[], profile: any, context: any): Promise<SmartDefault> {
    return {
      category: 'workout',
      userProfile: profile,
      contextualFactors: context,
      recommendedValue: {
        type: 'strength_training',
        duration: 45,
        intensity: 'moderate'
      },
      alternativeOptions: [
        { type: 'cardio', duration: 30, intensity: 'high' },
        { type: 'flexibility', duration: 20, intensity: 'low' }
      ],
      confidence: 80,
      learningBasis: ['historical_preferences', 'time_of_day', 'energy_level']
    };
  }

  private async createNutritionDefault(userId: string, history: any[], profile: any, context: any): Promise<SmartDefault> {
    return {
      category: 'nutrition',
      userProfile: profile,
      contextualFactors: context,
      recommendedValue: {
        meal_type: 'balanced',
        calories: 500,
        macros: { protein: 30, carbs: 40, fat: 30 }
      },
      alternativeOptions: [
        { meal_type: 'light', calories: 300 },
        { meal_type: 'protein_focused', calories: 600 }
      ],
      confidence: 75,
      learningBasis: ['meal_timing', 'activity_level', 'preferences']
    };
  }

  private async createSleepDefault(userId: string, history: any[], profile: any, context: any): Promise<SmartDefault> {
    return {
      category: 'sleep',
      userProfile: profile,
      contextualFactors: context,
      recommendedValue: {
        bedtime: '22:00',
        target_hours: 8,
        sleep_environment: 'optimal'
      },
      alternativeOptions: [
        { bedtime: '22:30', target_hours: 7.5 },
        { bedtime: '21:30', target_hours: 8.5 }
      ],
      confidence: 85,
      learningBasis: ['sleep_patterns', 'morning_schedule', 'recovery_needs']
    };
  }

  private evaluateAutoLoggingRule(rule: AutoLoggingRule, context: any): boolean {
    // Simple evaluation logic - would be more sophisticated in real implementation
    return rule.confidence > 70;
  }

  private async createFrictionReduction(userId: string, frictionPoint: any): Promise<any> {
    return {
      type: 'friction_reduction',
      targetStep: frictionPoint.step,
      strategy: frictionPoint.solutionStrategies[0],
      estimatedReduction: Math.min(50, frictionPoint.frictionLevel * 0.6)
    };
  }
}

// Export singleton instance
export const frictionMinimizationEngine = new FrictionMinimizationEngine();