/**
 * Sport-Specific Dashboard Presets Tests
 * TDD Step 4: Test Implementation with Mocks
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserPersonaType, DASHBOARD_WIDGETS } from '@/lib/ai-coach/types';
import { DashboardPreset, WidgetConfig } from '../types';
import { 
  getPresetByPersona, 
  validatePresetConfiguration,
  getDefaultPresets,
  createCustomPreset
} from '../presets';

// Mock data for testing
const mockEndurancePreset: DashboardPreset = {
  id: 'preset-endurance',
  name: 'Endurance Athlete',
  persona: UserPersonaType.ENDURANCE,
  description: 'Optimized for runners, cyclists, and triathletes',
  primaryWidgets: [
    {
      id: 'w1',
      type: DASHBOARD_WIDGETS.HR_ZONES,
      size: 'medium',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Heart Rate Zones'
    },
    {
      id: 'w2',
      type: DASHBOARD_WIDGETS.TRAINING_LOAD,
      size: 'large',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Training Load'
    },
    {
      id: 'w3',
      type: DASHBOARD_WIDGETS.WEEKLY_VOLUME,
      size: 'medium',
      position: { row: 1, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Weekly Volume'
    },
    {
      id: 'w4',
      type: DASHBOARD_WIDGETS.VO2_MAX,
      size: 'small',
      position: { row: 1, col: 2 },
      dataSource: 'fitness_metrics',
      title: 'VO2 Max'
    },
    {
      id: 'w5',
      type: DASHBOARD_WIDGETS.RECOVERY_METRICS,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'recovery',
      title: 'Recovery'
    }
  ],
  secondaryWidgets: [],
  layout: {
    type: 'grid',
    columns: 4,
    gap: 16,
    responsive: true,
    breakpoints: [
      { maxWidth: 768, columns: 2, gap: 8 },
      { maxWidth: 1024, columns: 3, gap: 12 }
    ]
  },
  customizable: true
};

const mockStrengthPreset: DashboardPreset = {
  id: 'preset-strength',
  name: 'Strength Athlete',
  persona: UserPersonaType.STRENGTH,
  description: 'Optimized for powerlifters and bodybuilders',
  primaryWidgets: [
    {
      id: 'w1',
      type: DASHBOARD_WIDGETS.PERSONAL_RECORDS,
      size: 'large',
      position: { row: 0, col: 0, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Personal Records'
    },
    {
      id: 'w2',
      type: DASHBOARD_WIDGETS.VOLUME_PROGRESSION,
      size: 'medium',
      position: { row: 0, col: 2, colSpan: 2 },
      dataSource: 'workouts',
      title: 'Volume Progression'
    },
    {
      id: 'w3',
      type: DASHBOARD_WIDGETS.PROTEIN_INTAKE,
      size: 'small',
      position: { row: 1, col: 0 },
      dataSource: 'nutrition',
      title: 'Protein'
    },
    {
      id: 'w4',
      type: DASHBOARD_WIDGETS.BODY_COMPOSITION,
      size: 'medium',
      position: { row: 1, col: 1, colSpan: 2 },
      dataSource: 'body_metrics',
      title: 'Body Composition'
    },
    {
      id: 'w5',
      type: DASHBOARD_WIDGETS.STRENGTH_BALANCE,
      size: 'small',
      position: { row: 1, col: 3 },
      dataSource: 'workouts',
      title: 'Balance'
    }
  ],
  secondaryWidgets: [],
  layout: {
    type: 'grid',
    columns: 4,
    gap: 16,
    responsive: true
  },
  customizable: true
};

describe('Dashboard Presets Configuration', () => {
  describe('getPresetByPersona', () => {
    it('should return endurance preset for endurance persona', () => {
      const preset = getPresetByPersona(UserPersonaType.ENDURANCE);
      expect(preset).toBeDefined();
      expect(preset?.persona).toBe(UserPersonaType.ENDURANCE);
      expect(preset?.name).toBe('Endurance Athlete');
    });

    it('should return strength preset for strength persona', () => {
      const preset = getPresetByPersona(UserPersonaType.STRENGTH);
      expect(preset).toBeDefined();
      expect(preset?.persona).toBe(UserPersonaType.STRENGTH);
      expect(preset?.name).toBe('Strength Athlete');
    });

    it('should return sport preset for sport persona', () => {
      const preset = getPresetByPersona(UserPersonaType.SPORT);
      expect(preset).toBeDefined();
      expect(preset?.persona).toBe(UserPersonaType.SPORT);
    });

    it('should return professional preset for professional persona', () => {
      const preset = getPresetByPersona(UserPersonaType.PROFESSIONAL);
      expect(preset).toBeDefined();
      expect(preset?.persona).toBe(UserPersonaType.PROFESSIONAL);
    });

    it('should return weight management preset for weight_mgmt persona', () => {
      const preset = getPresetByPersona(UserPersonaType.WEIGHT_MGMT);
      expect(preset).toBeDefined();
      expect(preset?.persona).toBe(UserPersonaType.WEIGHT_MGMT);
    });
  });

  describe('Endurance Preset Widgets', () => {
    let preset: DashboardPreset | undefined;

    beforeEach(() => {
      preset = getPresetByPersona(UserPersonaType.ENDURANCE);
    });

    it('should have HR zones as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.HR_ZONES })
      );
    });

    it('should have training load as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.TRAINING_LOAD })
      );
    });

    it('should have weekly volume as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.WEEKLY_VOLUME })
      );
    });

    it('should have exactly 5 primary widgets', () => {
      expect(preset?.primaryWidgets).toHaveLength(5);
    });

    it('should use grid layout', () => {
      expect(preset?.layout.type).toBe('grid');
    });
  });

  describe('Strength Preset Widgets', () => {
    let preset: DashboardPreset | undefined;

    beforeEach(() => {
      preset = getPresetByPersona(UserPersonaType.STRENGTH);
    });

    it('should have personal records as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.PERSONAL_RECORDS })
      );
    });

    it('should have volume progression as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.VOLUME_PROGRESSION })
      );
    });

    it('should have protein intake as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.PROTEIN_INTAKE })
      );
    });

    it('should have body composition as a primary widget', () => {
      expect(preset?.primaryWidgets).toContainEqual(
        expect.objectContaining({ type: DASHBOARD_WIDGETS.BODY_COMPOSITION })
      );
    });
  });

  describe('validatePresetConfiguration', () => {
    it('should validate a correct preset configuration', () => {
      const result = validatePresetConfiguration(mockEndurancePreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect widget position overlaps', () => {
      const invalidPreset: DashboardPreset = {
        ...mockEndurancePreset,
        primaryWidgets: [
          {
            id: 'w1',
            type: DASHBOARD_WIDGETS.HR_ZONES,
            size: 'medium',
            position: { row: 0, col: 0, colSpan: 2 },
            dataSource: 'workouts'
          },
          {
            id: 'w2',
            type: DASHBOARD_WIDGETS.TRAINING_LOAD,
            size: 'medium',
            position: { row: 0, col: 1, colSpan: 2 }, // Overlaps with w1
            dataSource: 'workouts'
          }
        ]
      };

      const result = validatePresetConfiguration(invalidPreset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Widget positions overlap');
    });

    it('should detect widgets exceeding column bounds', () => {
      const invalidPreset: DashboardPreset = {
        ...mockEndurancePreset,
        layout: { ...mockEndurancePreset.layout, columns: 3 },
        primaryWidgets: [
          {
            id: 'w1',
            type: DASHBOARD_WIDGETS.HR_ZONES,
            size: 'large',
            position: { row: 0, col: 2, colSpan: 3 }, // Exceeds 3 columns
            dataSource: 'workouts'
          }
        ]
      };

      const result = validatePresetConfiguration(invalidPreset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Widget exceeds column bounds');
    });
  });

  describe('getDefaultPresets', () => {
    it('should return all 5 default presets', () => {
      const presets = getDefaultPresets();
      expect(presets).toHaveLength(5);
    });

    it('should have one preset for each persona type', () => {
      const presets = getDefaultPresets();
      const personas = presets.map(p => p.persona);
      
      expect(personas).toContain(UserPersonaType.ENDURANCE);
      expect(personas).toContain(UserPersonaType.STRENGTH);
      expect(personas).toContain(UserPersonaType.SPORT);
      expect(personas).toContain(UserPersonaType.PROFESSIONAL);
      expect(personas).toContain(UserPersonaType.WEIGHT_MGMT);
    });

    it('should have valid configurations for all presets', () => {
      const presets = getDefaultPresets();
      presets.forEach(preset => {
        const result = validatePresetConfiguration(preset);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('createCustomPreset', () => {
    it('should create a custom preset from an existing one', () => {
      const custom = createCustomPreset(
        mockEndurancePreset,
        'My Custom Endurance',
        [mockEndurancePreset.primaryWidgets[0], mockEndurancePreset.primaryWidgets[1]]
      );

      expect(custom.name).toBe('My Custom Endurance');
      expect(custom.primaryWidgets).toHaveLength(2);
      expect(custom.id).toContain('custom-');
    });

    it('should validate custom preset configuration', () => {
      const custom = createCustomPreset(
        mockEndurancePreset,
        'Invalid Custom',
        [
          {
            id: 'w1',
            type: DASHBOARD_WIDGETS.HR_ZONES,
            size: 'medium',
            position: { row: 0, col: 10 }, // Invalid column
            dataSource: 'workouts'
          }
        ]
      );

      const result = validatePresetConfiguration(custom);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Widget Configuration Tests', () => {
  describe('Widget Size Validation', () => {
    it('should accept valid widget sizes', () => {
      const validSizes: Array<'small' | 'medium' | 'large' | 'full'> = ['small', 'medium', 'large', 'full'];
      validSizes.forEach(size => {
        const widget: WidgetConfig = {
          id: 'test',
          type: DASHBOARD_WIDGETS.HR_ZONES,
          size,
          position: { row: 0, col: 0 },
          dataSource: 'test'
        };
        expect(widget.size).toBe(size);
      });
    });
  });

  describe('Widget Position Validation', () => {
    it('should calculate widget span correctly', () => {
      const widget: WidgetConfig = {
        id: 'test',
        type: DASHBOARD_WIDGETS.HR_ZONES,
        size: 'large',
        position: { row: 0, col: 0, rowSpan: 2, colSpan: 3 },
        dataSource: 'test'
      };

      expect(widget.position.rowSpan).toBe(2);
      expect(widget.position.colSpan).toBe(3);
    });
  });
});