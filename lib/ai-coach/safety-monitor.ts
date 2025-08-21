/**
 * Safety Monitor - Critical health and safety detection system
 * Implements Rules #21-35 for comprehensive user protection
 */

import { ActivityLog, UserProfile } from './types';

// Medical red flags that require immediate attention
const MEDICAL_RED_FLAGS = {
  critical: [
    /chest\s*(pain|pressure|tightness)/i,
    /difficulty\s*breathing|shortness\s*of\s*breath/i,
    /dizzy|faint|lightheaded/i,
    /blood\s*in\s*(stool|urine|vomit)/i,
    /severe\s*headache|vision\s*changes/i,
    /numb|tingling|weakness/i,
    /irregular\s*heartbeat|palpitations/i,
    /severe\s*abdominal\s*pain/i
  ],
  concerning: [
    /persistent\s*pain/i,
    /swelling\s*that\s*won't\s*go\s*away/i,
    /unexplained\s*weight\s*loss/i,
    /chronic\s*fatigue/i,
    /frequent\s*infections/i
  ]
};

// Overtraining indicators
const OVERTRAINING_MARKERS = {
  objective: {
    restingHRIncrease: 5, // bpm above baseline
    hrvDecrease: 20, // % below baseline
    performanceDrop: 5, // % decrease
    weightLoss: 2 // % in a week
  },
  subjective: {
    mood: ['irritable', 'depressed', 'anxious'],
    sleep: ['insomnia', 'restless', 'not refreshing'],
    motivation: ['no desire', 'dreading workouts'],
    soreness: ['persistent', 'not recovering', 'getting worse']
  }
};

export interface SafetyCheckResult {
  safe: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  issue?: string;
  recommendation: string;
  requiresMedicalAttention: boolean;
  blockActivity: boolean;
}

export interface OvertrainingScore {
  score: number; // 0-100, higher = more overtrained
  status: 'green' | 'yellow' | 'red';
  recommendation: string;
  metrics: {
    restingHR?: number;
    hrv?: number;
    performance?: number;
    mood?: number;
    sleep?: number;
    soreness?: number;
  };
}

export class SafetyMonitor {
  /**
   * Check for medical red flags in user input
   */
  checkMedicalRedFlags(input: string): SafetyCheckResult {
    // Check critical symptoms
    for (const pattern of MEDICAL_RED_FLAGS.critical) {
      if (pattern.test(input)) {
        return {
          safe: false,
          severity: 'critical',
          issue: 'Medical emergency symptoms detected',
          recommendation: 'Stop all activity immediately and seek emergency medical care. If symptoms are severe, call emergency services.',
          requiresMedicalAttention: true,
          blockActivity: true
        };
      }
    }
    
    // Check concerning symptoms
    for (const pattern of MEDICAL_RED_FLAGS.concerning) {
      if (pattern.test(input)) {
        return {
          safe: false,
          severity: 'high',
          issue: 'Concerning symptoms detected',
          recommendation: 'Please consult with your healthcare provider before continuing your training plan.',
          requiresMedicalAttention: true,
          blockActivity: true
        };
      }
    }
    
    return {
      safe: true,
      severity: 'none',
      recommendation: '',
      requiresMedicalAttention: false,
      blockActivity: false
    };
  }
  
  /**
   * Detect injury patterns and provide RICE protocol if needed
   */
  detectInjury(input: string): SafetyCheckResult {
    const acuteInjuryPatterns = [
      /sharp\s*pain/i,
      /pop|snap\s*sound/i,
      /sudden\s*swelling/i,
      /can't\s*bear\s*weight/i,
      /joint\s*instability/i
    ];
    
    const chronicInjuryPatterns = [
      /pain\s*(for|lasting)\s*\d+\s*weeks/i,
      /getting\s*worse/i,
      /pain\s*at\s*rest/i,
      /night\s*pain/i
    ];
    
    // Check for acute injury
    for (const pattern of acuteInjuryPatterns) {
      if (pattern.test(input)) {
        return {
          safe: false,
          severity: 'high',
          issue: 'Acute injury detected',
          recommendation: `Follow RICE protocol:
• Rest: Stop activity immediately
• Ice: 20 minutes every 2-3 hours for 48 hours
• Compression: Wrap if appropriate
• Elevation: Above heart level if possible
See a doctor if not improving in 48 hours.`,
          requiresMedicalAttention: true,
          blockActivity: true
        };
      }
    }
    
    // Check for chronic injury
    for (const pattern of chronicInjuryPatterns) {
      if (pattern.test(input)) {
        return {
          safe: false,
          severity: 'medium',
          issue: 'Chronic injury pattern detected',
          recommendation: 'This appears to be a chronic issue. You need professional assessment from a physical therapist or sports medicine doctor. Work around the injury, not through it.',
          requiresMedicalAttention: true,
          blockActivity: false
        };
      }
    }
    
    return {
      safe: true,
      severity: 'none',
      recommendation: '',
      requiresMedicalAttention: false,
      blockActivity: false
    };
  }
  
