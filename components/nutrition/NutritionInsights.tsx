'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  Apple,
  Droplets
} from 'lucide-react';

interface NutritionInsightsProps {
  dailyTotals: {
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
  meals: any[];
}

export function NutritionInsights({ dailyTotals, targets, meals }: NutritionInsightsProps) {
  // Calculate insights based on current data
  const insights = generateNutritionInsights(dailyTotals, targets, meals);
  
  return (
    <div className="space-y-6">
      {/* AI Nutrition Coach */}
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            AI Nutrition Coach
          </h3>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${insight.color}`}>
                <insight.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">
                  {insight.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {insight.message}
                </div>
                {insight.action && (
                  <Button size="sm" variant="ghost" className="mt-2 h-6 text-xs">
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Meal Timing Analysis */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Meal Timing
        </h3>
        
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal, index) => {
              const mealTime = meal.timestamp.getHours();
              const timing = getMealTimingFeedback(meal.name, mealTime);
              
              return (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={`${timing.color} border-0 text-xs`}
                  >
                    {timing.status}
                  </Badge>
                </div>
              );
            })}
            
            {/* Next Meal Suggestion */}
            {meals.length < 4 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Next meal suggestion
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {getNextMealSuggestion(meals, dailyTotals, targets)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-600 dark:text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No meals logged today</p>
          </div>
        )}
      </Card>

      {/* Hydration Reminder */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Hydration Goal
          </h3>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            1.8L
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-0">
            72% complete
          </Badge>
        </div>
        
        <div className="h-2 rounded-full bg-blue-200 dark:bg-blue-800 mb-3">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
            style={{ width: '72%' }}
          />
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          700ml remaining • Next reminder in 45 minutes
        </p>
      </Card>

      {/* Micronutrient Status */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Key Nutrients
        </h3>
        
        <div className="space-y-3">
          {[
            { name: 'Fiber', current: 18, target: 25, unit: 'g', color: 'bg-green-100 text-green-800' },
            { name: 'Iron', current: 12, target: 18, unit: 'mg', color: 'bg-red-100 text-red-800' },
            { name: 'Calcium', current: 680, target: 1000, unit: 'mg', color: 'bg-blue-100 text-blue-800' },
            { name: 'Vitamin C', current: 45, target: 90, unit: 'mg', color: 'bg-orange-100 text-orange-800' },
          ].map((nutrient) => {
            const percentage = (nutrient.current / nutrient.target) * 100;
            return (
              <div key={nutrient.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {nutrient.name}
                  </div>
                  <Badge className={`${nutrient.color} border-0 text-xs`}>
                    {Math.round(percentage)}%
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {nutrient.current}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Apple className="h-4 w-4" />
            <span>Add more colorful fruits and vegetables for better micronutrient coverage</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function generateNutritionInsights(dailyTotals: any, targets: any, meals: any[]) {
  const insights = [];
  
  const proteinPercentage = (dailyTotals.protein / targets.protein) * 100;
  const caloriesPercentage = (dailyTotals.calories / targets.calories) * 100;
  const fatPercentage = (dailyTotals.fat / targets.fat) * 100;
  
  // Protein insights
  if (proteinPercentage < 60) {
    insights.push({
      icon: AlertTriangle,
      title: 'Protein intake is low',
      message: `You're at ${Math.round(proteinPercentage)}% of your protein goal. Add lean protein sources.`,
      color: 'bg-red-50 text-red-600',
      action: 'Protein Foods'
    });
  } else if (proteinPercentage >= 90) {
    insights.push({
      icon: CheckCircle,
      title: 'Excellent protein intake!',
      message: 'You\'re crushing your protein goals. Great for muscle recovery.',
      color: 'bg-green-50 text-green-600'
    });
  }
  
  // Calorie insights
  if (caloriesPercentage < 50) {
    insights.push({
      icon: AlertTriangle,
      title: 'Calories are very low',
      message: 'Make sure you\'re eating enough to fuel your workouts and recovery.',
      color: 'bg-red-50 text-red-600',
      action: 'Meal Ideas'
    });
  }
  
  // Meal frequency insights
  if (meals.length < 2 && new Date().getHours() > 14) {
    insights.push({
      icon: Clock,
      title: 'Consider more frequent meals',
      message: 'Eating 3-4 smaller meals can help with energy levels and nutrient absorption.',
      color: 'bg-yellow-50 text-yellow-600'
    });
  }
  
  // Fat intake insights
  if (fatPercentage > 120) {
    insights.push({
      icon: TrendingUp,
      title: 'High fat intake detected',
      message: 'Consider balancing with more carbs for optimal energy and recovery.',
      color: 'bg-orange-50 text-orange-600'
    });
  }
  
  // Default positive insight if no issues
  if (insights.length === 0) {
    insights.push({
      icon: Zap,
      title: 'Nutrition on track!',
      message: 'Your macro balance looks good. Keep up the consistent eating habits.',
      color: 'bg-blue-50 text-blue-600'
    });
  }
  
  return insights;
}

function getMealTimingFeedback(mealType: string, hour: number) {
  switch (mealType) {
    case 'breakfast':
      if (hour >= 6 && hour <= 9) {
        return { status: 'Optimal', color: 'bg-green-100 text-green-800' };
      } else if (hour <= 11) {
        return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { status: 'Late', color: 'bg-red-100 text-red-800' };
      }
    case 'lunch':
      if (hour >= 12 && hour <= 14) {
        return { status: 'Optimal', color: 'bg-green-100 text-green-800' };
      } else {
        return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' };
      }
    case 'dinner':
      if (hour >= 18 && hour <= 20) {
        return { status: 'Optimal', color: 'bg-green-100 text-green-800' };
      } else if (hour <= 22) {
        return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { status: 'Late', color: 'bg-red-100 text-red-800' };
      }
    default:
      return { status: 'Good', color: 'bg-blue-100 text-blue-800' };
  }
}

function getNextMealSuggestion(meals: any[], dailyTotals: any, targets: any) {
  const currentHour = new Date().getHours();
  const proteinNeeded = targets.protein - dailyTotals.protein;
  const caloriesNeeded = targets.calories - dailyTotals.calories;
  
  if (currentHour < 10 && !meals.find(m => m.name === 'breakfast')) {
    return 'Start with a protein-rich breakfast to kickstart your metabolism.';
  } else if (currentHour < 15 && !meals.find(m => m.name === 'lunch')) {
    return `Plan a balanced lunch with ${Math.round(proteinNeeded * 0.3)}g protein and ${Math.round(caloriesNeeded * 0.4)} calories.`;
  } else if (currentHour < 21 && !meals.find(m => m.name === 'dinner')) {
    return 'Consider a lighter dinner 2-3 hours before bed for better sleep quality.';
  } else {
    return 'A small protein-rich snack could help with overnight recovery.';
  }
}