/**
 * Sport-Specific Dashboard Presets Implementation
 * TDD Step 5: Implementation to pass tests
 */

import { UserPersonaType, DASHBOARD_WIDGETS } from '@/lib/ai-coach/types';
import { DashboardPreset, WidgetConfig, LayoutConfig } from './types';

/**
 * Default layout configuration for all presets
 */
const defaultLayout: LayoutConfig = {
  type: 'grid',
  columns: 4,
  gap: 16,
  responsive: true,
  breakpoints: [
    { maxWidth: 640, columns: 1, gap: 8 },
    { maxWidth: 768, columns: 2, gap: 12 },
    { maxWidth: 1024, columns: 3, gap: 14 }
  ]
};

/**
 * Endurance athlete dashboard preset
 */
const endurancePreset: DashboardPreset = {
  id: 'preset-endurance',
  name: 'Endurance Athlete',
  persona: UserPersonaType.ENDURANCE,
  description: 'Optimized for runners, cyclists, and triathletes',
  primaryWidgets: [
    {
      id: 'endurance-hr-zones',
      type: DASHBOARD_WIDGETS.HR_ZONES,
      size: 'medium',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Heart Rate Zones',
      refreshInterval: 60000
    },
    {
      id: 'endurance-training-load',
      type: DASHBOARD_WIDGETS.TRAINING_LOAD,
      size: 'large',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Training Load',
      refreshInterval: 300000
    },
    {
      id: 'endurance-weekly-volume',
      type: DASHBOARD_WIDGETS.WEEKLY_VOLUME,
      size: 'medium',
      position: { row: 1, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Weekly Volume'
    },
    {
      id: 'endurance-vo2max',
      type: DASHBOARD_WIDGETS.VO2_MAX,
      size: 'small',
      position: { row: 1, col: 2 },
      dataSource: 'fitness_metrics',
      title: 'VO2 Max Estimate'
    },
    {
      id: 'endurance-recovery',
      type: DASHBOARD_WIDGETS.RECOVERY_METRICS,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'recovery',
      title: 'Recovery Status'
    }
  ],
  secondaryWidgets: [
    {
      id: 'endurance-weekly-summary',
      type: DASHBOARD_WIDGETS.WEEKLY_SUMMARY,
      size: 'full',
      position: { row: 2, col: 0, colSpan: 4 },
      dataSource: 'workouts',
      title: 'Weekly Summary'
    }
  ],
  layout: defaultLayout,
  customizable: true,
  iconName: 'running'
};

/**
 * Strength athlete dashboard preset
 */
const strengthPreset: DashboardPreset = {
  id: 'preset-strength',
  name: 'Strength Athlete',
  persona: UserPersonaType.STRENGTH,
  description: 'Optimized for powerlifters and bodybuilders',
  primaryWidgets: [
    {
      id: 'strength-prs',
      type: DASHBOARD_WIDGETS.PERSONAL_RECORDS,
      size: 'large',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Personal Records',
      refreshInterval: 60000
    },
    {
      id: 'strength-volume',
      type: DASHBOARD_WIDGETS.VOLUME_PROGRESSION,
      size: 'medium',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Volume Progression'
    },
    {
      id: 'strength-protein',
      type: DASHBOARD_WIDGETS.PROTEIN_INTAKE,
      size: 'small',
      position: { row: 1, col: 0 },
      dataSource: 'nutrition',
      title: 'Protein Intake'
    },
    {
      id: 'strength-body-comp',
      type: DASHBOARD_WIDGETS.BODY_COMPOSITION,
      size: 'medium',
      position: { row: 1, col: 1, colSpan: 2 },
      dataSource: 'body_metrics',
      title: 'Body Composition'
    },
    {
      id: 'strength-balance',
      type: DASHBOARD_WIDGETS.STRENGTH_BALANCE,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'workouts',
      title: 'Muscle Balance'
    }
  ],
  secondaryWidgets: [
    {
      id: 'strength-measurements',
      type: DASHBOARD_WIDGETS.BODY_MEASUREMENTS,
      size: 'medium',
      position: { row: 2, col: 0, colSpan: 2 },
      dataSource: 'body_metrics',
      title: 'Body Measurements'
    },
    {
      id: 'strength-goals',
      type: DASHBOARD_WIDGETS.GOALS_PROGRESS,
      size: 'medium',
      position: { row: 2, col: 2, colSpan: 2 },
      dataSource: 'goals',
      title: 'Goals Progress'
    }
  ],
  layout: defaultLayout,
  customizable: true,
  iconName: 'dumbbell'
};

/**
 * Sport athlete dashboard preset
 */
const sportPreset: DashboardPreset = {
  id: 'preset-sport',
  name: 'Sport Athlete',
  persona: UserPersonaType.SPORT,
  description: 'Optimized for tennis, basketball, soccer players',
  primaryWidgets: [
    {
      id: 'sport-hours',
      type: DASHBOARD_WIDGETS.PRACTICE_HOURS,
      size: 'medium',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Practice Hours'
    },
    {
      id: 'sport-performance',
      type: DASHBOARD_WIDGETS.PERFORMANCE_RATING,
      size: 'medium',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'performance',
      title: 'Performance Rating'
    },
    {
      id: 'sport-win-loss',
      type: DASHBOARD_WIDGETS.WIN_LOSS_RECORD,
      size: 'small',
      position: { row: 1, col: 0 },
      dataSource: 'matches',
      title: 'Win/Loss'
    },
    {
      id: 'sport-skills',
      type: DASHBOARD_WIDGETS.SKILL_PROGRESSION,
      size: 'medium',
      position: { row: 1, col: 1, colSpan: 2 },
      dataSource: 'skills',
      title: 'Skill Progression'
    },
    {
      id: 'sport-mood',
      type: DASHBOARD_WIDGETS.MOOD_TRACKING,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'wellness',
      title: 'Mood & Energy'
    }
  ],
  secondaryWidgets: [
    {
      id: 'sport-recovery',
      type: DASHBOARD_WIDGETS.RECOVERY_METRICS,
      size: 'medium',
      position: { row: 2, col: 0, colSpan: 2 },
      dataSource: 'recovery',
      title: 'Recovery Between Games'
    },
    {
      id: 'sport-habits',
      type: DASHBOARD_WIDGETS.HABIT_TRACKER,
      size: 'medium',
      position: { row: 2, col: 2, colSpan: 2 },
      dataSource: 'habits',
      title: 'Training Habits'
    }
  ],
  layout: defaultLayout,
  customizable: true,
  iconName: 'trophy'
};

/**
 * Professional/busy person dashboard preset
 */
const professionalPreset: DashboardPreset = {
  id: 'preset-professional',
  name: 'Busy Professional',
  persona: UserPersonaType.PROFESSIONAL,
  description: 'Optimized for time-efficient fitness tracking',
  primaryWidgets: [
    {
      id: 'prof-quick-stats',
      type: DASHBOARD_WIDGETS.QUICK_STATS,
      size: 'large',
      position: { row: 0, col: 0, colSpan: 4 },
      dataSource: 'summary',
      title: 'Quick Stats Overview'
    },
    {
      id: 'prof-streak',
      type: DASHBOARD_WIDGETS.EXERCISE_STREAK,
      size: 'small',
      position: { row: 1, col: 0 },
      dataSource: 'workouts',
      title: 'Exercise Streak'
    },
    {
      id: 'prof-energy',
      type: DASHBOARD_WIDGETS.ENERGY_LEVELS,
      size: 'small',
      position: { row: 1, col: 1 },
      dataSource: 'wellness',
      title: 'Energy Levels'
    },
    {
      id: 'prof-weekly',
      type: DASHBOARD_WIDGETS.WEEKLY_SUMMARY,
      size: 'medium',
      position: { row: 1, col: 2, colSpan: 2 },
      dataSource: 'workouts',
      title: 'This Week'
    }
  ],
  secondaryWidgets: [
    {
      id: 'prof-habits',
      type: DASHBOARD_WIDGETS.HABIT_TRACKER,
      size: 'full',
      position: { row: 2, col: 0, colSpan: 4 },
      dataSource: 'habits',
      title: 'Healthy Habits'
    }
  ],
  layout: {
    ...defaultLayout,
    columns: 4,
    gap: 12
  },
  customizable: true,
  iconName: 'briefcase'
};

/**
 * Weight management focused dashboard preset
 */
const weightManagementPreset: DashboardPreset = {
  id: 'preset-weight-mgmt',
  name: 'Weight Management',
  persona: UserPersonaType.WEIGHT_MGMT,
  description: 'Optimized for weight loss and body transformation',
  primaryWidgets: [
    {
      id: 'weight-progress',
      type: DASHBOARD_WIDGETS.WEIGHT_PROGRESS,
      size: 'large',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'body_metrics',
      title: 'Weight Progress',
      refreshInterval: 86400000 // Daily
    },
    {
      id: 'weight-calories',
      type: DASHBOARD_WIDGETS.CALORIE_BALANCE,
      size: 'medium',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'nutrition',
      title: 'Calorie Balance'
    },
    {
      id: 'weight-nutrition',
      type: DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
      size: 'medium',
      position: { row: 1, col: 0, colSpan: 2 },
      dataSource: 'nutrition',
      title: 'Nutrition Breakdown'
    },
    {
      id: 'weight-measurements',
      type: DASHBOARD_WIDGETS.BODY_MEASUREMENTS,
      size: 'small',
      position: { row: 1, col: 2 },
      dataSource: 'body_metrics',
      title: 'Measurements'
    },
    {
      id: 'weight-photos',
      type: DASHBOARD_WIDGETS.PROGRESS_PHOTOS,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'photos',
      title: 'Progress Photos'
    }
  ],
  secondaryWidgets: [
    {
      id: 'weight-trend',
      type: DASHBOARD_WIDGETS.WEIGHT_TREND,
      size: 'full',
      position: { row: 2, col: 0, colSpan: 4 },
      dataSource: 'body_metrics',
      title: 'Weight Trend Analysis'
    }
  ],
  layout: defaultLayout,
  customizable: true,
  iconName: 'scale'
};

/**
 * All default presets
 */
const defaultPresets: DashboardPreset[] = [
  endurancePreset,
  strengthPreset,
  sportPreset,
  professionalPreset,
  weightManagementPreset
];

/**
 * Get preset by persona type
 */
export function getPresetByPersona(persona: UserPersonaType): DashboardPreset | undefined {
  return defaultPresets.find(preset => preset.persona === persona);
}

/**
 * Get all default presets
 */
export function getDefaultPresets(): DashboardPreset[] {
  return defaultPresets;
}

/**
 * Validate preset configuration
 */
export function validatePresetConfiguration(preset: DashboardPreset): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const occupiedPositions = new Set<string>();

  // Check for widget position overlaps
  for (const widget of [...preset.primaryWidgets, ...preset.secondaryWidgets]) {
    const { row, col, rowSpan = 1, colSpan = 1 } = widget.position;
    
    // Check if widget exceeds column bounds
    if (col + colSpan > preset.layout.columns) {
      errors.push('Widget exceeds column bounds');
    }

    // Check for position overlaps
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        const posKey = `${r}-${c}`;
        if (occupiedPositions.has(posKey)) {
          errors.push('Widget positions overlap');
          break;
        }
        occupiedPositions.add(posKey);
      }
    }
  }

  // Check for duplicate widget IDs
  const widgetIds = [...preset.primaryWidgets, ...preset.secondaryWidgets].map(w => w.id);
  const uniqueIds = new Set(widgetIds);
  if (widgetIds.length !== uniqueIds.size) {
    errors.push('Duplicate widget IDs found');
  }

  // Check for required fields
  if (!preset.id || !preset.name || !preset.persona) {
    errors.push('Missing required preset fields');
  }

  // Check layout configuration
  if (preset.layout.columns < 1 || preset.layout.columns > 12) {
    errors.push('Invalid column count (must be 1-12)');
  }

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)] // Remove duplicates
  };
}

