/**
 * Phase 5.8.6: Age and Special Population Adaptations
 * Safety protocols for seniors, youth, pregnancy, and other special populations
 */

import { createClient } from '@/lib/supabase/server';

export interface PopulationSafetyProfile {
  populationType: 'senior' | 'youth' | 'pregnancy' | 'postpartum' | 'disability' | 'chronic_illness';
  ageRange?: [number, number];
  specificConditions?: string[];
  safetyConsiderations: string[];
  exerciseModifications: string[];
  nutritionConsiderations: string[];
  contraindications: string[];
  medicalClearanceRequired: boolean;
  supervisedActivityRecommended: boolean;
}

export interface SpecialPopulationAssessment {
  userId: string;
  populationType: string;
  age?: number;
  conditions: string[];
  proposedActivity: string;
  safetyRating: 'safe' | 'caution' | 'unsafe' | 'requires_clearance';
  modifications: string[];
  warnings: string[];
  clearanceNeeded: boolean;
  monitoringRequired: string[];
}

export class SpecialPopulationSafetySystem {
  private supabase: any;
  private populationProfiles: Map<string, PopulationSafetyProfile>;

  constructor() {
    this.supabase = createClient();
    this.populationProfiles = this.initializePopulationProfiles();
  }

  /**
   * Assess safety for special population user
   */
  async assessSpecialPopulationSafety(
    userId: string,
    populationType: string,
    age: number,
    conditions: string[],
    proposedActivity: string
  ): Promise<SpecialPopulationAssessment> {
    try {
      const profile = this.populationProfiles.get(populationType);
      if (!profile) {
        return this.getDefaultSafetyAssessment(userId, populationType, proposedActivity);
      }

      const assessment: SpecialPopulationAssessment = {
        userId,
        populationType,
        age,
        conditions,
        proposedActivity,
        safetyRating: 'safe',
        modifications: [],
        warnings: [],
        clearanceNeeded: profile.medicalClearanceRequired,
        monitoringRequired: []
      };

      // Age-specific safety checks
      if (populationType === 'senior') {
        this.applySeniorSafetyChecks(assessment, age, conditions, proposedActivity);
      } else if (populationType === 'youth') {
        this.applyYouthSafetyChecks(assessment, age, conditions, proposedActivity);
      } else if (populationType === 'pregnancy') {
        this.applyPregnancySafetyChecks(assessment, conditions, proposedActivity);
      } else if (populationType === 'postpartum') {
        this.applyPostpartumSafetyChecks(assessment, conditions, proposedActivity);
      }

      // Apply general population-specific modifications
      assessment.modifications.push(...profile.exerciseModifications);
      assessment.warnings.push(...profile.safetyConsiderations);

      // Check for contraindications
      for (const contraindication of profile.contraindications) {
        if (proposedActivity.toLowerCase().includes(contraindication.toLowerCase())) {
          assessment.safetyRating = 'unsafe';
          assessment.warnings.push(`Contraindicated: ${contraindication} not recommended for ${populationType}`);
        }
      }

      // Log assessment
      await this.logSpecialPopulationAssessment(assessment);

      return assessment;

    } catch (error) {
      console.error('Error assessing special population safety:', error);
      return this.getDefaultSafetyAssessment(userId, populationType, proposedActivity);
    }
  }

