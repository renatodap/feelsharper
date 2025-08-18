"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Camera, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommonFood {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'snacks';
}

const COMMON_FOODS: CommonFood[] = [
  // Proteins
  { id: 'chicken', name: 'Chicken Breast', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g', category: 'protein' },
  { id: 'beef', name: 'Lean Beef', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, serving: '100g', category: 'protein' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', calories: 208, protein: 20, carbs: 0, fat: 13, serving: '100g', category: 'protein' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '2 large', category: 'protein' },
  { id: 'tofu', name: 'Tofu', emoji: '🍲', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, serving: '100g', category: 'protein' },
  
  // Carbs
  { id: 'rice', name: 'White Rice', emoji: '🍚', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100g cooked', category: 'carbs' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', calories: 131, protein: 5, carbs: 25, fat: 1.1, serving: '100g cooked', category: 'carbs' },
  { id: 'bread', name: 'Whole Wheat Bread', emoji: '🍞', calories: 81, protein: 4, carbs: 14, fat: 1.1, serving: '1 slice', category: 'carbs' },
  { id: 'oats', name: 'Oatmeal', emoji: '🥣', calories: 71, protein: 2.5, carbs: 12, fat: 1.4, serving: '1/2 cup dry', category: 'carbs' },
  { id: 'potato', name: 'Sweet Potato', emoji: '🍠', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: '100g', category: 'carbs' },
  
  // Vegetables
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: '100g', category: 'vegetables' },
  { id: 'spinach', name: 'Spinach', emoji: '🥬', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '100g', category: 'vegetables' },
  { id: 'tomato', name: 'Tomatoes', emoji: '🍅', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving: '100g', category: 'vegetables' },
  
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: '1 medium', category: 'fruits' },
  { id: 'banana', name: 'Banana', emoji: '🍌', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '1 medium', category: 'fruits' },
  { id: 'berries', name: 'Mixed Berries', emoji: '🫐', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, serving: '100g', category: 'fruits' },
  
  // Dairy
  { id: 'milk', name: 'Whole Milk', emoji: '🥛', calories: 149, protein: 8, carbs: 12, fat: 8, serving: '1 cup', category: 'dairy' },
  { id: 'yogurt', name: 'Greek Yogurt', emoji: '🥄', calories: 100, protein: 10, carbs: 4, fat: 5, serving: '100g', category: 'dairy' },
  { id: 'cheese', name: 'Cheddar Cheese', emoji: '🧀', calories: 402, protein: 25, carbs: 1.3, fat: 33, serving: '100g', category: 'dairy' },
  
  // Snacks
  { id: 'nuts', name: 'Mixed Nuts', emoji: '🥜', calories: 607, protein: 20, carbs: 21, fat: 54, serving: '100g', category: 'snacks' },
  { id: 'protein-bar', name: 'Protein Bar', emoji: '🍫', calories: 200, protein: 20, carbs: 22, fat: 7, serving: '1 bar', category: 'snacks' },
];

interface QuickFoodLoggerProps {
  onLog: (food: CommonFood, quantity: number, mealType: string) => Promise<void>;
  currentMeal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export default function QuickFoodLogger({ onLog, currentMeal = 'snack' }: QuickFoodLoggerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<CommonFood | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState(currentMeal);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  const categories = [
    { id: 'all', name: 'All', emoji: '🍽️' },
    { id: 'protein', name: 'Protein', emoji: '🥩' },
    { id: 'carbs', name: 'Carbs', emoji: '🍚' },
    { id: 'vegetables', name: 'Veggies', emoji: '🥦' },
    { id: 'fruits', name: 'Fruits', emoji: '🍎' },
    { id: 'dairy', name: 'Dairy', emoji: '🥛' },
    { id: 'snacks', name: 'Snacks', emoji: '🥜' },
  ];

  const filteredFoods = selectedCategory === 'all' 
    ? COMMON_FOODS 
    : COMMON_FOODS.filter(f => f.category === selectedCategory);

  const handleQuickLog = async (food: CommonFood) => {
    setIsLogging(true);
    try {
      await onLog(food, 1, mealType);
      setRecentFoods(prev => [food.id, ...prev.filter(id => id !== food.id)].slice(0, 5));
    } finally {
      setIsLogging(false);
    }
  };

  const handleCustomLog = async () => {
    if (!selectedFood) return;
    setIsLogging(true);
    try {
      await onLog(selectedFood, quantity, mealType);
      setRecentFoods(prev => [selectedFood.id, ...prev.filter(id => id !== selectedFood.id)].slice(0, 5));
      setSelectedFood(null);
      setQuantity(1);
    } finally {
      setIsLogging(false);
    }
  };

  const recentFoodItems = recentFoods
    .map(id => COMMON_FOODS.find(f => f.id === id))
    .filter(Boolean) as CommonFood[];

  return (
    <div className="space-y-4">
      {/* Meal Type Selector */}
      <div className="flex gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
          <Button
            key={meal}
            variant={mealType === meal ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMealType(meal)}
            className="capitalize"
          >
            {meal === 'breakfast' && '🌅'} 
            {meal === 'lunch' && '☀️'} 
            {meal === 'dinner' && '🌙'} 
            {meal === 'snack' && '🍿'} 
            {meal}
          </Button>
        ))}
      </div>

      {/* Recent Foods */}
      {recentFoodItems.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Recent</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {recentFoodItems.map((food) => (
              <Button
                key={food.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLog(food)}
                disabled={isLogging}
                className="flex items-center gap-1"
              >
                <span>{food.emoji}</span>
                <span className="text-xs">{food.name}</span>
                <span className="text-xs text-muted-foreground">+{food.calories}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="flex-shrink-0"
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredFoods.map((food) => (
          <Card
            key={food.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:scale-105",
              selectedFood?.id === food.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedFood(food)}
          >
            <div className="text-center space-y-2">
              <div className="text-3xl">{food.emoji}</div>
              <div className="text-sm font-medium">{food.name}</div>
              <div className="text-xs text-muted-foreground">{food.serving}</div>
              <div className="flex justify-center gap-2 text-xs">
                <span className="font-bold">{food.calories}</span>
                <span className="text-muted-foreground">cal</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>P: {food.protein}g</span>
                <span>C: {food.carbs}g</span>
                <span>F: {food.fat}g</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLog(food);
                }}
                disabled={isLogging}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Quick Add
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Quantity Modal */}
      {selectedFood && (
        <Card className="fixed bottom-20 left-4 right-4 z-50 p-4 bg-surface border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedFood.emoji}</span>
                <div>
                  <div className="font-medium">{selectedFood.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedFood.serving}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFood(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
              >
                -
              </Button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-20 text-center bg-background border border-border rounded px-2 py-1"
                step="0.5"
                min="0.5"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 0.5)}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">servings</span>
            </div>

            <div className="bg-muted/50 rounded p-2 text-sm">
              <div className="flex justify-between">
                <span>Calories:</span>
                <span className="font-bold">{Math.round(selectedFood.calories * quantity)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>P: {Math.round(selectedFood.protein * quantity)}g</span>
                <span>C: {Math.round(selectedFood.carbs * quantity)}g</span>
                <span>F: {Math.round(selectedFood.fat * quantity)}g</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleCustomLog}
              disabled={isLogging}
              className="w-full"
            >
              Add to {mealType}
            </Button>
          </div>
        </Card>
      )}

      {/* Photo Capture Button */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          <Camera className="w-4 h-4 mr-2" />
          Scan Food
        </Button>
        <Button variant="outline" className="flex-1">
          <Search className="w-4 h-4 mr-2" />
          Search Database
        </Button>
      </div>
    </div>
  );
}