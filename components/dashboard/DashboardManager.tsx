'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical,
  Save,
  X,
  Scale,
  Utensils,
  Dumbbell,
  Activity,
  Heart,
  Moon,
  Camera
} from 'lucide-react';

interface DashboardManagerProps {
  modules: string[];
  moduleOrder: string[];
  onSave: (modules: string[], moduleOrder: string[]) => void;
  onClose: () => void;
}

const AVAILABLE_MODULES = [
  { id: 'weight', label: 'Weight Tracking', icon: Scale, description: 'Daily weigh-ins and trends' },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils, description: 'Calories, macros, meal logging' },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell, description: 'Strength training and progress' },
  { id: 'cardio', label: 'Cardio', icon: Activity, description: 'Running, cycling, endurance' },
  { id: 'recovery', label: 'Recovery', icon: Heart, description: 'Sleep, stress, mobility' },
  { id: 'sleep', label: 'Sleep', icon: Moon, description: 'Sleep quality and patterns' },
  { id: 'progress', label: 'Progress Photos', icon: Camera, description: 'Visual transformation tracking' }
];

export default function DashboardManager({ 
  modules, 
  moduleOrder, 
  onSave, 
  onClose 
}: DashboardManagerProps) {
  const [activeModules, setActiveModules] = useState<string[]>(modules);
  const [currentOrder, setCurrentOrder] = useState<string[]>(moduleOrder);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleModule = (moduleId: string) => {
    const newActiveModules = activeModules.includes(moduleId)
      ? activeModules.filter(id => id !== moduleId)
      : [...activeModules, moduleId];
    
    setActiveModules(newActiveModules);
    
    // Update order to include/exclude the module
    const newOrder = currentOrder.includes(moduleId)
      ? currentOrder.filter(id => id !== moduleId)
      : [...currentOrder, moduleId];
    
    setCurrentOrder(newOrder);
    setHasChanges(true);
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = currentOrder.indexOf(moduleId);
    if (currentIndex === -1) return;

    const newOrder = [...currentOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
      setCurrentOrder(newOrder);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave(activeModules, currentOrder);
    setHasChanges(false);
  };

  const handleReset = () => {
    setActiveModules(modules);
    setCurrentOrder(moduleOrder);
    setHasChanges(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <Heading className="text-xl font-bold text-slate-900">
                  Customize Dashboard
                </Heading>
                <Body className="text-slate-600 text-sm">
                  Choose which modules to show and their order
                </Body>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="w-5 h-5 text-slate-400" />
            </Button>
          </div>

          {/* Available Modules */}
          <div className="mb-8">
            <Subheading className="font-semibold text-slate-900 mb-4">
              Available Modules
            </Subheading>
            <div className="grid gap-3">
              {AVAILABLE_MODULES.map((module) => {
                const Icon = module.icon;
                const isActive = activeModules.includes(module.id);
                
                return (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isActive
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-amber-100' : 'bg-slate-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive ? 'text-amber-600' : 'text-slate-500'
                          }`} />
                        </div>
                        <div>
                          <Subheading className="font-medium text-slate-900">
                            {module.label}
                          </Subheading>
                          <Body className="text-slate-600 text-sm">
                            {module.description}
                          </Body>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isActive ? (
                          <Eye className="w-5 h-5 text-amber-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Order */}
          {activeModules.length > 0 && (
            <div className="mb-8">
              <Subheading className="font-semibold text-slate-900 mb-4">
                Module Order ({activeModules.length} active)
              </Subheading>
              <div className="space-y-2">
                {currentOrder
                  .filter(moduleId => activeModules.includes(moduleId))
                  .map((moduleId, index) => {
                    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
                    if (!module) return null;
                    
                    const Icon = module.icon;
                    const isFirst = index === 0;
                    const isLast = index === currentOrder.filter(id => activeModules.includes(id)).length - 1;
                    
                    return (
                      <div key={moduleId} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => moveModule(moduleId, 'up')}
                            disabled={isFirst}
                            className={`p-1 rounded ${
                              isFirst 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveModule(moduleId, 'down')}
                            disabled={isLast}
                            className={`p-1 rounded ${
                              isLast 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <GripVertical className="w-4 h-4 rotate-180" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-white rounded-lg">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <Body className="text-slate-900 font-medium text-sm">
                              {module.label}
                            </Body>
                            <Body className="text-slate-500 text-xs">
                              Position {index + 1}
                            </Body>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!hasChanges}
              className="text-slate-600"
            >
              Reset Changes
            </Button>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-200 text-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
