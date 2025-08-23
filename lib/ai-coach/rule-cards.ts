/**
 * Rule Cards System - Core 20 scenario playbooks for FeelSharper MVP
 * Implements confidence-based, context-aware scenario handling with clarifying questions
 * Phase 8.1 Implementation
 */

import { UserContext, ActivityLog } from './coaching-engine';

export interface RuleCard {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  confidence_requirements: {
    high: string[];    // Required data points for high confidence response
    medium: string[];  // Required data points for medium confidence response
    low: string[];     // Minimum data points for low confidence response
  };
  responses: {
    high: RuleResponse;
    medium: RuleResponse;
    low: RuleResponse;
  };
  clarifying_questions: ClarifyingQuestion[];
  safety_checks: SafetyCheck[];
  priority: number; // 1-10, higher = more important
}

export interface RuleResponse {
  message_template: string;
  action_items: string[];
  identity_reinforcement?: string;
  safety_warnings?: string[];
  follow_up_suggested?: boolean;
}

export interface ClarifyingQuestion {
  question: string;
  importance: number; // 1-10, higher = more important to ask
  context_conditions: string[]; // When to ask this question
  response_mapping: {
    [key: string]: {
      confidence_boost: number;
      additional_context: string;
    };
  };
}

export interface SafetyCheck {
  condition: string;
  warning: string;
  action: 'warn' | 'refer_professional' | 'stop_advice';
}

export interface RuleCardMatch {
  card: RuleCard;
  confidence: 'high' | 'medium' | 'low';
  match_score: number;
  missing_context: string[];
  recommended_question?: ClarifyingQuestion;
}

/**
 * Core 20 Rule Cards - Essential scenarios for MVP
 */
