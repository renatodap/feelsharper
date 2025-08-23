/**
 * Phase 5.5: Friction Reduction UI Components
 * Displays confidence-based coaching responses with minimal friction
 */

import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CoachingResponse } from '@/lib/ai-coach/coaching-engine';

interface FrictionReductionUIProps {
  response: CoachingResponse;
  onActionTap?: (action: string, label: string) => void;
  onDefaultChoice?: (choice: string) => void;
}

export const FrictionReductionUI = memo<FrictionReductionUIProps>(({
  response,
  onActionTap,
  onDefaultChoice
}) => {
  const handleActionTap = useCallback((action: string, label: string) => {
    onActionTap?.(action, label);
  }, [onActionTap]);

  const handleDefaultChoice = useCallback((choice: string) => {
    onDefaultChoice?.(choice);
  }, [onDefaultChoice]);

  const frictionReduction = response.frictionReduction;
  const confidence = response.confidence;

  if (!frictionReduction) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Simplified Message Display */}
      {frictionReduction.cognitive_load_reduction && (
        <Card className="bg-gray-50 border-l-4 border-blue-500">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-gray-800">
              {frictionReduction.cognitive_load_reduction.simplified_message}
            </p>
            {frictionReduction.adaptive_tone && (
              <div className="mt-2 text-xs text-gray-600">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {frictionReduction.adaptive_tone.style.replace('_', ' ')} style
                  {frictionReduction.adaptive_tone.motivation_match && (
                    <span className="ml-1">({frictionReduction.adaptive_tone.motivation_match}% match)</span>
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* High Confidence: One-Tap Actions */}
      {confidence === 'high' && frictionReduction.one_tap_actions && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {frictionReduction.one_tap_actions.slice(0, frictionReduction.cognitive_load_reduction?.max_options || 4).map((action, index) => (
              <Button
                key={action.action}
                onClick={() => handleActionTap(action.action, action.label)}
                variant={index === 0 ? "primary" : "secondary"}
                size="sm"
                className={`
                  flex items-center justify-center gap-2 p-3 
                  ${index === 0 ? 'ring-2 ring-blue-200' : ''}
                  hover:shadow-md transition-shadow
                `}
              >
                <span>{action.label}</span>
                {action.confidence_boost > 15 && (
                  <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                    +{action.confidence_boost}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Medium Confidence: Smart Defaults */}
      {confidence === 'medium' && frictionReduction.smart_defaults && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-800">
              Recommended Choice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg border-2 border-orange-200">
              <p className="font-medium text-gray-800 mb-1">
                {frictionReduction.smart_defaults.default_choice}
              </p>
              <p className="text-xs text-gray-600">
                {frictionReduction.smart_defaults.reasoning}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDefaultChoice(frictionReduction.smart_defaults!.default_choice)}
                variant="primary"
                size="sm"
                className="flex-1 min-w-24"
              >
                ✅ Use This
              </Button>
              
              {frictionReduction.smart_defaults.alternatives.slice(0, 2).map((alt, index) => (
                <Button
                  key={index}
                  onClick={() => handleDefaultChoice(alt)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 min-w-24 text-xs"
                >
                  {alt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Confidence: Minimal Options */}
      {confidence === 'low' && frictionReduction.cognitive_load_reduction && (
        <Card className="border-gray-300 bg-gray-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-700 mb-3">
                Choose one option to get specific advice:
              </p>
              
              <div className="grid grid-cols-1 gap-2 max-w-md">
                {response.actionItems?.slice(0, frictionReduction.cognitive_load_reduction.max_options || 2).map((action, index) => (
                  <Button
                    key={index}
                    onClick={() => handleDefaultChoice(action)}
                    variant="secondary"
                    size="sm"
                    className="text-left justify-start p-3 hover:bg-gray-100"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-selected Choice Indicator */}
      {frictionReduction.cognitive_load_reduction?.pre_selected_choice && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          Pre-selected: {frictionReduction.cognitive_load_reduction.pre_selected_choice}
        </div>
      )}
    </div>
  );
});

FrictionReductionUI.displayName = 'FrictionReductionUI';

export default FrictionReductionUI;