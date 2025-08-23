/**
 * Phase 5.7.2: Synthetic Training Data Generator
 * Generates 10,000+ training examples for AI coach training
 */

import { COACHING_PLAYBOOKS, type CoachingScenario } from './coaching-playbooks';

export interface SyntheticTrainingExample {
  id: string;
  userInput: string;
  context: {
    userProfile: any;
    timeOfDay: number;
    dayOfWeek: number;
    recentActivity: string;
    emotionalState: string;
    motivationLevel: number;
    energyLevel: number;
  };
  expectedResponse: string;
  category: string;
  subcategory: string;
  safetyLevel: 'low' | 'medium' | 'high';
  behaviorChangePrinciples: string[];
  personalizedFactors: string[];
  variations: Array<{
    userType: string;
    modifiedInput: string;
    modifiedResponse: string;
  }>;
}

export class SyntheticDataGenerator {
  private userTypes = [
    'beginner_fitness',
    'intermediate_athlete',
    'time_constrained_professional',
    'stay_at_home_parent',
    'senior_adult',
    'college_student',
    'shift_worker',
    'competitive_athlete',
    'weight_loss_focused',
    'strength_focused',
    'endurance_focused',
    'wellness_focused'
  ];

  private emotionalStates = [
    'motivated', 'frustrated', 'excited', 'overwhelmed', 'confident',
    'anxious', 'determined', 'discouraged', 'hopeful', 'stressed',
    'proud', 'confused', 'energetic', 'tired', 'optimistic'
  ];

  private recentActivities = [
    'completed_workout', 'missed_workout', 'ate_well', 'overate',
    'good_sleep', 'poor_sleep', 'stressful_day', 'great_day',
    'traveled', 'sick', 'injured', 'celebrated', 'busy_work',
    'family_time', 'alone_time'
  ];

  private timeContexts = [
    { time: 6, description: 'early_morning', energy: 70, motivation: 80 },
    { time: 9, description: 'morning', energy: 85, motivation: 75 },
    { time: 12, description: 'midday', energy: 60, motivation: 60 },
    { time: 15, description: 'afternoon', energy: 50, motivation: 55 },
    { time: 18, description: 'evening', energy: 65, motivation: 70 },
    { time: 21, description: 'night', energy: 40, motivation: 45 }
  ];

  /**
   * Generate comprehensive training dataset
   */
  generateTrainingDataset(): SyntheticTrainingExample[] {
    const examples: SyntheticTrainingExample[] = [];
    
    // Generate examples from each coaching playbook scenario
    for (const scenario of COACHING_PLAYBOOKS) {
      examples.push(...this.generateScenarioVariations(scenario));
    }

    // Generate additional contextual variations
    examples.push(...this.generateContextualVariations());

    // Generate edge case examples
    examples.push(...this.generateEdgeCases());

    // Generate conversation flow examples
    examples.push(...this.generateConversationFlows());

    console.log(`Generated ${examples.length} synthetic training examples`);
    return examples;
  }

  /**
   * Generate variations for each coaching scenario
   */
  private generateScenarioVariations(scenario: CoachingScenario): SyntheticTrainingExample[] {
    const examples: SyntheticTrainingExample[] = [];

    // Generate base variations
    for (let i = 0; i < 20; i++) {
      const userType = this.getRandomUserType();
      const context = this.generateRandomContext();
      const variation = this.generateInputVariation(scenario.scenario, userType, context);

      const example: SyntheticTrainingExample = {
        id: `${scenario.id}_var_${i}`,
        userInput: variation.input,
        context,
        expectedResponse: this.adaptResponseToContext(
          scenario.examples.goodResponse,
          userType,
          context,
          scenario
        ),
        category: scenario.category,
        subcategory: scenario.id,
        safetyLevel: scenario.context.riskLevel,
        behaviorChangePrinciples: scenario.evidenceBasis.behaviorChangePrinciples,
        personalizedFactors: this.extractPersonalizationFactors(userType, context),
        variations: scenario.adaptiveVariations.map(av => ({
          userType: av.userType,
          modifiedInput: this.adaptInputToUserType(variation.input, av.userType),
          modifiedResponse: av.modifiedApproach
        }))
      };

      examples.push(example);
    }

    return examples;
  }