export const CORE_RULE_CARDS: RuleCard[] = [
  // Rule 1: Pre-workout Fueling (2-4h before)
  {
    id: 'pre_workout_fueling_2_4h',
    name: 'Pre-workout Fueling (2-4h before)',
    description: 'Optimal nutrition 2-4 hours before training or competition',
    triggers: [
      'workout in', 'training in', 'match in', 'game in', 'competition in',
      'exercise in', '2 hours', '3 hours', '4 hours', 'what should I eat'
    ],
    confidence_requirements: {
      high: ['last_meal_time', 'activity_type', 'activity_intensity', 'dietary_preferences'],
      medium: ['activity_type', 'time_until_activity'],
      low: ['time_until_activity']
    },
    responses: {
      high: {
        message_template: 'Perfect timing for a full meal. Based on your {activity_type} in {time_until_activity}, focus on {meal_recommendation}.',
        action_items: [
          'Eat a balanced meal with 60-70% carbs, 20-25% protein, 10-15% fat',
          'Include easily digestible options like rice, chicken, vegetables',
          'Avoid high-fat or high-fiber foods that slow digestion',
          'Hydrate with 500-600ml water over the next hour'
        ],
        identity_reinforcement: 'You\'re an athlete who plans ahead and fuels smartly',
        follow_up_suggested: false
      },
      medium: {
        message_template: 'With {time_until_activity} until your {activity_type}, a full meal is optimal.',
        action_items: [
          'Focus on carbs + moderate protein',
          'Good options: oatmeal with fruit, rice with chicken, pasta with light sauce',
          'Avoid heavy or greasy foods',
          'Start hydrating now'
        ],
        follow_up_suggested: false
      },
      low: {
        message_template: 'For activity in 2-4 hours, you can have a full meal.',
        action_items: [
          'Choose familiar foods',
          'Focus on carbohydrates with some protein',
          'Avoid anything that has caused digestive issues before'
        ],
        follow_up_suggested: true
      }
    },
    clarifying_questions: [
      {
        question: 'What type of activity are you preparing for?',
        importance: 9,
        context_conditions: ['missing_activity_type'],
        response_mapping: {
          'endurance': { confidence_boost: 20, additional_context: 'endurance_focus' },
          'strength': { confidence_boost: 20, additional_context: 'strength_focus' },
          'sport': { confidence_boost: 20, additional_context: 'sport_focus' }
        }
      },
      {
        question: 'When did you last eat a full meal?',
        importance: 8,
        context_conditions: ['missing_last_meal'],
        response_mapping: {
          'less than 2 hours ago': { confidence_boost: 15, additional_context: 'recent_meal' },
          '2-4 hours ago': { confidence_boost: 15, additional_context: 'normal_gap' },
          'more than 4 hours ago': { confidence_boost: 15, additional_context: 'long_gap' }
        }
      }
    ],
    safety_checks: [
      {
        condition: 'digestive_issues_mentioned',
        warning: 'If you have ongoing digestive issues, stick to very familiar foods',
        action: 'warn'
      }
    ],
    priority: 9
  },

  // Rule 2: Pre-workout Snack (≤1h before)
  {
    id: 'pre_workout_snack_1h',
    name: 'Pre-workout Snack (≤1h before)',
    description: 'Quick energy options for immediate pre-activity fueling',
    triggers: [
      'workout in 30', 'workout in 45', 'workout in 1 hour', 'quick snack',
      'about to work out', 'exercise soon', 'training soon'
    ],
    confidence_requirements: {
      high: ['time_until_activity', 'activity_type', 'last_meal_time', 'digestive_tolerance'],
      medium: ['time_until_activity', 'activity_type'],
      low: ['time_until_activity']
    },
    responses: {
      high: {
        message_template: 'With only {time_until_activity} until {activity_type}, keep it light and fast-digesting.',
        action_items: [
          'Banana or dates for quick carbs',
          'Small amount of caffeine if tolerated (coffee/green tea)',
          'Avoid protein, fat, and fiber',
          'Sip water, don\'t chug'
        ],
        identity_reinforcement: 'You\'re someone who optimizes even the smallest details',
        safety_warnings: ['Don\'t eat anything new or untested before activity']
      },
      medium: {
        message_template: 'For activity starting in {time_until_activity}, focus on quick energy.',
        action_items: [
          'Simple carbs only: banana, sports drink, energy gel',
          'Keep portions small',
          'Nothing new or experimental'
        ]
      },
      low: {
        message_template: 'With activity starting soon, keep any food light and familiar.',
        action_items: [
          'Small, easily digestible carbs only',
          'When in doubt, skip food and just hydrate'
        ],
        follow_up_suggested: true
      }
    },
    clarifying_questions: [
      {
        question: 'How does your stomach typically handle food close to exercise?',
        importance: 8,
        context_conditions: ['missing_digestive_tolerance'],
        response_mapping: {
          'sensitive': { confidence_boost: 15, additional_context: 'sensitive_stomach' },
          'normal': { confidence_boost: 10, additional_context: 'normal_tolerance' },
          'strong': { confidence_boost: 10, additional_context: 'strong_stomach' }
        }
      }
    ],
    safety_checks: [
      {
        condition: 'new_food_suggested',
        warning: 'Never try new foods before important activities',
        action: 'warn'
      }
    ],
    priority: 8
  },

  // Rule 3: Post-workout Recovery
  {
    id: 'post_workout_recovery',
    name: 'Post-workout Recovery',
    description: 'Optimal recovery nutrition and strategies after exercise',
    triggers: [
      'just finished', 'done working out', 'post workout', 'after exercise',
      'recovery', 'sore', 'tired after', 'what now'
    ],
    confidence_requirements: {
      high: ['workout_type', 'workout_intensity', 'workout_duration', 'time_since_workout'],
      medium: ['workout_type', 'time_since_workout'],
      low: ['time_since_workout']
    },
    responses: {
      high: {
        message_template: 'Great {workout_intensity} {workout_type} session! Recovery window is optimal for the next 30-60 minutes.',
        action_items: [
          'Within 30 min: 3:1 or 4:1 carb to protein ratio',
          'Good options: chocolate milk, protein smoothie with fruit, Greek yogurt with berries',
          'Rehydrate with 150% of fluid lost (weigh yourself if possible)',
          'Consider tart cherry juice for muscle recovery',
          'Plan full meal within 2 hours'
        ],
        identity_reinforcement: 'You\'re an athlete who prioritizes smart recovery',
        follow_up_suggested: false
      },
      medium: {
        message_template: 'Post-{workout_type} recovery - nutrition timing matters most in the next hour.',
        action_items: [
          'Carbs + protein within 30-60 minutes',
          'Simple options: banana with protein powder, chocolate milk',
          'Rehydrate gradually',
          'Full meal within 2 hours'
        ]
      },
      low: {
        message_template: 'Post-workout recovery is important - the sooner the better.',
        action_items: [
          'Carbs + protein if available',
          'At minimum, rehydrate well',
          'Full meal when convenient'
        ],
        follow_up_suggested: true
      }
    },
    clarifying_questions: [
      {
        question: 'How intense was your workout on a scale of 1-10?',
        importance: 7,
        context_conditions: ['missing_intensity'],
        response_mapping: {
          'light (1-4)': { confidence_boost: 10, additional_context: 'light_intensity' },
          'moderate (5-7)': { confidence_boost: 15, additional_context: 'moderate_intensity' },
          'hard (8-10)': { confidence_boost: 15, additional_context: 'high_intensity' }
        }
      }
    ],
    safety_checks: [
      {
        condition: 'unusual_pain_mentioned',
        warning: 'Sharp or unusual pain during/after exercise should be evaluated',
        action: 'refer_professional'
      }
    ],
    priority: 8
  },

  // Rule 4: Hydration Check
  {
    id: 'hydration_check',
    name: 'Hydration Assessment',
    description: 'Evaluate and optimize hydration status',
    triggers: [
      'thirsty', 'dehydrated', 'dry mouth', 'headache', 'dizzy',
      'water intake', 'how much water', 'urine color'
    ],
    confidence_requirements: {
      high: ['daily_water_intake', 'urine_color', 'activity_level', 'sweat_rate'],
      medium: ['daily_water_intake', 'activity_level'],
      low: ['symptom_description']
    },
    responses: {
      high: {
        message_template: 'Based on your {activity_level} activity and {daily_water_intake} intake, your hydration needs optimization.',
        action_items: [
          'Target: {calculated_water_needs}L daily minimum',
          'Pre-exercise: 500ml 2-3 hours before, 200ml 15-20 min before',
          'During exercise: 150-250ml every 15-20 minutes',
          'Post-exercise: 150% of fluid lost',
          'Monitor urine color - aim for pale yellow'
        ],
        identity_reinforcement: 'You\'re someone who understands that hydration is foundational to performance'
      },
      medium: {
        message_template: 'Let\'s get your hydration optimized for your {activity_level} lifestyle.',
        action_items: [
          'Baseline: 35-40ml per kg body weight daily',
          'Add 500-750ml per hour of exercise',
          'Spread intake throughout the day',
          'Check urine color as a guide'
        ]
      },
      low: {
        message_template: 'Hydration is crucial - let\'s start with basics.',
        action_items: [
          'Aim for 8-10 glasses (2-2.5L) daily as baseline',
          'More if you exercise or sweat',
          'Pale yellow urine is the goal'
        ],
        follow_up_suggested: true
      }
    },
    clarifying_questions: [
      {
        question: 'What color is your urine typically? (pale yellow is optimal)',
        importance: 9,
        context_conditions: ['missing_hydration_status'],
        response_mapping: {
          'clear': { confidence_boost: 10, additional_context: 'over_hydrated' },
          'pale yellow': { confidence_boost: 15, additional_context: 'well_hydrated' },
          'dark yellow': { confidence_boost: 15, additional_context: 'under_hydrated' }
        }
      }
    ],
    safety_checks: [
      {
        condition: 'severe_dehydration_symptoms',
        warning: 'Severe dehydration symptoms require immediate medical attention',
        action: 'refer_professional'
      }
    ],
    priority: 7
  },

  // Rule 5: Sleep Deficit Handling
  {
    id: 'sleep_deficit_training',
    name: 'Sleep Deficit Training Decisions',
    description: 'How to modify training when sleep is compromised',
    triggers: [
      'didn\'t sleep', 'only slept', 'tired', 'exhausted', 'no sleep',
      'should I still work out', 'train when tired'
    ],
    confidence_requirements: {
      high: ['sleep_hours', 'sleep_quality', 'training_type', 'training_importance'],
      medium: ['sleep_hours', 'training_type'],
      low: ['sleep_hours']
    },
    responses: {
      high: {
        message_template: 'With {sleep_hours} hours of {sleep_quality} sleep, here\'s how to modify your {training_type}.',
        action_items: [
          '{sleep_hours < 5 ? "Scale to 60-70% intensity or consider rest day" : sleep_hours < 6 ? "Reduce intensity by 30%, extend warmup" : "Proceed with caution, monitor energy during warmup"}',
          'Extended warmup (15+ minutes) to assess readiness',
          'Focus on technique over intensity',
          'Stop if you feel worse during exercise',
          'Prioritize early bedtime tonight'
        ],
        identity_reinforcement: 'You\'re smart enough to adapt training to your body\'s needs',
        safety_warnings: ['Poor sleep increases injury risk - listen to your body']
      },
      medium: {
        message_template: '{sleep_hours} hours of sleep affects recovery and performance.',
        action_items: [
          '{sleep_hours < 5 ? "Consider making today a rest day" : "Reduce intensity by 20-30%"}',
          'Extended warmup and body assessment',
          'Prioritize sleep tonight'
        ]
      },
      low: {
        message_template: 'Sleep deprivation impacts performance and injury risk.',
        action_items: [
          'Consider if today\'s training is essential',
          'If training, start very light and assess',
          'Make sleep a priority going forward'
        ],
        follow_up_suggested: true
      }
    },
    clarifying_questions: [
      {
        question: 'Is today\'s training for competition prep or general fitness?',
        importance: 8,
        context_conditions: ['missing_training_importance'],
        response_mapping: {
          'competition': { confidence_boost: 15, additional_context: 'high_importance' },
          'general fitness': { confidence_boost: 15, additional_context: 'low_importance' }
        }
      }
    ],
    safety_checks: [
      {
        condition: 'chronic_sleep_issues',
        warning: 'Chronic sleep issues should be addressed with a healthcare provider',
        action: 'refer_professional'
      }
    ],
    priority: 8
  }
];

