import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// POST /api/moderation/flag - Flag content for moderation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, flagType, reason } = body;

    // Validation
    const validTargetTypes = ['progress_card', 'activity_feed', 'squad', 'challenge'];
    const validFlagTypes = ['spam', 'inappropriate', 'fake', 'harassment', 'other'];

    if (!validTargetTypes.includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (!validFlagTypes.includes(flagType)) {
      return NextResponse.json({ error: 'Invalid flag type' }, { status: 400 });
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Target ID is required' }, { status: 400 });
    }

    // Check rate limit (max 10 flags per hour)
    const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action_type: 'content_flag',
      p_limit: 10,
      p_window_minutes: 60
    });

    if (!rateLimitCheck) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before flagging more content.' 
      }, { status: 429 });
    }

    // Check if user already flagged this content
    const { data: existingFlag } = await supabase
      .from('content_flags')
      .select('id')
      .eq('flagger_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single();

    if (existingFlag) {
      return NextResponse.json({ error: 'You have already flagged this content' }, { status: 400 });
    }

    // Create the flag
    const { data: flag, error: flagError } = await supabase
      .from('content_flags')
      .insert({
        flagger_id: user.id,
        target_type: targetType,
        target_id: targetId,
        flag_type: flagType,
        reason: reason?.trim() || null
      })
      .select()
      .single();

    if (flagError) {
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
    }

    // Update user reputation for flagging (small positive boost for community moderation)
    await supabase.rpc('update_user_reputation', {
      p_user_id: user.id,
      p_reputation_change: 1,
      p_action: 'content_flagged'
    });

    return NextResponse.json({ 
      success: true,
      flagId: flag.id,
      message: 'Content flagged successfully. Our moderation team will review it.'
    });

  } catch (error) {
    console.error('Content flag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
