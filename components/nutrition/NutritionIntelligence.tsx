'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  Utensils, 
  Target, 
  TrendingUp, 
  Clock, 
  Camera, 
  Mic, 
  Brain, 
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  ShoppingCart,
  Calendar,
  Zap,
  Award,
  BarChart3,
  PieChart,
  Apple,
  Coffee,
  Sandwich,
  ChefHat,
  MapPin,
  Star,
  Timer,
  Scale
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in ml
}

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  category: 'protein' | 'carbs' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'snack';
  quickAdd: boolean;
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  foods: { food: FoodItem; quantity: number }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  location?: string;
  mood?: 'satisfied' | 'hungry' | 'overfull';
  aiSuggested?: boolean;
}

interface MealPlan {
  id: string;
  date: Date;
  meals: Meal[];
  totalNutrition: NutritionGoals;
  adherenceScore: number;
  aiOptimized: boolean;
}

interface SmartSuggestion {
  id: string;
  type: 'meal' | 'substitution' | 'timing' | 'hydration';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  actionable: boolean;
}

export default function NutritionIntelligence() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todaysPlan, setTodaysPlan] = useState<MealPlan | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2200,
    protein: 165,
    carbs: 220,
    fat: 73,
    fiber: 35,
    water: 3000
  });
  const [loggedMeals, setLoggedMeals] = useState<Meal[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [quickAddFoods, setQuickAddFoods] = useState<FoodItem[]>([]);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [voiceLogging, setVoiceLogging] = useState(false);

  useEffect(() => {
    loadTodaysData();
    generateSmartSuggestions();
  }, [currentDate]);

  const loadTodaysData = () => {
    // Mock data for today's nutrition
    const mockMeals: Meal[] = [
      {
        id: 'breakfast1',
        name: 'Protein Oatmeal Bowl',
        type: 'breakfast',
        timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 7, 30),
        foods: [
          { food: { id: 'oats', name: 'Steel Cut Oats', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, servingSize: '1/2 cup', category: 'carbs', quickAdd: true }, quantity: 1 },
          { food: { id: 'protein_powder', name: 'Whey Protein', calories: 120, protein: 25, carbs: 2, fat: 1, fiber: 0, servingSize: '1 scoop', category: 'protein', quickAdd: true }, quantity: 1 }
        ],
        totalCalories: 270,
        totalProtein: 30,
        totalCarbs: 29,
        totalFat: 4,
        mood: 'satisfied',
        aiSuggested: true
      },
      {
        id: 'lunch1',
        name: 'Grilled Chicken Salad',
        type: 'lunch',
        timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 45),
        foods: [
          { food: { id: 'chicken_breast', name: 'Grilled Chicken Breast', calories: 185, protein: 35, carbs: 0, fat: 4, fiber: 0, servingSize: '4 oz', category: 'protein', quickAdd: true }, quantity: 1 },
          { food: { id: 'mixed_greens', name: 'Mixed Greens', calories: 20, protein: 2, carbs: 4, fat: 0, fiber: 2, servingSize: '2 cups', category: 'vegetable', quickAdd: true }, quantity: 1 }
        ],
        totalCalories: 205,
        totalProtein: 37,
        totalCarbs: 4,
        totalFat: 4,
        location: 'Office',
        mood: 'satisfied'
      }
    ];

    setLoggedMeals(mockMeals);

    // Calculate today's totals
    const totalNutrition = mockMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      fiber: acc.fiber + meal.foods.reduce((fiberSum, f) => fiberSum + (f.food.fiber * f.quantity), 0),
      water: acc.water + 1500 // Mock water intake
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });

    const adherenceScore = Math.round(
      ((totalNutrition.calories / nutritionGoals.calories) * 0.3 +
       (totalNutrition.protein / nutritionGoals.protein) * 0.4 +
       (totalNutrition.water / nutritionGoals.water) * 0.3) * 100
    );

    setTodaysPlan({
      id: 'today',
      date: currentDate,
      meals: mockMeals,
      totalNutrition,
      adherenceScore: Math.min(adherenceScore, 100),
      aiOptimized: true
    });

    // Load quick add foods
    setQuickAddFoods([
      { id: 'banana', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, servingSize: '1 medium', category: 'fruit', quickAdd: true },
      { id: 'almonds', name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 4, servingSize: '1 oz', category: 'fat', quickAdd: true },
      { id: 'greek_yogurt', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, servingSize: '1 cup', category: 'protein', quickAdd: true }
    ]);
  };

  const generateSmartSuggestions = () => {
    const suggestions: SmartSuggestion[] = [
      {
        id: 'protein_boost',
        type: 'meal',
        title: 'Protein Gap Alert',
        description: 'You\'re 45g short of your protein goal. Add a protein shake or Greek yogurt.',
        reason: 'Current protein: 67g, Goal: 165g',
        confidence: 0.9,
        actionable: true
      },
      {
        id: 'hydration_reminder',
        type: 'hydration',
        title: 'Hydration Check',
        description: 'You\'ve had 1.5L of water today. Aim for another 1.5L before evening.',
        reason: 'Optimal hydration supports metabolism and recovery',
        confidence: 0.8,
        actionable: true
      },
      {
        id: 'dinner_optimization',
        type: 'meal',
        title: 'Smart Dinner Planning',
        description: 'Based on your workout today, I suggest a carb-rich dinner with lean protein.',
        reason: 'Post-workout nutrition window optimization',
        confidence: 0.85,
        actionable: true
      },
      {
        id: 'restaurant_guide',
        type: 'meal',
        title: 'Restaurant Navigation',
        description: 'Eating at Chipotle? Try: Burrito bowl, chicken, brown rice, black beans, salsa.',
        reason: 'Location-based smart recommendations',
        confidence: 0.75,
        actionable: true
      }
    ];

    setSmartSuggestions(suggestions);
  };

  const getNutritionProgress = () => {
    if (!todaysPlan) return [];

    const { totalNutrition } = todaysPlan;
    
    return [
      { name: 'Calories', current: totalNutrition.calories, target: nutritionGoals.calories, unit: 'kcal', color: '#3b82f6' },
      { name: 'Protein', current: totalNutrition.protein, target: nutritionGoals.protein, unit: 'g', color: '#ef4444' },
      { name: 'Carbs', current: totalNutrition.carbs, target: nutritionGoals.carbs, unit: 'g', color: '#f59e0b' },
      { name: 'Fat', current: totalNutrition.fat, target: nutritionGoals.fat, unit: 'g', color: '#10b981' },
      { name: 'Water', current: totalNutrition.water, target: nutritionGoals.water, unit: 'ml', color: '#06b6d4' }
    ];
  };

  const getMacroDistribution = () => {
    if (!todaysPlan) return [];

    const { totalNutrition } = todaysPlan;
    const totalMacroCalories = (totalNutrition.protein * 4) + (totalNutrition.carbs * 4) + (totalNutrition.fat * 9);

    return [
      { name: 'Protein', value: Math.round((totalNutrition.protein * 4 / totalMacroCalories) * 100), color: '#ef4444' },
      { name: 'Carbs', value: Math.round((totalNutrition.carbs * 4 / totalMacroCalories) * 100), color: '#f59e0b' },
      { name: 'Fat', value: Math.round((totalNutrition.fat * 9 / totalMacroCalories) * 100), color: '#10b981' }
    ];
  };

  const quickAddFood = (food: FoodItem) => {
    const newMeal: Meal = {
      id: 'quick_' + Date.now(),
      name: `Quick Add: ${food.name}`,
      type: 'snack',
      timestamp: new Date(),
      foods: [{ food, quantity: 1 }],
      totalCalories: food.calories,
      totalProtein: food.protein,
      totalCarbs: food.carbs,
      totalFat: food.fat
    };

    setLoggedMeals(prev => [...prev, newMeal]);
    
    // Update today's plan
    if (todaysPlan) {
      const updatedNutrition = {
        calories: todaysPlan.totalNutrition.calories + food.calories,
        protein: todaysPlan.totalNutrition.protein + food.protein,
        carbs: todaysPlan.totalNutrition.carbs + food.carbs,
        fat: todaysPlan.totalNutrition.fat + food.fat,
        fiber: todaysPlan.totalNutrition.fiber + food.fiber,
        water: todaysPlan.totalNutrition.water
      };

      setTodaysPlan({
        ...todaysPlan,
        meals: [...todaysPlan.meals, newMeal],
        totalNutrition: updatedNutrition
      });
    }
  };

  const renderNutritionOverview = () => (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h3" className="text-xl font-bold mb-2">
            Today's Nutrition
          </Typography>
          <Typography variant="body2" className="text-slate-600">
            {currentDate.toLocaleDateString()} • Adherence: {todaysPlan?.adherenceScore || 0}%
          </Typography>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setVoiceLogging(!voiceLogging)}>
            <Mic className={`w-4 h-4 mr-2 ${voiceLogging ? 'text-red-500' : ''}`} />
            Voice Log
          </Button>
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Photo Log
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </div>
      </div>

      {/* Nutrition Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {getNutritionProgress().map((nutrient) => (
          <div key={nutrient.name} className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={nutrient.color}
                  strokeWidth="2"
                  strokeDasharray={`${Math.min((nutrient.current / nutrient.target) * 100, 100)}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Typography variant="body2" className="text-xs font-bold">
                  {Math.round((nutrient.current / nutrient.target) * 100)}%
                </Typography>
              </div>
            </div>
            <Typography variant="body2" className="font-medium mb-1">{nutrient.name}</Typography>
            <Typography variant="body2" className="text-slate-600 text-xs">
              {Math.round(nutrient.current)}/{nutrient.target} {nutrient.unit}
            </Typography>
          </div>
        ))}
      </div>

      {/* Macro Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Typography variant="h4" className="font-semibold mb-4">Macro Distribution</Typography>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <RechartsPieChart data={getMacroDistribution()}>
                  {getMacroDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <Typography variant="h4" className="font-semibold mb-4">Quick Add</Typography>
          <div className="grid grid-cols-2 gap-3">
            {quickAddFoods.map((food) => (
              <Button
                key={food.id}
                variant="outline"
                className="p-3 h-auto flex-col"
                onClick={() => quickAddFood(food)}
              >
                <Typography variant="body2" className="font-medium mb-1">{food.name}</Typography>
                <Typography variant="body2" className="text-slate-600 text-xs">
                  {food.calories} cal • {food.protein}g protein
                </Typography>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderSmartSuggestions = () => (
    <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <Typography variant="h4" className="font-semibold text-purple-900">
          Smart Nutrition Insights
        </Typography>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {smartSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <Typography variant="body2" className="font-medium text-purple-900">
                {suggestion.title}
              </Typography>
              <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {Math.round(suggestion.confidence * 100)}% confident
              </div>
            </div>
            <Typography variant="body2" className="text-purple-800 mb-2">
              {suggestion.description}
            </Typography>
            <Typography variant="body2" className="text-purple-600 text-sm mb-3">
              {suggestion.reason}
            </Typography>
            {suggestion.actionable && (
              <Button variant="primary" size="sm">
                Take Action
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  const renderMealTimeline = () => (
    <Card className="p-6">
      <Typography variant="h4" className="font-semibold mb-4">Today&apos;s Meals</Typography>
      
      <div className="space-y-4">
        {loggedMeals.map((meal) => (
          <div key={meal.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                {meal.type === 'breakfast' && <Coffee className="w-6 h-6 text-white" />}
                {meal.type === 'lunch' && <Sandwich className="w-6 h-6 text-white" />}
                {meal.type === 'dinner' && <ChefHat className="w-6 h-6 text-white" />}
                {meal.type === 'snack' && <Apple className="w-6 h-6 text-white" />}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="body2" className="font-semibold">{meal.name}</Typography>
                <div className="flex items-center space-x-2">
                  {meal.aiSuggested && (
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      AI Suggested
                    </div>
                  )}
                  <Typography variant="body2" className="text-slate-500 text-sm">
                    {meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-2">
                <div>
                  <Typography variant="body2" className="text-slate-600 text-xs">Calories</Typography>
                  <Typography variant="body2" className="font-medium">{meal.totalCalories}</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-slate-600 text-xs">Protein</Typography>
                  <Typography variant="body2" className="font-medium">{meal.totalProtein}g</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-slate-600 text-xs">Carbs</Typography>
                  <Typography variant="body2" className="font-medium">{meal.totalCarbs}g</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-slate-600 text-xs">Fat</Typography>
                  <Typography variant="body2" className="font-medium">{meal.totalFat}g</Typography>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {meal.foods.map((foodItem, index) => (
                  <span key={index} className="bg-white px-2 py-1 rounded-full text-xs text-slate-600">
                    {foodItem.food.name} ({foodItem.quantity}x)
                  </span>
                ))}
              </div>
              
              {meal.location && (
                <div className="flex items-center mt-2 text-slate-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <Typography variant="body2" className="text-xs">{meal.location}</Typography>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loggedMeals.length === 0 && (
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <Typography variant="h4" className="font-semibold mb-2 text-slate-600">
              No meals logged yet
            </Typography>
            <Typography variant="body2" className="text-slate-500 mb-4">
              Start tracking your nutrition to get personalized insights
            </Typography>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Log First Meal
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Nutrition Intelligence
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Smart nutrition that adapts to your life, goals, and preferences
        </Typography>
      </div>

      {/* Voice Logging Indicator */}
      {voiceLogging && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <Typography variant="body2" className="text-red-700 font-medium">
              🎤 Listening... Say something like &quot;I had chicken and rice for lunch&quot;
            </Typography>
            <Button variant="ghost" size="sm" onClick={() => setVoiceLogging(false)}>
              Stop
            </Button>
          </div>
        </Card>
      )}

      {/* Nutrition Overview */}
      {renderNutritionOverview()}

      {/* Smart Suggestions */}
      {renderSmartSuggestions()}

      {/* Meal Timeline */}
      {renderMealTimeline()}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="primary" size="lg">
          <Target className="w-5 h-5 mr-2" />
          Meal Planner
        </Button>
        <Button variant="outline" size="lg">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Shopping List
        </Button>
        <Button variant="outline" size="lg">
          <BarChart3 className="w-5 h-5 mr-2" />
          Nutrition Report
        </Button>
      </div>
    </div>
  );
}
