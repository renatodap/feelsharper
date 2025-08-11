'use client';

import React from 'react';
import { Heading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Settings, Plus } from 'lucide-react';

// Import module cards
import WeightCard from './modules/WeightCard';
import NutritionCard from './modules/NutritionCard';
import WorkoutCard from './modules/WorkoutCard';
import CardioCard from './modules/CardioCard';
import RecoveryCard from './modules/RecoveryCard';
import SleepCard from './modules/SleepCard';
import ProgressCard from './modules/ProgressCard';

interface ModuleGridProps {
  modules: string[];
  moduleOrder: string[];
  onCustomize?: () => void;
}

const MODULE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  weight: WeightCard,
  nutrition: NutritionCard,
  workouts: WorkoutCard,
  cardio: CardioCard,
  recovery: RecoveryCard,
  sleep: SleepCard,
  progress: ProgressCard
};

const MODULE_NAMES: Record<string, string> = {
  weight: 'Weight Tracking',
  nutrition: 'Nutrition',
  workouts: 'Workouts',
  cardio: 'Cardio',
  recovery: 'Recovery',
  sleep: 'Sleep',
  progress: 'Progress'
};

export default function ModuleGrid({ 
  modules, 
  moduleOrder, 
  onCustomize 
}: ModuleGridProps) {
  // Filter and order modules based on user preferences
  const orderedModules = moduleOrder.filter(moduleId => 
    modules.includes(moduleId) && MODULE_COMPONENTS[moduleId]
  );

  const renderModule = (moduleId: string) => {
    const ModuleComponent = MODULE_COMPONENTS[moduleId];
    if (!ModuleComponent) return null;

    return (
      <div key={moduleId} className="module-card">
        <ModuleComponent />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading className="text-xl font-bold text-slate-900">
            Your Dashboard
          </Heading>
          <Body className="text-slate-600 text-sm">
            {modules.length} modules active
          </Body>
        </div>
        <Button
          onClick={onCustomize}
          variant="outline"
          className="flex items-center text-slate-600 border-slate-200"
        >
          <Settings className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* Module Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orderedModules.map(renderModule)}
      </div>

      {/* Empty State */}
      {orderedModules.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <Heading className="text-lg font-semibold text-slate-900 mb-2">
            No modules selected
          </Heading>
          <Body className="text-slate-600 mb-4">
            Choose which metrics you want to track on your dashboard.
          </Body>
          <Button onClick={onCustomize} className="bg-amber-600 hover:bg-amber-700 text-white">
            Add Modules
          </Button>
        </div>
      )}
    </div>
  );
}
