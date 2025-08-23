"use client";

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Flame, 
  Award,
  Calendar,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight?: number;
  workoutCompleted: boolean;
}

interface ProgressDashboardProps {
  userId?: string;
  targetCalories?: number;
  targetProtein?: number;
}

function ProgressDashboard({ 
  userId, 
  targetCalories = 2000, 
  targetProtein = 150 
}: ProgressDashboardProps) {
  const [todayStats, setTodayStats] = useState<DailyStats>({
    date: new Date().toISOString().split('T')[0],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workoutCompleted: false
  });
  
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Memoize progress calculations to prevent unnecessary re-renders
  const calorieProgress = useMemo(() => 
    Math.min((todayStats.calories / targetCalories) * 100, 100),
    [todayStats.calories, targetCalories]
  );
  
  const proteinProgress = useMemo(() => 
    Math.min((todayStats.protein / targetProtein) * 100, 100),
    [todayStats.protein, targetProtein]
  );

  // Mock data for visualization (replace with real API calls)
  useEffect(() => {
    // Simulate loading today's data
    setTodayStats({
      date: new Date().toISOString().split('T')[0],
      calories: 1450,
      protein: 98,
      carbs: 180,
      fat: 45,
      weight: 75.5,
      workoutCompleted: true
    });

    // Simulate weekly data
    const mockWeekly: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockWeekly.push({
        date: date.toISOString().split('T')[0],
        calories: 1800 + Math.random() * 400,
        protein: 130 + Math.random() * 40,
        carbs: 200 + Math.random() * 50,
        fat: 60 + Math.random() * 20,
        weight: 75 + Math.random() * 2,
        workoutCompleted: Math.random() > 0.3
      });
    }
    setWeeklyStats(mockWeekly);
    
    // Calculate streak
    let streak = 0;
    for (let i = mockWeekly.length - 1; i >= 0; i--) {
      if (mockWeekly[i].workoutCompleted || mockWeekly[i].calories > 0) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    // Check achievements
    const newAchievements = [];
    if (streak >= 7) newAchievements.push('week_warrior');
    if (todayStats.protein >= targetProtein) newAchievements.push('protein_master');
    if (todayStats.workoutCompleted) newAchievements.push('workout_complete');
    setAchievements(newAchievements);
  }, [targetProtein, todayStats.protein, todayStats.workoutCompleted]);

  // Memoize utility functions to prevent recreation on every render
  const getProgressColor = useCallback((progress: number) => {
    if (progress < 50) return 'text-red-500';
    if (progress < 80) return 'text-yellow-500';
    return 'text-green-500';
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en', { weekday: 'short' });
  }, []);

  // Memoize weekly averages
  const weeklyAverages = useMemo(() => ({
    calories: Math.round(weeklyStats.reduce((sum, s) => sum + s.calories, 0) / weeklyStats.length) || 0,
    protein: Math.round(weeklyStats.reduce((sum, s) => sum + s.protein, 0) / weeklyStats.length) || 0
  }), [weeklyStats]);

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calorie Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Calories</h3>
            </div>
            <span className={cn("text-sm font-medium", getProgressColor(calorieProgress))}>
              {todayStats.calories} / {targetCalories}
            </span>
          </div>
          
          <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{targetCalories - todayStats.calories} remaining</span>
            <span>{calorieProgress.toFixed(0)}%</span>
          </div>
        </Card>

        {/* Protein Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Protein</h3>
            </div>
            <span className={cn("text-sm font-medium", getProgressColor(proteinProgress))}>
              {todayStats.protein}g / {targetProtein}g
            </span>
          </div>
          
          <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${proteinProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{targetProtein - todayStats.protein}g remaining</span>
            <span>{proteinProgress.toFixed(0)}%</span>
          </div>
        </Card>
      </div>

      {/* Streak & Achievements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">💪</div>
          <div className="text-2xl font-bold">
            {weeklyStats.filter(s => s.workoutCompleted).length}
          </div>
          <div className="text-xs text-muted-foreground">Workouts This Week</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">⚖️</div>
          <div className="text-2xl font-bold">
            {todayStats.weight ? `${todayStats.weight}kg` : '--'}
          </div>
          <div className="text-xs text-muted-foreground">Current Weight</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-2xl font-bold">{achievements.length}</div>
          <div className="text-xs text-muted-foreground">Achievements</div>
        </Card>
      </div>

      {/* Weekly Overview Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly Overview</h3>
          <Button variant="ghost" size="sm">
            <span className="text-sm">View Details</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Calorie Chart */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Calories</span>
              <span className="font-medium">
                Avg: {weeklyAverages.calories}
              </span>
            </div>
            <div className="flex gap-1 h-20">
              {weeklyStats.map((day, i) => {
                const height = (day.calories / targetCalories) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div 
                      className={cn(
                        "w-full rounded-t transition-all",
                        day.calories >= targetCalories ? "bg-green-500" : "bg-orange-500"
                      )}
                      style={{ height: `${Math.min(height, 100)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protein Chart */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Protein</span>
              <span className="font-medium">
                Avg: {weeklyAverages.protein}g
              </span>
            </div>
            <div className="flex gap-1 h-20">
              {weeklyStats.map((day, i) => {
                const height = (day.protein / targetProtein) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div 
                      className={cn(
                        "w-full rounded-t transition-all",
                        day.protein >= targetProtein ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ height: `${Math.min(height, 100)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Macro Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Today's Macros</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Carbohydrates</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ width: `${(todayStats.carbs / 250) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{todayStats.carbs}g</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Protein</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(todayStats.protein / targetProtein) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{todayStats.protein}g</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Fats</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500"
                  style={{ width: `${(todayStats.fat / 70) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{todayStats.fat}g</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="primary" className="py-6">
          <Activity className="w-5 h-5 mr-2" />
          Log Workout
        </Button>
        <Button variant="outline" className="py-6">
          <Calendar className="w-5 h-5 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
}

export default memo(ProgressDashboard);