/**
 * Create a custom preset based on an existing one
 */
export function createCustomPreset(
  basePreset: DashboardPreset,
  name: string,
  widgets: WidgetConfig[]
): DashboardPreset {
  return {
    ...basePreset,
    id: `custom-${Date.now()}`,
    name,
    primaryWidgets: widgets,
    secondaryWidgets: [],
    customizable: true
  };
}

/**
 * Get widget catalog for adding new widgets
 */
export function getWidgetCatalog() {
  return [
    // Performance widgets
    {
      type: DASHBOARD_WIDGETS.HR_ZONES,
      name: 'Heart Rate Zones',
      category: 'performance' as const,
      description: 'Distribution of time spent in each heart rate zone',
      requiredData: ['heart_rate'],
      defaultSize: 'medium' as const
    },
    {
      type: DASHBOARD_WIDGETS.TRAINING_LOAD,
      name: 'Training Load',
      category: 'performance' as const,
      description: 'Weekly training stress and recovery balance',
      requiredData: ['workouts'],
      defaultSize: 'large' as const
    },
    {
      type: DASHBOARD_WIDGETS.VO2_MAX,
      name: 'VO2 Max',
      category: 'performance' as const,
      description: 'Estimated maximum oxygen uptake',
      requiredData: ['heart_rate', 'pace'],
      defaultSize: 'small' as const
    },
    // Nutrition widgets
    {
      type: DASHBOARD_WIDGETS.PROTEIN_INTAKE,
      name: 'Protein Intake',
      category: 'nutrition' as const,
      description: 'Daily protein consumption tracking',
      requiredData: ['nutrition'],
      defaultSize: 'small' as const
    },
    {
      type: DASHBOARD_WIDGETS.CALORIE_BALANCE,
      name: 'Calorie Balance',
      category: 'nutrition' as const,
      description: 'Calories in vs calories out',
      requiredData: ['nutrition', 'workouts'],
      defaultSize: 'medium' as const
    },
    {
      type: DASHBOARD_WIDGETS.NUTRITION_BREAKDOWN,
      name: 'Nutrition Breakdown',
      category: 'nutrition' as const,
      description: 'Macronutrient distribution',
      requiredData: ['nutrition'],
      defaultSize: 'medium' as const
    },
    // Progress widgets
    {
      type: DASHBOARD_WIDGETS.WEIGHT_PROGRESS,
      name: 'Weight Progress',
      category: 'progress' as const,
      description: 'Weight change over time',
      requiredData: ['weight'],
      defaultSize: 'large' as const
    },
    {
      type: DASHBOARD_WIDGETS.BODY_MEASUREMENTS,
      name: 'Body Measurements',
      category: 'progress' as const,
      description: 'Track body measurements',
      requiredData: ['measurements'],
      defaultSize: 'medium' as const
    },
    {
      type: DASHBOARD_WIDGETS.PROGRESS_PHOTOS,
      name: 'Progress Photos',
      category: 'progress' as const,
      description: 'Visual progress tracking',
      requiredData: ['photos'],
      defaultSize: 'small' as const
    }
  ];
}