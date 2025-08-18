"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Apple, Plus, Calendar, TrendingUp, ChefHat, BookTemplate, Trash2, Home } from 'lucide-react';
import SimpleHeader from '@/components/navigation/SimpleHeader';

interface FoodLog {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export default function FoodPage() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [mealGroups, setMealGroups] = useState<Record<string, FoodLog[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  useEffect(() => {
    fetchFoodLogs();
  }, []);

  const fetchFoodLogs = async () => {
    try {
      const response = await fetch('/api/food/log');
      if (response.ok) {
        const data = await response.json();
        setFoodLogs(data.logs || []);
        setTotals(data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMealGroups(data.mealGroups || { breakfast: [], lunch: [], dinner: [], snack: [] });
      }
    } catch (error) {
      console.error('Failed to fetch food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this food entry?')) return;
    
    try {
      const response = await fetch(`/api/food/log?id=${logId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchFoodLogs(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete food log:', error);
    }
  };

  return (
    <>
      <SimpleHeader />
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/today"
                className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                title="Back to Dashboard"
              >
                <Home className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Food</h1>
                <p className="text-text-secondary text-lg">{today}</p>
              </div>
            </div>
            <a
              href="/food/add"
              className="inline-flex items-center px-6 py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Food
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round(totals.calories)}
              </div>
              <div className="text-sm text-text-secondary">Calories</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round(totals.protein)}g
              </div>
              <div className="text-sm text-text-secondary">Protein</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round(totals.carbs)}g
              </div>
              <div className="text-sm text-text-secondary">Carbs</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round(totals.fat)}g
              </div>
              <div className="text-sm text-text-secondary">Fat</div>
            </div>
          </div>

        {/* Daily Food Log */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Today's Food</h2>
          <div className="space-y-6">
            {mealTypes.map((mealType) => (
              <div key={mealType} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold capitalize">{mealType}</h3>
                  <a
                    href={`/food/add?meal=${mealType}`}
                    className="inline-flex items-center px-3 py-1 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </a>
                </div>
                
                {/* Food items or empty state */}
                {mealGroups[mealType] && mealGroups[mealType].length > 0 ? (
                  <div className="space-y-2">
                    {mealGroups[mealType].map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-bg rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{log.name}</div>
                          <div className="text-sm text-text-secondary">
                            {log.quantity} {log.unit} • {Math.round(log.calories)} cal
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Apple className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">No {mealType} logged yet</p>
                    <p className="text-text-muted text-sm mt-1">
                      Tap "Add" to log your first {mealType} item
                    </p>
                  </div>
                )}

                {/* Meal totals (shown when items exist) */}
                {mealGroups[mealType] && mealGroups[mealType].length > 0 && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Calories:</span>
                        <span className="text-text-primary font-medium ml-1">
                          {Math.round(mealGroups[mealType].reduce((sum, log) => sum + log.calories, 0))}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted">P:</span>
                        <span className="text-text-primary font-medium ml-1">
                          {Math.round(mealGroups[mealType].reduce((sum, log) => sum + log.protein_g, 0))}g
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted">C:</span>
                        <span className="text-text-primary font-medium ml-1">
                          {Math.round(mealGroups[mealType].reduce((sum, log) => sum + log.carbs_g, 0))}g
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted">F:</span>
                        <span className="text-text-primary font-medium ml-1">
                          {Math.round(mealGroups[mealType].reduce((sum, log) => sum + log.fat_g, 0))}g
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Recent Foods Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-navy" />
                <h3 className="text-lg font-semibold">Recent Foods</h3>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">No recent foods yet</p>
                  <p className="text-text-muted text-sm mt-1">
                    Start logging to see your frequently used foods here
                  </p>
                </div>
              </div>
            </div>

            {/* Recipes Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ChefHat className="w-6 h-6 text-navy" />
                  <h3 className="text-lg font-semibold">Recipes</h3>
                </div>
                <a
                  href="/food/recipes"
                  className="text-navy hover:underline text-sm"
                >
                  View all
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">No recipes yet</p>
                  <p className="text-text-muted text-sm mt-1">
                    Create custom recipes for accurate nutrition tracking
                  </p>
                </div>
              </div>
            </div>

            {/* Meal Templates Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookTemplate className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">Templates</h3>
                </div>
                <Link
                  href="/food/templates"
                  className="text-navy hover:underline text-sm"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">No templates yet</p>
                  <p className="text-text-muted text-sm mt-1">
                    Save meal combinations for quick logging
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">Analytics</h3>
                </div>
                <a
                  href="/insights"
                  className="text-navy hover:underline text-sm"
                >
                  View all
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">Start logging to see insights</p>
                  <p className="text-text-muted text-sm mt-1">
                    Track trends and nutrition patterns
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
    </>
  );
}