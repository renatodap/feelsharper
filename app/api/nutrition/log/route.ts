import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      food_id,
      food_name,
      amount,
      unit,
      meal_type,
      calories,
      macros,
      logged_at
    } = body;

    // Validate required fields
    if (!food_name || !amount || !meal_type || !calories) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert nutrition log entry
    const { data: nutritionLog, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: user.id,
        food_id,
        food_name,
        amount,
        unit,
        meal_type,
        calories,
        protein: macros?.protein || 0,
        carbs: macros?.carbs || 0,
        fat: macros?.fat || 0,
        fiber: macros?.fiber || 0,
        logged_at: logged_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ nutritionLog });
  } catch (error) {
    console.error('Nutrition log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const mealType = searchParams.get('meal_type');
    const date = searchParams.get('date');

    let query = supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (mealType) {
      query = query.eq('meal_type', mealType);
    }

    if (date) {
      query = query
        .gte('logged_at', `${date}T00:00:00.000Z`)
        .lt('logged_at', `${date}T23:59:59.999Z`);
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Get nutrition logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
