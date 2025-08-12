import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get logged foods for the day
    const { data: foods, error: foodsError } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', `${date}T00:00:00.000Z`)
      .lt('logged_at', `${date}T23:59:59.999Z`)
      .order('logged_at', { ascending: true });

    if (foodsError) {
      return NextResponse.json({ error: foodsError.message }, { status: 500 });
    }

    // Get user's macro targets
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('weight, goal, activity_level')
      .eq('user_id', user.id)
      .single();

    // Calculate targets based on profile or use defaults
    let targets = {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 67
    };

    if (profile && !profileError) {
      // Calculate personalized targets
      const weight = profile.weight || 70;
      const goal = profile.goal || 'general_health';
      const activityLevel = profile.activity_level || 'moderate';
      
      targets = calculateMacroTargets(goal, weight, activityLevel);
    }

    // Calculate totals
    const totals = foods?.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
      fiber: acc.fiber + (food.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }) || 
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    return NextResponse.json({
      date,
      foods: foods || [],
      totals,
      targets
    });
  } catch (error) {
    console.error('Daily nutrition error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMacroTargets(goal: string, weight: number, activityLevel: string) {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  
  let baseCalories = 0;
  let proteinMultiplier = 0;
  let fatPercentage = 0;
  
  switch (goal) {
    case 'weight_loss':
      baseCalories = weight * 22 * multiplier * 0.8;
      proteinMultiplier = 2.2;
      fatPercentage = 0.25;
      break;
    case 'muscle_gain':
      baseCalories = weight * 22 * multiplier * 1.1;
      proteinMultiplier = 2.0;
      fatPercentage = 0.25;
      break;
    case 'endurance':
      baseCalories = weight * 22 * multiplier * 1.05;
      proteinMultiplier = 1.6;
      fatPercentage = 0.20;
      break;
    default:
      baseCalories = weight * 22 * multiplier;
      proteinMultiplier = 1.8;
      fatPercentage = 0.25;
  }
  
  const protein = weight * proteinMultiplier;
  const fat = (baseCalories * fatPercentage) / 9;
  const carbs = (baseCalories - (protein * 4) - (fat * 9)) / 4;
  
  return {
    calories: Math.round(baseCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
}
