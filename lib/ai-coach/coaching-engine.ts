/**
 * AI Coaching Engine - Core logic for personalized coaching responses
 * Implements confidence-based, context-aware coaching for FeelSharper MVP
 * Enhanced with BJ Fogg Behavior Model (B=MAP) and habit formation framework
 */

// Removed OpenAI import as it's not directly used in this file
import { 
  BehaviorModel, 
  IdentityBasedHabits, 
  TinyHabit, 
  HabitLoop, 
  BehaviorAnalysis,
  MotivationProfile,
  AbilityFactors
} from './behavior-model';
import { getCoachingResponse } from '../ai/ai-client';
import { patternDetectionService, PatternDetectionResult } from './pattern-detection';
import { ruleCardsEngine, RuleCardMatch } from './rule-cards';

export interface UserContext {
  profile: {
    userType: 'endurance' | 'strength' | 'sport' | 'professional' | 'weight_mgmt';
    dietary?: string[];
    goals?: string[];
    constraints?: string[];
    identity_goals?: string[];  // "I am someone who..."
    motivation_profile?: MotivationProfile;
    ability_factors?: AbilityFactors;
  };
  recentLogs: ActivityLog[];
  patterns: UserPatterns;
  habitTracking?: {
    current_habits: TinyHabit[];
    habit_loops: HabitLoop[];
    streak_data: Record<string, number>;
    completion_rates: Record<string, number>;
  };
  lastMeal?: { timestamp: Date; description: string };
  lastWorkout?: { timestamp: Date; type: string; intensity: number };
  lastSleep?: { hours: number; quality: number };
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'nutrition' | 'exercise' | 'weight' | 'mood' | 'sleep';
  data: Record<string, any>;
  confidenceLevel: 'high' | 'medium' | 'low';
  originalText: string;
  subjectiveNotes?: string;
}

export interface UserPatterns {
  preMatchMeals?: string[];
  recoveryStrategies?: string[];
  typicalSleepHours?: number;
  exerciseFrequency?: number;
  stressResponse?: string;
}

export interface CoachingResponse {
  message: string;
  confidence: 'high' | 'medium' | 'low';
  clarifyingQuestion?: string;
  actionItems?: string[];
  followUpSuggested?: boolean;
  // Phase 8.1: Rule Cards Integration
  ruleCardUsed?: {
    id: string;
    name: string;
    match_score: number;
    missing_context?: string[];
  };
  safetyWarnings?: string[];
  // Enhanced with behavior design
  behaviorAnalysis?: BehaviorAnalysis;
  tinyHabit?: TinyHabit;
  identityReinforcement?: string;
  habitOptimization?: {
    suggestions: string[];
    adjusted_habit?: TinyHabit;
  };
  motivationalDesign?: {
    celebration?: string;
    progress_visualization?: string;
    social_proof?: string;
    streak_acknowledgment?: string;
  };
  // Phase 5.2: Pattern Detection Integration
  patternInsights?: {
    detected_patterns: Array<{
      type: string;
      pattern: string;
      strength: number;
      significance: 'high' | 'medium' | 'low';
    }>;
    just_in_time_intervention?: {
      trigger_reason: string;
      intervention_message: string;
      urgency: 'immediate' | 'today' | 'this_week';
    };
    adaptive_recommendation?: {
      category: string;
      goal_adjustment: string;
      implementation_intention: string;
    };
  };
  // Phase 5.5: Confidence-Based Friction Reduction
  frictionReduction?: {
    one_tap_actions?: Array<{
      label: string;
      action: string;
      confidence_boost: number;
    }>;
    smart_defaults?: {
      default_choice: string;
      reasoning: string;
      alternatives: string[];
    };
    cognitive_load_reduction?: {
      simplified_message: string;
      max_options: number;
      pre_selected_choice?: string;
    };
    adaptive_tone?: {
      style: 'data_driven' | 'emotional' | 'competitive' | 'gentle' | 'coach_authoritative';
      personalization: string;
      motivation_match: number;
    };
  };
}