  /**
   * Get age-appropriate exercise recommendations
   */
  async getAgeAppropriateRecommendations(
    age: number,
    fitnessLevel: string,
    conditions: string[]
  ): Promise<{
    recommendedActivities: string[];
    intensityGuidelines: string;
    durationGuidelines: string;
    frequencyGuidelines: string;
    specialConsiderations: string[];
  }> {
    let ageCategory: string;
    if (age < 18) ageCategory = 'youth';
    else if (age < 65) ageCategory = 'adult';
    else ageCategory = 'senior';

    const recommendations = {
      recommendedActivities: [] as string[],
      intensityGuidelines: '',
      durationGuidelines: '',
      frequencyGuidelines: '',
      specialConsiderations: [] as string[]
    };

    switch (ageCategory) {
      case 'youth':
        recommendations.recommendedActivities = [
          'Age-appropriate sports and games',
          'Playground activities',
          'Swimming',
          'Dancing',
          'Martial arts (with proper instruction)'
        ];
        recommendations.intensityGuidelines = 'Focus on fun and skill development rather than intensity';
        recommendations.durationGuidelines = '60 minutes daily of various activities';
        recommendations.frequencyGuidelines = 'Daily physical activity encouraged';
        recommendations.specialConsiderations = [
          'Growth plate safety',
          'Proper hydration',
          'Adult supervision for strength training',
          'Avoid overspecialization in single sport'
        ];
        break;

      case 'senior':
        recommendations.recommendedActivities = [
          'Walking',
          'Swimming',
          'Tai Chi',
          'Chair exercises',
          'Light resistance training',
          'Balance training'
        ];
        recommendations.intensityGuidelines = 'Low to moderate intensity, listen to body';
        recommendations.durationGuidelines = 'Start with 10-15 minutes, build gradually';
        recommendations.frequencyGuidelines = '2-3 times per week minimum';
        recommendations.specialConsiderations = [
          'Fall prevention focus',
          'Joint health priority',
          'Medication considerations',
          'Social interaction benefits'
        ];
        break;

      case 'adult':
      default:
        recommendations.recommendedActivities = [
          'Cardiovascular exercise',
          'Strength training',
          'Flexibility work',
          'Sports activities',
          'Group fitness classes'
        ];
        recommendations.intensityGuidelines = 'Moderate to vigorous intensity based on fitness level';
        recommendations.durationGuidelines = '150 minutes moderate or 75 minutes vigorous per week';
        recommendations.frequencyGuidelines = '5 days cardio, 2 days strength training per week';
        break;
    }

    // Adjust for conditions
    if (conditions.includes('arthritis')) {
      recommendations.specialConsiderations.push('Low-impact activities preferred');
      recommendations.recommendedActivities = recommendations.recommendedActivities.filter(
        activity => !activity.includes('high-impact')
      );
    }

    return recommendations;
  }

  /**
   * Pregnancy-specific exercise safety assessment
   */
  async assessPregnancyExerciseSafety(
    trimester: number,
    prePregnancyFitness: string,
    complications: string[],
    proposedExercise: string
  ): Promise<{
    safe: boolean;
    modifications: string[];
    warnings: string[];
    contraindications: string[];
  }> {
    const assessment = {
      safe: true,
      modifications: [] as string[],
      warnings: [] as string[],
      contraindications: [] as string[]
    };

    // Absolute contraindications for exercise during pregnancy
    const absoluteContraindications = [
      'significant heart disease',
      'restrictive lung disease',
      'incompetent cervix',
      'multiple gestation at risk for premature labor',
      'persistent bleeding',
      'placenta previa',
      'premature labor',
      'ruptured membranes',
      'preeclampsia'
    ];

    // Check for absolute contraindications
    for (const complication of complications) {
      if (absoluteContraindications.some(contra => 
        complication.toLowerCase().includes(contra.toLowerCase()))) {
        assessment.safe = false;
        assessment.contraindications.push(`Exercise contraindicated due to ${complication}`);
        return assessment;
      }
    }

    // Trimester-specific modifications
    if (trimester === 1) {
      assessment.warnings.push('Monitor for nausea and fatigue');
      assessment.modifications.push('Stay hydrated', 'Avoid overheating');
    } else if (trimester === 2) {
      assessment.modifications.push(
        'Avoid supine exercises after 16 weeks',
        'Modify core exercises',
        'Monitor for diastasis recti'
      );
    } else if (trimester === 3) {
      assessment.modifications.push(
        'Avoid supine position completely',
        'Focus on posture and balance',
        'Prepare for delivery with pelvic floor exercises',
        'Reduce exercise intensity as needed'
      );
    }

    // Exercise-specific safety
    const unsafeActivities = [
      'contact sports',
      'activities with fall risk',
      'scuba diving',
      'hot yoga',
      'high altitude activities'
    ];

    if (unsafeActivities.some(unsafe => 
      proposedExercise.toLowerCase().includes(unsafe.toLowerCase()))) {
      assessment.safe = false;
      assessment.contraindications.push(`${proposedExercise} not safe during pregnancy`);
    }

    // General pregnancy exercise guidelines
    assessment.warnings.push(
      'Stop if experiencing dizziness, chest pain, or unusual symptoms',
      'Maintain ability to hold conversation during exercise',
      'Avoid exercises that require precise balance'
    );

    return assessment;
  }

  // Private helper methods

