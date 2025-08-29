'use client';

import React from 'react';
import { UserPersonaType } from '@/lib/ai-coach/types';
import { DashboardPreset } from '@/lib/dashboard/types';
import { getDefaultPresets } from '@/lib/dashboard/presets';
import { cn } from '@/lib/utils';

interface PresetSelectorProps {
  currentPersona: UserPersonaType;
  onSelect: (preset: DashboardPreset) => void;
  className?: string;
}

const personaIcons: Record<UserPersonaType, string> = {
  [UserPersonaType.ENDURANCE]: '🏃',
  [UserPersonaType.STRENGTH]: '💪',
  [UserPersonaType.SPORT]: '🏆',
  [UserPersonaType.PROFESSIONAL]: '💼',
  [UserPersonaType.WEIGHT_MGMT]: '⚖️'
};

const personaColors: Record<UserPersonaType, string> = {
  [UserPersonaType.ENDURANCE]: 'bg-blue-500',
  [UserPersonaType.STRENGTH]: 'bg-red-500',
  [UserPersonaType.SPORT]: 'bg-green-500',
  [UserPersonaType.PROFESSIONAL]: 'bg-purple-500',
  [UserPersonaType.WEIGHT_MGMT]: 'bg-orange-500'
};

export const PresetSelector: React.FC<PresetSelectorProps> = React.memo(({
  currentPersona,
  onSelect,
  className
}) => {
  const presets = getDefaultPresets();
  const [selectedPreset, setSelectedPreset] = React.useState<DashboardPreset | null>(
    presets.find(p => p.persona === currentPersona) || null
  );

  const handlePresetSelect = (preset: DashboardPreset) => {
    setSelectedPreset(preset);
    onSelect(preset);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white">Choose Your Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            className={cn(
              'relative p-4 rounded-lg border-2 transition-all duration-200',
              'hover:scale-105 hover:shadow-lg',
              selectedPreset?.id === preset.id
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            )}
          >
            {/* Icon and Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                personaColors[preset.persona],
                'bg-opacity-20'
              )}>
                {personaIcons[preset.persona]}
              </div>
              {preset.persona === currentPersona && (
                <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                  Recommended
                </span>
              )}
            </div>

            {/* Content */}
            <div className="text-left">
              <h4 className="font-semibold text-white mb-1">{preset.name}</h4>
              <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
              
              {/* Widget Preview */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Primary widgets:</p>
                <div className="flex flex-wrap gap-1">
                  {preset.primaryWidgets.slice(0, 3).map((widget, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-gray-700 rounded"
                    >
                      {widget.title || widget.type}
                    </span>
                  ))}
                  {preset.primaryWidgets.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{preset.primaryWidgets.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedPreset?.id === preset.id && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Preset Option */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-700 rounded-lg">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-sm text-gray-400">
            Or create a custom dashboard from scratch
          </p>
          <button className="mt-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            Create Custom
          </button>
        </div>
      </div>
    </div>
  );
});

PresetSelector.displayName = 'PresetSelector';