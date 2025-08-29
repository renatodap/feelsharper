/**
 * MVP Insights API Endpoint
 * Generates simple, actionable insights from user activity logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Insight, InsightsResponse, ActivityLog } from '@/lib/types/mvp';

// Simple rule engine for generating insights
const INSIGHT_RULES = [
  {
    id: 'underfueled',
    name: 'Pre-workout Nutrition',
    check: (logs: ActivityLog[]) => {
      const workouts = logs.filter(l => l.type === 'exercise');
      const meals = logs.filter(l => l.type === 'food');
      
      // Check if workouts without prior meals
      const underfueled = workouts.filter(w => {
        const workoutTime = new Date(w.timestamp).getTime();
        const priorMeal = meals.find(m => {
          const mealTime = new Date(m.timestamp).getTime();
          const diff = (workoutTime - mealTime) / (1000 * 60); // minutes
          return diff > 0 && diff < 180; // Within 3 hours before
        });
        return !priorMeal;
      });

      if (underfueled.length >= 2) {
        return {
          title: "You're underfueled pre-run",
          body: 'Your recent runs show low energy. Try eating 30-60 minutes before.',
          severity: 'warning' as const,
          evidence: {
            logs: underfueled.map(l => l.id),
            pattern: 'low_energy_runs',
            action: {
              label: 'Add pre-run carbs guide',
              type: 'log',
              payload: { prefill: 'banana and toast' }
            },
            steps: [
              'Eat a light snack 30-60 minutes before running',
              'Focus on easily digestible carbs',
              'Track your energy levels'
            ]
          }
        };
      }
      return null;
    }
  },
  {
    id: 'hydration',
    name: 'Hydration Tracking',
    check: (logs: ActivityLog[]) => {
      const waterLogs = logs.filter(l => l.type === 'water');
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const yesterdayWater = waterLogs.filter(l => {
        const logDate = new Date(l.timestamp);
        return logDate >= yesterday && logDate < today;
      });

      const totalOz = yesterdayWater.reduce((sum, log) => {
        return sum + (log.parsed_data?.amount || 0);
      }, 0);

      if (totalOz < 64) { // Less than 64oz
        return {
          title: 'Hydration levels need attention',
          body: `You logged less than 2L of water yesterday (${totalOz}oz).`,
          severity: 'info' as const,
          evidence: {
            logs: yesterdayWater.map(l => l.id),
            pattern: 'low_hydration',
            action: {
              label: 'Log water intake',
              type: 'log',
              payload: { type: 'water' }
            },
            steps: [
              'Set hourly water reminders',
              'Keep a water bottle nearby',
              'Log each glass you drink'
            ]
          }
        };
      }
      return null;
    }
  },
  {
    id: 'consistency',
    name: 'Workout Consistency',
    check: (logs: ActivityLog[]) => {
      const workouts = logs.filter(l => l.type === 'exercise');
      const dates = workouts.map(w => new Date(w.timestamp).toDateString());
      const uniqueDates = new Set(dates);
      
      if (uniqueDates.size < 3 && logs.length > 10) {
        return {
          title: 'Build workout consistency',
          body: `You've worked out ${uniqueDates.size} times this week. Aim for 3-4 sessions.`,
          severity: 'info' as const,
          evidence: {
            logs: workouts.map(l => l.id),
            pattern: 'low_frequency',
            action: {
              label: 'Schedule next workout',
              type: 'navigate',
              payload: { url: '/workouts/schedule' }
            },
            steps: [
              'Schedule workouts in advance',
              'Start with 20-minute sessions',
              'Track completion daily'
            ]
          }
        };
      }
      return null;
    }
  }
];

// Critical questions based on user patterns
const CRITICAL_QUESTIONS = [
  {
    id: 'goal-check',
    question: 'Are you targeting weight loss this week?',
    options: ['Yes', 'No', 'Maintenance'],
    condition: (logs: ActivityLog[]) => {
      const weightLogs = logs.filter(l => l.type === 'weight');
      return weightLogs.length > 0;
    }
  },
  {
    id: 'energy-check',
    question: 'How are your energy levels today?',
    options: ['Great', 'Normal', 'Low'],
    condition: (logs: ActivityLog[]) => {
      const today = new Date().toDateString();
      const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today);
      return todayLogs.length > 0;
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '7');

    // Fetch user's activity logs
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Generate insights using rule engine
    const insights: Insight[] = [];
    
    for (const rule of INSIGHT_RULES) {
      const result = rule.check(logs || []);
      if (result) {
        const insight: Insight = {
          id: `insight-${Date.now()}-${rule.id}`,
          user_id: user.id,
          rule_id: rule.id,
          title: result.title,
          body: result.body,
          severity: result.severity,
          evidence_json: result.evidence,
          created_at: new Date().toISOString()
        };
        insights.push(insight);
      }
    }

    // Sort by severity (critical > warning > info)
    insights.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    // Select a critical question
    const eligibleQuestions = CRITICAL_QUESTIONS.filter(q => q.condition(logs || []));
    const criticalQuestion = eligibleQuestions.length > 0 
      ? eligibleQuestions[Math.floor(Math.random() * eligibleQuestions.length)]
      : null;

    const response: InsightsResponse = {
      insights: insights.slice(0, 3), // Max 3 insights
      criticalQuestion
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}