export class CoachingEngine {
  /**
   * Main entry point for generating coaching responses
   * Enhanced with BJ Fogg Behavior Model, habit formation, Phase 5.2 pattern detection,
   * and Phase 5.5 confidence-based friction reduction
   */
  async generateResponse(
    userInput: string,
    userContext: UserContext
  ): Promise<CoachingResponse> {
    // Phase 5.2: Run pattern detection if sufficient data
    let patternResults: PatternDetectionResult | null = null;
    if (userContext.recentLogs.length >= 10) {
      try {
        patternResults = await patternDetectionService.analyzePatterns(userContext);
      } catch (error) {
        console.warn('Pattern detection failed, continuing with standard coaching:', error);
      }
    }

    // Check for Just-In-Time intervention opportunities first
    const jitIntervention = this.checkForJustInTimeIntervention(userInput, userContext, patternResults);
    if (jitIntervention) {
      return jitIntervention;
    }

    // Phase 8.1: Try Rule Cards System first (Primary routing mechanism)
    const ruleCardMatch = ruleCardsEngine.findBestMatch(userInput, userContext);
    
    if (ruleCardMatch && ruleCardMatch.match_score > 10) {
      // Use rule card for response
      const ruleCardResponse = ruleCardsEngine.generateRuleCardResponse(ruleCardMatch, userContext);
      
      const response: CoachingResponse = {
        message: ruleCardResponse.message,
        confidence: ruleCardMatch.confidence,
        clarifyingQuestion: ruleCardResponse.clarifyingQuestion,
        actionItems: ruleCardResponse.actionItems,
        identityReinforcement: ruleCardResponse.identityReinforcement,
        safetyWarnings: ruleCardResponse.safetyWarnings,
        followUpSuggested: ruleCardResponse.followUpSuggested,
        ruleCardUsed: {
          id: ruleCardMatch.card.id,
          name: ruleCardMatch.card.name,
          match_score: ruleCardMatch.match_score,
          missing_context: ruleCardMatch.missing_context
        }
      };

      // Enhance with behavioral design and pattern insights
      const enhancedResponse = this.enhanceWithBehavioralDesign(response, userContext, userInput);
      const finalResponse = this.enhanceWithPatternInsights(enhancedResponse, patternResults);
      
      // Apply friction reduction
      return this.applyFrictionReduction(finalResponse, userContext, ruleCardMatch.confidence);
    }
    
    // Check if this is habit-related interaction (fallback)
    const isHabitInteraction = this.isHabitRelatedInput(userInput);
    
    if (isHabitInteraction) {
      const confidence = this.calculateConfidence(userContext, 'habit', patternResults);
      const habitResponse = await this.handleHabitFormation(userInput, userContext, confidence);
      return this.enhanceWithPatternInsights(habitResponse, patternResults);
    }
    
    // Fallback to legacy scenario routing (kept for edge cases)
    const scenario = this.classifyScenario(userInput);
    const confidence = this.calculateConfidence(userContext, scenario, patternResults);
    
    let response: CoachingResponse;
    switch (scenario) {
      case 'pre_activity_nutrition':
        response = await this.handlePreActivityNutrition(userInput, userContext, confidence);
        break;
      case 'post_workout_recovery':
        response = await this.handlePostWorkoutRecovery(userInput, userContext, confidence);
        break;
      case 'sleep_affected_training':
        response = await this.handleSleepAffectedTraining(userInput, userContext, confidence);
        break;
      case 'weight_plateau':
        response = await this.handleWeightPlateau(userInput, userContext, confidence);
        break;
      case 'travel_nutrition':
        response = await this.handleTravelNutrition(userInput, userContext, confidence);
        break;
      default:
        response = await this.handleGeneralQuery(userInput, userContext, confidence);
        break;
    }
    
    // Enhance response with behavioral design principles and pattern insights
    response = this.enhanceWithBehavioralDesign(response, userContext, userInput);
    response = this.enhanceWithPatternInsights(response, patternResults);
    
    // Phase 5.5: Apply confidence-based friction reduction
    return this.applyFrictionReduction(response, userContext, confidence);
  }

  /**
   * Classify the type of coaching scenario from user input
   */
  private classifyScenario(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('tennis') || lowerInput.includes('match') || lowerInput.includes('game')) {
      if (lowerInput.includes('eat') || lowerInput.includes('food')) {
        return 'pre_activity_nutrition';
      }
    }
    
    if (lowerInput.includes('sore') || lowerInput.includes('recovery')) {
      return 'post_workout_recovery';
    }
    
    if (lowerInput.includes('sleep') && (lowerInput.includes('workout') || lowerInput.includes('work out') || lowerInput.includes('train'))) {
      return 'sleep_affected_training';
    }
    
    if (lowerInput.includes('stuck') || lowerInput.includes('plateau')) {
      return 'weight_plateau';
    }
    
    if (lowerInput.includes('travel') || lowerInput.includes('mcdonald') || lowerInput.includes('fast food')) {
      return 'travel_nutrition';
    }
    