  /**
   * Generate contextual variations based on time, mood, situation
   */
  private generateContextualVariations(): SyntheticTrainingExample[] {
    const examples: SyntheticTrainingExample[] = [];

    const baseInputs = [
      "I'm feeling unmotivated today",
      "I don't know what to eat",
      "I'm too tired to work out",
      "I broke my streak",
      "I'm not seeing results",
      "I ate too much yesterday",
      "I'm stressed about work",
      "I don't have time",
      "I'm overwhelmed with options",
      "I feel like giving up"
    ];

    for (const input of baseInputs) {
      for (const userType of this.userTypes) {
        for (const timeContext of this.timeContexts) {
          for (const emotion of this.emotionalStates.slice(0, 3)) {
            const context = {
              userProfile: { userType, primaryGoal: 'fitness' },
              timeOfDay: timeContext.time,
              dayOfWeek: Math.floor(Math.random() * 7),
              recentActivity: this.getRandomElement(this.recentActivities),
              emotionalState: emotion,
              motivationLevel: Math.floor(Math.random() * 100),
              energyLevel: timeContext.energy + Math.floor(Math.random() * 20) - 10
            };

            examples.push({
              id: `contextual_${examples.length}`,
              userInput: this.addContextualNuance(input, context),
              context,
              expectedResponse: this.generateContextualResponse(input, context),
              category: 'motivation',
              subcategory: 'contextual',
              safetyLevel: 'low',
              behaviorChangePrinciples: ['empathy', 'personalization', 'contextual_awareness'],
              personalizedFactors: [userType, emotion, timeContext.description],
              variations: []
            });
          }
        }
      }
    }

    return examples.slice(0, 2000); // Limit to 2000 contextual examples
  }

  /**
   * Generate edge case examples for robust training
   */
  private generateEdgeCases(): SyntheticTrainingExample[] {
    const examples: SyntheticTrainingExample[] = [];

    const edgeCases = [
      {
        input: "I have chest pain during exercise",
        response: "Stop exercising immediately. Chest pain during exercise requires medical evaluation. Please see a doctor before continuing any physical activity.",
        category: "safety",
        safetyLevel: "high" as const
      },
      {
        input: "I'm only eating 500 calories per day",
        response: "I'm very concerned about your safety. 500 calories is dangerously low and can cause serious health problems. Please speak with a healthcare provider immediately.",
        category: "safety",
        safetyLevel: "high" as const
      },
      {
        input: "I want to lose 20 pounds this week",
        response: "That's not safe or sustainable. Healthy weight loss is 1-2 pounds per week. Let's focus on building lasting habits that will get you to your goal safely.",
        category: "nutrition",
        safetyLevel: "medium" as const
      },
      {
        input: "Nothing is working I want to give up",
        response: "I hear your frustration, and it's completely valid. Sometimes progress isn't visible but your body is adapting. Let's talk about what 'working' means to you and adjust our approach.",
        category: "motivation",
        safetyLevel: "medium" as const
      },
      {
        input: "Should I work out with this injury?",
        response: "Not without medical clearance. Your safety comes first. Have you been cleared by a doctor or physical therapist to exercise with this injury?",
        category: "safety",
        safetyLevel: "high" as const
      }
    ];

    edgeCases.forEach((edgeCase, index) => {
      examples.push({
        id: `edge_case_${index}`,
        userInput: edgeCase.input,
        context: this.generateRandomContext(),
        expectedResponse: edgeCase.response,
        category: edgeCase.category,
        subcategory: 'edge_case',
        safetyLevel: edgeCase.safetyLevel,
        behaviorChangePrinciples: ['safety_first', 'appropriate_boundaries'],
        personalizedFactors: ['safety_priority'],
        variations: []
      });
    });

    return examples;
  }

