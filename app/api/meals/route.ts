import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let query = supabase
    .from('meals')
    .select(`
      *,
      food_items(*)
    `)
    .eq('user_id', user.id)
    .order('consumed_at', { ascending: false });

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString());
  } else {
    query = query.range(offset, offset + limit - 1);
  }

  const { data: meals, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate daily totals if date is provided
  if (date && meals) {
    const totals = meals.reduce((acc: any, meal: any) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return NextResponse.json({ meals, totals });
  }

  return NextResponse.json({ meals });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    meal_type,
    name,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    notes,
    food_items = []
  } = body;

  // Create the meal
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: user.id,
      meal_type: meal_type || 'snack',
      name,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber,
      sugar,
      sodium,
      notes,
      consumed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (mealError) {
    return NextResponse.json({ error: mealError.message }, { status: 500 });
  }

  // Add food items if provided
  if (food_items.length > 0 && meal) {
    const itemsToInsert = food_items.map((item: any) => ({
      meal_id: meal.id,
      name: item.name,
      brand: item.brand,
      quantity: item.quantity || 1,
      unit: item.unit || 'serving',
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber,
      sugar: item.sugar,
      sodium: item.sodium,
      barcode: item.barcode,
    }));

    const { error: itemsError } = await supabase
      .from('food_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Failed to add food items:', itemsError);
    }
  }

  return NextResponse.json({ meal }, { status: 201 });
}