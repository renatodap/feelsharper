import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

// Pre-built meal plan templates
const MEAL_PLAN_TEMPLATES = {
  'weight-loss': {
    name: 'Weight Loss Plan',
    description: 'Calorie deficit plan for sustainable weight loss',
    dailyCalories: 1500,
    macroSplit: { protein: 40, carbs: 30, fat: 30 },
    meals: [
      {
        name: 'Breakfast',
        calories: 350,
        items: [
          { name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 5 },
          { name: 'Greek Yogurt', calories: 100, protein: 15, carbs: 8, fat: 2 }
        ]
      },
      {
        name: 'Lunch',
        calories: 450,
        items: [
          { name: 'Grilled Chicken Salad', calories: 350, protein: 35, carbs: 20, fat: 12 },
          { name: 'Apple', calories: 100, protein: 0, carbs: 25, fat: 0 }
        ]
      },
      {
        name: 'Dinner',
        calories: 500,
        items: [
          { name: 'Salmon with Vegetables', calories: 400, protein: 40, carbs: 20, fat: 18 },
          { name: 'Brown Rice', calories: 100, protein: 2, carbs: 22, fat: 1 }
        ]
      },
      {
        name: 'Snacks',
        calories: 200,
        items: [
          { name: 'Protein Shake', calories: 150, protein: 25, carbs: 10, fat: 3 },
          { name: 'Almonds', calories: 50, protein: 2, carbs: 2, fat: 4 }
        ]
      }
    ]
  },
  'muscle-gain': {
    name: 'Muscle Building Plan',
    description: 'High protein plan for muscle growth',
    dailyCalories: 2800,
    macroSplit: { protein: 35, carbs: 45, fat: 20 },
    meals: [
      {
        name: 'Breakfast',
        calories: 600,
        items: [
          { name: 'Eggs and Toast', calories: 400, protein: 30, carbs: 40, fat: 12 },
          { name: 'Protein Smoothie', calories: 200, protein: 25, carbs: 20, fat: 3 }
        ]
      },
      {
        name: 'Lunch',
        calories: 800,
        items: [
          { name: 'Chicken and Rice Bowl', calories: 600, protein: 50, carbs: 70, fat: 10 },
          { name: 'Mixed Vegetables', calories: 100, protein: 3, carbs: 20, fat: 1 },
          { name: 'Banana', calories: 100, protein: 1, carbs: 27, fat: 0 }
        ]
      },
      {
        name: 'Dinner',
        calories: 900,
        items: [
          { name: 'Steak and Sweet Potato', calories: 700, protein: 60, carbs: 50, fat: 25 },
          { name: 'Quinoa Salad', calories: 200, protein: 8, carbs: 35, fat: 4 }
        ]
      },
      {
        name: 'Snacks',
        calories: 500,
        items: [
          { name: 'Protein Bar', calories: 250, protein: 20, carbs: 30, fat: 8 },
          { name: 'Peanut Butter Sandwich', calories: 250, protein: 10, carbs: 30, fat: 12 }
        ]
      }
    ]
  },
  'maintenance': {
    name: 'Balanced Maintenance',
    description: 'Maintain current weight with balanced nutrition',
    dailyCalories: 2000,
    macroSplit: { protein: 30, carbs: 40, fat: 30 },
    meals: [
      {
        name: 'Breakfast',
        calories: 450,
        items: [
          { name: 'Whole Grain Cereal', calories: 300, protein: 10, carbs: 50, fat: 6 },
          { name: 'Milk and Fruit', calories: 150, protein: 8, carbs: 20, fat: 3 }
        ]
      },
      {
        name: 'Lunch',
        calories: 600,
        items: [
          { name: 'Turkey Sandwich', calories: 400, protein: 30, carbs: 45, fat: 12 },
          { name: 'Side Salad', calories: 100, protein: 2, carbs: 8, fat: 7 },
          { name: 'Orange', calories: 100, protein: 1, carbs: 25, fat: 0 }
        ]
      },
      {
        name: 'Dinner',
        calories: 700,
        items: [
          { name: 'Pasta with Chicken', calories: 550, protein: 40, carbs: 65, fat: 15 },
          { name: 'Garlic Bread', calories: 150, protein: 4, carbs: 20, fat: 7 }
        ]
      },
      {
        name: 'Snacks',
        calories: 250,
        items: [
          { name: 'Trail Mix', calories: 150, protein: 5, carbs: 15, fat: 10 },
          { name: 'Yogurt', calories: 100, protein: 10, carbs: 12, fat: 2 }
        ]
      }
    ]
  },
  'keto': {
    name: 'Ketogenic Diet',
    description: 'Very low carb, high fat diet',
    dailyCalories: 1800,
    macroSplit: { protein: 25, carbs: 5, fat: 70 },
    meals: [
      {
        name: 'Breakfast',
        calories: 450,
        items: [
          { name: 'Bacon and Eggs', calories: 350, protein: 25, carbs: 2, fat: 28 },
          { name: 'Avocado', calories: 100, protein: 1, carbs: 6, fat: 9 }
        ]
      },
      {
        name: 'Lunch',
        calories: 500,
        items: [
          { name: 'Caesar Salad with Chicken', calories: 400, protein: 35, carbs: 8, fat: 28 },
          { name: 'Cheese Sticks', calories: 100, protein: 7, carbs: 1, fat: 8 }
        ]
      },
      {
        name: 'Dinner',
        calories: 600,
        items: [
          { name: 'Ribeye Steak', calories: 450, protein: 45, carbs: 0, fat: 30 },
          { name: 'Buttered Broccoli', calories: 150, protein: 3, carbs: 8, fat: 12 }
        ]
      },
      {
        name: 'Snacks',
        calories: 250,
        items: [
          { name: 'Macadamia Nuts', calories: 150, protein: 2, carbs: 2, fat: 16 },
          { name: 'Pork Rinds', calories: 100, protein: 12, carbs: 0, fat: 6 }
        ]
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planType = searchParams.get('type');
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's custom meal plans
    const { data: customPlans, error } = await supabase
      .from('meal_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal plans:', error);
    }

    // Return specific template if requested
    if (planType && MEAL_PLAN_TEMPLATES[planType as keyof typeof MEAL_PLAN_TEMPLATES]) {
      return NextResponse.json({
        template: MEAL_PLAN_TEMPLATES[planType as keyof typeof MEAL_PLAN_TEMPLATES],
        customPlans: customPlans || []
      });
    }

    // Return all templates and custom plans
    return NextResponse.json({
      templates: MEAL_PLAN_TEMPLATES,
      customPlans: customPlans || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, meals, daily_calories, macro_split, is_public } = body;
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create custom meal plan
    const { data: mealPlan, error } = await supabase
      .from('meal_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        meals,
        daily_calories,
        macro_split,
        is_public: is_public || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
    }

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply a meal plan to a specific date
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { planId, date, adjustCalories } = body;
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the meal plan
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_templates')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Apply the meal plan by creating food logs for the specified date
    const foodLogs = [];
    const meals = mealPlan.meals as any;
    
    for (const meal of meals) {
      for (const item of meal.items) {
        foodLogs.push({
          user_id: user.id,
          food_name: item.name,
          meal_type: meal.name.toLowerCase(),
          kcal: item.calories,
          protein_g: item.protein,
          carbs_g: item.carbs,
          fat_g: item.fat,
          logged_at: `${date}T${getMealTime(meal.name)}`,
          from_template: true,
          template_id: planId
        });
      }
    }

    // Insert all food logs
    const { data, error } = await supabase
      .from('food_logs')
      .insert(foodLogs);

    if (error) {
      console.error('Error applying meal plan:', error);
      return NextResponse.json({ error: 'Failed to apply meal plan' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Applied ${foodLogs.length} items from meal plan`,
      appliedDate: date
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get meal times
function getMealTime(mealName: string): string {
  const mealTimes: { [key: string]: string } = {
    'breakfast': '08:00:00',
    'lunch': '12:30:00',
    'dinner': '18:30:00',
    'snacks': '15:00:00'
  };
  return mealTimes[mealName.toLowerCase()] || '12:00:00';
}