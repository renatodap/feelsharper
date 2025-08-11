'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Zap, AlertCircle } from 'lucide-react';

interface MacroSummaryProps {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function MacroSummary({ current, targets }: MacroSummaryProps) {
  const caloriesFromMacros = (current.protein * 4) + (current.carbs * 4) + (current.fat * 9);
  const remaining = targets.calories - current.calories;
  
  // Calculate percentages
  const proteinPercentage = (current.protein / targets.protein) * 100;
  const carbsPercentage = (current.carbs / targets.carbs) * 100;
  const fatPercentage = (current.fat / targets.fat) * 100;
  const caloriesPercentage = (current.calories / targets.calories) * 100;

  // Macro distribution for pie chart
  const macroDistribution = [
    { 
      name: 'Protein', 
      value: current.protein * 4, 
      color: '#8b5cf6',
      percentage: Math.round((current.protein * 4 / caloriesFromMacros) * 100) || 0
    },
    { 
      name: 'Carbs', 
      value: current.carbs * 4, 
      color: '#3b82f6',
      percentage: Math.round((current.carbs * 4 / caloriesFromMacros) * 100) || 0
    },
    { 
      name: 'Fat', 
      value: current.fat * 9, 
      color: '#f59e0b',
      percentage: Math.round((current.fat * 9 / caloriesFromMacros) * 100) || 0
    },
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Daily Progress
        </h3>
        <Badge 
          variant="secondary" 
          className={`${
            caloriesPercentage >= 90 ? 'bg-green-100 text-green-800' :
            caloriesPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
            'bg-slate-100 text-slate-600'
          }`}
        >
          {Math.round(caloriesPercentage)}%
        </Badge>
      </div>

      {/* Calorie Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: current.calories }, { value: Math.max(0, remaining) }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {current.calories}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              of {targets.calories}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              calories
            </div>
          </div>
        </div>
      </div>

      {/* Macro Progress Bars */}
      <div className="space-y-4 mb-6">
        {/* Protein */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">Protein</span>
            <span className={`font-medium ${getProgressColor(proteinPercentage)}`}>
              {Math.round(current.protein)}g / {targets.protein}g
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(proteinPercentage)}`}
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">Carbs</span>
            <span className={`font-medium ${getProgressColor(carbsPercentage)}`}>
              {Math.round(current.carbs)}g / {targets.carbs}g
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(carbsPercentage)}`}
              style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">Fat</span>
            <span className={`font-medium ${getProgressColor(fatPercentage)}`}>
              {Math.round(current.fat)}g / {targets.fat}g
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(fatPercentage)}`}
              style={{ width: `${Math.min(fatPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Macro Distribution */}
      {caloriesFromMacros > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Macro Distribution
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {macroDistribution.map((macro) => (
              <div key={macro.name} className="text-center">
                <div
                  className="w-4 h-4 rounded mx-auto mb-1"
                  style={{ backgroundColor: macro.color }}
                />
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {macro.percentage}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {macro.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status & Recommendations */}
      <div className="space-y-3">
        {remaining > 0 ? (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {remaining} calories remaining
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You can have a balanced snack or small meal.
            </p>
          </div>
        ) : remaining < -200 ? (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                {Math.abs(remaining)} calories over target
              </span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200">
              Consider adjusting portion sizes tomorrow or adding extra cardio.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Perfect calorie balance!
              </span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              Great job hitting your daily targets.
            </p>
          </div>
        )}

        {/* Protein status */}
        {proteinPercentage < 80 && (
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Boost your protein
              </span>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Add {Math.round(targets.protein - current.protein)}g more protein to optimize recovery and muscle building.
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-600 dark:text-slate-400">Protein per kg</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {Math.round((current.protein / 75) * 10) / 10}g {/* Assuming 75kg body weight */}
            </div>
          </div>
          <div>
            <div className="text-slate-600 dark:text-slate-400">Fiber est.</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {Math.round(current.carbs * 0.1)}g {/* Rough fiber estimate */}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}