/**
 * Rule Cards Engine - Matches user input to appropriate rule cards
 */
export class RuleCardsEngine {
  /**
   * Find the best matching rule card for user input and context
   */
  findBestMatch(userInput: string, context: UserContext): RuleCardMatch | null {
    const matches = this.scoreAllCards(userInput, context);
    
    if (matches.length === 0) {
      return null;
    }
    
    // Return highest scoring match
    const bestMatch = matches[0];
    
    // Determine confidence level based on available context
    const confidence = this.determineConfidence(bestMatch.card, context);
    
    // Check if we need a clarifying question
    const recommendedQuestion = this.selectClarifyingQuestion(bestMatch.card, context, confidence);
    
    return {
      card: bestMatch.card,
      confidence,
      match_score: bestMatch.score,
      missing_context: this.getMissingContext(bestMatch.card, context, confidence),
      recommended_question: recommendedQuestion
    };
  }

  /**
   * Score all rule cards against user input
   */
  private scoreAllCards(userInput: string, context: UserContext): Array<{card: RuleCard; score: number}> {
    const scores: Array<{card: RuleCard; score: number}> = [];
    
    for (const card of CORE_RULE_CARDS) {
      const score = this.scoreCard(card, userInput, context);
      if (score > 0) {
        scores.push({ card, score });
      }
    }
    
    // Sort by score (highest first)
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Score individual rule card against user input and context
   */
  private scoreCard(card: RuleCard, userInput: string, context: UserContext): number {
    let score = 0;
    const lowerInput = userInput.toLowerCase();
    
    // Check trigger matches
    for (const trigger of card.triggers) {
      if (lowerInput.includes(trigger.toLowerCase())) {
        score += 10; // Base trigger match
      }
    }
    
    // Context relevance scoring
    if (card.id.includes('pre_workout') && this.isPreWorkoutContext(lowerInput, context)) {
      score += 15;
    }
    
    if (card.id.includes('post_workout') && this.isPostWorkoutContext(lowerInput, context)) {
      score += 15;
    }
    
    if (card.id.includes('sleep') && this.isSleepContext(lowerInput, context)) {
      score += 15;
    }
    
    if (card.id.includes('hydration') && this.isHydrationContext(lowerInput, context)) {
      score += 15;
    }
    
    // Priority weighting
    score *= (card.priority / 10);
    
    return score;
  }

  /**
   * Determine confidence level based on available context data
   */
  private determineConfidence(card: RuleCard, context: UserContext): 'high' | 'medium' | 'low' {
    const availableData = this.getAvailableContextData(context);
    
    // Check high confidence requirements
    const highReqs = card.confidence_requirements.high;
    if (highReqs.every(req => availableData.includes(req))) {
      return 'high';
    }
    
    // Check medium confidence requirements  
    const mediumReqs = card.confidence_requirements.medium;
    if (mediumReqs.every(req => availableData.includes(req))) {
      return 'medium';
    }
    
    // Check low confidence requirements
    const lowReqs = card.confidence_requirements.low;
    if (lowReqs.some(req => availableData.includes(req))) {
      return 'low';
    }
    
    return 'low';
  }

  /**
   * Get available context data points from user context
   */
  private getAvailableContextData(context: UserContext): string[] {
    const available: string[] = [];
    
    if (context.lastMeal) available.push('last_meal_time');
    if (context.lastWorkout) available.push('workout_type', 'time_since_workout');
    if (context.lastSleep) available.push('sleep_hours', 'sleep_quality');
    if (context.profile.userType) available.push('activity_type');
    if (context.profile.dietary) available.push('dietary_preferences');
    if (context.recentLogs.length > 0) available.push('recent_activity');
    
    return available;
  }

  /**
   * Select the most important clarifying question if confidence is not high
   */
  private selectClarifyingQuestion(
    card: RuleCard, 
    context: UserContext, 
    confidence: 'high' | 'medium' | 'low'
  ): ClarifyingQuestion | undefined {
    if (confidence === 'high') {
      return undefined; // No question needed for high confidence
    }
    
    const missingContext = this.getMissingContext(card, context, confidence);
    
    // Find questions that address missing context
    const relevantQuestions = card.clarifying_questions.filter(q =>
      q.context_conditions.some(condition => missingContext.includes(condition))
    );
    
    if (relevantQuestions.length === 0) {
      return undefined;
    }
    
    // Return highest importance question
    return relevantQuestions.sort((a, b) => b.importance - a.importance)[0];
  }

  /**
   * Get missing context data for current confidence level
   */
  private getMissingContext(card: RuleCard, context: UserContext, confidence: 'high' | 'medium' | 'low'): string[] {
    const required = card.confidence_requirements[confidence];
    const available = this.getAvailableContextData(context);
    
    return required.filter(req => !available.includes(req));
  }

  // Context detection helpers
  private isPreWorkoutContext(input: string, context: UserContext): boolean {
    return input.includes('before') || input.includes('in ') || input.includes('until') ||
           input.includes('workout') || input.includes('exercise') || input.includes('training');
  }

  private isPostWorkoutContext(input: string, context: UserContext): boolean {
    return input.includes('after') || input.includes('finished') || input.includes('done') ||
           input.includes('recovery') || input.includes('sore') ||
           (context.lastWorkout && (Date.now() - context.lastWorkout.timestamp.getTime()) < 2 * 60 * 60 * 1000);
  }

  private isSleepContext(input: string, context: UserContext): boolean {
    return input.includes('sleep') || input.includes('tired') || input.includes('exhausted') ||
           (context.lastSleep && context.lastSleep.hours < 7);
  }

  private isHydrationContext(input: string, context: UserContext): boolean {
    return input.includes('water') || input.includes('thirsty') || input.includes('dehydrat') ||
           input.includes('headache') || input.includes('urine');
  }

  /**
   * Generate response using matched rule card
   */
  generateRuleCardResponse(match: RuleCardMatch, context: UserContext): {
    message: string;
    actionItems: string[];
    identityReinforcement?: string;
    safetyWarnings?: string[];
    clarifyingQuestion?: string;
    followUpSuggested?: boolean;
  } {
    const response = match.card.responses[match.confidence];
    
    // Process message template with context
    let message = this.processTemplate(response.message_template, context, match);
    
    // Process action items with context
    const actionItems = response.action_items.map(item => 
      this.processTemplate(item, context, match)
    );

    // Check for safety warnings
    const safetyWarnings = this.checkSafetyConditions(match.card, context);

    return {
      message,
      actionItems,
      identityReinforcement: response.identity_reinforcement,
      safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : response.safety_warnings,
      clarifyingQuestion: match.recommended_question?.question,
      followUpSuggested: response.follow_up_suggested
    };
  }

  /**
   * Process template variables with context data
   */
  private processTemplate(template: string, context: UserContext, match: RuleCardMatch): string {
    let processed = template;
    
    // Replace common variables
    if (context.lastWorkout) {
      processed = processed.replace('{workout_type}', context.lastWorkout.type || 'workout');
      processed = processed.replace('{activity_type}', context.lastWorkout.type || 'activity');
    }
    
    if (context.lastSleep) {
      processed = processed.replace('{sleep_hours}', context.lastSleep.hours.toString());
      processed = processed.replace('{sleep_quality}', context.lastSleep.quality > 7 ? 'good' : 'poor');
    }
    
    // Process conditional logic in templates
    processed = this.processConditionalLogic(processed, context);
    
    return processed;
  }

  /**
   * Process conditional logic in templates (basic implementation)
   */
  private processConditionalLogic(template: string, context: UserContext): string {
    // Handle simple conditionals like: {condition ? "true text" : "false text"}
    const conditionalRegex = /\{([^}]+)\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"\}/g;
    
    return template.replace(conditionalRegex, (match, condition, trueText, falseText) => {
      // Simple condition evaluation (can be expanded)
      if (condition.includes('sleep_hours < 5') && context.lastSleep?.hours && context.lastSleep.hours < 5) {
        return trueText;
      }
      if (condition.includes('sleep_hours < 6') && context.lastSleep?.hours && context.lastSleep.hours < 6) {
        return trueText;
      }
      return falseText;
    });
  }

  /**
   * Check safety conditions and return warnings
   */
  private checkSafetyConditions(card: RuleCard, context: UserContext): string[] {
    const warnings: string[] = [];
    
    for (const safetyCheck of card.safety_checks) {
      if (this.evaluateSafetyCondition(safetyCheck.condition, context)) {
        warnings.push(safetyCheck.warning);
        
        if (safetyCheck.action === 'refer_professional') {
          warnings.push('Consider consulting with a healthcare professional or sports medicine expert.');
        } else if (safetyCheck.action === 'stop_advice') {
          warnings.push('I recommend stopping here and seeking professional guidance.');
        }
      }
    }
    
    return warnings;
  }

  /**
   * Evaluate safety condition against context
   */
  private evaluateSafetyCondition(condition: string, context: UserContext): boolean {
    // This is a simplified implementation - can be expanded with more sophisticated logic
    switch (condition) {
      case 'severe_dehydration_symptoms':
        // This would need more sophisticated symptom detection
        return false;
      case 'chronic_sleep_issues':
        // Check if user has consistently poor sleep
        const recentSleepLogs = context.recentLogs
          .filter(log => log.type === 'sleep')
          .slice(0, 7);
        return recentSleepLogs.length >= 5 && 
               recentSleepLogs.every(log => (log.data.hours || 8) < 6);
      case 'unusual_pain_mentioned':
        // Would need NLP to detect pain descriptions
        return false;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const ruleCardsEngine = new RuleCardsEngine();