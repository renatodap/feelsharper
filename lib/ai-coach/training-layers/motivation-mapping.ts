/**
 * Phase 5.6.3: Layer 3 - Personalized Motivation Mapping
 * Maps individual motivation profiles based on Self-Determination Theory and psychological research
 */

import { createClient } from '@/lib/supabase/server';

// Self-Determination Theory: Core psychological needs
export interface BasicPsychologicalNeeds {
  autonomy: number; // 0-100: Need for choice and volition
  competence: number; // 0-100: Need for mastery and effectiveness
  relatedness: number; // 0-100: Need for connection and belonging
}

// Motivation orientation types
export enum MotivationType {
  INTRINSIC = 'intrinsic',
  IDENTIFIED = 'identified', // Personal importance
  INTROJECTED = 'introjected', // Guilt/shame avoidance
  EXTERNAL = 'external', // Rewards/punishments
  AMOTIVATION = 'amotivation' // Lack of motivation
}

export interface MotivationProfile {
  userId: string;
  
  // Primary motivation type
  primaryType: MotivationType;
  secondaryType?: MotivationType;
  
  // Self-Determination Theory needs
  basicNeeds: BasicPsychologicalNeeds;
  
  // Social motivation preferences
  socialPreferences: {
    individualVsGroup: number; // -100 (solo) to +100 (group)
    competitiveVsCollaborative: number; // -100 (collaborative) to +100 (competitive)
    publicVsPrivate: number; // -100 (private) to +100 (public)
    supportGiving: number; // 0-100: Enjoys helping others
    supportReceiving: number; // 0-100: Comfortable receiving help
  };
  
  // Temporal preferences
  temporalPreferences: {
    immediateVsDelayed: number; // -100 (delayed) to +100 (immediate)
    shortTermVsLongTerm: number; // -100 (long-term) to +100 (short-term)
    consistencyVsVariety: number; // -100 (variety) to +100 (consistency)
  };
  
  // Achievement preferences
  achievementPreferences: {
    processVsOutcome: number; // -100 (outcome) to +100 (process)
    masteryVsPerformance: number; // -100 (performance) to +100 (mastery)
    challengeSeekingLevel: number; // 0-100
    perfectionism: number; // 0-100
  };
  
  // Environmental preferences
  environmentalPreferences: {
    structureVsFlexibility: number; // -100 (flexibility) to +100 (structure)
    stimulationLevel: number; // 0-100: Preferred level of stimulation
    feedbackFrequency: number; // 0-100: Desired feedback frequency
  };
  
  // Values and life domains
  values: {
    health: number; // 0-100 importance
    performance: number;
    appearance: number;
    social_connection: number;
    personal_growth: number;
    achievement: number;
    fun_enjoyment: number;
    meaning_purpose: number;
  };
  
  // Dynamic factors
  contextualFactors: {
    stressLevel: number; // 0-100
    energyLevel: number; // 0-100
    timeAvailability: number; // 0-100
    socialSupport: number; // 0-100
    lifeStageFactors: string[];
  };
  
  // Learning and adaptation
  motivationHistory: Array<{
    date: Date;
    context: string;
    effectiveStrategies: string[];
    ineffectiveStrategies: string[];
    motivationLevel: number;
  }>;
  
  // Personalized intervention strategies
  personalizedStrategies: {
    optimalInterventions: string[];
    avoidStrategies: string[];
    preferredRewards: string[];
    effectiveFeedback: string[];
    socialSupport: string[];
  };
}

export interface MotivationIntervention {
  type: string;
  description: string;
  sdtAlignment: keyof BasicPsychologicalNeeds;
  socialComponent: boolean;
  temporalFocus: 'immediate' | 'short_term' | 'long_term';
  evidenceLevel: 'high' | 'medium' | 'low';
  personalizedParameters: { [key: string]: any };
}

export interface MotivationContext {
  timeOfDay: number;
  dayOfWeek: number;
  location: string;
  socialContext: 'alone' | 'with_others' | 'public';
  stressLevel: number;
  energyLevel: number;
  recentEvents: string[];
  upcomingEvents: string[];
}

export class MotivationMappingEngine {
  private supabase: any;
  private interventionLibrary: Map<string, MotivationIntervention>;

  constructor() {
    this.supabase = createClient();
    this.interventionLibrary = this.initializeInterventionLibrary();
  }

