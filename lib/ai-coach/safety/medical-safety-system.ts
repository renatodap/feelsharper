/**
 * Phase 5.8: Critical Safety Implementation
 * Medical red flag detection, emergency protocols, and professional referral system
 */

import { createClient } from '@/lib/supabase/server';

export interface MedicalRedFlag {
  id: string;
  category: 'cardiac' | 'metabolic' | 'musculoskeletal' | 'psychological' | 'neurological';
  severity: 'immediate' | 'urgent' | 'concerning';
  keywords: string[];
  patterns: RegExp[];
  description: string;
  immediateAction: string;
  referralType: 'emergency' | 'urgent_care' | 'primary_care' | 'specialist';
  followUpRequired: boolean;
}

export interface SafetyAssessment {
  userId: string;
  userInput: string;
  flagsDetected: MedicalRedFlag[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendedAction: 'continue' | 'caution' | 'stop_and_refer' | 'emergency';
  safetyResponse: string;
  followUpNeeded: boolean;
  documentationRequired: boolean;
}

export interface EmergencyProtocol {
  id: string;
  triggerConditions: string[];
  immediateActions: string[];
  emergencyContacts?: string[];
  documentationSteps: string[];
  followUpRequirements: string[];
}

export class MedicalSafetySystem {
  private supabase: any;
  private redFlags: MedicalRedFlag[];
  private emergencyProtocols: EmergencyProtocol[];

  constructor() {
    this.supabase = createClient();
    this.redFlags = this.initializeRedFlags();
    this.emergencyProtocols = this.initializeEmergencyProtocols();
  }

  /**
   * Primary safety screening for all user inputs
   */
  async screenForMedicalRisks(
    userId: string,
    userInput: string,
    context?: any
  ): Promise<SafetyAssessment> {
    try {
      // Detect red flags in user input
      const detectedFlags = this.detectRedFlags(userInput);

      // Calculate overall risk level
      const riskLevel = this.calculateRiskLevel(detectedFlags);

      // Generate appropriate safety response
      const safetyResponse = this.generateSafetyResponse(detectedFlags, riskLevel);

      // Determine recommended action
      const recommendedAction = this.determineRecommendedAction(detectedFlags, riskLevel);

      const assessment: SafetyAssessment = {
        userId,
        userInput,
        flagsDetected: detectedFlags,
        riskLevel,
        recommendedAction,
        safetyResponse,
        followUpNeeded: detectedFlags.some(flag => flag.followUpRequired),
        documentationRequired: riskLevel !== 'low'
      };

      // Log safety assessment for monitoring
      if (detectedFlags.length > 0) {
        await this.logSafetyAssessment(assessment);
      }

      // Trigger emergency protocols if needed
      if (recommendedAction === 'emergency') {
        await this.triggerEmergencyProtocol(assessment);
      }

      return assessment;

    } catch (error) {
      console.error('Error in medical safety screening:', error);
      
      // Fail safe - treat any error as high risk
      return {
        userId,
        userInput,
        flagsDetected: [],
        riskLevel: 'high',
        recommendedAction: 'stop_and_refer',
        safetyResponse: 'I want to ensure your safety. Please consult with a healthcare provider about your situation.',
        followUpNeeded: true,
        documentationRequired: true
      };
    }
  }

  /**
   * Chronic condition management safety checks
   */
  async assessChronicConditionRisks(
    userId: string,
    conditions: string[],
    proposedActivity: string
  ): Promise<{
    safe: boolean;
    modifications?: string[];
    warnings?: string[];
    clearanceNeeded?: boolean;
  }> {
    try {
      const riskAssessment = {
        safe: true,
        modifications: [] as string[],
        warnings: [] as string[],
        clearanceNeeded: false
      };

      for (const condition of conditions) {
        const conditionRisks = this.assessConditionSpecificRisks(condition, proposedActivity);
        
        if (!conditionRisks.safe) {
          riskAssessment.safe = false;
        }
        
        if (conditionRisks.modifications) {
          riskAssessment.modifications.push(...conditionRisks.modifications);
        }
        
        if (conditionRisks.warnings) {
          riskAssessment.warnings.push(...conditionRisks.warnings);
        }
        
        if (conditionRisks.clearanceNeeded) {
          riskAssessment.clearanceNeeded = true;
        }
      }

      // Log chronic condition assessment
      await this.supabase.from('chronic_condition_assessments').insert({
        user_id: userId,
        conditions,
        proposed_activity: proposedActivity,
        assessment_result: riskAssessment,
        assessed_at: new Date().toISOString()
      });

      return riskAssessment;

    } catch (error) {
      console.error('Error assessing chronic condition risks:', error);
      return {
        safe: false,
        warnings: ['Unable to assess safety. Please consult your healthcare provider.'],
        clearanceNeeded: true
      };
    }
  }

