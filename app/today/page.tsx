"use client";

import { useState, useEffect } from 'react';
import { Apple, Dumbbell, Activity, TrendingUp, Plus, Calendar, MessageCircle } from 'lucide-react';
import { quickActions } from '@/lib/navigation/routes';
import SimpleHeader from '@/components/navigation/SimpleHeader';
import ChatAssistant from '@/components/ai/ChatAssistant';
import { useRouter } from 'next/navigation';

interface DailyTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface WeightData {
  current: number | null;
  change: number | null;
  trend: 'up' | 'down' | 'stable';
}

export default function TodayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [foodTotals, setFoodTotals] = useState<DailyTotals>({
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0
  });
  const [weightData, setWeightData] = useState<WeightData>({
    current: null,
    change: null,
    trend: 'stable'
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    fetchDailyData();
  }, []);

  const fetchDailyData = async () => {
    try {
      // Fetch food logs for today
      const foodResponse = await fetch('/api/food/log');
      if (foodResponse.ok) {
        const foodData = await foodResponse.json();
        setFoodTotals(foodData.totals || { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
        setRecentLogs(foodData.foodLogs ? foodData.foodLogs.slice(-3) : []); // Last 3 logs
      }

      // Fetch weight data
      const weightResponse = await fetch('/api/weight?days=7');
      if (weightResponse.ok) {
        const weightData = await weightResponse.json();
        if (weightData.stats) {
          setWeightData({
            current: weightData.stats.current,
            change: weightData.stats.change,
            trend: weightData.stats.trend
          });
        }
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logWeight = async () => {
    const weightStr = prompt('Enter your weight (kg):');
    if (!weightStr) return;
    
    const weight = parseFloat(weightStr);
    if (isNaN(weight)) {
      alert('Please enter a valid number');
      return;
    }

    try {
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight, unit: 'kg' })
      });

      if (response.ok) {
        fetchDailyData(); // Refresh data
      }
    } catch (error) {
      console.error('Error logging weight:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Today</h1>
          <p className="text-text-secondary text-lg">{today}</p>
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className={`group relative ${action.color} rounded-xl p-8 text-center hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-focus`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-white">
                      {action.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Today's Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Food Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Apple className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">Food</h3>
                </div>
                <button 
                  onClick={() => router.push('/food/add')}
                  className="text-navy hover:bg-navy/10 p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-border rounded w-3/4"></div>
                  <div className="h-4 bg-border rounded w-1/2"></div>
                </div>
              ) : foodTotals.kcal > 0 ? (
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-text-primary">
                    {Math.round(foodTotals.kcal)} <span className="text-sm font-normal text-text-secondary">kcal</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">P:</span> {Math.round(foodTotals.protein_g)}g
                    </div>
                    <div>
                      <span className="text-text-muted">C:</span> {Math.round(foodTotals.carbs_g)}g
                    </div>
                    <div>
                      <span className="text-text-muted">F:</span> {Math.round(foodTotals.fat_g)}g
                    </div>
                  </div>
                  <a href="/food" className="text-navy hover:underline text-sm inline-block">
                    View details →
                  </a>
                </div>
              ) : (
                <div className="space-y-2 text-text-secondary">
                  <p>No meals logged yet</p>
                  <a href="/food/add" className="text-navy hover:underline text-sm">
                    Log your first meal →
                  </a>
                </div>
              )}
            </div>

            {/* Weight Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-info" />
                  <h3 className="text-lg font-semibold">Weight</h3>
                </div>
                <button 
                  onClick={logWeight}
                  className="text-navy hover:bg-navy/10 p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-border rounded w-3/4"></div>
                  <div className="h-4 bg-border rounded w-1/2"></div>
                </div>
              ) : weightData.current ? (
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-text-primary">
                    {weightData.current.toFixed(1)} <span className="text-sm font-normal text-text-secondary">kg</span>
                  </div>
                  {weightData.change !== null && (
                    <div className={`text-sm flex items-center gap-1 ${
                      weightData.trend === 'down' ? 'text-success' : 
                      weightData.trend === 'up' ? 'text-warning' : 
                      'text-text-secondary'
                    }`}>
                      {weightData.trend === 'down' ? '↓' : weightData.trend === 'up' ? '↑' : '→'}
                      {Math.abs(weightData.change).toFixed(1)} kg this week
                    </div>
                  )}
                  <a href="/weight" className="text-navy hover:underline text-sm inline-block">
                    View trends →
                  </a>
                </div>
              ) : (
                <div className="space-y-2 text-text-secondary">
                  <p>No weight logged yet</p>
                  <button 
                    onClick={logWeight}
                    className="text-navy hover:underline text-sm text-left"
                  >
                    Add your weight →
                  </button>
                </div>
              )}
            </div>

            {/* Workout Card (Placeholder for now) */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-warning" />
                  <h3 className="text-lg font-semibold">Workout</h3>
                </div>
                <button 
                  onClick={() => router.push('/workouts/add')}
                  className="text-navy hover:bg-navy/10 p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-text-secondary">
                <p>Coming soon!</p>
                <p className="text-sm text-text-muted">Workout tracking will be available in the next update</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-navy" />
            AI Coach
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatAssistant />
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-navy/5 border border-navy/10 rounded-lg">
                  <p className="text-sm text-text-primary font-medium mb-1">Daily Tip</p>
                  <p className="text-sm text-text-secondary">
                    Start logging your meals to get personalized nutrition insights and recommendations.
                  </p>
                </div>
                <div className="p-4 bg-surface-2 border border-border rounded-lg">
                  <p className="text-sm text-text-primary font-medium mb-1">Quick Actions</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button className="text-xs px-3 py-1 bg-navy/10 text-navy rounded-full hover:bg-navy/20 transition-colors">
                      Meal suggestions
                    </button>
                    <button className="text-xs px-3 py-1 bg-navy/10 text-navy rounded-full hover:bg-navy/20 transition-colors">
                      Calorie calculator
                    </button>
                    <button className="text-xs px-3 py-1 bg-navy/10 text-navy rounded-full hover:bg-navy/20 transition-colors">
                      Weight goal setting
                    </button>
                  </div>
                </div>
                <div className="text-xs text-text-muted">
                  <p>Your AI assistant learns from your data to provide personalized guidance.</p>
                  <a href="/pricing" className="text-navy hover:underline">Upgrade to Pro</a> for advanced coaching features.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Recent Activity</h2>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Apple className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">{log.foods?.name}</p>
                      <p className="text-sm text-text-secondary">
                        {log.quantity} {log.foods?.unit} • {Math.round(log.kcal)} kcal
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-text-muted">
                    {new Date(log.logged_at).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
              <a href="/food" className="text-navy hover:underline text-sm inline-block mt-2">
                View all activity →
              </a>
            </div>
          ) : (
            <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
              <TrendingUp className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-secondary mb-2">
                Start tracking to see your progress
              </h3>
              <p className="text-text-muted mb-6">
                Once you log food or weight, your recent activity will appear here.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => router.push('/food/add')}
                  className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy-600 transition-colors"
                >
                  Log Food
                </button>
                <button 
                  onClick={logWeight}
                  className="px-6 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-surface-2 transition-colors"
                >
                  Log Weight
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}