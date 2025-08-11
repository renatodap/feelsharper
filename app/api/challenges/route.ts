import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/challenges - Get active challenges
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'active'; // active, my, completed
    const category = searchParams.get('category'); // weight_loss, workouts, steps, nutrition

    let query = supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants!left(
          id,
          user_id,
          progress,
          final_score,
          rank,
          is_completed
        )
      `);

    if (type === 'active') {
      query = query
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString());
    } else if (type === 'my') {
      query = query
        .eq('challenge_participants.user_id', user.id);
    } else if (type === 'completed') {
      query = query
        .eq('is_active', true)
        .lt('ends_at', new Date().toISOString());
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: challenges, error: challengesError } = await query
      .order('starts_at', { ascending: true })
      .limit(20);

    if (challengesError) {
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Get participant counts for each challenge
    const challengeIds = challenges?.map(c => c.id) || [];
    const { data: participantCounts } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .in('challenge_id', challengeIds);

    const participantCountMap = participantCounts?.reduce((acc, participant) => {
      acc[participant.challenge_id] = (acc[participant.challenge_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const enrichedChallenges = challenges?.map(challenge => ({
      ...challenge,
      participantCount: participantCountMap[challenge.id] || 0,
      userParticipation: challenge.challenge_participants?.find(p => p.user_id === user.id) || null
    }));

    return NextResponse.json({ challenges: enrichedChallenges || [] });

  } catch (error) {
    console.error('Challenges GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/challenges - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      startsAt, 
      endsAt, 
      challengeType = 'individual',
      category,
      rules = {},
      rewards = {},
      maxParticipants 
    } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Challenge title is required' }, { status: 400 });
    }

    if (!category || !['weight_loss', 'workouts', 'steps', 'nutrition'].includes(category)) {
      return NextResponse.json({ error: 'Valid category is required' }, { status: 400 });
    }

    if (!startsAt || !endsAt) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    if (startDate < new Date()) {
      return NextResponse.json({ error: 'Start date must be in the future' }, { status: 400 });
    }

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        created_by: user.id,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        challenge_type: challengeType,
        category,
        rules,
        rewards,
        max_participants: maxParticipants || null
      })
      .select()
      .single();

    if (challengeError) {
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }

    return NextResponse.json({ challenge });

  } catch (error) {
    console.error('Challenges POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