  /**
   * Medication interaction checking
   */
  async checkMedicationInteractions(
    userId: string,
    medications: string[],
    proposedNutrition?: string,
    proposedExercise?: string
  ): Promise<{
    interactions: Array<{
      medication: string;
      interaction: string;
      severity: 'mild' | 'moderate' | 'severe';
      recommendations: string[];
    }>;
    overallSafety: 'safe' | 'caution' | 'consult_provider';
  }> {
    try {
      const interactions = [];
      let maxSeverity = 'safe';

      // Check for common exercise-medication interactions
      if (proposedExercise) {
        for (const medication of medications) {
          const exerciseInteractions = this.checkExerciseMedicationInteractions(medication, proposedExercise);
          interactions.push(...exerciseInteractions);
          
          const severities = exerciseInteractions.map(i => i.severity);
          if (severities.includes('severe')) maxSeverity = 'consult_provider';
          else if (severities.includes('moderate') && maxSeverity === 'safe') maxSeverity = 'caution';
        }
      }

      // Check for nutrition-medication interactions
      if (proposedNutrition) {
        for (const medication of medications) {
          const nutritionInteractions = this.checkNutritionMedicationInteractions(medication, proposedNutrition);
          interactions.push(...nutritionInteractions);
          
          const severities = nutritionInteractions.map(i => i.severity);
          if (severities.includes('severe')) maxSeverity = 'consult_provider';
          else if (severities.includes('moderate') && maxSeverity === 'safe') maxSeverity = 'caution';
        }
      }

      const result = {
        interactions,
        overallSafety: maxSeverity as 'safe' | 'caution' | 'consult_provider'
      };

      // Log medication interaction check
      await this.supabase.from('medication_interaction_checks').insert({
        user_id: userId,
        medications,
        proposed_nutrition: proposedNutrition,
        proposed_exercise: proposedExercise,
        interaction_result: result,
        checked_at: new Date().toISOString()
      });

      return result;

    } catch (error) {
      console.error('Error checking medication interactions:', error);
      return {
        interactions: [],
        overallSafety: 'consult_provider'
      };
    }
  }

  /**
   * Injury detection and RICE protocol implementation
   */
  async assessInjuryRisk(
    userId: string,
    symptoms: string[],
    activityContext: string
  ): Promise<{
    injuryLikelihood: number;
    severity: 'minor' | 'moderate' | 'severe';
    recommendedAction: string;
    riceProtocol?: boolean;
    seekMedicalCare?: boolean;
  }> {
    try {
      let injuryLikelihood = 0;
      let severity: 'minor' | 'moderate' | 'severe' = 'minor';
      let riceProtocol = false;
      let seekMedicalCare = false;

      // Analyze symptoms for injury indicators
      const severeSymptoms = ['severe pain', 'inability to bear weight', 'deformity', 'numbness', 'tingling'];
      const moderateSymptoms = ['persistent pain', 'swelling', 'limited range of motion', 'instability'];
      const minorSymptoms = ['mild pain', 'stiffness', 'minor discomfort'];

      for (const symptom of symptoms) {
        if (severeSymptoms.some(severe => symptom.toLowerCase().includes(severe))) {
          injuryLikelihood = Math.max(injuryLikelihood, 90);
          severity = 'severe';
          seekMedicalCare = true;
        } else if (moderateSymptoms.some(moderate => symptom.toLowerCase().includes(moderate))) {
          injuryLikelihood = Math.max(injuryLikelihood, 60);
          if (severity !== 'severe') severity = 'moderate';
          riceProtocol = true;
        } else if (minorSymptoms.some(minor => symptom.toLowerCase().includes(minor))) {
          injuryLikelihood = Math.max(injuryLikelihood, 30);
        }
      }

      let recommendedAction = '';
      if (severity === 'severe') {
        recommendedAction = 'Stop all activity immediately and seek medical attention. Do not continue exercising.';
      } else if (severity === 'moderate') {
        recommendedAction = 'Rest and apply RICE protocol. Avoid activities that worsen symptoms. Consider medical evaluation if no improvement in 2-3 days.';
      } else {
        recommendedAction = 'Monitor symptoms. Gentle movement is okay if it doesn\'t increase pain. Rest if symptoms worsen.';
      }

      const assessment = {
        injuryLikelihood,
        severity,
        recommendedAction,
        riceProtocol,
        seekMedicalCare
      };

      // Log injury assessment
      await this.supabase.from('injury_assessments').insert({
        user_id: userId,
        symptoms,
        activity_context: activityContext,
        assessment_result: assessment,
        assessed_at: new Date().toISOString()
      });

      return assessment;

    } catch (error) {
      console.error('Error assessing injury risk:', error);
      return {
        injuryLikelihood: 50,
        severity: 'moderate',
        recommendedAction: 'Please consult a healthcare provider to assess your symptoms safely.',
        seekMedicalCare: true
      };
    }
  }

