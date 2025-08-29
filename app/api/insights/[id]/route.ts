/**
 * Individual Insight Actions API
 * Handles snoozing and other actions on specific insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/insights/:id - Update insight (snooze, dismiss, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insightId = params.id;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'snooze':
        // Snooze insight for 7 days
        const snoozedUntil = new Date();
        snoozedUntil.setDate(snoozedUntil.getDate() + 7);

        const { data: snoozedInsight, error: snoozeError } = await supabase
          .from('user_insights')
          .update({
            snoozed_until: snoozedUntil.toISOString(),
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', insightId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (snoozeError) {
          console.error('Error snoozing insight:', snoozeError);
          return NextResponse.json(
            { error: 'Failed to snooze insight' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Insight snoozed for 7 days',
          snoozedUntil: snoozedUntil.toISOString(),
          insight: snoozedInsight
        });

      case 'dismiss':
        // Permanently dismiss insight
        const { error: dismissError } = await supabase
          .from('user_insights')
          .update({
            is_active: false,
            dismissed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', insightId)
          .eq('user_id', user.id);

        if (dismissError) {
          console.error('Error dismissing insight:', dismissError);
          return NextResponse.json(
            { error: 'Failed to dismiss insight' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Insight dismissed'
        });

      case 'complete':
        // Mark insight as completed/acted upon
        const { data: completedInsight, error: completeError } = await supabase
          .from('user_insights')
          .update({
            is_active: false,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', insightId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (completeError) {
          console.error('Error completing insight:', completeError);
          return NextResponse.json(
            { error: 'Failed to complete insight' },
            { status: 500 }
          );
        }

        // Log the completion for tracking
        await supabase
          .from('insight_interactions')
          .insert({
            user_id: user.id,
            insight_id: insightId,
            action: 'completed',
            timestamp: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'Insight marked as completed',
          insight: completedInsight
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in insight action:', error);
    return NextResponse.json(
      { error: 'Failed to process insight action' },
      { status: 500 }
    );
  }
}

// GET /api/insights/:id - Get specific insight details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insightId = params.id;

    const { data: insight, error } = await supabase
      .from('user_insights')
      .select('*')
      .eq('id', insightId)
      .eq('user_id', user.id)
      .single();

    if (error || !insight) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    // Check if insight is snoozed and should be reactivated
    if (insight.snoozed_until && new Date(insight.snoozed_until) < new Date()) {
      // Reactivate snoozed insight
      await supabase
        .from('user_insights')
        .update({
          snoozed_until: null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', insightId)
        .eq('user_id', user.id);
      
      insight.snoozed_until = null;
      insight.is_active = true;
    }

    return NextResponse.json({
      success: true,
      insight
    });
  } catch (error) {
    console.error('Error fetching insight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight' },
      { status: 500 }
    );
  }
}