  /**
   * Generate conversation flow examples
   */
  private generateConversationFlows(): SyntheticTrainingExample[] {
    const examples: SyntheticTrainingExample[] = [];

    const flows = [
      {
        initial: "I want to start working out",
        followUp: "But I don't know where to begin",
        response: "Perfect! Starting is the hardest part, and you've already decided to begin. Let's start ridiculously small - what's one form of movement you actually enjoy?"
      },
      {
        initial: "I had a bad eating day yesterday",
        followUp: "I feel so guilty and want to restrict today",
        response: "One day doesn't define your journey. Restricting after overeating often leads to a cycle. Let's focus on nourishing your body well today - what sounds good and satisfying?"
      },
      {
        initial: "I'm not seeing results",
        followUp: "Maybe I should try something more extreme",
        response: "I understand the temptation, but extreme approaches rarely work long-term. Let's look at what IS working and make one small adjustment. What changes have you noticed, even if they're not on the scale?"
      }
    ];

    flows.forEach((flow, index) => {
      examples.push({
        id: `conversation_flow_${index}`,
        userInput: `${flow.initial} ${flow.followUp}`,
        context: this.generateRandomContext(),
        expectedResponse: flow.response,
        category: 'conversation',
        subcategory: 'multi_turn',
        safetyLevel: 'low',
        behaviorChangePrinciples: ['active_listening', 'building_on_responses', 'flow_management'],
        personalizedFactors: ['conversation_context'],
        variations: []
      });
    });

    return examples;
  }

