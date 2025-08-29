/**
 * Coach Q&A API Endpoint
 * Handles single-turn questions from users with context-aware responses
 * Returns answers ≤400 characters based on last 7 days of user logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication - REQUIRE user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get last 7 days of user logs - summarize across all activity types
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const [logs, workouts, nutrition] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('id, type, raw_text, timestamp, parsed_data')
        .eq('user_id', user.id)
        .gte('timestamp', sevenDaysAgo)
        .order('timestamp', { ascending: false }),
      supabase
        .from('workouts')
        .select('type, duration_minutes, exercises, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo),
      supabase
        .from('nutrition_logs')
        .select('calories, protein, carbs, fat, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo)
    ]);

    // Summarize 7-day activity
    const exerciseLogs = logs.data?.filter(l => l.type === 'exercise') || [];
    const foodLogs = logs.data?.filter(l => l.type === 'food') || [];
    const workoutCount = workouts.data?.length || 0;
    const avgWorkoutMinutes = workoutCount > 0 
      ? Math.round(workouts.data!.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workoutCount)
      : 0;
    
    const nutritionDays = nutrition.data?.length || 0;
    const avgCalories = nutritionDays > 0
      ? Math.round(nutrition.data!.reduce((sum, n) => sum + (n.calories || 0), 0) / nutritionDays)
      : 0;
    const avgProtein = nutritionDays > 0
      ? Math.round(nutrition.data!.reduce((sum, n) => sum + (n.protein || 0), 0) / nutritionDays)
      : 0;

    // Generate contextual answer based on question and 7-day summary
    const questionLower = question.toLowerCase();
    let answer = '';

    // Weight/fat loss questions
    if (questionLower.includes('weight') || questionLower.includes('fat') || questionLower.includes('lose')) {
      if (avgCalories > 2500 && avgCalories > 0) {
        answer = `Based on ${avgCalories}cal/day avg, reduce by 300-500cal for sustainable fat loss. Keep protein at ${avgProtein}g+ to preserve muscle.`;
      } else if (workoutCount < 3) {
        answer = `Only ${workoutCount} workouts this week. Add 2-3 strength sessions to boost metabolism and accelerate fat loss.`;
      } else {
        answer = `Good ${workoutCount} workouts this week! Track measurements weekly, not just weight. Focus on consistency over perfection.`;
      }
    }
    // Muscle/strength questions
    else if (questionLower.includes('muscle') || questionLower.includes('strength') || questionLower.includes('gain')) {
      if (avgProtein < 100 && avgProtein > 0) {
        answer = `Your ${avgProtein}g protein is too low. Aim for 150g+ daily with ${workoutCount} weekly workouts for optimal muscle growth.`;
      } else if (workoutCount < 3) {
        answer = `Increase to 3-4 workouts/week with progressive overload. Current ${workoutCount} sessions won't maximize muscle gains.`;
      } else {
        answer = `Strong week: ${workoutCount} workouts, ${avgProtein}g protein daily. Add 5lbs or 2 reps weekly for continued progress.`;
      }
    }
    // Recovery questions
    else if (questionLower.includes('tired') || questionLower.includes('recover') || questionLower.includes('sore')) {
      if (workoutCount > 5) {
        answer = `${workoutCount} workouts may be too much. Take a full rest day and ensure 8+ hours sleep for recovery.`;
      } else {
        answer = `Recovery is key! With ${workoutCount} workouts, prioritize sleep, hydration (3L+/day), and post-workout stretching.`;
      }
    }
    // Protein questions
    else if (questionLower.includes('protein')) {
      if (avgProtein > 0) {
        answer = `You're averaging ${avgProtein}g protein daily. Aim for 30g within 2hrs post-workout for optimal recovery.`;
      } else {
        answer = `Track protein intake consistently. Target 0.8-1g per lb bodyweight split across 4-5 meals daily.`;
      }
    }
    // Progress/plateau questions
    else if (questionLower.includes('progress') || questionLower.includes('plateau') || questionLower.includes('stuck')) {
      if (workoutCount === 0 && exerciseLogs.length === 0) {
        answer = `No workouts logged this week. Start with 3 sessions focusing on compound movements to break the plateau.`;
      } else {
        answer = `With ${workoutCount} workouts and ${avgCalories || 'untracked'} calories, vary intensity or try new exercises to shock your system.`;
      }
    }
    // Default coaching response
    else {
      if (workoutCount >= 4) {
        answer = `Excellent consistency: ${workoutCount} workouts this week! ${avgProtein > 0 ? `Keep protein at ${avgProtein}g+.` : 'Track nutrition for better insights.'}`;
      } else if (workoutCount > 0) {
        answer = `${workoutCount} workouts logged - good start! Aim for 3-4 weekly sessions. Small daily improvements compound into major results.`;
      } else {
        answer = `Start this week: 3 workouts, log one meal daily, aim for 10k steps. Building habits beats perfection.`;
      }
    }

    // Ensure response is ≤400 chars
    if (answer.length > 400) {
      answer = answer.substring(0, 397) + '...';
    }

    // Save the interaction
    await supabase
      .from('coach_interactions')
      .insert({
        user_id: user.id,
        interaction_type: 'qa',
        question,
        answer,
        related_logs: logs.data?.slice(0, 5).map(l => l.id) || [],
        confidence: 0.85
      });

    return NextResponse.json({ 
      answer,
      context: {
        workouts: workoutCount,
        avgCalories,
        avgProtein,
        logsCount: logs.data?.length || 0
      }
    });
  } catch (error) {
    console.error('Error in coach Q&A:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}