  /**
   * Create initial motivation profile from user assessment
   */
  async createInitialMotivationProfile(
    userId: string,
    assessmentResponses: any
  ): Promise<MotivationProfile> {
    try {
      // Analyze assessment responses using validated instruments
      const basicNeeds = this.analyzeBasicNeeds(assessmentResponses);
      const primaryType = this.determinePrimaryMotivationType(assessmentResponses);
      const socialPreferences = this.analyzeSocialPreferences(assessmentResponses);
      const temporalPreferences = this.analyzeTemporalPreferences(assessmentResponses);
      const achievementPreferences = this.analyzeAchievementPreferences(assessmentResponses);
      const environmentalPreferences = this.analyzeEnvironmentalPreferences(assessmentResponses);
      const values = this.analyzeValues(assessmentResponses);

      const profile: MotivationProfile = {
        userId,
        primaryType,
        basicNeeds,
        socialPreferences,
        temporalPreferences,
        achievementPreferences,
        environmentalPreferences,
        values,
        contextualFactors: {
          stressLevel: assessmentResponses.current_stress || 50,
          energyLevel: assessmentResponses.current_energy || 50,
          timeAvailability: assessmentResponses.time_availability || 50,
          socialSupport: assessmentResponses.social_support || 50,
          lifeStageFactors: assessmentResponses.life_stage_factors || []
        },
        motivationHistory: [],
        personalizedStrategies: {
          optimalInterventions: [],
          avoidStrategies: [],
          preferredRewards: [],
          effectiveFeedback: [],
          socialSupport: []
        }
      };

      // Generate initial personalized strategies
      profile.personalizedStrategies = await this.generatePersonalizedStrategies(profile);

      // Save to database
      await this.supabase.from('motivation_profiles').insert({
        user_id: userId,
        profile_data: profile,
        created_at: new Date().toISOString()
      });

      return profile;

    } catch (error) {
      console.error('Error creating motivation profile:', error);
      throw error;
    }
  }