  private initializePopulationProfiles(): Map<string, PopulationSafetyProfile> {
    const profiles = new Map<string, PopulationSafetyProfile>();

    profiles.set('senior', {
      populationType: 'senior',
      ageRange: [65, 120],
      safetyConsiderations: [
        'Fall risk assessment',
        'Joint health priority',
        'Medication interactions',
        'Slower recovery times',
        'Balance and coordination focus'
      ],
      exerciseModifications: [
        'Start with shorter durations',
        'Focus on low-impact activities',
        'Include balance training',
        'Emphasize proper warm-up and cool-down',
        'Monitor blood pressure response'
      ],
      nutritionConsiderations: [
        'Adequate protein for muscle preservation',
        'Calcium and Vitamin D for bone health',
        'Hydration awareness',
        'Medication-food interactions'
      ],
      contraindications: [
        'High-impact activities without clearance',
        'Exercises requiring rapid direction changes',
        'Heavy resistance training without supervision'
      ],
      medicalClearanceRequired: true,
      supervisedActivityRecommended: true
    });

    profiles.set('youth', {
      populationType: 'youth',
      ageRange: [6, 17],
      safetyConsiderations: [
        'Growth plate protection',
        'Age-appropriate activities',
        'Proper supervision',
        'Hydration and heat illness prevention',
        'Overuse injury prevention'
      ],
      exerciseModifications: [
        'Focus on fun and skill development',
        'Avoid powerlifting and maximal lifts',
        'Include variety to prevent overspecialization',
        'Ensure adequate recovery',
        'Emphasize proper technique over intensity'
      ],
      nutritionConsiderations: [
        'Support growth and development',
        'Avoid restrictive dieting',
        'Adequate calories for activity level',
        'Healthy relationship with food'
      ],
      contraindications: [
        'Maximal strength testing',
        'Extreme caloric restriction',
        'Single-sport specialization too early'
      ],
      medicalClearanceRequired: false,
      supervisedActivityRecommended: true
    });

    profiles.set('pregnancy', {
      populationType: 'pregnancy',
      safetyConsiderations: [
        'Avoid overheating',
        'Monitor heart rate response',
        'Avoid supine position after first trimester',
        'Watch for warning signs',
        'Maintain hydration'
      ],
      exerciseModifications: [
        'Modify intensity based on perceived exertion',
        'Avoid contact sports',
        'Include pelvic floor exercises',
        'Focus on posture and balance',
        'Prepare body for delivery'
      ],
      nutritionConsiderations: [
        'Adequate calories for pregnancy',
        'Folic acid and prenatal vitamins',
        'Iron-rich foods',
        'Limit caffeine',
        'Avoid alcohol'
      ],
      contraindications: [
        'Contact sports',
        'Activities with fall risk',
        'Scuba diving',
        'Hot yoga',
        'Supine exercises after 16 weeks'
      ],
      medicalClearanceRequired: true,
      supervisedActivityRecommended: true
    });

    profiles.set('postpartum', {
      populationType: 'postpartum',
      safetyConsiderations: [
        'Gradual return to activity',
        'Pelvic floor recovery',
        'Joint laxity from hormones',
        'Sleep deprivation effects',
        'Breastfeeding considerations'
      ],
      exerciseModifications: [
        'Start with gentle walking',
        'Progress gradually',
        'Include core rehabilitation',
        'Focus on posture improvement',
        'Listen to body signals'
      ],
      nutritionConsiderations: [
        'Support lactation if breastfeeding',
        'Iron replacement if needed',
        'Adequate hydration',
        'Avoid extreme calorie restriction'
      ],
      contraindications: [
        'High-impact activities until cleared',
        'Abdominal exercises until diastasis recti assessed',
        'Heavy lifting until pelvic floor recovered'
      ],
      medicalClearanceRequired: true,
      supervisedActivityRecommended: true
    });

    return profiles;
  }

