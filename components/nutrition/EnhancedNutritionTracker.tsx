'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Target, 
  TrendingUp, 
  Camera, 
  Utensils,
  Apple,
  Zap,
  Scale,
  Clock,
  ChefHat,
  X,
  Check,
  Info
} from 'lucide-react';
import { 
  COMMON_FOODS, 
  MEAL_SUGGESTIONS,
  FoodItem, 
  MealSuggestion,
  searchFoods, 
  getFoodsByCategory,
  calculateMealMacros,
  calculateDailyMacroTargets,
  getMealSuggestionsByGoal,
  getMealSuggestionsByCategory
} from '@/data/nutrition';

const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;

interface LoggedFood {
  id: string;
  food_id: string;
  food_name: string;
  amount: number;
  unit: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  logged_at: string;
}

interface DailyNutrition {
  date: string;
  foods: LoggedFood[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface UserProfile {
  weight: number;
  goal: string;
  activity_level: string;
}

export default function EnhancedNutritionTracker() {
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodAmount, setFoodAmount] = useState(100);
  const [showMealSuggestions, setShowMealSuggestions] = useState(false);
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyNutrition();
    loadUserProfile();
  }, []);

  const loadDailyNutrition = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/nutrition/daily?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        setDailyNutrition(data);
      } else {
        // Initialize empty day
        initializeEmptyDay();
      }
    } catch (error) {
      console.error('Failed to load daily nutrition:', error);
      initializeEmptyDay();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const initializeEmptyDay = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultTargets = calculateDailyMacroTargets('general_health', 70, 'moderate');
    
    setDailyNutrition({
      date: today,
      foods: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      targets: defaultTargets
    });
  };

  const logFood = async () => {
    if (!selectedFood || !dailyNutrition) return;

    const multiplier = foodAmount / selectedFood.serving_size;
    const calories = Math.round(selectedFood.calories_per_serving * multiplier);
    const macros = {
      protein: Math.round(selectedFood.macros_per_serving.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.macros_per_serving.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.macros_per_serving.fat * multiplier * 10) / 10,
      fiber: Math.round(selectedFood.macros_per_serving.fiber * multiplier * 10) / 10
    };

    const loggedFood: LoggedFood = {
      id: Date.now().toString(),
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      amount: foodAmount,
      unit: selectedFood.serving_unit,
      meal_type: selectedMealType,
      calories,
      macros,
      logged_at: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loggedFood)
      });

      if (response.ok) {
        // Update local state
        const newFoods = [...dailyNutrition.foods, loggedFood];
        const newTotals = calculateDayTotals(newFoods);
        
        setDailyNutrition({
          ...dailyNutrition,
          foods: newFoods,
          totals: newTotals
        });

        // Reset form
        setSelectedFood(null);
        setFoodAmount(100);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Failed to log food:', error);
    }
  };

  const removeFood = async (foodId: string) => {
    if (!dailyNutrition) return;

    try {
      const response = await fetch(`/api/nutrition/log/${foodId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const newFoods = dailyNutrition.foods.filter(f => f.id !== foodId);
        const newTotals = calculateDayTotals(newFoods);
        
        setDailyNutrition({
          ...dailyNutrition,
          foods: newFoods,
          totals: newTotals
        });
      }
    } catch (error) {
      console.error('Failed to remove food:', error);
    }
  };

  const calculateDayTotals = (foods: LoggedFood[]) => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.macros.protein,
      carbs: totals.carbs + food.macros.carbs,
      fat: totals.fat + food.macros.fat,
      fiber: totals.fiber + food.macros.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const getFilteredFoods = () => {
    let foods = COMMON_FOODS;
    
    if (selectedCategory !== 'all') {
      foods = getFoodsByCategory(selectedCategory);
    }
    
    if (searchTerm) {
      foods = searchFoods(searchTerm);
    }
    
    return foods;
  };

  const getMealFoods = (mealType: string) => {
    return dailyNutrition?.foods.filter(food => food.meal_type === mealType) || [];
  };

  const getMealTotals = (mealType: string) => {
    const mealFoods = getMealFoods(mealType);
    return calculateDayTotals(mealFoods);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 80) return 'bg-red-500';
    if (percentage < 95) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dailyNutrition) return null;

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${getProgressPercentage(dailyNutrition.totals.calories, dailyNutrition.targets.calories)}, 100`}
                    className={getProgressColor(dailyNutrition.totals.calories, dailyNutrition.targets.calories)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <p className="text-sm font-medium">Calories</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {dailyNutrition.totals.calories} / {dailyNutrition.targets.calories}
              </p>
            </div>

            {/* Protein */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${getProgressPercentage(dailyNutrition.totals.protein, dailyNutrition.targets.protein)}, 100`}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">P</span>
                </div>
              </div>
              <p className="text-sm font-medium">Protein</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {Math.round(dailyNutrition.totals.protein)}g / {dailyNutrition.targets.protein}g
              </p>
            </div>

            {/* Carbs */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${getProgressPercentage(dailyNutrition.totals.carbs, dailyNutrition.targets.carbs)}, 100`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">C</span>
                </div>
              </div>
              <p className="text-sm font-medium">Carbs</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {Math.round(dailyNutrition.totals.carbs)}g / {dailyNutrition.targets.carbs}g
              </p>
            </div>

            {/* Fat */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${getProgressPercentage(dailyNutrition.totals.fat, dailyNutrition.targets.fat)}, 100`}
                    className="text-purple-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">F</span>
                </div>
              </div>
              <p className="text-sm font-medium">Fat</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {Math.round(dailyNutrition.totals.fat)}g / {dailyNutrition.targets.fat}g
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowMealSuggestions(true)}
              className="h-auto py-4"
            >
              <div className="text-center">
                <ChefHat className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Meal Ideas</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Get suggestions</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4"
            >
              <div className="text-center">
                <Camera className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Scan Food</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Barcode scanner</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Food */}
      <Card>
        <CardHeader>
          <CardTitle>Log Food</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Meal Type Selection */}
            <div>
              <Label>Meal Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                  <Button
                    key={meal}
                    variant={selectedMealType === meal ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMealType(meal as any)}
                    className="capitalize"
                  >
                    {meal}
                  </Button>
                ))}
              </div>
            </div>

            {/* Food Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="all">All</option>
                <option value="proteins">Proteins</option>
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="dairy">Dairy</option>
                <option value="nuts_seeds">Nuts & Seeds</option>
              </select>
            </div>

            {/* Food List */}
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {getFilteredFoods().map((food) => (
                <div
                  key={food.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {food.calories_per_serving} cal per {food.serving_size}{food.serving_unit}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFood(food);
                        setShowFoodDetails(true);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Amount Input */}
            {selectedFood && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex-1">
                  <Label htmlFor="amount">Amount ({selectedFood.serving_unit})</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={foodAmount}
                    onChange={(e) => setFoodAmount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Calories</p>
                  <p className="font-semibold">
                    {Math.round((selectedFood.calories_per_serving * foodAmount) / selectedFood.serving_size)}
                  </p>
                </div>
                <Button onClick={logFood}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meals Breakdown */}
      {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
        const mealFoods = getMealFoods(mealType);
        const mealTotals = getMealTotals(mealType);
        
        if (mealFoods.length === 0) return null;
        
        return (
          <Card key={mealType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{mealType}</CardTitle>
                <div className="text-right">
                  <p className="text-sm font-medium">{mealTotals.calories} calories</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    P: {Math.round(mealTotals.protein)}g • C: {Math.round(mealTotals.carbs)}g • F: {Math.round(mealTotals.fat)}g
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mealFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <div>
                      <p className="font-medium">{food.food_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {food.amount}{food.unit} • {food.calories} cal
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFood(food.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Food Details Modal */}
      {showFoodDetails && selectedFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedFood.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFoodDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Nutrition per {selectedFood.serving_size}{selectedFood.serving_unit}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Calories:</span>
                    <p className="font-medium">{selectedFood.calories_per_serving}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Protein:</span>
                    <p className="font-medium">{selectedFood.macros_per_serving.protein}g</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Carbs:</span>
                    <p className="font-medium">{selectedFood.macros_per_serving.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Fat:</span>
                    <p className="font-medium">{selectedFood.macros_per_serving.fat}g</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Fiber:</span>
                    <p className="font-medium">{selectedFood.macros_per_serving.fiber}g</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Sugar:</span>
                    <p className="font-medium">{selectedFood.macros_per_serving.sugar}g</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Meal Suggestions Modal */}
      {showMealSuggestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Meal Suggestions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMealSuggestions(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MEAL_SUGGESTIONS.map((meal) => (
                  <div key={meal.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{meal.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {meal.category} • {meal.prep_time_minutes} min • {meal.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{meal.total_calories} cal</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          P: {meal.total_macros.protein}g • C: {meal.total_macros.carbs}g • F: {meal.total_macros.fat}g
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {meal.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" className="w-full">
                      Add to {selectedMealType}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
