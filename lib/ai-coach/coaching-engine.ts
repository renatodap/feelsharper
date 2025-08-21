/**
 * AI Coaching Engine - Core logic for personalized coaching responses
 * Implements confidence-based, context-aware coaching for FeelSharper MVP
 */

import { ChatCompletionMessageParam } from 'openai';

export interface UserContext {
  profile: {
    userType: 'endurance' | 'strength' | 'sport' | 'professional' | 'weight_mgmt';
    dietary?: string[];
    goals?: string[];
    constraints?: string[];
  };
  recentLogs: ActivityLog[];
  patterns: UserPatterns;
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
}

export class CoachingEngine {
  /**
   * Main entry point for generating coaching responses
   */
  async generateResponse(
    userInput: string,
    userContext: UserContext
  ): Promise<CoachingResponse> {
    // Determine scenario type
    const scenario = this.classifyScenario(userInput);
    
    // Calculate confidence based on available data
    const confidence = this.calculateConfidence(userContext, scenario);
    
    // Route to appropriate handler
    switch (scenario) {
      case 'pre_activity_nutrition':
        return this.handlePreActivityNutrition(userInput, userContext, confidence);
      case 'post_workout_recovery':
        return this.handlePostWorkoutRecovery(userInput, userContext, confidence);
      case 'sleep_affected_training':
        return this.handleSleepAffectedTraining(userInput, userContext, confidence);
      case 'weight_plateau':
        return this.handleWeightPlateau(userInput, userContext, confidence);
      case 'travel_nutrition':
        return this.handleTravelNutrition(userInput, userContext, confidence);
      default:
        return this.handleGeneralQuery(userInput, userContext, confidence);
    }
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
    
    if (lowerInput.includes('sleep') && lowerInput.includes('workout')) {
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
   * Calculate confidence level based on available user data
   */
  private calculateConfidence(context: UserContext, scenario: string): 'high' | 'medium' | 'low' {
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
    
    const totalScore = dataPoints + relevantPoints;
    
    if (totalScore >= 4) return 'high';
    if (totalScore >= 2) return 'medium';
    return 'low';
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
   * Handle general queries
   */
  private async handleGeneralQuery(
    input: string,
    context: UserContext,
    confidence: 'high' | 'medium' | 'low'
  ): Promise<CoachingResponse> {
    return {
      message: "I'll help you with that based on your profile and recent activity.",
      confidence,
      followUpSuggested: true,
      actionItems: [
        "Please provide more specific details about your question",
        "I can help with nutrition, training, recovery, and performance optimization"
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
}

// Export singleton instance
export const coachingEngine = new CoachingEngine();