'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FoodSearch } from './FoodSearch';
import { MacroSummary } from './MacroSummary';
import { MealPlanner } from './MealPlanner';
import { NutritionInsights } from './NutritionInsights';
import { 
  Plus, 
  Search, 
  Clock, 
  Target, 
  TrendingUp,
  Utensils,
  Zap,
  Camera,
  Save,
  Trash2
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  source: 'manual' | 'database' | 'barcode';
}

interface Meal {
  id: string;
  name: string;
  timestamp: Date;
  foods: FoodItem[];
  notes?: string;
}

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', time: '07:00' },
  { id: 'lunch', label: 'Lunch', icon: '☀️', time: '12:30' },
  { id: 'dinner', label: 'Dinner', icon: '🌙', time: '19:00' },
  { id: 'snack', label: 'Snack', icon: '🥜', time: '15:00' },
] as const;

export function MealLogger() {
  const [currentMeal, setCurrentMeal] = useState<Meal>({
    id: `meal_${Date.now()}`,
    name: 'breakfast',
    timestamp: new Date(),
    foods: []
  });

  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [dailyTargets] = useState({
    calories: 2200,
    protein: 150, // grams
    carbs: 275,   // grams
    fat: 85       // grams
  });

  // Load today's meals on component mount
  useEffect(() => {
    loadTodaysMeals();
  }, []);

  const loadTodaysMeals = async () => {
    // TODO: Load from Supabase
    // Mock data for now
    const mockMeals: Meal[] = [
      {
        id: 'meal_1',
        name: 'breakfast',
        timestamp: new Date(new Date().setHours(7, 30)),
        foods: [
          {
            id: 'food_1',
            name: 'Greek Yogurt',
            quantity: 200,
            unit: 'g',
            calories: 130,
            protein: 20,
            carbs: 9,
            fat: 0,
            source: 'database'
          },
          {
            id: 'food_2',
            name: 'Blueberries',
            quantity: 100,
            unit: 'g',
            calories: 84,
            protein: 1,
            carbs: 21,
            fat: 0.3,
            source: 'database'
          }
        ]
      }
    ];
    setTodaysMeals(mockMeals);
  };

  const addFoodToMeal = (food: FoodItem) => {
    setCurrentMeal(prev => ({
      ...prev,
      foods: [...prev.foods, { ...food, id: `food_${Date.now()}` }]
    }));
    setShowFoodSearch(false);
  };

  const removeFoodFromMeal = (foodId: string) => {
    setCurrentMeal(prev => ({
      ...prev,
      foods: prev.foods.filter(food => food.id !== foodId)
    }));
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      foods: prev.foods.map(food => {
        if (food.id === foodId) {
          const ratio = quantity / food.quantity;
          return {
            ...food,
            quantity,
            calories: Math.round(food.calories * ratio),
            protein: Math.round(food.protein * ratio * 10) / 10,
            carbs: Math.round(food.carbs * ratio * 10) / 10,
            fat: Math.round(food.fat * ratio * 10) / 10,
          };
        }
        return food;
      })
    }));
  };

  const saveMeal = async () => {
    if (currentMeal.foods.length === 0) return;

    // TODO: Save to Supabase
    setTodaysMeals(prev => [...prev, currentMeal]);
    
    // Reset current meal
    setCurrentMeal({
      id: `meal_${Date.now()}`,
      name: 'breakfast',
      timestamp: new Date(),
      foods: []
    });

    // Show success message
    alert('Meal logged successfully!');
  };

  const getMealTotals = (meal: Meal) => {
    return meal.foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getDailyTotals = () => {
    return todaysMeals.reduce((totals, meal) => {
      const mealTotals = getMealTotals(meal);
      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        carbs: totals.carbs + mealTotals.carbs,
        fat: totals.fat + mealTotals.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const currentMealTotals = getMealTotals(currentMeal);
  const dailyTotals = getDailyTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900 dark:to-green-950/20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Meal Logger
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track your nutrition with AI-powered insights and macro analysis
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Logging Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Type Selection */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Current Meal
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Meal Type Tabs */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {mealTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCurrentMeal(prev => ({ ...prev, name: type.id }))}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      currentMeal.name === type.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/50'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      {type.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {type.time}
                    </div>
                  </button>
                ))}
              </div>

              {/* Current Meal Summary */}
              {currentMeal.foods.length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {currentMealTotals.calories}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Calories</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(currentMealTotals.protein)}g
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Protein</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(currentMealTotals.carbs)}g
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Carbs</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(currentMealTotals.fat)}g
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Fat</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Items */}
              <div className="space-y-3 mb-6">
                {currentMeal.foods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-700">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {food.name}
                        </h4>
                        {food.brand && (
                          <Badge variant="secondary" className="text-xs">
                            {food.brand}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            food.source === 'database' ? 'bg-green-50 text-green-700' : 
                            food.source === 'barcode' ? 'bg-blue-50 text-blue-700' : 
                            'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {food.source}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div>
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => updateFoodQuantity(food.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700"
                            step="0.1"
                            min=&quot;0&quot;
                          />
                          <span className="ml-1">{food.unit}</span>
                        </div>
                        <div>{food.calories} kcal</div>
                        <div>{Math.round(food.protein * 10) / 10}g protein</div>
                        <div>{Math.round(food.carbs * 10) / 10}g carbs</div>
                        <div>{Math.round(food.fat * 10) / 10}g fat</div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoodFromMeal(food.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Food Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowFoodSearch(true)}
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Foods
                </Button>
                
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan
                </Button>
              </div>

              {/* Save Meal */}
              {currentMeal.foods.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {currentMeal.foods.length} item{currentMeal.foods.length !== 1 ? 's' : ''} • {currentMealTotals.calories} calories
                    </div>
                    <Button onClick={saveMeal}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Meal
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Today&apos;s Meals */}
            {todaysMeals.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Today&apos;s Meals
                </h2>
                <div className="space-y-4">
                  {todaysMeals.map((meal) => {
                    const mealType = mealTypes.find(type => type.id === meal.name);
                    const totals = getMealTotals(meal);
                    return (
                      <div key={meal.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mealType?.icon}</span>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {mealType?.label}
                            </h3>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {totals.calories} kcal
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>{Math.round(totals.protein)}g protein</div>
                          <div>{Math.round(totals.carbs)}g carbs</div>
                          <div>{Math.round(totals.fat)}g fat</div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                          {meal.foods.map(food => food.name).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Progress */}
            <MacroSummary 
              current={dailyTotals}
              targets={dailyTargets}
            />

            {/* Nutrition Insights */}
            <NutritionInsights 
              dailyTotals={dailyTotals}
              targets={dailyTargets}
              meals={todaysMeals}
            />
          </div>
        </div>

        {/* Food Search Modal */}
        {showFoodSearch && (
          <FoodSearch
            onAddFood={addFoodToMeal}
            onClose={() => setShowFoodSearch(false)}
          />
        )}
      </div>
    </div>
  );
}