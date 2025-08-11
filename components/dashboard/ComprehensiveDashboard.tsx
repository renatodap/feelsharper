'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Dumbbell, 
  Apple, 
  Scale,
  Moon,
  Calendar,
  ChevronRight,
  Trophy,
  Flame,
  Heart,
  Brain,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DashboardData {
  profile: any;
  todayWorkout: any;
  weekWorkouts: any[];
  todayMeals: any;
  latestMetrics: any;
  previousMetrics: any;
  weekProgress: any;
  insights: string[];
}

export default function ComprehensiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [workoutsRes, mealsRes, metricsRes, profileRes] = await Promise.all([
        fetch('/api/workouts?limit=7'),
        fetch(`/api/meals?date=${new Date().toISOString().split('T')[0]}`),
        fetch('/api/metrics?days=30'),
        fetch('/api/user/goal')
      ]);

      const workouts = await workoutsRes.json();
      const meals = await mealsRes.json();
      const metrics = await metricsRes.json();
      const profile = await profileRes.json();

      // Process data
      const today = new Date().toISOString().split('T')[0];
      const todayWorkout = workouts.workouts?.find((w: any) => 
        w.started_at.startsWith(today)
      );

      // Calculate week stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekWorkouts = workouts.workouts?.filter((w: any) => 
        new Date(w.started_at) >= weekAgo
      ) || [];

      // Generate insights
      const insights = generateInsights({
        workouts: weekWorkouts,
        meals: meals.totals,
        metrics: metrics.latest,
        profile
      });

      setData({
        profile,
        todayWorkout,
        weekWorkouts,
        todayMeals: meals.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        latestMetrics: metrics.latest,
        previousMetrics: metrics.metrics?.[metrics.metrics.length - 2],
        weekProgress: calculateWeekProgress(weekWorkouts),
        insights
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = ({ workouts, meals, metrics, profile }: any) => {
    const insights = [];
    
    // Workout consistency
    if (workouts.length >= 3) {
      insights.push('💪 Great consistency! You\'ve worked out ' + workouts.length + ' times this week.');
    } else if (workouts.length === 0) {
      insights.push('🎯 Time to get moving! Start with a quick workout today.');
    }

    // Protein intake
    if (meals.protein >= 150) {
      insights.push('🥩 Excellent protein intake today: ' + meals.protein + 'g');
    } else if (meals.protein < 100 && meals.protein > 0) {
      insights.push('📈 Consider adding more protein. Current: ' + meals.protein + 'g, target: 150g+');
    }

    // Weight trend
    if (metrics?.weight) {
      insights.push('⚖️ Current weight: ' + metrics.weight + 'kg');
    }

    return insights;
  };

  const calculateWeekProgress = (workouts: any[]) => {
    const totalVolume = workouts.reduce((sum, w) => sum + (w.total_volume || 0), 0);
    const totalSets = workouts.reduce((sum, w) => sum + (w.total_sets || 0), 0);
    const avgDuration = workouts.length > 0 ? 
      workouts.reduce((sum, w) => {
        if (w.ended_at) {
          const duration = new Date(w.ended_at).getTime() - new Date(w.started_at).getTime();
          return sum + duration;
        }
        return sum;
      }, 0) / workouts.length / 60000 : 0;

    return {
      workouts: workouts.length,
      totalVolume,
      totalSets,
      avgDuration: Math.round(avgDuration)
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-secondary rounded-lg"></div>
            <div className="h-40 bg-secondary rounded-lg"></div>
            <div className="h-40 bg-secondary rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const calorieGoal = 2400;
  const proteinGoal = 180;
  const workoutGoal = 4;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Goal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">
          {data?.profile?.current_goal || 'Track your progress and crush your goals'}
        </p>
      </div>

      {/* Daily Check-in Prompt */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Start Your Day Right</h3>
              <p className="text-sm text-muted-foreground">
                Complete your daily check-in to track wellness metrics
              </p>
            </div>
            <Button onClick={() => router.push('/checkin')} variant="default">
              Daily Check-in
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {data?.insights && data.insights.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.insights.map((insight, i) => (
                <p key={i} className="text-sm">{insight}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => router.push('/workouts')}
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs">Log Workout</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => router.push('/nutrition')}
        >
          <Apple className="h-5 w-5" />
          <span className="text-xs">Track Meal</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => router.push('/metrics')}
        >
          <Scale className="h-5 w-5" />
          <span className="text-xs">Update Weight</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => router.push('/sleep')}
        >
          <Moon className="h-5 w-5" />
          <span className="text-xs">Log Sleep</span>
        </Button>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Today's Workout */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Today's Workout</span>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.todayWorkout ? (
              <div>
                <p className="text-2xl font-bold">{data.todayWorkout.name}</p>
                <p className="text-sm text-muted-foreground">
                  {data.todayWorkout.total_sets} sets • {data.todayWorkout.total_volume}kg
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">No workout yet</p>
                <Button size="sm" variant="default" onClick={() => router.push('/workouts')}>
                  Start Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Nutrition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Today's Nutrition</span>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">
                {data?.todayMeals.calories || 0} 
                <span className="text-sm font-normal text-muted-foreground"> / {calorieGoal}</span>
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>P: {data?.todayMeals.protein || 0}g</span>
                <span>C: {data?.todayMeals.carbs || 0}g</span>
                <span>F: {data?.todayMeals.fat || 0}g</span>
              </div>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((data?.todayMeals.calories || 0) / calorieGoal * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Weight */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Body Weight</span>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.latestMetrics ? (
              <div>
                <p className="text-2xl font-bold">
                  {data.latestMetrics.weight} kg
                  {data.previousMetrics && (
                    <span className={`ml-2 text-sm ${
                      data.latestMetrics.weight > data.previousMetrics.weight 
                        ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {data.latestMetrics.weight > data.previousMetrics.weight ? (
                        <ArrowUp className="inline h-3 w-3" />
                      ) : (
                        <ArrowDown className="inline h-3 w-3" />
                      )}
                      {Math.abs(data.latestMetrics.weight - data.previousMetrics.weight).toFixed(1)}
                    </span>
                  )}
                </p>
                {data.latestMetrics.body_fat_percentage && (
                  <p className="text-sm text-muted-foreground">
                    Body Fat: {data.latestMetrics.body_fat_percentage}%
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">No data yet</p>
                <Button size="sm" variant="default" onClick={() => router.push('/metrics')}>
                  Add Metrics
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>This Week's Progress</span>
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Workouts</p>
              <p className="text-2xl font-bold">
                {data?.weekProgress.workouts || 0}
                <span className="text-sm font-normal text-muted-foreground"> / {workoutGoal}</span>
              </p>
              <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${Math.min((data?.weekProgress.workouts || 0) / workoutGoal * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{(data?.weekProgress.totalVolume || 0).toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sets</p>
              <p className="text-2xl font-bold">{data?.weekProgress.totalSets || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{data?.weekProgress.avgDuration || 0} min</p>
            </div>
          </div>

          {/* Recent Workouts List */}
          {data?.weekWorkouts && data.weekWorkouts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Recent Workouts</h3>
              <div className="space-y-2">
                {data.weekWorkouts.slice(0, 3).map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                    <div>
                      <p className="font-medium text-sm">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(workout.started_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{workout.total_sets} sets</p>
                      <p className="text-xs text-muted-foreground">{workout.total_volume}kg</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/workouts">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  View All Workouts
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}