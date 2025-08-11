'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TodayOverview } from './TodayOverview';
import { ProgressCharts } from './ProgressCharts';
import { StreakCounter } from './StreakCounter';
import { AICoachTip } from './AICoachTip';
import { QuickActions } from './QuickActions';
import { UpcomingWorkouts } from './UpcomingWorkouts';
import { MacroStatus } from './MacroStatus';
import { RecoveryStatus } from './RecoveryStatus';

export function FitnessDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [todayStats, setTodayStats] = useState({
    workoutsCompleted: 0,
    caloriesConsumed: 0,
    caloriesTarget: 2200,
    proteinConsumed: 0,
    proteinTarget: 150,
    sleepHours: 7.5,
    sleepTarget: 8,
    currentStreak: 12,
    weightTrend: 'stable',
  });

  useEffect(() => {
    // TODO: Fetch user profile and today's stats from Supabase
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Placeholder for actual data loading
    // This would fetch from Supabase tables: profiles, workouts, meals, sleep_logs, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            AI Fitness Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Your personal elite coach, nutritionist, and sports scientist
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Today's Overview */}
              <TodayOverview stats={todayStats} />

              {/* Progress Charts */}
              <ProgressCharts />

              {/* Upcoming Workouts */}
              <UpcomingWorkouts />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* AI Coach Tip */}
              <AICoachTip />

              {/* Streak Counter */}
              <StreakCounter streak={todayStats.currentStreak} />

              {/* Macro Status */}
              <MacroStatus 
                consumed={todayStats.caloriesConsumed}
                target={todayStats.caloriesTarget}
                protein={todayStats.proteinConsumed}
                proteinTarget={todayStats.proteinTarget}
              />

              {/* Recovery Status */}
              <RecoveryStatus 
                sleepHours={todayStats.sleepHours}
                sleepTarget={todayStats.sleepTarget}
              />

              {/* Quick Actions */}
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}