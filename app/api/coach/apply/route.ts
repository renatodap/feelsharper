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
    const { insightId, actionPayload } = body;

    if (!insightId || !actionPayload) {
      return NextResponse.json(
        { error: 'Insight ID and action payload are required' },
        { status: 400 }
      );
    }

    // Apply the recommendation based on action type
    const result = await applyRecommendation(user.id, actionPayload, supabase);

    // Mark insight as shown/applied if it exists in DB
    await supabase
      .from('coach_insights')
      .update({ shown_at: new Date().toISOString() })
      .eq('id', insightId)
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true, 
      result,
      message: 'Recommendation applied successfully'
    });
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function applyRecommendation(userId: string, actionPayload: any, supabase: any) {
  const { type } = actionPayload;

  switch (type) {
    case 'add_meal_item':
      // Mock implementation - in real app, would add to today's meals
      return {
        action: 'meal_item_added',
        item: actionPayload.item,
        protein: actionPayload.protein
      };

    case 'show_meal_suggestions':
      // Mock implementation - in real app, would return meal suggestions
      return {
        action: 'meal_suggestions_shown',
        calorie_limit: actionPayload.calorie_limit,
        suggestions: [
          'Grilled chicken salad (350 cal)',
          'Salmon with vegetables (320 cal)',
          'Turkey wrap (280 cal)'
        ]
      };

    case 'increase_weight':
      // Mock implementation - in real app, would update workout template
      return {
        action: 'weight_increased',
        exercise: actionPayload.exercise,
        new_weight: `+${actionPayload.amount}kg`
      };

    case 'start_cardio':
      // Mock implementation - in real app, would start workout timer
      return {
        action: 'cardio_started',
        modality: actionPayload.modality,
        target_zone: actionPayload.target_zone
      };

    case 'start_mobility':
      // Mock implementation - in real app, would start mobility routine
      return {
        action: 'mobility_started',
        duration: actionPayload.duration
      };

    case 'log_water':
      // Mock implementation - in real app, would add to hydration log
      return {
        action: 'water_logged',
        amount: actionPayload.amount
      };

    default:
      return {
        action: 'unknown',
        message: 'Action type not recognized'
      };
  }
}
