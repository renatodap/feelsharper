import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { foodId, name, quantity, unit, mealType, calories, protein, carbs, fat, isCustom } = body;

    // Validate required fields
    if (!foodId || !name || !quantity || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, create or get today's meal for this meal type
    const today = new Date().toISOString().split('T')[0];
    const mealName = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${today}`;
    
    // Insert the meal first (or get existing)
    const { data: mealData, error: mealError } = await supabase
      .from('meals')
      .upsert({
        user_id: user.id,
        eaten_at: new Date().toISOString(),
        name: mealName,
        kcal: parseFloat(calories || 0),
        protein_g: parseFloat(protein || 0),
        carbs_g: parseFloat(carbs || 0),
        fat_g: parseFloat(fat || 0),
      }, {
        onConflict: 'user_id,name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (mealError) {
      console.error('Error creating meal:', mealError);
      return NextResponse.json(
        { error: 'Failed to create meal entry' },
        { status: 500 }
      );
    }

    // Then insert the meal item
    const { data, error } = await supabase
      .from('meal_items')
      .insert({
        meal_id: mealData.id,
        food_name: name,
        qty: parseFloat(quantity),
        unit: unit || 'g',
        kcal: Math.round(parseFloat(calories || 0)),
        protein_g: parseFloat(protein || 0),
        carbs_g: parseFloat(carbs || 0),
        fat_g: parseFloat(fat || 0),
        source: isCustom ? 'custom' : 'usda'
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging food:', error);
      return NextResponse.json(
        { error: 'Failed to log food' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in food log API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get date from query params (default to today)
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch meals and meal items for the user and date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (*)
      `)
      .eq('user_id', user.id)
      .gte('eaten_at', startOfDay.toISOString())
      .lte('eaten_at', endOfDay.toISOString())
      .order('eaten_at', { ascending: true });

    if (error) {
      console.error('Error fetching food logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch food logs' },
        { status: 500 }
      );
    }

    // Calculate totals and organize meals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    const mealGroups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    // Flatten meal items and categorize by meal type
    const allItems: any[] = [];
    
    data?.forEach((meal: any) => {
      totals.calories += meal.kcal || 0;
      totals.protein += meal.protein_g || 0;
      totals.carbs += meal.carbs_g || 0;
      totals.fat += meal.fat_g || 0;

      // Extract meal type from name (e.g., "Breakfast - 2025-01-15" -> "breakfast")
      let mealType = 'snack';
      if (meal.name) {
        const nameLower = meal.name.toLowerCase();
        if (nameLower.includes('breakfast')) mealType = 'breakfast';
        else if (nameLower.includes('lunch')) mealType = 'lunch';
        else if (nameLower.includes('dinner')) mealType = 'dinner';
      }

      // Process meal items
      meal.meal_items?.forEach((item: any) => {
        const processedItem = {
          id: item.id,
          name: item.food_name,
          quantity: item.qty,
          unit: item.unit,
          calories: item.kcal,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
          meal_type: mealType,
          logged_at: meal.eaten_at
        };
        
        allItems.push(processedItem);
        
        if (mealGroups[mealType as keyof typeof mealGroups]) {
          mealGroups[mealType as keyof typeof mealGroups].push(processedItem);
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      logs: allItems,
      totals,
      mealGroups
    });
  } catch (error) {
    console.error('Error in food log API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID required' },
        { status: 400 }
      );
    }

    // Delete the meal item (RLS will ensure user owns it via meal)
    const { error } = await supabase
      .from('meal_items')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('Error deleting food log:', error);
      return NextResponse.json(
        { error: 'Failed to delete food log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in food log API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}