  private applySeniorSafetyChecks(
    assessment: SpecialPopulationAssessment,
    age: number,
    conditions: string[],
    proposedActivity: string
  ): void {
    // Age-specific modifications
    if (age >= 80) {
      assessment.modifications.push('Extra emphasis on balance and fall prevention');
      assessment.monitoringRequired.push('Balance assessment', 'Cognitive function');
    }

    // Check for high-risk activities
    const highRiskActivities = ['running', 'jumping', 'contact sports'];
    if (highRiskActivities.some(activity => 
      proposedActivity.toLowerCase().includes(activity.toLowerCase()))) {
      assessment.safetyRating = 'caution';
      assessment.warnings.push('Higher fall risk - consider alternatives or supervision');
    }

    // Condition-specific modifications
    if (conditions.includes('osteoporosis')) {
      assessment.modifications.push('Avoid forward flexion of spine', 'Weight-bearing exercises preferred');
      assessment.warnings.push('Fracture risk with improper movement');
    }

    if (conditions.includes('arthritis')) {
      assessment.modifications.push('Low-impact activities', 'Warm-up thoroughly', 'Respect pain limits');
    }
  }

  private applyYouthSafetyChecks(
    assessment: SpecialPopulationAssessment,
    age: number,
    conditions: string[],
    proposedActivity: string
  ): void {
    // Age-specific safety
    if (age < 12) {
      assessment.modifications.push('Focus on fundamental movement skills', 'Avoid specialized training');
      assessment.monitoringRequired.push('Adult supervision', 'Proper hydration');
    }

    if (age >= 13 && age <= 17) {
      assessment.modifications.push('Growth plate protection', 'Progressive loading');
      if (proposedActivity.includes('strength training')) {
        assessment.modifications.push('Professional instruction required', 'Avoid maximal lifts');
      }
    }

    // Check for age-inappropriate activities
    const ageInappropriate = ['powerlifting', 'extreme sports without supervision'];
    if (ageInappropriate.some(activity => 
      proposedActivity.toLowerCase().includes(activity.toLowerCase()))) {
      assessment.safetyRating = 'unsafe';
      assessment.warnings.push('Activity not appropriate for this age group');
    }
  }

  private applyPregnancySafetyChecks(
    assessment: SpecialPopulationAssessment,
    conditions: string[],
    proposedActivity: string
  ): void {
    // Check for pregnancy contraindications
    const contraindicatedActivities = [
      'contact sports', 'scuba diving', 'hot yoga', 'horseback riding'
    ];

    if (contraindicatedActivities.some(activity => 
      proposedActivity.toLowerCase().includes(activity.toLowerCase()))) {
      assessment.safetyRating = 'unsafe';
      assessment.warnings.push('Activity contraindicated during pregnancy');
    }

    // General pregnancy modifications
    assessment.modifications.push(
      'Monitor perceived exertion',
      'Avoid overheating',
      'Stay well hydrated',
      'Stop if experiencing any unusual symptoms'
    );

    // Trimester-specific (would need additional context)
    assessment.warnings.push('Avoid supine position after first trimester');
  }

  private applyPostpartumSafetyChecks(
    assessment: SpecialPopulationAssessment,
    conditions: string[],
    proposedActivity: string
  ): void {
    assessment.clearanceNeeded = true;
    assessment.modifications.push(
      'Gradual progression back to pre-pregnancy activity',
      'Include pelvic floor rehabilitation',
      'Address diastasis recti if present'
    );

    if (proposedActivity.includes('running') || proposedActivity.includes('high-impact')) {
      assessment.safetyRating = 'requires_clearance';
      assessment.warnings.push('High-impact activities require clearance and pelvic floor assessment');
    }
  }

  private getDefaultSafetyAssessment(
    userId: string, 
    populationType: string, 
    proposedActivity: string
  ): SpecialPopulationAssessment {
    return {
      userId,
      populationType,
      proposedActivity,
      conditions: [],
      safetyRating: 'requires_clearance',
      modifications: ['Professional guidance recommended'],
      warnings: ['Special population safety assessment needed'],
      clearanceNeeded: true,
      monitoringRequired: ['Professional supervision']
    };
  }

  private async logSpecialPopulationAssessment(assessment: SpecialPopulationAssessment): Promise<void> {
    try {
      await this.supabase.from('special_population_assessments').insert({
        user_id: assessment.userId,
        population_type: assessment.populationType,
        age: assessment.age,
        conditions: assessment.conditions,
        proposed_activity: assessment.proposedActivity,
        safety_rating: assessment.safetyRating,
        modifications: assessment.modifications,
        warnings: assessment.warnings,
        clearance_needed: assessment.clearanceNeeded,
        monitoring_required: assessment.monitoringRequired,
        assessed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging special population assessment:', error);
    }
  }
}

// Export singleton instance
export const specialPopulationSafetySystem = new SpecialPopulationSafetySystem();