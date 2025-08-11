import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/referrals - Get user's referral data and stats
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral code and stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referral_code, total_referrals, qualified_referrals, referral_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Get referral code details
    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (codeError && codeError.code !== 'PGRST116') { // Not found is OK
      return NextResponse.json({ error: 'Failed to fetch referral code' }, { status: 500 });
    }

    // Get recent referrals
    const { data: recentReferrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        id,
        created_at,
        status,
        qualified_at,
        profiles!referrals_referee_id_fkey(id)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (referralsError) {
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Get unclaimed rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_claimed', false)
      .order('granted_at', { ascending: false });

    if (rewardsError) {
      return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
    }

    return NextResponse.json({
      referralCode: referralCode?.code || profile.referral_code,
      stats: {
        totalReferrals: profile.total_referrals,
        qualifiedReferrals: profile.qualified_referrals,
        tier: profile.referral_tier
      },
      recentReferrals: recentReferrals || [],
      unclaimedRewards: rewards || []
    });

  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/referrals - Create or regenerate referral code
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'regenerate') {
      // Deactivate current code
      await supabase
        .from('referral_codes')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Generate new code
      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) {
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
      }

      // Create new referral code
      const { data: newCode, error: createError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: data,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ referral_code: data })
        .eq('id', user.id);

      return NextResponse.json({ code: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Referrals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
