import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active insights from database
    const { data: insights, error } = await supabase
      .from('coach_insights')
      .select('*')
      .eq('user_id', user.id)
      .is('dismissed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching insights:', error);
    }

    // If no insights in DB, generate mock insights based on user data
    if (!insights || insights.length === 0) {
      const mockInsights = await generateMockInsights(user.id, supabase);
      return NextResponse.json({ insights: mockInsights });
    }

    return NextResponse.json({ insights });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateMockInsights(userId: string, supabase: any) {
  // Get user's goal to provide contextual insights
  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_goal, weekly_hours_available')
    .eq('id', userId)
    .single();

  const goal = profile?.primary_goal || 'general_health';
  const weeklyHours = profile?.weekly_hours_available || 5;

  // Generate goal-specific insights
  const insightTemplates = {
    weight_loss: [
      {
        id: 'protein-focus',
        insight_type: 'nutrition',
        title: 'Lock in 110g protein today',
        message: 'You\'re 40g short of your protein target. High protein = better satiety.',
        action_label: 'Add protein shake',
        action_payload: { type: 'add_meal_item', item: 'protein_shake', protein: 25 },
        priority: 1
      },
      {
        id: 'calorie-deficit',
        insight_type: 'nutrition',
        title: 'Stay in your deficit zone',
        message: 'You have 380 calories left for dinner. Keep it lean and green.',
        action_label: 'See meal ideas',
        action_payload: { type: 'show_meal_suggestions', calorie_limit: 380 },
        priority: 2
      }
    ],
    muscle_gain: [
      {
        id: 'progressive-overload',
        insight_type: 'training',
        title: 'Time to add weight',
        message: 'You hit 3x8 on bench press. Ready to bump up 2.5kg?',
        action_label: 'Update workout',
        action_payload: { type: 'increase_weight', exercise: 'bench_press', amount: 2.5 },
        priority: 1
      },
      {
        id: 'recovery-check',
        insight_type: 'recovery',
        title: 'Recovery looking good',
        message: '8hrs sleep + low stress. Perfect for your heavy squat day.',
        action_label: 'View workout',
        action_payload: { type: 'show_workout', workout_id: 'heavy_squat' },
        priority: 2
      }
    ],
    endurance: [
      {
        id: 'easy-day',
        insight_type: 'training',
        title: 'Easy day: Zone 2 focus',
        message: '30-40min easy pace. Build your aerobic base.',
        action_label: 'Start run',
        action_payload: { type: 'start_cardio', modality: 'run', target_zone: 2 },
        priority: 1
      },
      {
        id: 'recovery-priority',
        insight_type: 'recovery',
        title: 'Add 10min mobility?',
        message: 'You\'ve under-recovered 2 days. Your legs will thank you.',
        action_label: 'Quick mobility',
        action_payload: { type: 'start_mobility', duration: 10 },
        priority: 2
      }
    ]
  };

  const defaultInsights = [
    {
      id: 'hydration',
      insight_type: 'general',
      title: 'Stay hydrated',
      message: 'Aim for 2.5L water today. Your performance depends on it.',
      action_label: 'Log water',
      action_payload: { type: 'log_water', amount: 500 },
      priority: 3
    }
  ];

  const goalInsights = insightTemplates[goal as keyof typeof insightTemplates] || [];
  return [...goalInsights, ...defaultInsights].slice(0, 3);
}