  /**
   * Overtraining monitoring system
   */
  async monitorOvertraining(
    userId: string,
    recentActivity: any[],
    selfReportedSymptoms: string[]
  ): Promise<{
    overtrainingRisk: number;
    recommendations: string[];
    forceRestDay?: boolean;
  }> {
    try {
      let overtrainingRisk = 0;
      const recommendations = [];

      // Analyze training volume and frequency
      const recentWorkouts = recentActivity.filter(a => a.activity_type === 'exercise');
      const last7Days = recentWorkouts.filter(w => 
        new Date(w.logged_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      // Check for excessive frequency
      if (last7Days.length > 6) {
        overtrainingRisk += 30;
        recommendations.push('Consider taking at least one full rest day per week');
      }

      // Check for symptoms
      const overtrainingSymptoms = [
        'persistent fatigue', 'decreased performance', 'increased injury rate',
        'mood changes', 'sleep disturbances', 'elevated resting heart rate',
        'loss of motivation', 'frequent illness'
      ];

      let symptomCount = 0;
      for (const symptom of selfReportedSymptoms) {
        if (overtrainingSymptoms.some(ots => symptom.toLowerCase().includes(ots))) {
          symptomCount++;
        }
      }

      overtrainingRisk += symptomCount * 15;

      if (symptomCount >= 3) {
        recommendations.push('Multiple overtraining symptoms detected. Consider reducing training intensity and volume.');
      }

      // Check for adequate recovery
      const recoveryActivities = recentActivity.filter(a => 
        a.activity_type === 'recovery' || a.activity_type === 'sleep'
      );
      
      if (recoveryActivities.length < last7Days.length * 0.5) {
        overtrainingRisk += 20;
        recommendations.push('Increase recovery activities (sleep, stretching, rest days)');
      }

      const result = {
        overtrainingRisk,
        recommendations,
        forceRestDay: overtrainingRisk > 70
      };

      // Log overtraining assessment
      await this.supabase.from('overtraining_assessments').insert({
        user_id: userId,
        recent_activity_count: recentActivity.length,
        symptoms: selfReportedSymptoms,
        assessment_result: result,
        assessed_at: new Date().toISOString()
      });

      return result;

    } catch (error) {
      console.error('Error monitoring overtraining:', error);
      return {
        overtrainingRisk: 0,
        recommendations: ['Unable to assess overtraining risk. Listen to your body and rest if needed.']
      };
    }
  }

  // Private helper methods

  private initializeRedFlags(): MedicalRedFlag[] {
    return [
      // Cardiac red flags
      {
        id: 'chest_pain_exercise',
        category: 'cardiac',
        severity: 'immediate',
        keywords: ['chest pain', 'chest pressure', 'chest tightness', 'heart pain'],
        patterns: [/chest.*pain.*exercise/i, /pain.*chest.*workout/i, /heart.*hurts.*running/i],
        description: 'Chest pain during or after exercise',
        immediateAction: 'Stop all exercise immediately. Seek emergency medical attention.',
        referralType: 'emergency',
        followUpRequired: true
      },
      {
        id: 'cardiac_symptoms',
        category: 'cardiac',
        severity: 'immediate',
        keywords: ['heart racing', 'palpitations', 'shortness of breath', 'dizziness'],
        patterns: [/heart.*racing.*exercise/i, /dizzy.*workout/i, /can\'t breathe.*running/i],
        description: 'Cardiac symptoms during exercise',
        immediateAction: 'Stop exercise and rest. If symptoms persist, seek medical attention.',
        referralType: 'urgent_care',
        followUpRequired: true
      },

      // Extreme restriction red flags
      {
        id: 'severe_restriction',
        category: 'psychological',
        severity: 'urgent',
        keywords: ['500 calories', '600 calories', 'barely eating', 'not eating'],
        patterns: [/eating.*[1-6]\d{2}.*calories/i, /only.*\d{2,3}.*calories/i],
        description: 'Severely restrictive eating patterns',
        immediateAction: 'This level of restriction is dangerous. Please consult a healthcare provider.',
        referralType: 'urgent_care',
        followUpRequired: true
      },

      // Injury red flags
      {
        id: 'severe_pain',
        category: 'musculoskeletal',
        severity: 'urgent',
        keywords: ['severe pain', 'excruciating pain', 'unbearable pain', 'can\'t move'],
        patterns: [/severe.*pain/i, /excruciating.*pain/i, /can\'t.*move/i],
        description: 'Severe pain indicating possible serious injury',
        immediateAction: 'Stop all activity. Seek medical evaluation for severe pain.',
        referralType: 'urgent_care',
        followUpRequired: true
      },

      // Mental health red flags
      {
        id: 'self_harm_ideation',
        category: 'psychological',
        severity: 'immediate',
        keywords: ['want to hurt myself', 'self harm', 'suicidal', 'end it all'],
        patterns: [/want.*hurt.*myself/i, /thoughts.*suicide/i, /self.*harm/i],
        description: 'Self-harm or suicidal ideation',
        immediateAction: 'Please reach out for immediate support. Contact emergency services or crisis hotline.',
        referralType: 'emergency',
        followUpRequired: true
      }
    ];
  }

  private initializeEmergencyProtocols(): EmergencyProtocol[] {
    return [
      {
        id: 'cardiac_emergency',
        triggerConditions: ['chest_pain_exercise', 'cardiac_symptoms'],
        immediateActions: [
          'Instruct user to stop all physical activity immediately',
          'Advise to call emergency services if symptoms are severe',
          'Recommend sitting or lying down in comfortable position',
          'Document all symptoms and timing'
        ],
        documentationSteps: [
          'Record exact symptoms reported',
          'Note time of symptom onset',
          'Document activity being performed',
          'Log user response to instructions'
        ],
        followUpRequirements: [
          'Require medical clearance before resuming exercise',
          'Check in within 24 hours if possible',
          'Update safety profile with incident'
        ]
      },
      {
        id: 'eating_disorder_emergency',
        triggerConditions: ['severe_restriction', 'self_harm_ideation'],
        immediateActions: [
          'Express immediate concern for safety',
          'Provide eating disorder helpline resources',
          'Recommend immediate professional evaluation',
          'Do not provide any nutrition advice'
        ],
        documentationSteps: [
          'Document concerning eating behaviors',
          'Record any body image distortions mentioned',
          'Note duration of restrictive patterns',
          'Log referral resources provided'
        ],
        followUpRequirements: [
          'Require professional clearance for nutrition guidance',
          'Monitor for continued concerning behaviors',
          'Provide ongoing mental health resources'
        ]
      }
    ];
  }

  private detectRedFlags(userInput: string): MedicalRedFlag[] {
    const detectedFlags = [];

    for (const flag of this.redFlags) {
      // Check keyword matches
      const hasKeywordMatch = flag.keywords.some(keyword => 
        userInput.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check pattern matches
      const hasPatternMatch = flag.patterns.some(pattern => 
        pattern.test(userInput)
      );

      if (hasKeywordMatch || hasPatternMatch) {
        detectedFlags.push(flag);
      }
    }

    return detectedFlags;
  }

  private calculateRiskLevel(flags: MedicalRedFlag[]): SafetyAssessment['riskLevel'] {
    if (flags.some(flag => flag.severity === 'immediate')) {
      return 'critical';
    }
    if (flags.some(flag => flag.severity === 'urgent')) {
      return 'high';
    }
    if (flags.some(flag => flag.severity === 'concerning')) {
      return 'moderate';
    }
    return 'low';
  }

  private generateSafetyResponse(flags: MedicalRedFlag[], riskLevel: string): string {
    if (flags.length === 0) {
      return ''; // No safety response needed
    }

    // Use the most severe flag's immediate action
    const mostSevereFlag = flags.reduce((prev, current) => {
      const severityOrder = { immediate: 3, urgent: 2, concerning: 1 };
      return severityOrder[current.severity as keyof typeof severityOrder] > 
             severityOrder[prev.severity as keyof typeof severityOrder] ? current : prev;
    });

    return `🚨 Safety Notice: ${mostSevereFlag.immediateAction} Your health and safety are my top priority.`;
  }

  private determineRecommendedAction(
    flags: MedicalRedFlag[], 
    riskLevel: string
  ): SafetyAssessment['recommendedAction'] {
    if (flags.some(flag => flag.referralType === 'emergency')) {
      return 'emergency';
    }
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return 'stop_and_refer';
    }
    if (riskLevel === 'moderate') {
      return 'caution';
    }
    return 'continue';
  }

  private async logSafetyAssessment(assessment: SafetyAssessment): Promise<void> {
    try {
      await this.supabase.from('safety_assessments').insert({
        user_id: assessment.userId,
        user_input: assessment.userInput,
        flags_detected: assessment.flagsDetected.map(f => f.id),
        risk_level: assessment.riskLevel,
        recommended_action: assessment.recommendedAction,
        assessed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging safety assessment:', error);
    }
  }

  private async triggerEmergencyProtocol(assessment: SafetyAssessment): Promise<void> {
    try {
      const relevantProtocols = this.emergencyProtocols.filter(protocol =>
        assessment.flagsDetected.some(flag => 
          protocol.triggerConditions.includes(flag.id)
        )
      );

      for (const protocol of relevantProtocols) {
        // Log emergency protocol activation
        await this.supabase.from('emergency_protocol_activations').insert({
          user_id: assessment.userId,
          protocol_id: protocol.id,
          trigger_flags: assessment.flagsDetected.map(f => f.id),
          activated_at: new Date().toISOString()
        });

        // Execute protocol steps (in real implementation, this might include
        // notifications to supervisors, logging to medical systems, etc.)
        console.warn(`Emergency protocol activated: ${protocol.id} for user ${assessment.userId}`);
      }
    } catch (error) {
      console.error('Error triggering emergency protocol:', error);
    }
  }

  private assessConditionSpecificRisks(condition: string, activity: string): any {
    const conditionRisks: { [key: string]: any } = {
      'diabetes': {
        safe: true,
        modifications: ['Monitor blood sugar before/after exercise', 'Keep glucose tablets available'],
        warnings: ['Watch for hypoglycemic symptoms'],
        clearanceNeeded: false
      },
      'hypertension': {
        safe: !activity.includes('high intensity'),
        modifications: ['Avoid holding breath during exercise', 'Monitor blood pressure'],
        warnings: ['Stop if experiencing headache or dizziness'],
        clearanceNeeded: activity.includes('high intensity')
      },
      'heart disease': {
        safe: false,
        modifications: [],
        warnings: ['Cardiac clearance required'],
        clearanceNeeded: true
      }
    };

    return conditionRisks[condition.toLowerCase()] || {
      safe: false,
      warnings: ['Please consult your healthcare provider'],
      clearanceNeeded: true
    };
  }

  private checkExerciseMedicationInteractions(medication: string, exercise: string): any[] {
    // Simplified medication interaction checking
    const interactions: { [key: string]: any } = {
      'beta_blockers': [{
        medication: 'beta blockers',
        interaction: 'May reduce heart rate response to exercise',
        severity: 'moderate' as const,
        recommendations: ['Monitor perceived exertion instead of heart rate', 'Start slowly']
      }],
      'blood_pressure_medication': [{
        medication: 'blood pressure medication',
        interaction: 'Risk of hypotension with sudden position changes',
        severity: 'moderate' as const,
        recommendations: ['Change positions slowly', 'Stay hydrated']
      }]
    };

    const medicationKey = medication.toLowerCase().replace(' ', '_');
    return interactions[medicationKey] || [];
  }

  private checkNutritionMedicationInteractions(medication: string, nutrition: string): any[] {
    // Simplified nutrition-medication interaction checking
    return []; // Would implement specific interactions
  }
}

// Export singleton instance
export const medicalSafetySystem = new MedicalSafetySystem();