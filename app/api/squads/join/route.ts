import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// POST /api/squads/join - Join a squad by invite code
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode, squadId } = body;

    let squad;

    if (inviteCode) {
      // Join by invite code
      const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (squadError || !squadData) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      squad = squadData;
    } else if (squadId) {
      // Join public squad by ID
      const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .select('*')
        .eq('id', squadId)
        .eq('is_public', true)
        .single();

      if (squadError || !squadData) {
        return NextResponse.json({ error: 'Squad not found or not public' }, { status: 400 });
      }
      squad = squadData;
    } else {
      return NextResponse.json({ error: 'Invite code or squad ID required' }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('squad_members')
      .select('id, is_active')
      .eq('squad_id', squad.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      if (existingMember.is_active) {
        return NextResponse.json({ error: 'Already a member of this squad' }, { status: 400 });
      } else {
        // Reactivate membership
        const { error: reactivateError } = await supabase
          .from('squad_members')
          .update({ is_active: true, joined_at: new Date().toISOString() })
          .eq('id', existingMember.id);

        if (reactivateError) {
          return NextResponse.json({ error: 'Failed to rejoin squad' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Rejoined squad successfully',
          squad 
        });
      }
    }

    // Check squad capacity
    const { count: memberCount } = await supabase
      .from('squad_members')
      .select('*', { count: 'exact', head: true })
      .eq('squad_id', squad.id)
      .eq('is_active', true);

    if (memberCount && memberCount >= squad.max_members) {
      return NextResponse.json({ error: 'Squad is at maximum capacity' }, { status: 400 });
    }

    // Add user to squad
    const { error: joinError } = await supabase
      .from('squad_members')
      .insert({
        squad_id: squad.id,
        user_id: user.id,
        role: 'member'
      });

    if (joinError) {
      return NextResponse.json({ error: 'Failed to join squad' }, { status: 500 });
    }

    // Create activity feed entry
    await supabase
      .from('activity_feed')
      .insert({
        user_id: user.id,
        activity_type: 'squad_joined',
        content: {
          squad_name: squad.name,
          squad_id: squad.id
        },
        squad_id: squad.id,
        is_public: squad.is_public
      });

    return NextResponse.json({ 
      success: true,
      message: 'Joined squad successfully',
      squad
    });

  } catch (error) {
    console.error('Squad join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
