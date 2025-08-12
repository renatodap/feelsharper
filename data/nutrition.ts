export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  serving_size: number;
  serving_unit: string;
  calories_per_serving: number;
  macros_per_serving: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  micronutrients?: {
    sodium: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitamin_c: number;
    vitamin_d: number;
  };
  barcode?: string;
  verified: boolean;
}

export interface MealSuggestion {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prep_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: {
    food_id: string;
    amount: number;
    unit: string;
  }[];
  instructions: string[];
  total_calories: number;
  total_macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  goal_alignment: string[]; // 'weight_loss', 'muscle_gain', 'endurance', etc.
}

export const FOOD_CATEGORIES = [
  'proteins', 'grains', 'vegetables', 'fruits', 'dairy', 'nuts_seeds',
  'oils_fats', 'beverages', 'snacks', 'supplements', 'prepared_meals'
];

export const COMMON_FOODS: FoodItem[] = [
  // PROTEINS
  {
    id: 'chicken_breast',
    name: 'Chicken Breast',
    category: 'proteins',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 165,
    macros_per_serving: {
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0
    },
    micronutrients: {
      sodium: 74,
      potassium: 256,
      calcium: 15,
      iron: 0.9,
      vitamin_c: 0,
      vitamin_d: 0
    },
    verified: true
  },
  {
    id: 'salmon_fillet',
    name: 'Salmon Fillet',
    category: 'proteins',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 208,
    macros_per_serving: {
      protein: 25.4,
      carbs: 0,
      fat: 12.4,
      fiber: 0,
      sugar: 0
    },
    micronutrients: {
      sodium: 59,
      potassium: 363,
      calcium: 12,
      iron: 0.8,
      vitamin_c: 0,
      vitamin_d: 11
    },
    verified: true
  },
  {
    id: 'eggs_whole',
    name: 'Whole Eggs',
    category: 'proteins',
    serving_size: 50,
    serving_unit: 'g',
    calories_per_serving: 78,
    macros_per_serving: {
      protein: 6.3,
      carbs: 0.6,
      fat: 5.3,
      fiber: 0,
      sugar: 0.6
    },
    verified: true
  },
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt (Plain)',
    category: 'dairy',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 100,
    macros_per_serving: {
      protein: 10,
      carbs: 3.6,
      fat: 5,
      fiber: 0,
      sugar: 3.6
    },
    verified: true
  },

  // GRAINS
  {
    id: 'brown_rice',
    name: 'Brown Rice (Cooked)',
    category: 'grains',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 112,
    macros_per_serving: {
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4
    },
    verified: true
  },
  {
    id: 'quinoa',
    name: 'Quinoa (Cooked)',
    category: 'grains',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 120,
    macros_per_serving: {
      protein: 4.4,
      carbs: 22,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9
    },
    verified: true
  },
  {
    id: 'oats',
    name: 'Rolled Oats (Dry)',
    category: 'grains',
    serving_size: 40,
    serving_unit: 'g',
    calories_per_serving: 154,
    macros_per_serving: {
      protein: 5.4,
      carbs: 28,
      fat: 2.8,
      fiber: 4,
      sugar: 0.4
    },
    verified: true
  },

  // VEGETABLES
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'vegetables',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 25,
    macros_per_serving: {
      protein: 3,
      carbs: 5,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.5
    },
    micronutrients: {
      sodium: 33,
      potassium: 316,
      calcium: 47,
      iron: 0.7,
      vitamin_c: 89,
      vitamin_d: 0
    },
    verified: true
  },
  {
    id: 'spinach',
    name: 'Spinach (Raw)',
    category: 'vegetables',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 23,
    macros_per_serving: {
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4
    },
    verified: true
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato (Baked)',
    category: 'vegetables',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 90,
    macros_per_serving: {
      protein: 2,
      carbs: 21,
      fat: 0.2,
      fiber: 3.3,
      sugar: 6.8
    },
    verified: true
  },

  // FRUITS
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 89,
    macros_per_serving: {
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12
    },
    verified: true
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruits',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 52,
    macros_per_serving: {
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10
    },
    verified: true
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    category: 'fruits',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 57,
    macros_per_serving: {
      protein: 0.7,
      carbs: 14,
      fat: 0.3,
      fiber: 2.4,
      sugar: 10
    },
    verified: true
  },

  // NUTS & SEEDS
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'nuts_seeds',
    serving_size: 28,
    serving_unit: 'g',
    calories_per_serving: 164,
    macros_per_serving: {
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 3.5,
      sugar: 1.2
    },
    verified: true
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter (Natural)',
    category: 'nuts_seeds',
    serving_size: 32,
    serving_unit: 'g',
    calories_per_serving: 190,
    macros_per_serving: {
      protein: 8,
      carbs: 8,
      fat: 16,
      fiber: 3,
      sugar: 3
    },
    verified: true
  },

  // OILS & FATS
  {
    id: 'olive_oil',
    name: 'Olive Oil',
    category: 'oils_fats',
    serving_size: 14,
    serving_unit: 'g',
    calories_per_serving: 120,
    macros_per_serving: {
      protein: 0,
      carbs: 0,
      fat: 14,
      fiber: 0,
      sugar: 0
    },
    verified: true
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'oils_fats',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 160,
    macros_per_serving: {
      protein: 2,
      carbs: 9,
      fat: 15,
      fiber: 7,
      sugar: 0.7
    },
    verified: true
  }
];

