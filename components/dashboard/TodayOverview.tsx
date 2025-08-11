'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  Calendar
} from 'lucide-react';

interface TodayOverviewProps {
  stats: {
    workoutsCompleted: number;
    caloriesConsumed: number;
    caloriesTarget: number;
    proteinConsumed: number;
    proteinTarget: number;
    sleepHours: number;
    sleepTarget: number;
    currentStreak: number;
    weightTrend: string;
  };
}

export function TodayOverview({ stats }: TodayOverviewProps) {
  const caloriesProgress = (stats.caloriesConsumed / stats.caloriesTarget) * 100;
  const proteinProgress = (stats.proteinConsumed / stats.proteinTarget) * 100;
  const sleepProgress = (stats.sleepHours / stats.sleepTarget) * 100;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    return <TrendingUp className={`h-4 w-4 ${getTrendColor(trend)}`} />;
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Today's Overview
        </h2>
        <Badge variant="secondary" className="bg-brand-amber/10 text-brand-amber">
          Day {stats.currentStreak}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Workouts */}
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Workouts
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.workoutsCompleted}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              completed
            </div>
          </div>
        </div>

        {/* Calories */}
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <Target className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Calories
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(caloriesProgress)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {stats.caloriesConsumed}/{stats.caloriesTarget}
            </div>
          </div>
        </div>

        {/* Protein */}
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Protein
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(proteinProgress)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {stats.proteinConsumed}g/{stats.proteinTarget}g
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Sleep
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.sleepHours}h
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              of {stats.sleepTarget}h target
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Daily Calories</span>
            <span>{stats.caloriesConsumed} / {stats.caloriesTarget}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
              style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Protein Intake</span>
            <span>{stats.proteinConsumed}g / {stats.proteinTarget}g</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300"
              style={{ width: `${Math.min(proteinProgress, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Sleep Quality</span>
            <span>{stats.sleepHours}h / {stats.sleepTarget}h</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300"
              style={{ width: `${Math.min(sleepProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Today&apos;s Plan */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-600" />
          <h3 className="font-medium text-slate-900 dark:text-slate-100">Today&apos;s Plan</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>• Upper body strength training</span>
            <Badge variant="outline" size="sm">Scheduled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>• Track macros for lunch & dinner</span>
            <Badge variant="outline" size="sm">Pending</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>• 10-minute evening stretching</span>
            <Badge variant="outline" size="sm">Pending</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}