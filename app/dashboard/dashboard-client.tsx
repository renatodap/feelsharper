"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ProgressDashboard from '@/components/dashboard/ProgressDashboard';
import { 
  Apple, 
  Dumbbell, 
  TrendingUp, 
  Target,
  ChevronDown,
  ChevronUp,
  Flame,
  Plus,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/components/dashboard/DashboardProvider';

interface DashboardClientProps {
  userId: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'food' | 'workout' | 'progress'>('overview');
  const [loading, setLoading] = useState(true);
  const { showMoreMetrics, setShowMoreMetrics } = useDashboard();
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workoutCompleted: false,
    weight: null as number | null
  });

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    
    // Load today's food logs
    const response = await fetch(`/api/food/log?date=${today}`);
    if (response.ok) {
      const data = await response.json();
      setTodayStats(prev => ({
        ...prev,
        calories: data.totals?.calories || 0,
        protein: data.totals?.protein || 0,
        carbs: data.totals?.carbs || 0,
        fat: data.totals?.fat || 0
      }));
    }

    // Check for today's workout
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', today + 'T00:00:00')
      .lte('workout_date', today + 'T23:59:59');
    
    if (workouts && workouts.length > 0) {
      setTodayStats(prev => ({ ...prev, workoutCompleted: true }));
    }

    // Get latest weight
    const { data: weightData } = await supabase
      .from('body_measurements')
      .select('weight_kg')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();
    
    if (weightData) {
      setTodayStats(prev => ({ ...prev, weight: weightData.weight_kg }));
    }

    setLoading(false);
  };

  const targetCalories = 2000;
  const targetProtein = 150;
  const calorieProgress = (todayStats.calories / targetCalories) * 100;
  const proteinProgress = (todayStats.protein / targetProtein) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* More Metrics Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMoreMetrics(!showMoreMetrics)}
        className="w-full mb-6"
      >
        {showMoreMetrics ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            More Metrics
          </>
        )}
      </Button>

      {/* Additional Metrics Panel */}
      {showMoreMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Calories</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.calories}</div>
            <div className="text-xs text-muted-foreground">
              {targetCalories - todayStats.calories} remaining
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Protein</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.protein}g</div>
            <div className="text-xs text-muted-foreground">
              {targetProtein - todayStats.protein}g remaining
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Carbs</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.carbs}g</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fat</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.fat}g</div>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-surface border rounded-lg mb-6">
        <div className="flex gap-1 p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'food', label: 'Food', icon: Apple },
            { id: 'workout', label: 'Workout', icon: Dumbbell },
            { id: 'progress', label: 'Progress', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded transition-colors",
                  activeTab === tab.id 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                className="py-8 text-lg"
                onClick={() => setActiveTab('food')}
              >
                <Apple className="w-6 h-6 mr-2" />
                Log Food
              </Button>
              <Button 
                variant={todayStats.workoutCompleted ? "outline" : "primary"}
                className="py-8 text-lg"
                onClick={() => setActiveTab('workout')}
              >
                <Dumbbell className="w-6 h-6 mr-2" />
                {todayStats.workoutCompleted ? 'Workout Done ✓' : 'Start Workout'}
              </Button>
            </div>

            {/* Today's Summary */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Today's Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories</span>
                  <span className="font-medium">{todayStats.calories} / {targetCalories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein</span>
                  <span className="font-medium">{todayStats.protein}g / {targetProtein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs</span>
                  <span className="font-medium">{todayStats.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat</span>
                  <span className="font-medium">{todayStats.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workout</span>
                  <span className="font-medium">
                    {todayStats.workoutCompleted ? '✓ Completed' : 'Not started'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Motivational Card */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-4">
                <div className="text-4xl">💪</div>
                <div>
                  <h3 className="font-semibold">Keep Going!</h3>
                  <p className="text-sm text-muted-foreground">
                    You're {Math.round(calorieProgress)}% to your calorie goal. 
                    {calorieProgress < 80 && " Time for a healthy snack!"}
                    {calorieProgress >= 80 && calorieProgress < 100 && " Almost there!"}
                    {calorieProgress >= 100 && " Goal achieved! 🎉"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quick Food Logger</h2>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Food
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <p>Food logging component coming soon</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Workout tracking component coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <ProgressDashboard 
              userId={userId}
              targetCalories={targetCalories}
              targetProtein={targetProtein}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'overview', icon: Target },
            { id: 'food', icon: Apple },
            { id: 'workout', icon: Dumbbell },
            { id: 'progress', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 transition-colors",
                  activeTab === tab.id 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 capitalize">{tab.id}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}