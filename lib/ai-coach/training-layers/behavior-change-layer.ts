/**
 * Layer 2: Evidence-Based Behavior Change Techniques
 * Implements proven behavior change interventions from health psychology research
 * Based on Michie et al. Behavior Change Technique Taxonomy (BCTTv1)
 */

export interface BehaviorChangeTechnique {
  id: string;
  name: string;
  description: string;
  evidenceLevel: 'high' | 'moderate' | 'emerging';
  applicableStages: Array<'precontemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance'>;
  effectiveness: number; // 0-10 based on meta-analyses
  implementation: string;
  contraindications: string[];
}

export const BehaviorChangeTechniques: BehaviorChangeTechnique[] = [
  {
    id: 'goal_setting',
    name: 'Goal Setting (Behavior)',
    description: 'Set or agree on a goal defined in terms of the behavior to be achieved',
    evidenceLevel: 'high',
    applicableStages: ['contemplation', 'preparation', 'action'],
    effectiveness: 8.5,
    implementation: 'Help user set SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound',
    contraindications: ['Perfectionism tendency', 'High anxiety about failure']
  },
  {
    id: 'self_monitoring',
    name: 'Self-Monitoring of Behavior',
    description: 'Establish a method for the person to monitor and record their behavior',
    evidenceLevel: 'high',
    applicableStages: ['preparation', 'action', 'maintenance'],
    effectiveness: 9.0,
    implementation: 'Encourage daily tracking with specific metrics and reflection prompts',
    contraindications: ['Obsessive tendencies', 'History of eating disorders for food tracking']
  },
  {
    id: 'feedback_monitoring',
    name: 'Feedback on Behavior',
    description: 'Monitor and provide informative or evaluative feedback on performance',
    evidenceLevel: 'high',
    applicableStages: ['action', 'maintenance'],
    effectiveness: 8.0,
    implementation: 'Provide regular progress updates with specific achievements and areas for improvement',
    contraindications: ['High sensitivity to criticism', 'External locus of control']
  },
  {
    id: 'social_support_unspecified',
    name: 'Social Support (Unspecified)',
    description: 'Advise on, arrange, or provide social support or non-contingent praise',
    evidenceLevel: 'high',
    applicableStages: ['preparation', 'action', 'maintenance'],
    effectiveness: 7.5,
    implementation: 'Connect users with community, encourage sharing progress, celebrate achievements publicly',
    contraindications: ['Social anxiety', 'Privacy concerns']
  },
  {
    id: 'instruction_behavior',
    name: 'Instruction on How to Perform Behavior',
    description: 'Advise or agree on how to perform the behavior',
    evidenceLevel: 'high',
    applicableStages: ['contemplation', 'preparation', 'action'],
    effectiveness: 8.2,
    implementation: 'Provide clear, step-by-step instructions with visual aids when possible',
    contraindications: ['Information overload tendency', 'Analysis paralysis']
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving',
    description: 'Analyse factors influencing the behavior and generate solutions',
    evidenceLevel: 'high',
    applicableStages: ['preparation', 'action', 'maintenance'],
    effectiveness: 7.8,
    implementation: 'Guide users through structured problem-solving: identify barriers, brainstorm solutions, test and refine',
    contraindications: ['Overthinking tendency', 'Decision fatigue']
  },
  {
    id: 'action_planning',
    name: 'Action Planning',
    description: 'Prompt detailed planning of performance of the behavior',
    evidenceLevel: 'high',
    applicableStages: ['preparation', 'action'],
    effectiveness: 8.0,
    implementation: 'Help create specific if-then plans: "If X situation occurs, then I will do Y behavior"',
    contraindications: ['Rigidity issues', 'Anxiety about planning']
  },
  {
    id: 'barrier_identification',
    name: 'Barrier Identification/Problem Solving',
    description: 'Identify barriers and problem solve ways to overcome them',
    evidenceLevel: 'high',
    applicableStages: ['contemplation', 'preparation', 'action'],
    effectiveness: 7.9,
    implementation: 'Proactively identify potential obstacles and create specific contingency plans',
    contraindications: ['Catastrophic thinking', 'Pessimistic attribution style']
  },
  {
    id: 'graded_tasks',
    name: 'Graded Tasks',
    description: 'Set easy-to-perform tasks, making them increasingly difficult',
    evidenceLevel: 'high',
    applicableStages: ['preparation', 'action'],
    effectiveness: 8.3,
    implementation: 'Start with tiny habits and gradually increase difficulty as confidence builds',
    contraindications: ['Impatience', 'All-or-nothing thinking']
  },
  {
    id: 'reward_behavior',
    name: 'Reward (Behavior)',
    description: 'Arrange for rewards following successful behavior performance',
    evidenceLevel: 'moderate',
    applicableStages: ['action', 'maintenance'],
    effectiveness: 6.5,
    implementation: 'Help identify meaningful rewards and create reward schedules (variable ratio most effective)',
    contraindications: ['Intrinsic motivation concerns', 'Reward dependency risk']
  },
  {
    id: 'habit_formation',
    name: 'Habit Formation',
    description: 'Prompt rehearsal and repetition in the same context repeatedly',
    evidenceLevel: 'high',
    applicableStages: ['action', 'maintenance'],
    effectiveness: 8.7,
    implementation: 'Encourage same time, same place, same sequence to build automaticity',
    contraindications: ['Inflexibility', 'Need for variety']
  },
  {
    id: 'behavioral_substitution',
    name: 'Behavioral Substitution',
    description: 'Prompt substitution of unwanted behavior with wanted behavior',
    evidenceLevel: 'moderate',
    applicableStages: ['action', 'maintenance'],
    effectiveness: 7.2,
    implementation: 'Identify triggers for unwanted behavior and replace with positive alternatives',
    contraindications: ['Habit strength too high', 'Multiple unwanted behaviors']
  },
  {
    id: 'mental_rehearsal',
    name: 'Mental Rehearsal of Successful Performance',
    description: 'Advise to practice the behavior mentally before performing',
    evidenceLevel: 'moderate',
    applicableStages: ['preparation', 'action'],
    effectiveness: 7.0,
    implementation: 'Guide visualization exercises of successful behavior performance',
    contraindications: ['Anxiety about performance', 'Difficulty with visualization']
  },
  {
    id: 'reduce_negative_emotions',
    name: 'Reduce Negative Emotions',
    description: 'Advise on ways of reducing negative emotions to facilitate behavior change',
    evidenceLevel: 'moderate',
    applicableStages: ['contemplation', 'preparation', 'action'],
    effectiveness: 6.8,
    implementation: 'Teach stress management, reframing techniques, self-compassion practices',
    contraindications: ['Clinical depression/anxiety requiring treatment']
  },
  {
    id: 'identity_associated_rewards',
    name: 'Identity Associated with Changed Behavior',
    description: 'Advise the person to construct a new self-identity as someone who performs the behavior',
    evidenceLevel: 'emerging',
    applicableStages: ['action', 'maintenance'],
    effectiveness: 8.5,
    implementation: 'Use identity-based language: "You\'re becoming someone who..." Focus on identity over outcomes',
    contraindications: ['Identity conflicts', 'Low self-worth']
  }
];

