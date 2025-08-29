/**
 * Coach Answer API Endpoint
 * Stores user's answer to critical questions and triggers insight updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId, answer } = body;

    if (!userId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Save the answer as a coach interaction
    const { error } = await supabase
      .from('coach_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'answer',
        question: questionId,
        answer,
        confidence: 1.0, // User's own answer has full confidence
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving answer:', error);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    // Update user preferences based on answer
    if (questionId === 'goal-check') {
      let persona_preset = 'auto';
      if (answer === 'Yes') {
        persona_preset = 'weight';
      } else if (answer === 'Maintenance') {
        persona_preset = 'wellness';
      }

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          persona_preset,
          updated_at: new Date().toISOString()
        });
    }

    // Trigger insight regeneration (in a real app, this would be more sophisticated)
    // For now, just mark that insights should be refreshed
    await supabase
      .from('insights')
      .delete()
      .eq('user_id', userId)
      .eq('severity', 'info'); // Remove low-priority insights to regenerate

    return NextResponse.json({ 
      success: true,
      message: 'Answer recorded. Insights will be updated.' 
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
}