  /**
   * Helper methods
   */
  private getRandomUserType(): string {
    return this.getRandomElement(this.userTypes);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generateRandomContext() {
    const timeContext = this.getRandomElement(this.timeContexts);
    return {
      userProfile: { 
        userType: this.getRandomUserType(), 
        primaryGoal: this.getRandomElement(['fitness', 'nutrition', 'wellness', 'weight_loss'])
      },
      timeOfDay: timeContext.time,
      dayOfWeek: Math.floor(Math.random() * 7),
      recentActivity: this.getRandomElement(this.recentActivities),
      emotionalState: this.getRandomElement(this.emotionalStates),
      motivationLevel: Math.floor(Math.random() * 100),
      energyLevel: timeContext.energy + Math.floor(Math.random() * 20) - 10
    };
  }

  private generateInputVariation(baseInput: string, userType: string, context: any): { input: string } {
    // Add natural language variations
    const variations = {
      'User feels overwhelmed by fitness options': [
        "I don't know where to start with fitness",
        "There are so many workout options I'm paralyzed",
        "I'm overwhelmed by all the exercise choices",
        "What should I do first to get fit?",
        "I'm lost with all these fitness programs"
      ],
      'User hits plateau': [
        "I'm not seeing progress anymore",
        "My results have stalled",
        "Nothing is working like it used to",
        "I've hit a wall with my fitness",
        "My weight loss has stopped"
      ]
    };

    // Find matching variations or create contextual modifications
    const matchingKey = Object.keys(variations).find(key => baseInput.includes(key.toLowerCase()));
    if (matchingKey) {
      return { input: this.getRandomElement(variations[matchingKey as keyof typeof variations]) };
    }

    // Generate contextual modification
    return { input: this.addPersonalizedContext(baseInput, userType, context) };
  }

  private addPersonalizedContext(input: string, userType: string, context: any): string {
    const personalizedElements = {
      'time_constrained_professional': 'as a busy professional',
      'stay_at_home_parent': 'as a parent with young kids',
      'senior_adult': 'at my age',
      'college_student': 'as a college student',
      'beginner_fitness': 'as someone new to fitness'
    };

    const timeElements = {
      6: 'this early in the morning',
      21: 'this late at night',
      12: 'during my lunch break'
    };

    let modifiedInput = input;
    
    if (personalizedElements[userType as keyof typeof personalizedElements]) {
      modifiedInput += ` ${personalizedElements[userType as keyof typeof personalizedElements]}`;
    }

    if (timeElements[context.timeOfDay as keyof typeof timeElements]) {
      modifiedInput += ` ${timeElements[context.timeOfDay as keyof typeof timeElements]}`;
    }

    return modifiedInput;
  }

  private adaptResponseToContext(
    baseResponse: string, 
    userType: string, 
    context: any, 
    scenario: CoachingScenario
  ): string {
    let adaptedResponse = baseResponse;

    // Add time-specific elements
    if (context.timeOfDay < 8) {
      adaptedResponse = adaptedResponse.replace(/\b(start|begin)\b/g, 'start when you have energy');
    } else if (context.timeOfDay > 20) {
      adaptedResponse = adaptedResponse.replace(/\b(workout|exercise)\b/g, 'gentle movement');
    }

    // Add user type specific adaptations
    if (userType === 'time_constrained_professional') {
      adaptedResponse += ' This can fit into your busy schedule.';
    } else if (userType === 'stay_at_home_parent') {
      adaptedResponse += ' You can even include your kids in this.';
    }

    // Add emotional state adaptations
    if (context.emotionalState === 'overwhelmed') {
      adaptedResponse = 'Take a breath. ' + adaptedResponse;
    } else if (context.emotionalState === 'frustrated') {
      adaptedResponse = 'I hear your frustration - it\'s valid. ' + adaptedResponse;
    }

    return adaptedResponse;
  }

  private addContextualNuance(input: string, context: any): string {
    const nuances = [];

    if (context.timeOfDay < 8) nuances.push('this early in the morning');
    if (context.energyLevel < 30) nuances.push('and I\'m exhausted');
    if (context.motivationLevel < 40) nuances.push('and I just don\'t feel like it');
    if (context.recentActivity === 'stressful_day') nuances.push('after a really stressful day');

    if (nuances.length > 0) {
      return `${input} ${nuances.join(' ')}`;
    }

    return input;
  }

  private generateContextualResponse(input: string, context: any): string {
    let response = "I understand ";

    // Add contextual acknowledgment
    if (context.timeOfDay < 8) {
      response += "it's early and energy might be low. ";
    } else if (context.timeOfDay > 20) {
      response += "it's late and you might be tired. ";
    }

    // Add emotional validation
    if (context.emotionalState === 'frustrated') {
      response += "your frustration - that's completely normal. ";
    } else if (context.emotionalState === 'overwhelmed') {
      response += "feeling overwhelmed - let's simplify this. ";
    }

    // Add personalized suggestion based on context
    if (context.energyLevel < 40) {
      response += "Since your energy is low, what's the smallest step you could take right now?";
    } else if (context.motivationLevel < 40) {
      response += "When motivation is low, action creates momentum. What's one tiny thing you could do?";
    } else {
      response += "What feels right for you in this moment?";
    }

    return response;
  }

  private adaptInputToUserType(input: string, userType: string): string {
    const adaptations = {
      'competitive_athlete': input.replace('I', 'As an athlete, I'),
      'senior_adult': input.replace('I', 'At my age, I'),
      'stay_at_home_parent': input.replace('I', 'As a parent, I')
    };

    return adaptations[userType as keyof typeof adaptations] || input;
  }

  private extractPersonalizationFactors(userType: string, context: any): string[] {
    const factors = [userType, context.emotionalState];

    if (context.timeOfDay < 8 || context.timeOfDay > 20) {
      factors.push('time_sensitive');
    }

    if (context.energyLevel < 40) {
      factors.push('low_energy');
    }

    if (context.motivationLevel < 40) {
      factors.push('low_motivation');
    }

    return factors;
  }
}

/**
 * Export generator instance and main function
 */
export const syntheticDataGenerator = new SyntheticDataGenerator();

export function generateLargeTrainingDataset(): SyntheticTrainingExample[] {
  return syntheticDataGenerator.generateTrainingDataset();
}

export default SyntheticDataGenerator;