export interface UserBehaviorProfile {
  userId: string;
  
  // Stage of change (Transtheoretical Model)
  currentStage: 'precontemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance';
  stageHistory: Array<{
    stage: string;
    date: Date;
    trigger?: string;
  }>;
  
  // Personality factors affecting technique selection
  personalityTraits: {
    conscientiousness: number; // 1-10
    openness: number; // 1-10
    extraversion: number; // 1-10
    agreeableness: number; // 1-10
    neuroticism: number; // 1-10
  };
  
  // Behavioral tendencies
  cognitiveStyle: 'analytical' | 'intuitive' | 'balanced';
  motivationOrientation: 'autonomous' | 'controlled' | 'mixed';
  selfefficacy: number; // 1-10
  locusOfControl: 'internal' | 'external' | 'mixed';
  
  // Technique effectiveness tracking
  techniqueHistory: Array<{
    techniqueId: string;
    usedAt: Date;
    effectivenessRating: number; // 1-10
    userFeedback?: string;
    behaviorOutcome: 'improved' | 'maintained' | 'declined';
  }>;
  
  // Contraindications
  contraindications: string[];
  
  // Preferences
  preferredTechniques: string[];
  avoidedTechniques: string[];
}

export class BehaviorChangeTechniqueSelector {
  /**
   * Select optimal behavior change techniques based on user profile and current situation
   */
  static selectTechniques(
    userProfile: UserBehaviorProfile,
    currentGoal: string,
    recentBehavior: 'improving' | 'stable' | 'declining',
    contextFactors?: {
      timeAvailable: 'low' | 'medium' | 'high';
      stressLevel: 'low' | 'medium' | 'high';
      socialSupport: 'low' | 'medium' | 'high';
    }
  ): BehaviorChangeTechnique[] {
    
    // Filter techniques by stage of change
    let applicableTechniques = BehaviorChangeTechniques.filter(technique =>
      technique.applicableStages.includes(userProfile.currentStage)
    );

    // Remove contraindicated techniques
    applicableTechniques = applicableTechniques.filter(technique =>
      !technique.contraindications.some(contraindication =>
        userProfile.contraindications.includes(contraindication)
      )
    );

    // Score techniques based on user profile
    const scoredTechniques = applicableTechniques.map(technique => ({
      technique,
      score: this.calculateTechniqueScore(technique, userProfile, recentBehavior, contextFactors)
    }));

    // Sort by score and return top techniques
    return scoredTechniques
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.technique);
  }

  private static calculateTechniqueScore(
    technique: BehaviorChangeTechnique,
    userProfile: UserBehaviorProfile,
    recentBehavior: 'improving' | 'stable' | 'declining',
    contextFactors?: any
  ): number {
    let score = technique.effectiveness; // Base score

    // Adjust for user's historical effectiveness with this technique
    const history = userProfile.techniqueHistory
      .filter(h => h.techniqueId === technique.id)
      .slice(-5); // Last 5 uses

    if (history.length > 0) {
      const avgEffectiveness = history.reduce((sum, h) => sum + h.effectivenessRating, 0) / history.length;
      score *= (avgEffectiveness / 5); // Adjust based on personal effectiveness
    }

    // Adjust for personality traits
    switch (technique.id) {
      case 'self_monitoring':
        score *= (userProfile.personalityTraits.conscientiousness / 10) * 1.5;
        break;
      case 'social_support_unspecified':
        score *= (userProfile.personalityTraits.extraversion / 10) * 1.3;
        break;
      case 'problem_solving':
        score *= userProfile.cognitiveStyle === 'analytical' ? 1.3 : 0.8;
        break;
      case 'mental_rehearsal':
        score *= (userProfile.personalityTraits.openness / 10) * 1.2;
        break;
    }

    // Adjust for current behavior trend
    if (recentBehavior === 'declining') {
      // Prioritize supportive, non-demanding techniques
      if (['reduce_negative_emotions', 'social_support_unspecified', 'graded_tasks'].includes(technique.id)) {
        score *= 1.4;
      }
    } else if (recentBehavior === 'improving') {
      // Prioritize growth and challenge techniques
      if (['habit_formation', 'identity_associated_rewards', 'action_planning'].includes(technique.id)) {
        score *= 1.3;
      }
    }

    // Adjust for preferences
    if (userProfile.preferredTechniques.includes(technique.id)) {
      score *= 1.2;
    }
    if (userProfile.avoidedTechniques.includes(technique.id)) {
      score *= 0.5;
    }

    return score;
  }

  /**
   * Generate coaching message using selected technique
   */
  static generateTechniqueMessage(
    technique: BehaviorChangeTechnique,
    userProfile: UserBehaviorProfile,
    specificContext: {
      goalBehavior: string;
      currentChallenge?: string;
      recentSuccess?: string;
    }
  ): string {
    const templates = this.getTechniqueTemplates();
    const template = templates[technique.id];
    
    if (!template) {
      return `Let's work on ${specificContext.goalBehavior} using proven techniques.`;
    }

    // Personalize based on user profile
    let message = template.baseMessage;
    
    // Replace placeholders
    message = message.replace('{behavior}', specificContext.goalBehavior);
    message = message.replace('{challenge}', specificContext.currentChallenge || 'staying consistent');
    message = message.replace('{success}', specificContext.recentSuccess || 'your efforts so far');

    // Adjust tone for personality
    if (userProfile.personalityTraits.neuroticism > 7) {
      message = this.softenMessage(message);
    }
    if (userProfile.personalityTraits.conscientiousness > 7) {
      message = this.addStructure(message);
    }

    return message;
  }

  private static getTechniqueTemplates(): Record<string, { baseMessage: string; followUp?: string }> {
    return {
      goal_setting: {
        baseMessage: "Let's set a specific, achievable goal for {behavior}. What would success look like for you in the next week?",
        followUp: "Remember: the best goals are specific, measurable, and slightly challenging but definitely achievable."
      },
      self_monitoring: {
        baseMessage: "Tracking your {behavior} will give you powerful insights. What's one simple way you could monitor your progress daily?",
        followUp: "Research shows that people who self-monitor are 2-3x more successful at behavior change."
      },
      action_planning: {
        baseMessage: "Let's create a specific plan: If [situation] happens, then I will [specific behavior]. What situation could trigger your {behavior}?",
        followUp: "These 'if-then' plans help your brain automate good decisions, even when motivation is low."
      },
      graded_tasks: {
        baseMessage: "Let's start incredibly small with {behavior}. What's the tiniest version you could do that would still count as progress?",
        followUp: "Small wins build confidence and momentum. You can always do more once you start!"
      },
      habit_formation: {
        baseMessage: "To make {behavior} automatic, let's link it to something you already do consistently. What existing habit could be your cue?",
        followUp: "Same time, same place, same sequence - this is how habits form naturally."
      },
      identity_associated_rewards: {
        baseMessage: "You're becoming someone who {behavior}s consistently. This identity shift is more powerful than any external motivation.",
        followUp: "Every time you {behavior}, you're casting a vote for the person you want to become."
      },
      social_support_unspecified: {
        baseMessage: "Having support makes {behavior} easier and more enjoyable. Who in your life could encourage this journey?",
        followUp: "Consider sharing your goal with someone who cares about your success."
      },
      problem_solving: {
        baseMessage: "Let's think through what might make {behavior} challenging. What's one barrier we should plan for?",
        followUp: "By anticipating obstacles, you're already halfway to overcoming them."
      }
    };
  }

  private static softenMessage(message: string): string {
    return message
      .replace('Let\'s', 'Maybe we could')
      .replace('What\'s', 'What might be')
      .replace('You should', 'You might consider')
      .replace('!', '.') + ' There\'s no pressure - we\'ll take this at your pace.';
  }

  private static addStructure(message: string): string {
    return message + ' We can break this into specific steps if that would be helpful.';
  }
}

