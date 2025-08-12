'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Search, 
  X, 
  Plus, 
  Clock, 
  Star,
  Database,
  Utensils,
  Apple,
  Beef,
  Coffee
} from 'lucide-react';

interface FoodSearchProps {
  onAddFood: (food: any) => void;
  onClose: () => void;
}

export function FoodSearch({ onAddFood, onClose }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'search' | 'recent' | 'favorites' | 'quick'>('search');

  // Mock food database - in production, this would integrate with OpenFoodFacts or similar API
  const foodDatabase = [
    {
      id: 'chicken_breast',
      name: 'Chicken Breast',
      brand: 'Fresh',
      category: 'Protein',
      per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 piece (150g)', multiplier: 1.5 },
        { name: '1 cup diced (140g)', multiplier: 1.4 }
      ]
    },
    {
      id: 'brown_rice',
      name: 'Brown Rice',
      brand: 'Cooked',
      category: 'Grains',
      per100g: { calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 cup (195g)', multiplier: 1.95 },
        { name: '1/2 cup (98g)', multiplier: 0.98 }
      ]
    },
    {
      id: 'greek_yogurt',
      name: 'Greek Yogurt',
      brand: 'Plain 0% Fat',
      category: 'Dairy',
      per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 container (170g)', multiplier: 1.7 },
        { name: '1 cup (245g)', multiplier: 2.45 }
      ]
    },
    {
      id: 'oats',
      name: 'Rolled Oats',
      brand: 'Dry',
      category: 'Grains',
      per100g: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1/2 cup (40g)', multiplier: 0.4 },
        { name: '1 cup (80g)', multiplier: 0.8 }
      ]
    },
    {
      id: 'banana',
      name: 'Banana',
      brand: 'Fresh',
      category: 'Fruits',
      per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 medium (118g)', multiplier: 1.18 },
        { name: '1 large (136g)', multiplier: 1.36 }
      ]
    },
    {
      id: 'salmon',
      name: 'Atlantic Salmon',
      brand: 'Cooked',
      category: 'Fish',
      per100g: { calories: 208, protein: 25.4, carbs: 0, fat: 12.4 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 fillet (150g)', multiplier: 1.5 },
        { name: '3.5 oz (100g)', multiplier: 1 }
      ]
    },
    {
      id: 'avocado',
      name: 'Avocado',
      brand: 'Fresh',
      category: 'Fruits',
      per100g: { calories: 160, protein: 2, carbs: 9, fat: 15 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1/2 medium (75g)', multiplier: 0.75 },
        { name: '1 medium (150g)', multiplier: 1.5 }
      ]
    },
    {
      id: 'almonds',
      name: 'Almonds',
      brand: 'Raw',
      category: 'Nuts',
      per100g: { calories: 579, protein: 21.2, carbs: 22, fat: 49.9 },
      commonPortions: [
        { name: '100g', multiplier: 1 },
        { name: '1 handful (28g)', multiplier: 0.28 },
        { name: '10 pieces (14g)', multiplier: 0.14 }
      ]
    }
  ];

  const recentFoods = [
    { id: 'greek_yogurt', lastUsed: '2024-08-10' },
    { id: 'oats', lastUsed: '2024-08-10' },
    { id: 'banana', lastUsed: '2024-08-09' },
  ];

  const favoriteFoods = [
    'chicken_breast',
    'brown_rice',
    'greek_yogurt',
  ];

  const quickAddFoods = [
    { name: 'Protein Shake', calories: 150, protein: 25, carbs: 3, fat: 2 },
    { name: 'Mixed Nuts (handful)', calories: 180, protein: 6, carbs: 6, fat: 16 },
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Coffee (black)', calories: 5, protein: 0.3, carbs: 1, fat: 0 },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        const results = foodDatabase.filter(food =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'protein':
      case 'fish':
        return <Beef className="h-4 w-4" />;
      case 'fruits':
        return <Apple className="h-4 w-4" />;
      case 'dairy':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'protein':
      case 'fish':
        return 'bg-red-50 text-red-600';
      case 'fruits':
        return 'bg-orange-50 text-orange-600';
      case 'dairy':
        return 'bg-blue-50 text-blue-600';
      case 'grains':
        return 'bg-yellow-50 text-yellow-600';
      case 'nuts':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  const addFoodWithPortion = (food: any, portion: any) => {
    const nutritionPerGram = {
      calories: food.per100g.calories / 100,
      protein: food.per100g.protein / 100,
      carbs: food.per100g.carbs / 100,
      fat: food.per100g.fat / 100,
    };

    const quantity = portion.multiplier * 100; // Convert to grams
    
    const foodItem = {
      name: food.name,
      brand: food.brand,
      quantity: quantity,
      unit: 'g',
      calories: Math.round(nutritionPerGram.calories * quantity),
      protein: Math.round(nutritionPerGram.protein * quantity * 10) / 10,
      carbs: Math.round(nutritionPerGram.carbs * quantity * 10) / 10,
      fat: Math.round(nutritionPerGram.fat * quantity * 10) / 10,
      source: 'database' as const
    };

    onAddFood(foodItem);
  };

  const addQuickFood = (quickFood: any) => {
    const foodItem = {
      name: quickFood.name,
      quantity: 1,
      unit: 'serving',
      calories: quickFood.calories,
      protein: quickFood.protein,
      carbs: quickFood.carbs,
      fat: quickFood.fat,
      source: 'manual' as const
    };

    onAddFood(foodItem);
  };

  const getFilteredFoods = () => {
    switch (selectedTab) {
      case 'recent':
        return recentFoods.map(recent => 
          foodDatabase.find(food => food.id === recent.id)
        ).filter(Boolean);
      case 'favorites':
        return favoriteFoods.map(fav => 
          foodDatabase.find(food => food.id === fav)
        ).filter(Boolean);
      case 'quick':
        return quickAddFoods;
      default:
        return searchResults;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Add Food
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'search', label: 'Search', icon: Search },
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'favorites', label: 'Favorites', icon: Star },
            { id: 'quick', label: 'Quick Add', icon: Plus },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {selectedTab === 'search' && (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-700 dark:bg-slate-800"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {isSearching ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Database className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Searching food database...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(food => (
                    <FoodSearchResult
                      key={food.id}
                      food={food}
                      onAddFood={addFoodWithPortion}
                      getCategoryIcon={getCategoryIcon}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              ) : searchQuery.length > 2 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No foods found for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>Type to search our food database</p>
                  <p className="text-sm mt-1">Over 100,000 foods available</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'quick' && (
            <div className="space-y-3">
              {quickAddFoods.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-700">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {food.name}
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {food.calories} kcal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addQuickFood(food)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {(selectedTab === 'recent' || selectedTab === 'favorites') && (
            <div className="space-y-3">
              {getFilteredFoods().map(food => (
                <FoodSearchResult
                  key={food.id}
                  food={food}
                  onAddFood={addFoodWithPortion}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function FoodSearchResult({ food, onAddFood, getCategoryIcon, getCategoryColor }: any) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {food.name}
            </h3>
            <Badge className={`${getCategoryColor(food.category)} border-0 text-xs`}>
              {getCategoryIcon(food.category)}
              <span className="ml-1">{food.category}</span>
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {food.brand}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {food.per100g.calories}
          </div>
          <div>kcal</div>
        </div>
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {food.per100g.protein}g
          </div>
          <div>protein</div>
        </div>
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {food.per100g.carbs}g
          </div>
          <div>carbs</div>
        </div>
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {food.per100g.fat}g
          </div>
          <div>fat</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {food.commonPortions.map((portion: any, index: number) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onAddFood(food, portion)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {portion.name}
          </Button>
        ))}
      </div>
    </div>
  );
}