  /**
   * Calculate overtraining score based on recent data
   */
  calculateOvertrainingScore(
    recentLogs: ActivityLog[],
    userProfile: UserProfile
  ): OvertrainingScore {
    let score = 0;
    const metrics: any = {};
    
    // Analyze last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentData = recentLogs.filter(
      log => log.timestamp > sevenDaysAgo
    );
    
    // Check resting HR elevation (if available)
    const hrLogs = recentData.filter(log => log.data?.restingHR);
    if (hrLogs.length > 0 && userProfile.health?.resting_hr) {
      const avgRestingHR = hrLogs.reduce((sum, log) => sum + log.data.restingHR, 0) / hrLogs.length;
      const increase = avgRestingHR - userProfile.health.resting_hr;
      if (increase > OVERTRAINING_MARKERS.objective.restingHRIncrease) {
        score += 20;
        metrics.restingHR = increase;
      }
    }
    
    // Check mood patterns
    const moodLogs = recentData.filter(log => log.type === 'mood');
    const negativeMoods = moodLogs.filter(log => 
      OVERTRAINING_MARKERS.subjective.mood.some(mood => 
        log.originalText.toLowerCase().includes(mood)
      )
    );
    if (negativeMoods.length > moodLogs.length * 0.5) {
      score += 15;
      metrics.mood = negativeMoods.length / moodLogs.length;
    }
    
    // Check sleep quality
    const sleepLogs = recentData.filter(log => log.type === 'sleep');
    const poorSleep = sleepLogs.filter(log => 
      log.data?.quality < 5 || 
      OVERTRAINING_MARKERS.subjective.sleep.some(pattern =>
        log.originalText.toLowerCase().includes(pattern)
      )
    );
    if (poorSleep.length > sleepLogs.length * 0.5) {
      score += 15;
      metrics.sleep = poorSleep.length / sleepLogs.length;
    }
    
    // Check persistent soreness
    const sorenessmentions = recentData.filter(log =>
      /sore|aching|pain|hurt/i.test(log.originalText)
    );
    if (sorenessmentions.length > 4) {
      score += 20;
      metrics.soreness = sorenessmentions.length;
    }
    
    // Check training load (simplified - would need more complex calculation)
    const workoutLogs = recentData.filter(log => 
      log.type === 'exercise' && log.data?.intensity > 7
    );
    if (workoutLogs.length > 5) {
      score += 10;
    }
    
    // Determine status and recommendation
    let status: 'green' | 'yellow' | 'red';
    let recommendation: string;
    
    if (score >= 60) {
      status = 'red';
      recommendation = `High overtraining risk detected. Immediate actions:
1. Take 3-5 days complete rest
2. Focus on sleep (9+ hours)
3. Increase calories by 300-500
4. Consider blood work if symptoms persist
5. Gradual return to training over 1-2 weeks`;
    } else if (score >= 35) {
      status = 'yellow';
      recommendation = `Moderate fatigue detected. Adjustments needed:
1. Reduce training intensity to 70% for 2-3 days
2. Maintain routine but make it easier
3. Prioritize sleep and nutrition
4. Add stress management activities`;
    } else {
      status = 'green';
      recommendation = 'Recovery looks good. Continue monitoring and ensure adequate rest between hard sessions.';
    }
    