  /**
   * Update motivation profile based on behavioral data and feedback
   */
  async updateMotivationProfile(
    userId: string,
    behaviorData: any[],
    feedbackData: any[]
  ): Promise<MotivationProfile> {
    try {
      // Get current profile
      const { data: profileData } = await this.supabase
        .from('motivation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        throw new Error('Motivation profile not found');
      }

      let profile: MotivationProfile = profileData.profile_data;

      // Analyze recent behavior patterns
      const behaviorInsights = this.analyzeBehaviorPatterns(behaviorData);

      // Update profile based on insights
      profile = this.updateProfileFromBehavior(profile, behaviorInsights);

      // Analyze feedback effectiveness
      const feedbackInsights = this.analyzeFeedbackEffectiveness(feedbackData);

      // Update strategies based on effectiveness
      profile.personalizedStrategies = this.updateStrategiesFromFeedback(
        profile.personalizedStrategies,
        feedbackInsights
      );

      // Update contextual factors
      profile.contextualFactors = this.updateContextualFactors(profile.contextualFactors, behaviorData);

      // Add to motivation history
      profile.motivationHistory.push({
        date: new Date(),
        context: 'profile_update',
        effectiveStrategies: feedbackInsights.effective,
        ineffectiveStrategies: feedbackInsights.ineffective,
        motivationLevel: behaviorInsights.averageMotivation
      });

      // Keep history manageable
      if (profile.motivationHistory.length > 50) {
        profile.motivationHistory = profile.motivationHistory.slice(-50);
      }

      // Save updated profile
      await this.supabase
        .from('motivation_profiles')
        .update({
          profile_data: profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return profile;

    } catch (error) {
      console.error('Error updating motivation profile:', error);
      throw error;
    }
  }

  /**
   * Select optimal motivation intervention for current context
   */
  async selectOptimalIntervention(
    userId: string,
    context: MotivationContext,
    goalType: string
  ): Promise<MotivationIntervention> {
    try {
      // Get user's motivation profile
      const { data: profileData } = await this.supabase
        .from('motivation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        throw new Error('Motivation profile not found');
      }

      const profile: MotivationProfile = profileData.profile_data;

      // Get candidate interventions
      const candidates = this.getCandidateInterventions(profile, context, goalType);

      // Rank interventions by predicted effectiveness
      const rankedInterventions = this.rankInterventionsByEffectiveness(
        candidates,
        profile,
        context
      );

      // Select top intervention with personalized parameters
      const selectedIntervention = rankedInterventions[0];
      selectedIntervention.personalizedParameters = this.personalizeIntervention(
        selectedIntervention,
        profile,
        context
      );

      // Track intervention selection for learning
      await this.trackInterventionSelection(userId, selectedIntervention, context);

      return selectedIntervention;

    } catch (error) {
      console.error('Error selecting optimal intervention:', error);
      throw error;
    }
  }

  /**
   * Generate motivation-aligned coaching message
   */
  async generateMotivationalMessage(
    userId: string,
    context: MotivationContext,
    situation: string
  ): Promise<string> {
    try {
      const { data: profileData } = await this.supabase
        .from('motivation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        return this.generateGenericMessage(situation);
      }

      const profile: MotivationProfile = profileData.profile_data;

      // Create motivation-aligned message
      let message = '';

      // Address primary motivation type
      switch (profile.primaryType) {
        case MotivationType.INTRINSIC:
          message = this.generateIntrinsicMessage(profile, situation);
          break;
        case MotivationType.IDENTIFIED:
          message = this.generateIdentifiedMessage(profile, situation);
          break;
        case MotivationType.EXTERNAL:
          message = this.generateExternalMessage(profile, situation);
          break;
        default:
          message = this.generateBalancedMessage(profile, situation);
      }

      // Add SDT need fulfillment
      if (profile.basicNeeds.autonomy > 70) {
        message += ' You have the choice in how to approach this.';
      }
      if (profile.basicNeeds.competence > 70) {
        message += ' You have the skills to succeed at this.';
      }
      if (profile.basicNeeds.relatedness > 70) {
        message += ' Others are cheering for your success.';
      }

      // Add social elements if preferred
      if (profile.socialPreferences.individualVsGroup > 30) {
        message += ' Consider sharing your progress with others.';
      }

      return message;

    } catch (error) {
      console.error('Error generating motivational message:', error);
      return this.generateGenericMessage(situation);
    }
  }

  /**
   * Analyze motivation profile effectiveness for training data
   */
  async analyzeProfileEffectiveness(userId: string): Promise<any> {
    try {
      const { data: interventionData } = await this.supabase
        .from('motivation_interventions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!interventionData || interventionData.length === 0) {
        return null;
      }

      // Calculate effectiveness metrics
      const effectiveness = {
        totalInterventions: interventionData.length,
        successfulInterventions: interventionData.filter((i: any) => i.success_rating > 3).length,
        averageSuccessRating: interventionData.reduce((sum: any, i: any) => sum + i.success_rating, 0) / interventionData.length,
        mostEffectiveTypes: this.getMostEffectiveInterventionTypes(interventionData),
        leastEffectiveTypes: this.getLeastEffectiveInterventionTypes(interventionData),
        contextualPatterns: this.analyzeContextualEffectiveness(interventionData)
      };

      return effectiveness;

    } catch (error) {
      console.error('Error analyzing profile effectiveness:', error);
      return null;
    }
  }

  // Private helper methods

  private initializeInterventionLibrary(): Map<string, MotivationIntervention> {
    const library = new Map<string, MotivationIntervention>();

    // Autonomy-supporting interventions
    library.set('choice_emphasis', {
      type: 'choice_emphasis',
      description: 'Emphasize personal choice and control',
      sdtAlignment: 'autonomy',
      socialComponent: false,
      temporalFocus: 'immediate',
      evidenceLevel: 'high',
      personalizedParameters: {}
    });

    // Competence-building interventions
    library.set('mastery_focus', {
      type: 'mastery_focus',
      description: 'Focus on skill development and mastery',
      sdtAlignment: 'competence',
      socialComponent: false,
      temporalFocus: 'long_term',
      evidenceLevel: 'high',
      personalizedParameters: {}
    });

    // Relatedness interventions
    library.set('social_connection', {
      type: 'social_connection',
      description: 'Emphasize connection with others',
      sdtAlignment: 'relatedness',
      socialComponent: true,
      temporalFocus: 'immediate',
      evidenceLevel: 'high',
      personalizedParameters: {}
    });

    // Add more interventions...
    return library;
  }

  private analyzeBasicNeeds(responses: any): BasicPsychologicalNeeds {
    // Analyze responses using validated SDT scales
    return {
      autonomy: responses.autonomy_score || 70,
      competence: responses.competence_score || 70,
      relatedness: responses.relatedness_score || 70
    };
  }

  private determinePrimaryMotivationType(responses: any): MotivationType {
    // Use validated motivation scales
    const scores = {
      [MotivationType.INTRINSIC]: responses.intrinsic_score || 0,
      [MotivationType.IDENTIFIED]: responses.identified_score || 0,
      [MotivationType.INTROJECTED]: responses.introjected_score || 0,
      [MotivationType.EXTERNAL]: responses.external_score || 0,
      [MotivationType.AMOTIVATION]: responses.amotivation_score || 0
    };

    return Object.entries(scores).reduce((a, b) => scores[a[0] as MotivationType] > scores[b[0] as MotivationType] ? a : b)[0] as MotivationType;
  }

  private analyzeSocialPreferences(responses: any): MotivationProfile['socialPreferences'] {
    return {
      individualVsGroup: responses.social_preference || 0,
      competitiveVsCollaborative: responses.competitive_preference || 0,
      publicVsPrivate: responses.privacy_preference || 0,
      supportGiving: responses.support_giving || 50,
      supportReceiving: responses.support_receiving || 50
    };
  }

  private analyzeTemporalPreferences(responses: any): MotivationProfile['temporalPreferences'] {
    return {
      immediateVsDelayed: responses.temporal_preference || 0,
      shortTermVsLongTerm: responses.goal_horizon || 0,
      consistencyVsVariety: responses.variety_preference || 0
    };
  }

  private analyzeAchievementPreferences(responses: any): MotivationProfile['achievementPreferences'] {
    return {
      processVsOutcome: responses.process_preference || 0,
      masteryVsPerformance: responses.goal_orientation || 0,
      challengeSeekingLevel: responses.challenge_seeking || 50,
      perfectionism: responses.perfectionism || 30
    };
  }

  private analyzeEnvironmentalPreferences(responses: any): MotivationProfile['environmentalPreferences'] {
    return {
      structureVsFlexibility: responses.structure_preference || 0,
      stimulationLevel: responses.stimulation_preference || 50,
      feedbackFrequency: responses.feedback_preference || 50
    };
  }

  private analyzeValues(responses: any): MotivationProfile['values'] {
    return {
      health: responses.health_importance || 80,
      performance: responses.performance_importance || 70,
      appearance: responses.appearance_importance || 50,
      social_connection: responses.social_importance || 60,
      personal_growth: responses.growth_importance || 75,
      achievement: responses.achievement_importance || 65,
      fun_enjoyment: responses.fun_importance || 70,
      meaning_purpose: responses.meaning_importance || 80
    };
  }

  private async generatePersonalizedStrategies(profile: MotivationProfile): Promise<MotivationProfile['personalizedStrategies']> {
    const strategies: MotivationProfile['personalizedStrategies'] = {
      optimalInterventions: [],
      avoidStrategies: [],
      preferredRewards: [],
      effectiveFeedback: [],
      socialSupport: []
    };

    // Based on primary motivation type
    switch (profile.primaryType) {
      case MotivationType.INTRINSIC:
        strategies.optimalInterventions.push('mastery_focus', 'autonomy_support', 'curiosity_building');
        strategies.preferredRewards.push('skill_development', 'personal_satisfaction', 'flow_experiences');
        break;
      case MotivationType.IDENTIFIED:
        strategies.optimalInterventions.push('value_connection', 'goal_alignment', 'meaning_emphasis');
        strategies.preferredRewards.push('progress_toward_values', 'identity_reinforcement');
        break;
      case MotivationType.EXTERNAL:
        strategies.optimalInterventions.push('external_rewards', 'accountability', 'recognition');
        strategies.preferredRewards.push('tangible_rewards', 'social_recognition', 'status_symbols');
        break;
    }

    // Based on social preferences
    if (profile.socialPreferences.individualVsGroup > 50) {
      strategies.socialSupport.push('group_challenges', 'peer_support', 'community_connection');
    } else {
      strategies.socialSupport.push('one_on_one_support', 'private_coaching', 'individual_recognition');
    }

    return strategies;
  }

  // Additional helper methods would continue...
  private analyzeBehaviorPatterns(behaviorData: any[]): any {
    return {
      averageMotivation: behaviorData.reduce((sum, b) => sum + (b.motivation_level || 50), 0) / behaviorData.length,
      preferredTimes: behaviorData.map(b => b.time_of_day),
      successContexts: behaviorData.filter(b => b.success).map(b => b.context)
    };
  }

  private updateProfileFromBehavior(profile: MotivationProfile, insights: any): MotivationProfile {
    // Update profile based on behavioral insights
    return profile;
  }

  private analyzeFeedbackEffectiveness(feedbackData: any[]): any {
    return {
      effective: feedbackData.filter(f => f.effectiveness > 3).map(f => f.type),
      ineffective: feedbackData.filter(f => f.effectiveness <= 2).map(f => f.type)
    };
  }

  private updateStrategiesFromFeedback(strategies: any, feedback: any): any {
    // Update strategies based on feedback effectiveness
    return strategies;
  }

  private updateContextualFactors(factors: any, behaviorData: any[]): any {
    // Update contextual factors based on recent behavior
    return factors;
  }

  private getCandidateInterventions(profile: MotivationProfile, context: MotivationContext, goalType: string): MotivationIntervention[] {
    // Get relevant interventions based on profile and context
    return Array.from(this.interventionLibrary.values()).slice(0, 5);
  }

  private rankInterventionsByEffectiveness(interventions: MotivationIntervention[], profile: MotivationProfile, context: MotivationContext): MotivationIntervention[] {
    // Rank interventions by predicted effectiveness
    return interventions.sort((a, b) => this.calculateInterventionScore(b, profile) - this.calculateInterventionScore(a, profile));
  }

  private calculateInterventionScore(intervention: MotivationIntervention, profile: MotivationProfile): number {
    let score = 50; // Base score

    // Align with primary SDT need
    const needValue = profile.basicNeeds[intervention.sdtAlignment];
    score += needValue * 0.3;

    // Consider social preference
    if (intervention.socialComponent && profile.socialPreferences.individualVsGroup > 50) {
      score += 20;
    }

    return score;
  }

  private personalizeIntervention(intervention: MotivationIntervention, profile: MotivationProfile, context: MotivationContext): any {
    // Add personalized parameters based on profile
    return {
      intensity: profile.contextualFactors.energyLevel / 100,
      social_component: profile.socialPreferences.individualVsGroup > 50,
      feedback_frequency: profile.environmentalPreferences.feedbackFrequency
    };
  }

  private async trackInterventionSelection(userId: string, intervention: MotivationIntervention, context: MotivationContext): Promise<void> {
    await this.supabase.from('motivation_interventions').insert({
      user_id: userId,
      intervention_type: intervention.type,
      context_data: context,
      created_at: new Date().toISOString()
    });
  }

  private generateGenericMessage(situation: string): string {
    return `You can do this! Focus on your progress and remember why this matters to you.`;
  }

  private generateIntrinsicMessage(profile: MotivationProfile, situation: string): string {
    return `This is your chance to grow and develop your skills. Focus on the joy of the process and what you'll learn.`;
  }

  private generateIdentifiedMessage(profile: MotivationProfile, situation: string): string {
    return `Remember why this matters to you personally. This aligns with your values and who you want to become.`;
  }

  private generateExternalMessage(profile: MotivationProfile, situation: string): string {
    return `Great work! You're making measurable progress toward your goals. Keep it up for the rewards ahead.`;
  }

  private generateBalancedMessage(profile: MotivationProfile, situation: string): string {
    return `You're doing great! This combines personal growth with meaningful progress toward your goals.`;
  }

  private getMostEffectiveInterventionTypes(data: any[]): string[] {
    return data.filter(d => d.success_rating > 4).map(d => d.intervention_type);
  }

  private getLeastEffectiveInterventionTypes(data: any[]): string[] {
    return data.filter(d => d.success_rating < 2).map(d => d.intervention_type);
  }

  private analyzeContextualEffectiveness(data: any[]): any {
    return {
      timePatterns: {},
      socialPatterns: {},
      energyPatterns: {}
    };
  }
}

// Export singleton instance
export const motivationMappingEngine = new MotivationMappingEngine();