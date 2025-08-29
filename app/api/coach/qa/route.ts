/**
 * Coach Q&A API Endpoint
 * Handles single-turn questions from users with context-aware responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CoachQAResponse } from '@/lib/types/mvp';

// Simple responses based on common questions
const COACH_RESPONSES = {
  'lift after cardio': 'Based on your recent workouts, yes - light strength training after cardio can be beneficial. Focus on compound movements and keep intensity moderate.',
  'eat before morning': 'For morning workouts, a light snack 30-60 minutes before can help. Try a banana with almond butter or toast with honey.',
  'recovery needed': 'Your training load has been high. Consider a full rest day or light active recovery like walking or yoga.',
  'protein timing': 'Aim for 20-30g of protein within 2 hours post-workout. Your recent logs show good consistency - keep it up!',
  'hydration goals': 'Based on your activity level, aim for at least 3L of water daily. You logged 2.5L yesterday - try adding one more glass.',
  'sleep quality': 'Your sleep has been inconsistent. Try maintaining a regular bedtime and avoiding screens 1 hour before sleep.',
  'default': 'Great question! Based on your recent activity, I recommend focusing on consistency and listening to your body. Track how you feel after each session.'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, question } = body;

    if (!userId || !question) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user's recent logs for context
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentLogs } = await supabase
      .from('activity_logs')
      .select('id, type, raw_text, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', oneWeekAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(10);

    // Simple keyword matching for response selection
    const questionLower = question.toLowerCase();
    let answer = COACH_RESPONSES.default;
    let confidence = 0.7;

    if (questionLower.includes('lift') && (questionLower.includes('after') || questionLower.includes('cardio'))) {
      answer = COACH_RESPONSES['lift after cardio'];
      confidence = 0.85;
    } else if (questionLower.includes('eat') && questionLower.includes('morning')) {
      answer = COACH_RESPONSES['eat before morning'];
      confidence = 0.9;
    } else if (questionLower.includes('recovery') || questionLower.includes('rest')) {
      answer = COACH_RESPONSES['recovery needed'];
      confidence = 0.8;
    } else if (questionLower.includes('protein')) {
      answer = COACH_RESPONSES['protein timing'];
      confidence = 0.85;
    } else if (questionLower.includes('water') || questionLower.includes('hydration')) {
      answer = COACH_RESPONSES['hydration goals'];
      confidence = 0.9;
    } else if (questionLower.includes('sleep')) {
      answer = COACH_RESPONSES['sleep quality'];
      confidence = 0.8;
    }

    // Add context from recent logs if available
    if (recentLogs && recentLogs.length > 0) {
      const exerciseLogs = recentLogs.filter((log: any) => log.type === 'exercise');
      const foodLogs = recentLogs.filter((log: any) => log.type === 'food');
      
      if (exerciseLogs.length > 5) {
        answer += ' You\'ve been very active this week with ' + exerciseLogs.length + ' workouts logged.';
        confidence = Math.min(confidence + 0.05, 1);
      }
      
      if (foodLogs.length < 3) {
        answer += ' Consider logging your meals more consistently for better insights.';
      }
    }

    // Save the interaction
    await supabase
      .from('coach_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'qa',
        question,
        answer,
        related_logs: recentLogs?.map((l: any) => l.id) || [],
        confidence
      });

    const response: CoachQAResponse = {
      answer,
      relatedLogs: recentLogs?.slice(0, 3).map((l: any) => l.id) || [],
      confidence
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in coach Q&A:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}