/**
 * Behavior change intervention scheduler
 */
export class InterventionScheduler {
  /**
   * Determine optimal timing for behavior change interventions
   */
  static scheduleIntervention(
    userProfile: UserBehaviorProfile,
    technique: BehaviorChangeTechnique,
    userTimezone: string,
    recentActivity: Array<{ timestamp: Date; success: boolean }>
  ): {
    suggestedTime: Date;
    rationale: string;
    deliveryMethod: 'immediate' | 'notification' | 'next_session';
  } {
    
    // Analyze user's success patterns
    const hourlySuccess = this.analyzeHourlyPatterns(recentActivity);
    const bestHour = Object.entries(hourlySuccess)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Determine urgency based on technique and recent behavior
    const isUrgent = recentActivity.slice(-3).every(a => !a.success) && 
                    ['reduce_negative_emotions', 'social_support_unspecified'].includes(technique.id);

    const now = new Date();
    let suggestedTime: Date;
    let deliveryMethod: 'immediate' | 'notification' | 'next_session';
    let rationale: string;

    if (isUrgent) {
      suggestedTime = now;
      deliveryMethod = 'immediate';
      rationale = 'Immediate support needed based on recent struggles';
    } else if (technique.id === 'action_planning' || technique.id === 'goal_setting') {
      // Planning techniques work better at start of day/week
      suggestedTime = new Date(now);
      suggestedTime.setHours(parseInt(bestHour), 0, 0, 0);
      if (suggestedTime <= now) {
        suggestedTime.setDate(suggestedTime.getDate() + 1);
      }
      deliveryMethod = 'notification';
      rationale = `Scheduled for ${bestHour}:00 when you're typically most successful`;
    } else {
      // Most techniques can wait for next natural interaction
      suggestedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      deliveryMethod = 'next_session';
      rationale = 'Will be integrated into next coaching conversation';
    }

    return { suggestedTime, rationale, deliveryMethod };
  }

