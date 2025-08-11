import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/squads - Get user's squads and public squads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, my, public

    let query = supabase
      .from('squads')
      .select(`
        *,
        squad_members!inner(
          id,
          user_id,
          role,
          joined_at,
          is_active
        )
      `);

    if (type === 'my') {
      // Get user's squads only
      query = query.eq('squad_members.user_id', user.id)
                  .eq('squad_members.is_active', true);
    } else if (type === 'public') {
      // Get public squads only
      query = query.eq('is_public', true);
    } else {
      // Get all accessible squads (user's squads + public squads)
      query = query.or(`is_public.eq.true,squad_members.user_id.eq.${user.id}`);
    }

    const { data: squads, error: squadsError } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (squadsError) {
      return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
    }

    // Get member counts for each squad
    const squadIds = squads?.map(s => s.id) || [];
    const { data: memberCounts } = await supabase
      .from('squad_members')
      .select('squad_id')
      .in('squad_id', squadIds)
      .eq('is_active', true);

    const memberCountMap = memberCounts?.reduce((acc, member) => {
      acc[member.squad_id] = (acc[member.squad_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const enrichedSquads = squads?.map(squad => ({
      ...squad,
      memberCount: memberCountMap[squad.id] || 0
    }));

    return NextResponse.json({ squads: enrichedSquads || [] });

  } catch (error) {
    console.error('Squads GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/squads - Create a new squad
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic = true, maxMembers = 50, squadType = 'general' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Squad name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Squad name must be 100 characters or less' }, { status: 400 });
    }

    // Create the squad
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
        is_public: isPublic,
        max_members: maxMembers,
        squad_type: squadType
      })
      .select()
      .single();

    if (squadError) {
      return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
    }

    return NextResponse.json({ squad });

  } catch (error) {
    console.error('Squads POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