export const MEAL_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'protein_oats',
    name: 'Protein Overnight Oats',
    category: 'breakfast',
    prep_time_minutes: 5,
    difficulty: 'easy',
    ingredients: [
      { food_id: 'oats', amount: 40, unit: 'g' },
      { food_id: 'greek_yogurt', amount: 100, unit: 'g' },
      { food_id: 'blueberries', amount: 50, unit: 'g' },
      { food_id: 'almonds', amount: 14, unit: 'g' }
    ],
    instructions: [
      'Mix oats with Greek yogurt in a jar',
      'Add blueberries and chopped almonds',
      'Refrigerate overnight',
      'Enjoy cold in the morning'
    ],
    total_calories: 395,
    total_macros: {
      protein: 18.4,
      carbs: 42,
      fat: 13.3
    },
    tags: ['high_protein', 'make_ahead', 'no_cook'],
    goal_alignment: ['muscle_gain', 'general_health']
  },
  {
    id: 'chicken_quinoa_bowl',
    name: 'Chicken Quinoa Power Bowl',
    category: 'lunch',
    prep_time_minutes: 25,
    difficulty: 'medium',
    ingredients: [
      { food_id: 'chicken_breast', amount: 120, unit: 'g' },
      { food_id: 'quinoa', amount: 80, unit: 'g' },
      { food_id: 'broccoli', amount: 100, unit: 'g' },
      { food_id: 'avocado', amount: 50, unit: 'g' },
      { food_id: 'olive_oil', amount: 7, unit: 'g' }
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Season and grill chicken breast',
      'Steam broccoli until tender',
      'Slice avocado',
      'Combine all ingredients in bowl, drizzle with olive oil'
    ],
    total_calories: 518,
    total_macros: {
      protein: 41.2,
      carbs: 35.6,
      fat: 19.8
    },
    tags: ['balanced', 'high_protein', 'gluten_free'],
    goal_alignment: ['muscle_gain', 'weight_loss', 'sport_specific']
  },
  {
    id: 'salmon_sweet_potato',
    name: 'Baked Salmon with Sweet Potato',
    category: 'dinner',
    prep_time_minutes: 30,
    difficulty: 'medium',
    ingredients: [
      { food_id: 'salmon_fillet', amount: 150, unit: 'g' },
      { food_id: 'sweet_potato', amount: 150, unit: 'g' },
      { food_id: 'spinach', amount: 100, unit: 'g' },
      { food_id: 'olive_oil', amount: 7, unit: 'g' }
    ],
    instructions: [
      'Preheat oven to 400°F (200°C)',
      'Cube sweet potato and toss with half the olive oil',
      'Bake sweet potato for 20 minutes',
      'Season salmon and bake for 12-15 minutes',
      'Sauté spinach with remaining oil',
      'Serve together'
    ],
    total_calories: 518,
    total_macros: {
      protein: 41.0,
      carbs: 34.4,
      fat: 25.6
    },
    tags: ['omega_3', 'anti_inflammatory', 'nutrient_dense'],
    goal_alignment: ['general_health', 'endurance', 'weight_loss']
  }
];

export function searchFoods(query: string): FoodItem[] {
  const lowercaseQuery = query.toLowerCase();
  return COMMON_FOODS.filter(food => 
    food.name.toLowerCase().includes(lowercaseQuery) ||
    food.category.toLowerCase().includes(lowercaseQuery) ||
    food.brand?.toLowerCase().includes(lowercaseQuery)
  );
}

export function getFoodsByCategory(category: string): FoodItem[] {
  return COMMON_FOODS.filter(food => food.category === category);
}

export function calculateMealMacros(ingredients: { food_id: string; amount: number; unit: string }[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  ingredients.forEach(ingredient => {
    const food = COMMON_FOODS.find(f => f.id === ingredient.food_id);
    if (food) {
      const multiplier = ingredient.amount / food.serving_size;
      totals.calories += food.calories_per_serving * multiplier;
      totals.protein += food.macros_per_serving.protein * multiplier;
      totals.carbs += food.macros_per_serving.carbs * multiplier;
      totals.fat += food.macros_per_serving.fat * multiplier;
      totals.fiber += food.macros_per_serving.fiber * multiplier;
    }
  });
  
  return totals;
}

export function getMealSuggestionsByGoal(goal: string): MealSuggestion[] {
  return MEAL_SUGGESTIONS.filter(meal => 
    meal.goal_alignment.includes(goal)
  );
}

export function getMealSuggestionsByCategory(category: string): MealSuggestion[] {
  return MEAL_SUGGESTIONS.filter(meal => meal.category === category);
}

export function calculateDailyMacroTargets(goal: string, weight: number, activityLevel: string): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let baseCalories = 0;
  let proteinMultiplier = 0;
  let fatPercentage = 0;
  
  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  
  // Goal-specific calculations
  switch (goal) {
    case 'weight_loss':
      baseCalories = weight * 22 * multiplier * 0.8; // 20% deficit
      proteinMultiplier = 2.2; // Higher protein for muscle preservation
      fatPercentage = 0.25;
      break;
    case 'muscle_gain':
      baseCalories = weight * 22 * multiplier * 1.1; // 10% surplus
      proteinMultiplier = 2.0;
      fatPercentage = 0.25;
      break;
    case 'endurance':
      baseCalories = weight * 22 * multiplier * 1.05; // Slight surplus
      proteinMultiplier = 1.6;
      fatPercentage = 0.20; // Higher carbs for endurance
      break;
    default:
      baseCalories = weight * 22 * multiplier;
      proteinMultiplier = 1.8;
      fatPercentage = 0.25;
  }
  
  const protein = weight * proteinMultiplier;
  const fat = (baseCalories * fatPercentage) / 9; // 9 calories per gram of fat
  const carbs = (baseCalories - (protein * 4) - (fat * 9)) / 4; // 4 calories per gram
  
  return {
    calories: Math.round(baseCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
}