  private static analyzeHourlyPatterns(activity: Array<{ timestamp: Date; success: boolean }>): Record<string, number> {
    const hourlyData: Record<string, { successes: number; total: number }> = {};
    
    activity.forEach(a => {
      const hour = a.timestamp.getHours().toString();
      if (!hourlyData[hour]) hourlyData[hour] = { successes: 0, total: 0 };
      hourlyData[hour].total++;
      if (a.success) hourlyData[hour].successes++;
    });

    const hourlySuccess: Record<string, number> = {};
    Object.entries(hourlyData).forEach(([hour, data]) => {
      hourlySuccess[hour] = data.total > 0 ? data.successes / data.total : 0;
    });

    return hourlySuccess;
  }
}

/**
 * Evidence-based coaching prompts for AI training
 */
export const BehaviorChangePrompts = {
  techniqueSelection: `
    When selecting behavior change techniques:
    1. Always assess user's stage of change first
    2. Check for contraindications (personality, mental health history)
    3. Consider recent effectiveness of techniques with this user
    4. Match technique to current behavior trend (improving/stable/declining)
    5. Prioritize evidence-based techniques with effectiveness scores >7.0
    
    Never use techniques marked as contraindicated for this user.
  `,

  implementationGuidelines: `
    When implementing behavior change techniques:
    - Start with the highest-scoring technique from selection algorithm
    - Use personalized messaging based on user personality profile
    - Provide clear rationale for why this technique helps
    - Include specific, actionable steps
    - Reference scientific basis when appropriate
    - Monitor user response and adjust accordingly
  `,

  safetyProtocol: `
    Always check for:
    - Signs of clinical depression/anxiety requiring professional help
    - Eating disorder risk flags when discussing nutrition tracking
    - Perfectionism that could lead to burnout
    - All-or-nothing thinking patterns
    - Excessive self-criticism that undermines progress
    
    Refer to professionals when behavior change intersects with clinical concerns.
  `
};