    return 'general';
  }

  /**
   * Calculate confidence level based on available user data and pattern insights
   */
  private calculateConfidence(context: UserContext, scenario: string, patternResults?: PatternDetectionResult | null): 'high' | 'medium' | 'low' {
    let dataPoints = 0;
    let relevantPoints = 0;
    
    // Check for relevant recent logs
    const recentLogs = context.recentLogs.filter(
      log => new Date().getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    if (recentLogs.length > 5) dataPoints += 2;
    else if (recentLogs.length > 0) dataPoints += 1;
    
    // Check for user patterns
    if (context.patterns && Object.keys(context.patterns).length > 3) {
      relevantPoints += 2;
    }
    
    // Check for specific scenario data
    if (scenario === 'pre_activity_nutrition' && context.lastMeal) {
      relevantPoints += 2;
    }
    
    if (scenario === 'sleep_affected_training' && context.lastSleep) {
      relevantPoints += 2;
    }
    
    // Phase 5.2: Pattern detection confidence boost
    let patternBoost = 0;
    if (patternResults && patternResults.confidence > 70) {
      patternBoost += 2;
    } else if (patternResults && patternResults.confidence > 50) {
      patternBoost += 1;
    }

    const totalScore = dataPoints + relevantPoints + patternBoost;
    
    if (totalScore >= 4) return 'high';
    if (totalScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Handle habit formation using BJ Fogg's Behavior Model
   */
  private async handleHabitFormation(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    const lowerInput = input.toLowerCase();
    
    // Check if user is struggling with existing habit
    if (lowerInput.includes('struggling') || lowerInput.includes('forgot') || lowerInput.includes('missed')) {
      return this.handleHabitStruggle(input, context, confidence);
    }
    
    // Check if user wants to start new habit
    if (lowerInput.includes('want to') || lowerInput.includes('start') || lowerInput.includes('begin')) {
      return this.designNewHabit(input, context, confidence);
    }
    
    // Check if user completed a habit
    if (lowerInput.includes('did') || lowerInput.includes('completed') || lowerInput.includes('finished')) {
      return this.celebrateHabitCompletion(input, context, confidence);
    }
    
    // General habit coaching
    return this.provideHabitCoaching(input, context, confidence);
  }

  /**
   * Check if input is habit-related
   */
  private isHabitRelatedInput(input: string): boolean {
    const habitKeywords = [
      'habit', 'routine', 'consistent', 'daily', 'every day',
      'streak', 'reminder', 'forgot', 'struggling', 'motivation',
      'want to start', 'trying to', 'build', 'maintain'
    ];
    
    const lowerInput = input.toLowerCase();
    return habitKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Design a new tiny habit using Fogg's method
   */
  private async designNewHabit(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // Extract desired behavior from input
    const desiredBehavior = this.extractDesiredBehavior(input);
    
    // Use default values if user profile incomplete
    const userContext = {
      current_habits: context.habitTracking?.current_habits.map(h => h.behavior) || [],
      motivation_profile: context.profile.motivation_profile || this.getDefaultMotivationProfile(),
      ability_factors: context.profile.ability_factors || this.getDefaultAbilityFactors(),
      identity_goals: context.profile.identity_goals || ['I am someone who takes care of their health']
    };
    
    // Design tiny habit
    const tinyHabit = BehaviorModel.designTinyHabit(desiredBehavior, userContext);
    
    // Calculate behavior score for this habit
    const behaviorAnalysis = BehaviorModel.calculateBehaviorScore(7, 8, 9); // Start with easy parameters
    
    // Convert to identity-based goal
    const identityGoal = IdentityBasedHabits.convertToIdentityGoal(desiredBehavior);
    
    return {
      message: `Perfect! Let's start ridiculously small. Instead of "${desiredBehavior}", try this tiny version: "${tinyHabit.behavior}".`,
      confidence,
      actionItems: [
        `Trigger: ${tinyHabit.trigger.description}`,
        `Behavior: ${tinyHabit.behavior}`,
        `Reward: ${tinyHabit.reward}`,
        'Do this for 7 days, then we can expand'
      ],
      behaviorAnalysis,
      tinyHabit,
      identityReinforcement: tinyHabit.identity_connection,
      motivationalDesign: {
        celebration: 'Remember: You\'re not just building a habit, you\'re becoming the type of person who follows through!',
        progress_visualization: 'Mark an X on your calendar each time you do this',
        streak_acknowledgment: 'Every repetition is evidence of your new identity'
      }
    };
  }

  /**
   * Handle when user struggles with habit
   */
  private async handleHabitStruggle(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // In full implementation, analyze specific habit that's struggling
    // For now, provide general Fogg-method guidance
    
    const strugglingHabit = this.extractStruggleContext(input);
    
    return {
      message: 'No worries! When habits feel hard, we make them easier. The behavior was too big for your current situation.',
      confidence,
      clarifyingQuestion: 'What specifically made it difficult - was it remembering, finding time, or the behavior itself?',
      actionItems: [
        'Option 1: Make it even tinier (if it was too hard)',
        'Option 2: Change your trigger (if you forgot)',
        'Option 3: Adjust your environment (if there were barriers)',
        'Remember: Progress, not perfection'
      ],
      identityReinforcement: 'You\'re someone who adapts and finds what works - this is part of the process!',
      motivationalDesign: {
        celebration: 'Noticing the struggle is actually progress - most people just quit!',
        streak_acknowledgment: 'Missed days don\'t erase your previous success'
      }
    };
  }

  /**
   * Celebrate habit completion with identity reinforcement
   */
  private async celebrateHabitCompletion(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // Extract what they completed
    const completedAction = this.extractCompletedAction(input);
    
    // Get streak count if available
    const habitId = this.findMatchingHabit(completedAction, context);
    const streakCount = habitId ? (context.habitTracking?.streak_data[habitId] || 1) : 1;
    
    // Generate identity reinforcement
    const identityReinforcement = IdentityBasedHabits.generateIdentityReinforcement(
      completedAction,
      'someone who follows through on commitments',
      streakCount
    );
    
    return {
      message: `Excellent! You did it. ${identityReinforcement}`,
      confidence,
      actionItems: [
        'Take a moment to feel proud',
        'Mark this completion somewhere visible',
        'Remember: This is evidence of who you\'re becoming'
      ],
      identityReinforcement,
      motivationalDesign: {
        celebration: streakCount === 1 ? '🎉 First success!' : `🔥 ${streakCount}-day streak!`,
        progress_visualization: `Streak: ${streakCount} days`,
        social_proof: streakCount >= 7 ? 'You\'re in the top 20% of people who maintain week-long streaks!' : undefined,
        streak_acknowledgment: `Every day you do this, you become more of the person you want to be`
      }
    };
  }

  /**
   * Provide general habit coaching
   */
  private async provideHabitCoaching(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // Use AI to generate contextual coaching response
    try {
      const aiResponse = await getCoachingResponse({
        message: input,
        context: {
          user_type: context.profile.userType,
          recent_activities: context.recentLogs.slice(0, 5),
          current_habits: context.habitTracking?.current_habits || [],
          coaching_focus: 'habit_formation_and_behavior_change'
        },
        coaching_mode: 'behavioral_design',
        forceService: 'claude' // Use Claude for advanced coaching
      });

      if (aiResponse.success) {
        const baseResponse = {
          message: aiResponse.data.message || aiResponse.data.response,
          confidence,
          actionItems: aiResponse.data.actionItems || aiResponse.data.action_items || [],
          identityReinforcement: 'You\'re building the habits that will transform your life'
        };

        return this.enhanceWithBehavioralDesign(baseResponse, context, input);
      }
    } catch (error) {
      console.error('AI coaching error:', error);
    }

    // Fallback to rule-based coaching
    return {
      message: 'I\'m here to help you build lasting habits. What specific behavior would you like to work on?',
      confidence: 'medium',
      clarifyingQuestion: 'Are you trying to start a new habit, improve an existing one, or recover from a setback?',
      actionItems: [
        'Start ridiculously small',
        'Link to existing habits',
        'Celebrate small wins',
        'Focus on identity over outcomes'
      ],
      identityReinforcement: 'You\'re someone who invests in lasting change'
    };
  }

  /**
   * Enhance any response with behavioral design principles
   */
  private enhanceWithBehavioralDesign(
    response: CoachingResponse,
    context: UserContext,
    userInput: string
  ): CoachingResponse {
    // Add motivational design if not already present
    if (!response.motivationalDesign) {
      response.motivationalDesign = {
        celebration: 'You\'re making progress!',
        progress_visualization: 'Every small step counts',
        streak_acknowledgment: 'Consistency beats perfection'
      };
    }

    // Add identity reinforcement if not present
    if (!response.identityReinforcement) {
      response.identityReinforcement = 'You\'re becoming someone who prioritizes their health and follows through on commitments';
    }

    // Enhance action items with Fogg method principles
    if (response.actionItems) {
      response.actionItems = response.actionItems.map(item => {
        if (!item.toLowerCase().includes('small') && !item.toLowerCase().includes('tiny')) {
          return `${item} (start small!)`;
        }
        return item;
      });
    }

    return response;
  }

  /**
   * Handle pre-activity nutrition queries (tennis match, workout, etc.)
   */
  private async handlePreActivityNutrition(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // Extract timing from input
    const hoursMatch = input.match(/(\d+)\s*(?:hours?|hrs?)/i);
    const hoursUntilActivity = hoursMatch ? parseInt(hoursMatch[1]) : 2;
    
    // Check last meal timing
    const lastMealHoursAgo = context.lastMeal 
      ? (new Date().getTime() - context.lastMeal.timestamp.getTime()) / (1000 * 60 * 60)
      : null;
    
    if (confidence === 'low' && lastMealHoursAgo === null) {
      return {
        message: "Great — fuel matters here.",
        confidence: 'low',
        clarifyingQuestion: "Did you eat a full meal in the last 3 hours?",
        actionItems: [
          "If yes: Go light - banana, sports bar, or toast with nut butter",
          "If no: Have something more substantial - rice with chicken or oatmeal"
        ]
      };
    }
    
    if (hoursUntilActivity <= 2) {
      const advice = this.getPreActivitySnack(context, lastMealHoursAgo || 0);
      return {
        message: `Since your match is in ${hoursUntilActivity} hours, ${advice}`,
        confidence,
        actionItems: [
          "Focus on easily digestible carbs",
          "Keep protein moderate",
          "Avoid high fat/fiber foods",
          "Stay hydrated with small sips"
        ]
      };
    }
    
    return {
      message: `With ${hoursUntilActivity} hours until activity, you have time for a proper meal. Focus on carbs with moderate protein.`,
      confidence,
      actionItems: [
        "Have a balanced meal now",
        "Light snack 1-2 hours before",
        "Hydrate consistently"
      ]
    };
  }

  /**
   * Handle post-workout recovery queries
   */
  private async handlePostWorkoutRecovery(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    const isSevere = input.toLowerCase().includes('super') || 
                     input.toLowerCase().includes('very') ||
                     input.toLowerCase().includes('can\'t');
    
    if (confidence === 'low') {
      return {
        message: "Let me help you with recovery.",
        confidence: 'low',
        clarifyingQuestion: "Is this normal muscle soreness or pain that limits your movement?",
        actionItems: [
          "If soreness: Light activity and stretching help",
          "If pain: Rest completely and consider ice/heat"
        ]
      };
    }
    
    if (isSevere) {
      return {
        message: "That sounds like significant soreness. Today should be a recovery day.",
        confidence,
        actionItems: [
          "Skip intense training",
          "Try gentle yoga or walking",
          "Focus on protein intake (aim for your target)",
          "Consider foam rolling or massage",
          "Reassess tomorrow - see a physio if not improving"
        ]
      };
    }
    
    return {
      message: "Normal post-workout soreness (DOMS). Active recovery will help.",
      confidence,
      actionItems: [
        "20-30 minutes light cardio (cycling or walking)",
        "Dynamic stretching for affected muscles",
        "Hit your protein target today",
        "Extra hydration (add 1L to normal intake)",
        "Consider magnesium supplement"
      ]
    };
  }

  /**
   * Handle sleep-affected training decisions
   */
  private async handleSleepAffectedTraining(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    const sleepHours = this.extractSleepHours(input) || context.lastSleep?.hours;
    
    if (!sleepHours) {
      return {
        message: "Sleep affects performance significantly.",
        confidence: 'low',
        clarifyingQuestion: "How many hours of sleep did you get?",
        followUpSuggested: true
      };
    }
    
    if (sleepHours < 5) {
      return {
        message: `With only ${sleepHours} hours of sleep, your recovery and performance will be compromised.`,
        confidence,
        clarifyingQuestion: "Is this workout for training or competition?",
        actionItems: [
          "Training: Scale to 70% intensity or switch to recovery work",
          "Competition: Normal warmup, expect reduced performance",
          "Prioritize extra carbs for energy",
          "Focus on hydration throughout"
        ]
      };
    }
    
    if (sleepHours < 6) {
      return {
        message: `${sleepHours} hours is quite low and will affect your performance.`,
        confidence,
        clarifyingQuestion: "How important is today's workout - can you make it a lighter session?",
        actionItems: [
          "Consider making it a recovery day",
          "If you must train, reduce intensity by 30%",
          "Focus on hydration and extra carbs",
          "Listen to your body during warmup"
        ]
      };
    }
    
    return {
      message: `${sleepHours} hours is suboptimal but manageable. Adjust intensity based on how you feel during warmup.`,
      confidence,
      actionItems: [
        "Extended warmup (10-15 minutes)",
        "Start at 80% intensity",
        "Increase if feeling good after 15 minutes",
        "Extra focus on form over intensity"
      ]
    };
  }

  /**
   * Handle weight plateau concerns
   */
  private async handleWeightPlateau(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    const plateauDuration = this.extractPlateauDuration(input);
    
    if (confidence === 'low') {
      return {
        message: "Let's address your weight plateau.",
        confidence: 'low',
        clarifyingQuestion: "Is your main goal weight loss or are you trying to maintain?",
        followUpSuggested: true
      };
    }
    
    if (context.profile.userType === 'weight_mgmt') {
      return {
        message: `A ${plateauDuration}-week plateau is normal during weight loss. Your body is adapting.`,
        confidence,
        actionItems: [
          "Option 1: Reduce portions by 10-15%",
          "Option 2: Add 2000 steps to daily activity",
          "Option 3: Introduce one 16-hour fast per week",
          "Ensure 7+ hours sleep (cortisol affects weight)",
          "Track measurements - you might be losing fat while gaining muscle"
        ]
      };
    }
    
    return {
      message: "Weight stability might actually be a good sign depending on your goals.",
      confidence,
      actionItems: [
        "Review your recent training intensity",
        "Check if strength/performance is improving",
        "Consider body composition changes",
        "Adjust calories only if weight loss is primary goal"
      ]
    };
  }

  /**
   * Handle travel/fast food nutrition
   */
  private async handleTravelNutrition(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    const restaurant = this.extractRestaurant(input);
    
    if (confidence === 'low') {
      return {
        message: `I can help you make the best choice at ${restaurant || 'fast food'}.`,
        confidence: 'low',
        clarifyingQuestion: "Are you prioritizing performance/recovery or keeping calories lighter?",
        actionItems: [
          "Performance: Focus on protein + carbs",
          "Calorie control: Prioritize protein + vegetables"
        ]
      };
    }
    
    const isPerformanceFocus = context.profile.userType === 'endurance' || 
                               context.profile.userType === 'strength' ||
                               context.profile.userType === 'sport';
    
    if (isPerformanceFocus) {
      return {
        message: `At ${restaurant || 'fast food'}, prioritize protein and quality carbs for recovery.`,
        confidence,
        actionItems: [
          "Grilled chicken sandwich + side salad",
          "Or: Double burger (no fries) for more protein",
          "Add: Milk or chocolate milk if available",
          "Skip: Fries, sugary sodas",
          "Total target: 30-40g protein, 40-60g carbs"
        ]
      };
    }
    
    return {
      message: `For lighter calories at ${restaurant || 'fast food'}, focus on protein while minimizing extras.`,
      confidence,
      actionItems: [
        "Grilled chicken salad (dressing on side)",
        "Or: Grilled chicken sandwich (no mayo/cheese)",
        "Skip: Fries, regular sodas, desserts",
        "Drink: Water, diet soda, or unsweetened tea",
        "Target: Under 500 calories, 30g+ protein"
      ]
    };
  }

  /**
   * Handle general queries with AI enhancement
   */
  private async handleGeneralQuery(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    // Try to get AI-powered response first
    try {
      const aiResponse = await getCoachingResponse({
        message: input,
        context: {
          user_type: context.profile.userType,
          recent_activities: context.recentLogs.slice(0, 10),
          goals: context.profile.goals,
          dietary_constraints: context.profile.dietary,
          last_meal: context.lastMeal,
          last_workout: context.lastWorkout,
          last_sleep: context.lastSleep
        },
        coaching_mode: 'general_wellness',
        forceService: 'gemini' // Use free Gemini for general queries
      });

      if (aiResponse.success && aiResponse.data.response) {
        return {
          message: aiResponse.data.response,
          confidence: aiResponse.data.confidence > 70 ? 'high' : confidence,
          actionItems: aiResponse.data.action_items || [
            "Let me know if you'd like more specific guidance"
          ],
          followUpSuggested: true
        };
      }
    } catch (error) {
      console.error('AI general query error:', error);
    }

    // Fallback to rule-based response
    return {
      message: "I'll help you with that based on your profile and recent activity.",
      confidence,
      followUpSuggested: true,
      actionItems: [
        "Please provide more specific details about your question",
        "I can help with nutrition, training, recovery, performance optimization, and habit formation"
      ]
    };
  }

  // Helper methods
  private getPreActivitySnack(context: UserContext, lastMealHoursAgo: number): string {
    if (context.profile.dietary?.includes('vegan')) {
      return "try a banana with almond butter or an oat-based energy bar";
    }
    
    if (context.profile.dietary?.includes('gluten-free')) {
      return "go with rice cakes and nut butter or a certified gluten-free bar";
    }
    
    if (lastMealHoursAgo < 2) {
      return "keep it very light - just a banana or a few dates";
    }
    
    if (lastMealHoursAgo > 4) {
      return "have something more substantial - a sandwich or bowl of oatmeal";
    }
    
    return "aim for something light and carb-focused - banana with yogurt, toast with honey, or an energy bar";
  }

  private extractSleepHours(input: string): number | null {
    const match = input.match(/(\d+)\s*(?:hours?|hrs?|h)/i);
    return match ? parseInt(match[1]) : null;
  }

  private extractPlateauDuration(input: string): number {
    const match = input.match(/(\d+)\s*(?:weeks?|wks?)/i);
    return match ? parseInt(match[1]) : 2; // Default to 2 weeks
  }

  private extractRestaurant(input: string): string | null {
    const restaurants = ['mcdonald', 'burger king', 'subway', 'chipotle', 'wendy'];
    const lower = input.toLowerCase();
    
    for (const restaurant of restaurants) {
      if (lower.includes(restaurant)) {
        return restaurant.charAt(0).toUpperCase() + restaurant.slice(1);
      }
    }
    
    return null;
  }

  // New helper methods for habit formation
  private extractDesiredBehavior(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Common patterns
    if (lowerInput.includes('want to work out') || lowerInput.includes('want to exercise')) {
      return 'exercise';
    }
    if (lowerInput.includes('want to eat healthy') || lowerInput.includes('want to eat better')) {
      return 'eat healthy';
    }
    if (lowerInput.includes('want to drink more water')) {
      return 'drink water';
    }
    if (lowerInput.includes('want to sleep better')) {
      return 'sleep better';
    }
    if (lowerInput.includes('want to meditate')) {
      return 'meditate';
    }
    if (lowerInput.includes('want to run')) {
      return 'run';
    }
    
    // Extract after "want to" or "start"
    const wantToMatch = lowerInput.match(/want to ([^,\.\?]+)/);
    if (wantToMatch) {
      return wantToMatch[1].trim();
    }
    
    const startMatch = lowerInput.match(/start ([^,\.\?]+)/);
    if (startMatch) {
      return startMatch[1].trim();
    }
    
    return 'be healthier';
  }

  private extractStruggleContext(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('forgot')) return 'forgetting';
    if (lowerInput.includes('time')) return 'no time';
    if (lowerInput.includes('tired') || lowerInput.includes('energy')) return 'low energy';
    if (lowerInput.includes('motivation')) return 'low motivation';
    if (lowerInput.includes('hard') || lowerInput.includes('difficult')) return 'too difficult';
    
    return 'general struggle';
  }

  private extractCompletedAction(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Common completions
    if (lowerInput.includes('worked out') || lowerInput.includes('exercised')) {
      return 'workout';
    }
    if (lowerInput.includes('ate') || lowerInput.includes('meal')) {
      return 'healthy eating';
    }
    if (lowerInput.includes('water') || lowerInput.includes('drank')) {
      return 'water intake';
    }
    if (lowerInput.includes('slept') || lowerInput.includes('sleep')) {
      return 'good sleep';
    }
    if (lowerInput.includes('meditated')) {
      return 'meditation';
    }
    
    return 'healthy habit';
  }

  private findMatchingHabit(action: string, context: UserContext): string | null {
    if (!context.habitTracking?.current_habits) return null;
    
    const habit = context.habitTracking.current_habits.find(h => 
      h.behavior.toLowerCase().includes(action.toLowerCase()) ||
      action.toLowerCase().includes(h.behavior.toLowerCase())
    );
    
    return habit?.id || null;
  }

  private getDefaultMotivationProfile(): MotivationProfile {
    return {
      intrinsic_motivators: ['health', 'energy', 'confidence'],
      extrinsic_motivators: ['appearance', 'social approval'],
      motivation_style: 'data_driven',
      energy_patterns: {
        high_motivation_times: ['morning', 'after coffee'],
        low_motivation_triggers: ['stress', 'fatigue']
      }
    };
  }

  private getDefaultAbilityFactors(): AbilityFactors {
    return {
      physical_capability: 7,
      time_availability: 6,
      cognitive_load: 5,
      social_support: 6,
      resource_access: 8,
      overall_ability: 6.4
    };
  }

  /**
   * Phase 5.2: Check for Just-In-Time Adaptive Intervention opportunities
   */
  private checkForJustInTimeIntervention(
    userInput: string,
    context: UserContext,
    patternResults: PatternDetectionResult | null
  ): CoachingResponse | null {
    if (!patternResults || patternResults.interventions.length === 0) {
      return null;
    }

    const currentHour = new Date().getHours();
    const lowerInput = userInput.toLowerCase();

    // Check for immediate intervention triggers
    for (const intervention of patternResults.interventions) {
      if (intervention.intervention.urgency === 'immediate') {
        // Check if trigger conditions are met
        const shouldTrigger = this.evaluateInterventionTrigger(
          intervention.trigger,
          lowerInput,
          currentHour,
          context
        );

        if (shouldTrigger) {
          return {
            message: intervention.intervention.message,
            confidence: 'high',
            actionItems: [
              'This is based on your behavioral patterns',
              'Act on this insight while motivation is high',
              'Small action now = big impact later'
            ],
            identityReinforcement: 'You\'re someone who recognizes and acts on data-driven insights',
            patternInsights: {
              detected_patterns: patternResults.patterns.slice(0, 2).map(p => ({
                type: p.type,
                pattern: p.pattern,
                strength: p.strength,
                significance: p.significance
              })),
              just_in_time_intervention: {
                trigger_reason: intervention.trigger.condition,
                intervention_message: intervention.intervention.message,
                urgency: intervention.intervention.urgency
              }
            },
            motivationalDesign: {
              celebration: '🎯 Pattern-based insight triggered!',
              progress_visualization: 'Your data is working for you',
              streak_acknowledgment: 'Acting on insights builds the habit of self-awareness'
            }
          };
        }
      }
    }

    return null;
  }

  /**
   * Evaluate if intervention trigger conditions are met
   */
  private evaluateInterventionTrigger(
    trigger: any,
    userInput: string,
    currentHour: number,
    context: UserContext
  ): boolean {
    // Check timing constraints
    if (trigger.timing_hours && !trigger.timing_hours.includes(currentHour)) {
      return false;
    }

    // Check condition-specific triggers
    if (trigger.condition.includes('Sleep hours < optimal') && context.lastSleep) {
      return context.lastSleep.hours < 7;
    }

    if (trigger.condition.includes('Low mood detected') && 
        (userInput.includes('tired') || userInput.includes('stressed') || userInput.includes('down'))) {
      return true;
    }

    if (trigger.condition.includes('Workout scheduled') && 
        (userInput.includes('workout') || userInput.includes('exercise') || userInput.includes('training'))) {
      return true;
    }

    if (trigger.condition.includes('Post-workout recovery') && context.lastWorkout) {
      const hoursSinceWorkout = (Date.now() - context.lastWorkout.timestamp.getTime()) / (1000 * 60 * 60);
      return hoursSinceWorkout <= 2; // Within 2 hours of workout
    }

    if (trigger.condition.includes('Multiple high-intensity days') && context.recentLogs) {
      const recentExercises = context.recentLogs.filter(log => 
        ['exercise', 'sport'].includes(log.type) &&
        (log.data.intensity || 5) > 7 &&
        (Date.now() - log.timestamp.getTime()) < (3 * 24 * 60 * 60 * 1000) // Last 3 days
      );
      return recentExercises.length >= 3;
    }

    return false;
  }

  /**
   * Enhance coaching response with pattern insights
   */
  private enhanceWithPatternInsights(
    response: CoachingResponse,
    patternResults: PatternDetectionResult | null
  ): CoachingResponse {
    if (!patternResults || patternResults.patterns.length === 0) {
      return response;
    }

    // Find most relevant patterns for current response
    const relevantPatterns = patternResults.patterns
      .filter(p => p.significance !== 'low')
      .slice(0, 2);

    if (relevantPatterns.length === 0) {
      return response;
    }

    // Add pattern insights to response
    response.patternInsights = {
      detected_patterns: relevantPatterns.map(p => ({
        type: p.type,
        pattern: p.pattern,
        strength: p.strength,
        significance: p.significance
      }))
    };

    // Find relevant adaptive recommendation
    const adaptiveRec = patternResults.recommendations.find(r => 
      relevantPatterns.some(p => p.type.includes(r.category))
    );

    if (adaptiveRec) {
      response.patternInsights.adaptive_recommendation = {
        category: adaptiveRec.category,
        goal_adjustment: adaptiveRec.goal_adjustment.recommended_change,
        implementation_intention: adaptiveRec.implementation_intention.then_behavior
      };

      // Enhance action items with pattern-based suggestions
      if (response.actionItems) {
        response.actionItems.push(`Pattern insight: ${adaptiveRec.goal_adjustment.recommended_change}`);
      } else {
        response.actionItems = [`Pattern insight: ${adaptiveRec.goal_adjustment.recommended_change}`];
      }
    }

    // Add pattern confidence to motivational design
    if (response.motivationalDesign) {
      response.motivationalDesign.progress_visualization = 
        `${response.motivationalDesign.progress_visualization} (${patternResults.confidence}% pattern confidence)`;
    }

    return response;
  }

  /**
   * Phase 5.5: Apply confidence-based friction reduction strategies
   */
  private applyFrictionReduction(
    response: CoachingResponse,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): CoachingResponse {
    const frictionReduction: CoachingResponse['frictionReduction'] = {};
    
    // Apply confidence-specific enhancements
    switch (confidence) {
      case 'high':
        frictionReduction.one_tap_actions = this.generateOneTapActions(response, context);
        frictionReduction.cognitive_load_reduction = {
          simplified_message: this.simplifyForQuickAction(response.message),
          max_options: 3,
          pre_selected_choice: response.actionItems?.[0] || 'Continue'
        };
        break;
        
      case 'medium':
        frictionReduction.smart_defaults = this.generateSmartDefaults(response, context);
        frictionReduction.cognitive_load_reduction = {
          simplified_message: response.message,
          max_options: 5
        };
        break;
        
      case 'low':
        frictionReduction.cognitive_load_reduction = {
          simplified_message: this.minimizeCognitiveLoad(response.message, response.clarifyingQuestion),
          max_options: 2
        };
        break;
    }
    
    // Apply adaptive tone based on user's motivational style
    frictionReduction.adaptive_tone = this.determineAdaptiveTone(context, response);
    
    // Apply tone adaptation to message
    response.message = this.adaptMessageTone(response.message, frictionReduction.adaptive_tone);
    
    response.frictionReduction = frictionReduction;
    return response;
  }

  /**
   * 5.5.1: Generate one-tap actions for high confidence responses
   */
  private generateOneTapActions(
    response: CoachingResponse,
    context: UserContext
  ): Array<{label: string; action: string; confidence_boost: number}> {
    const actions: Array<{label: string; action: string; confidence_boost: number}> = [];
    
    // Extract actionable items from response
    const message = response.message.toLowerCase();
    const actionItems = response.actionItems || [];
    
    // Generate context-aware one-tap actions
    if (message.includes('eat') || message.includes('food') || message.includes('meal')) {
      actions.push({
        label: '🍎 Log this meal',
        action: 'log_meal_suggestion',
        confidence_boost: 15
      });
      actions.push({
        label: '⏰ Set meal reminder',
        action: 'set_meal_reminder',
        confidence_boost: 10
      });
    }
    
    if (message.includes('workout') || message.includes('exercise') || message.includes('train')) {
      actions.push({
        label: '💪 Start workout timer',
        action: 'start_workout_timer',
        confidence_boost: 20
      });
      actions.push({
        label: '📝 Log workout plan',
        action: 'log_workout_plan',
        confidence_boost: 15
      });
    }
    
    if (message.includes('sleep') || message.includes('rest') || message.includes('recovery')) {
      actions.push({
        label: '😴 Set bedtime reminder',
        action: 'set_bedtime_reminder',
        confidence_boost: 12
      });
      actions.push({
        label: '📊 Log sleep quality',
        action: 'log_sleep_quality',
        confidence_boost: 8
      });
    }
    
    if (message.includes('water') || message.includes('hydrat')) {
      actions.push({
        label: '💧 Log water intake',
        action: 'log_water_intake',
        confidence_boost: 10
      });
      actions.push({
        label: '⏰ Set hydration reminder',
        action: 'set_hydration_reminder',
        confidence_boost: 8
      });
    }
    
    // Add habit-specific actions
    if (response.tinyHabit) {
      actions.push({
        label: `✅ Did: ${response.tinyHabit.behavior}`,
        action: 'complete_tiny_habit',
        confidence_boost: 25
      });
    }
    
    // Always include a general positive action
    actions.push({
      label: '👍 Got it, thanks!',
      action: 'acknowledge_advice',
      confidence_boost: 5
    });
    
    // Limit to 4 most relevant actions
    return actions.slice(0, 4);
  }

  /**
   * 5.5.2: Generate smart defaults for medium confidence responses
   */
  private generateSmartDefaults(
    response: CoachingResponse,
    context: UserContext
  ): {default_choice: string; reasoning: string; alternatives: string[]} {
    const message = response.message.toLowerCase();
    
    // Food/nutrition defaults
    if (message.includes('eat') || message.includes('food')) {
      const userType = context.profile.userType;
      let defaultChoice = 'Balanced meal with protein and carbs';
      let reasoning = 'Based on general wellness guidelines';
      
      if (userType === 'sport') {
        defaultChoice = 'Pre-activity snack: banana + protein';
        reasoning = 'Optimized for athletic performance based on your sport profile';
      } else if (userType === 'weight_mgmt') {
        defaultChoice = 'Protein-focused meal with vegetables';
        reasoning = 'Aligned with your weight management goals';
      }
      
      return {
        default_choice: defaultChoice,
        reasoning,
        alternatives: [
          'Light snack option',
          'Full meal option',
          'Quick energy option'
        ]
      };
    }
    
    // Exercise/workout defaults
    if (message.includes('workout') || message.includes('exercise')) {
      const recentWorkouts = context.recentLogs.filter(log => 
        ['exercise', 'sport'].includes(log.type)
      );
      
      let defaultChoice = '30-minute moderate intensity workout';
      let reasoning = 'Balanced approach for consistent progress';
      
      if (recentWorkouts.length >= 2) {
        defaultChoice = 'Active recovery or rest day';
        reasoning = 'You have been consistent - recovery prevents burnout';
      }
      
      return {
        default_choice: defaultChoice,
        reasoning,
        alternatives: [
          '15-minute quick session',
          '45-minute focused session',
          'Rest/recovery day'
        ]
      };
    }
    
    // Sleep defaults
    if (message.includes('sleep')) {
      const sleepHours = context.lastSleep?.hours || 7;
      const defaultChoice = sleepHours < 7 ? 'Prioritize 8+ hours tonight' : 'Maintain current sleep schedule';
      
      return {
        default_choice: defaultChoice,
        reasoning: `Based on your recent ${sleepHours}-hour average`,
        alternatives: [
          'Earlier bedtime',
          'Later wake time',
          'Same schedule'
        ]
      };
    }
    
    // General default
    return {
      default_choice: response.actionItems?.[0] || 'Follow the primary recommendation',
      reasoning: 'Most relevant based on your current situation',
      alternatives: response.actionItems?.slice(1, 4) || ['Alternative approach', 'Modified version']
    };
  }

  /**
   * 5.5.3: Minimize cognitive load for low confidence responses
   */
  private minimizeCognitiveLoad(
    message: string,
    clarifyingQuestion?: string
  ): string {
    // Simplify the message for easier processing
    if (clarifyingQuestion) {
      // Focus on the question, minimize explanation
      return `${clarifyingQuestion}\n\nChoose one option, and I'll give specific advice.`;
    }
    
    // Extract key points and simplify
    const simplifiedMessage = message
      .replace(/^(Great|Perfect|Excellent|Let me).*?[.!]\s*/i, '') // Remove enthusiasm starters
      .split('.')[0] + '.'; // Take first sentence only
    
    return `${simplifiedMessage}\n\nTell me more so I can help better.`;
  }

  /**
   * 5.5.4: Determine adaptive tone based on user's motivational style
   */
  private determineAdaptiveTone(
    context: UserContext,
    response: CoachingResponse
  ): {style: 'data_driven' | 'emotional' | 'competitive' | 'gentle' | 'coach_authoritative'; personalization: string; motivation_match: number} {
    const motivationProfile = context.profile.motivation_profile;
    const userType = context.profile.userType;
    const recentLogs = context.recentLogs;
    
    // Default to data-driven for unknown profiles
    let style: 'data_driven' | 'emotional' | 'competitive' | 'gentle' | 'coach_authoritative' = 'data_driven';
    let personalization = 'Based on your activity patterns';
    let motivation_match = 70;
    
    // Analyze user patterns for tone preference
    if (motivationProfile) {
      const motivationStyle = motivationProfile.motivation_style;
      
      switch (motivationStyle) {
        case 'data_driven':
          style = 'data_driven';
          personalization = 'Here is what your data shows';
          motivation_match = 90;
          break;
        case 'emotional':
          style = 'emotional';
          personalization = 'You are doing amazing work';
          motivation_match = 85;
          break;
        case 'competitive':
          style = 'competitive';
          personalization = 'Time to level up your game';
          motivation_match = 88;
          break;
      }
    } else {
      // Infer from user type and behavior
      if (userType === 'sport') {
        style = 'coach_authoritative';
        personalization = 'As an athlete, you know';
        motivation_match = 80;
      } else if (userType === 'professional') {
        style = 'gentle';
        personalization = 'Fitting this into your busy life';
        motivation_match = 75;
      } else if (recentLogs.length > 10) {
        // Active user - can handle more direct approach
        style = 'data_driven';
        personalization = 'Your consistent tracking shows';
        motivation_match = 82;
      } else {
        // New user - gentle encouragement
        style = 'gentle';
        personalization = 'Starting your journey';
        motivation_match = 70;
      }
    }
    
    return { style, personalization, motivation_match };
  }

  /**
   * Adapt message tone based on determined style
   */
  private adaptMessageTone(
    message: string,
    toneStyle: {style: 'data_driven' | 'emotional' | 'competitive' | 'gentle' | 'coach_authoritative'; personalization: string; motivation_match: number}
  ): string {
    const { style, personalization } = toneStyle;
    
    switch (style) {
      case 'data_driven':
        return message.replace(
          /^([^.!?]*[.!?])/,
          `${personalization}: $1`
        );
        
      case 'emotional':
        return message.replace(
          /(You|Your)/g,
          match => match === 'You' ? 'You absolutely' : 'Your incredible'
        );
        
      case 'competitive':
        return message.replace(
          /\b(try|consider|might)\b/gi,
          'need to'
        ).replace(/\.$/, ' - no excuses!');
        
      case 'gentle':
        return message.replace(
          /\b(must|need to|should)\b/gi,
          'could gently'
        ).replace(/!$/, '.');
        
      case 'coach_authoritative':
        return `Listen up: ${message.replace(/\.$/, '. Execute this today.')}`;
        
      default:
        return message;
    }
  }

  /**
   * Simplify message for quick action (high confidence)
   */
  private simplifyForQuickAction(message: string): string {
    // Extract the core action/recommendation
    const actionMatch = message.match(/([A-Z][^.!?]*(?:try|go|have|focus on|aim for|consider)[^.!?]*[.!?])/i);
    
    if (actionMatch) {
      return actionMatch[1].trim();
    }
    
    // Take first sentence if no clear action found
    const firstSentence = message.split(/[.!?]/)[0] + '.';
    return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
  }
}

// Export singleton instance
export const coachingEngine = new CoachingEngine();

// Export behavior model for direct access
export { BehaviorModel, IdentityBasedHabits } from './behavior-model';