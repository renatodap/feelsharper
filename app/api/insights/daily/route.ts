import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch recent activity data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [workoutsResult, nutritionResult, sleepResult, profileResult] = await Promise.all([
      // Recent workouts
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('date', oneWeekAgo.toISOString())
        .order('date', { ascending: false }),
      
      // Recent nutrition logs
      supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', oneWeekAgo.toISOString()),
      
      // Recent sleep data (if exists)
      supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'sleep')
        .gte('timestamp', oneWeekAgo.toISOString()),
      
      // User profile for goals
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    ]);

    const workouts = workoutsResult.data || [];
    const nutritionLogs = nutritionResult.data || [];
    const sleepLogs = sleepResult.data || [];
    const profile = profileResult.data;

    // Generate insights based on data patterns
    const insights = generateInsights(workouts, nutritionLogs, sleepLogs, profile);

    return NextResponse.json({ 
      insights,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateInsights(workouts: any[], nutritionLogs: any[], sleepLogs: any[], profile: any) {
  const insights = [];
  
  // Workout frequency insight
  if (workouts.length > 0) {
    const workoutsPerWeek = workouts.length;
    const avgDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length;
    
    if (workoutsPerWeek < 3) {
      insights.push({
        id: 'workout-frequency',
        title: 'Increase Training Frequency',
        summary: `You've trained ${workoutsPerWeek} times this week. Aim for 3-5 sessions for optimal results.`,
        details: 'Research shows that training 3-5 times per week provides the best balance of stimulus and recovery for most fitness goals. Consider adding 1-2 more sessions this week, even if they are shorter duration.',
        confidence: 85,
        actionable: true,
        action: {
          label: 'Schedule workout',
          route: '/log'
        },
        category: 'performance',
        priority: 1
      });
    } else if (workoutsPerWeek > 6) {
      insights.push({
        id: 'recovery-needed',
        title: 'Recovery Day Recommended',
        summary: `You've trained ${workoutsPerWeek} times this week. Consider a rest day for optimal recovery.`,
        details: 'Recovery is when adaptation happens. Your high training frequency is impressive, but ensure you are allowing adequate recovery between sessions. Active recovery like walking or yoga can be beneficial.',
        confidence: 90,
        actionable: true,
        action: {
          label: 'Log recovery activity',
          route: '/log'
        },
        category: 'recovery',
        priority: 1
      });
    }
  }

  // Nutrition insight
  if (nutritionLogs.length > 0) {
    const avgProtein = nutritionLogs.reduce((sum, n) => sum + (n.protein_g || 0), 0) / nutritionLogs.length;
    const targetProtein = profile?.current_weight ? (profile.current_weight * 0.8) : 140; // 0.8g per lb (assuming current_weight is in lbs)
    
    if (avgProtein < targetProtein * 0.8) {
      insights.push({
        id: 'protein-intake',
        title: 'Optimize Protein Intake',
        summary: `You're averaging ${Math.round(avgProtein)}g protein daily, below your target of ${Math.round(targetProtein)}g.`,
        details: `Based on your weight and activity level, aim for ${Math.round(targetProtein)}g of protein daily. This supports muscle recovery and growth. Consider adding a protein shake or Greek yogurt to reach your target.`,
        confidence: 88,
        actionable: true,
        action: {
          label: 'Log protein intake',
          route: '/log'
        },
        category: 'nutrition',
        priority: 2
      });
    }
  }

  // Sleep insight
  if (sleepLogs.length > 0) {
    const avgSleepHours = sleepLogs.reduce((sum, s) => {
      const data = s.data || {};
      return sum + (data.duration_hours || data.hours || 0);
    }, 0) / sleepLogs.length;
    
    if (avgSleepHours < 7) {
      insights.push({
        id: 'sleep-optimization',
        title: 'Improve Sleep Duration',
        summary: `You're averaging ${avgSleepHours.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal recovery.`,
        details: 'Sleep is critical for recovery, hormone regulation, and performance. Try setting a consistent bedtime, avoiding screens 1 hour before bed, and keeping your room cool and dark.',
        confidence: 92,
        actionable: true,
        action: {
          label: 'Set sleep goal',
          route: '/log'
        },
        category: 'recovery',
        priority: 1
      });
    }
  }

  // Progress tracking insight
  if (profile?.primary_goal || profile?.secondary_goals) {
    insights.push({
      id: 'goal-progress',
      title: 'Track Your Progress',
      summary: 'Consistent tracking improves success rate by 42%',
      details: 'Studies show that people who track their fitness and nutrition are significantly more likely to achieve their goals. You are already on the right path by using FeelSharper. Keep logging daily for best results.',
      confidence: 95,
      actionable: true,
      action: {
        label: "Log today's activity",
        route: '/log'
      },
      category: 'habit',
      priority: 3
    });
  }

  // Sort by priority and return top 3
  return insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}