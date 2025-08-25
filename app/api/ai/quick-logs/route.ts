import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { QuickLogSystem } from '@/lib/ai/quick-logs/QuickLogSystem';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '10');

    const quickLogSystem = new QuickLogSystem();

    // Phase 10.4.2: Get quick access buttons
    if (action === 'quick-access') {
      const quickAccess = quickLogSystem.getQuickAccessButtons(session.user.id, limit);
      
      return NextResponse.json({
        success: true,
        quickAccess,
        count: quickAccess.length
      });
    }

    // Phase 10.4.3: Get contextual suggestions
    if (action === 'contextual') {
      const suggestions = quickLogSystem.getContextualSuggestions(session.user.id);
      
      return NextResponse.json({
        success: true,
        suggestions,
        count: suggestions.length
      });
    }

    // Phase 10.4.5: Get button grid layout
    if (action === 'button-grid') {
      const grid = quickLogSystem.generateButtonGrid(session.user.id);
      
      return NextResponse.json({
        success: true,
        grid,
        totalButtons: grid.primary.length + grid.secondary.length + grid.contextual.length
      });
    }

    // Phase 10.4.6: Get swipe gestures
    if (action === 'swipe-gestures') {
      const gestures = quickLogSystem.getSwipeGestures(session.user.id);
      
      return NextResponse.json({
        success: true,
        gestures,
        totalGestures: Object.values(gestures).flat().length
      });
    }

    // Phase 10.4.4: Get habit stacks
    if (action === 'habit-stacks') {
      const stacks = await quickLogSystem.generateHabitStacks(session.user.id);
      
      return NextResponse.json({
        success: true,
        stacks,
        count: stacks.length
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Quick logs error:', error);
    return NextResponse.json(
      { error: error.message || 'Quick logs failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, text, parsedData, partialText } = body;

    const quickLogSystem = new QuickLogSystem();

    // Phase 10.4.1: Learn user patterns
    if (action === 'learn-patterns') {
      const timeWindow = body.timeWindow || 30;
      const patterns = await quickLogSystem.learnUserPatterns(session.user.id, timeWindow);
      
      return NextResponse.json({
        success: true,
        patterns,
        count: patterns.length,
        message: `Learned ${patterns.length} patterns from last ${timeWindow} days`
      });
    }

    // Phase 10.4.7: Get predictive completions
    if (action === 'predictive-completions' && partialText) {
      const completions = quickLogSystem.getPredictiveCompletions(session.user.id, partialText);
      
      return NextResponse.json({
        success: true,
        completions,
        count: completions.length
      });
    }

    // Update common logs when user creates new entry
    if (action === 'update-logs' && text && parsedData) {
      await quickLogSystem.updateCommonLogs(session.user.id, text, parsedData);
      
      return NextResponse.json({
        success: true,
        message: 'Common logs updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Quick logs update error:', error);
    return NextResponse.json(
      { error: error.message || 'Quick logs update failed' },
      { status: 500 }
    );
  }
}