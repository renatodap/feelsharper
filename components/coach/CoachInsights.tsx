'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

export function CoachInsights() {
  // Mock insights - would be generated from user data analysis
  const insights = [
    {
      type: 'performance',
      priority: 'high',
      icon: TrendingUp,
      title: 'Strength Progress Trending Up',
      description: 'Your squat has improved 12% over the past month. Consider progressive overload.',
      color: 'bg-green-50 text-green-600 border-green-200',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      type: 'nutrition',
      priority: 'medium',
      icon: AlertCircle,
      title: 'Protein Intake Fluctuating',
      description: 'You\'ve hit protein targets only 60% of days this week. Consistency is key.',
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      type: 'recovery',
      priority: 'high',
      icon: Clock,
      title: 'Sleep Quality Declining',
      description: 'Average sleep has decreased to 6.2h. This may impact tomorrow\'s workout.',
      color: 'bg-red-50 text-red-600 border-red-200',
      badgeColor: 'bg-red-100 text-red-800'
    },
    {
      type: 'achievement',
      priority: 'low',
      icon: CheckCircle,
      title: '14-Day Consistency Streak',
      description: 'Outstanding! You\'ve logged data every day for 2 weeks straight.',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800'
    }
  ];

  const weeklyStats = {
    workoutsCompleted: 4,
    totalVolume: 52500, // kg
    avgSleep: 7.2, // hours
    proteinConsistency: 85, // percentage
    calorieAccuracy: 92 // percentage
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            AI Insights
          </h3>
          <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
            Updated 2h ago
          </Badge>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border ${insight.color}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {insight.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{getPriorityIcon(insight.priority)}</span>
                    <Badge className={`${insight.badgeColor} border-0 text-xs`}>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Weekly Performance
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {weeklyStats.workoutsCompleted}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Workouts
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Math.round(weeklyStats.avgSleep * 10) / 10}h
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Avg Sleep
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Volume</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {weeklyStats.totalVolume.toLocaleString()}kg
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{ width: '78%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Protein Consistency</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {weeklyStats.proteinConsistency}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                style={{ width: `${weeklyStats.proteinConsistency}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Calorie Tracking</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {weeklyStats.calorieAccuracy}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                style={{ width: `${weeklyStats.calorieAccuracy}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Goal Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Goal Progress
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Bench Press 100kg
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Current: 87.5kg
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                88%
              </Badge>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                12.5kg to go
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Body Fat to 12%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Current: 15.2%
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">
                62%
              </Badge>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                3.2% to go
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Daily 10k Steps
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                7-day average: 8,740
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                87%
              </Badge>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                1,260 steps
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}