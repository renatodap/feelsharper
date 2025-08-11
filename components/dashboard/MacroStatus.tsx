'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp } from 'lucide-react';

interface MacroStatusProps {
  consumed: number;
  target: number;
  protein: number;
  proteinTarget: number;
}

export function MacroStatus({ consumed, target, protein, proteinTarget }: MacroStatusProps) {
  // Mock macro breakdown - would come from meal logging
  const macroData = [
    { name: 'Protein', value: 680, color: '#8b5cf6', target: 600 }, // 4 cal/g
    { name: 'Carbs', value: 800, color: '#3b82f6', target: 880 },   // 4 cal/g  
    { name: 'Fat', value: 720, color: '#f59e0b', target: 720 },     // 9 cal/g
  ];

  const remaining = target - consumed;
  const proteinRemaining = proteinTarget - protein;

  const getStatusColor = (consumed: number, target: number) => {
    const percentage = (consumed / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Daily Nutrition
        </h3>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => window.location.href = '/log/meal'}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Calorie Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: consumed }, { value: Math.max(0, remaining) }]}
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
              {consumed}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              of {target}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              calories
            </div>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="space-y-3 mb-6">
        {macroData.map((macro) => {
          const percentage = (macro.value / macro.target) * 100;
          return (
            <div key={macro.name}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {macro.name}
                </span>
                <span className={getStatusColor(macro.value, macro.target)}>
                  {Math.round(percentage)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: macro.color 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{Math.round(macro.value / 4)}g consumed</span>
                <span>{Math.round(macro.target / 4)}g target</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {remaining > 0 ? `${remaining}` : '✓'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {remaining > 0 ? 'calories left' : 'goal reached'}
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {proteinRemaining > 0 ? `${proteinRemaining}g` : '✓'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {proteinRemaining > 0 ? 'protein left' : 'protein goal'}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Smart Suggestion
          </span>
        </div>
        {proteinRemaining > 20 ? (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Add a protein shake ({proteinRemaining}g protein, {proteinRemaining * 4} calories) to hit your targets.
          </p>
        ) : remaining > 300 ? (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You have room for a balanced snack. Try nuts with fruit ({remaining} calories left).
          </p>
        ) : (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Great macro balance today! Stay consistent with this approach.
          </p>
        )}
      </div>
    </Card>
  );
}