    return {
      score,
      status,
      recommendation,
      metrics
    };
  }
  
  /**
   * Check for chronic condition conflicts
   */
  checkChronicConditions(
    userProfile: UserProfile,
    plannedActivity: string
  ): SafetyCheckResult {
    const conditions = userProfile.health?.conditions || [];
    
    if (conditions.includes('diabetes')) {
      if (/fasting|no.*food/i.test(plannedActivity)) {
        return {
          safe: false,
          severity: 'medium',
          issue: 'Diabetes safety concern',
          recommendation: 'With diabetes, fasting workouts are not recommended. Check blood sugar and have 15-30g carbs if below 100mg/dL.',
          requiresMedicalAttention: false,
          blockActivity: true
        };
      }
    }
    
    if (conditions.includes('heart_disease')) {
      if (/high.*intensity|hiit|sprint/i.test(plannedActivity)) {
        return {
          safe: false,
          severity: 'high',
          issue: 'Heart disease precaution',
          recommendation: 'With heart disease, high-intensity exercise requires medical clearance. Stay within prescribed heart rate zones.',
          requiresMedicalAttention: true,
          blockActivity: true
        };
      }
    }
    
    if (conditions.includes('asthma')) {
      const warning = 'With asthma, use prescribed inhaler 15 minutes before exercise if recommended by your doctor. Stop if you experience wheezing or chest tightness.';
      return {
        safe: true,
        severity: 'low',
        recommendation: warning,
        requiresMedicalAttention: false,
        blockActivity: false
      };
    }
    
    return {
      safe: true,
      severity: 'none',
      recommendation: '',
      requiresMedicalAttention: false,
      blockActivity: false
    };
  }
  
  /**
   * Check medication interactions
   */
  checkMedicationInteractions(
    userProfile: UserProfile,
    plannedActivity: string,
    plannedNutrition?: string
  ): SafetyCheckResult {
    const medications = userProfile.health?.medications || [];
    
    if (medications.includes('beta_blockers')) {
      if (/heart.*rate.*zone/i.test(plannedActivity)) {
        return {
          safe: true,
          severity: 'low',
          recommendation: 'Beta blockers affect heart rate. Use perceived exertion (RPE) instead of heart rate zones for training intensity.',
          requiresMedicalAttention: false,
          blockActivity: false
        };
      }
    }
    
    if (medications.includes('blood_thinners')) {
      if (/contact|martial|boxing/i.test(plannedActivity)) {
        return {
          safe: false,
          severity: 'high',
          issue: 'Blood thinner safety',
          recommendation: 'Contact sports are not recommended while on blood thinners due to bleeding risk.',
          requiresMedicalAttention: false,
          blockActivity: true
        };
      }
    }
    
    if (medications.includes('metformin') && plannedNutrition) {
      if (/high.*intensity/i.test(plannedActivity)) {
        return {
          safe: true,
          severity: 'low',
          recommendation: 'Metformin may cause stomach upset with intense exercise. Consider timing dose after workout.',
          requiresMedicalAttention: false,
          blockActivity: false
        };
      }
    }
    
    return {
      safe: true,
      severity: 'none',
      recommendation: '',
      requiresMedicalAttention: false,
      blockActivity: false
    };
  }
  
  /**
   * Comprehensive safety check combining all monitors
   */
  async performComprehensiveSafetyCheck(
    input: string,
    userProfile: UserProfile,
    recentLogs: ActivityLog[]
  ): Promise<{
    safe: boolean;
    checks: SafetyCheckResult[];
    overtraining: OvertrainingScore;
    finalRecommendation: string;
  }> {
    const checks: SafetyCheckResult[] = [];
    
    // Run all safety checks
    checks.push(this.checkMedicalRedFlags(input));
    checks.push(this.detectInjury(input));
    checks.push(this.checkChronicConditions(userProfile, input));
    checks.push(this.checkMedicationInteractions(userProfile, input));
    
    // Calculate overtraining score
    const overtraining = this.calculateOvertrainingScore(recentLogs, userProfile);
    
    // Determine if safe to proceed
    const safe = checks.every(check => check.safe) && overtraining.status !== 'red';
    
    // Build final recommendation
    const criticalIssues = checks.filter(c => c.severity === 'critical');
    const highIssues = checks.filter(c => c.severity === 'high');
    
    let finalRecommendation = '';
    if (criticalIssues.length > 0) {
      finalRecommendation = criticalIssues[0].recommendation;
    } else if (highIssues.length > 0) {
      finalRecommendation = highIssues[0].recommendation;
    } else if (overtraining.status === 'red') {
      finalRecommendation = overtraining.recommendation;
    } else {
      finalRecommendation = 'All safety checks passed. Proceed with your planned activity while listening to your body.';
    }
    
    return {
      safe,
      checks,
      overtraining,
      finalRecommendation
    };
  }
}

// Export singleton instance
export const safetyMonitor = new SafetyMonitor();