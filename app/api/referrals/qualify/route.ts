import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// POST /api/referrals/qualify - Mark a referral as qualified when user completes onboarding
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find pending referral for this user
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referee_id', user.id)
      .eq('status', 'pending')
      .single();

    if (referralError || !referral) {
      // No pending referral found - user wasn't referred or already qualified
      return NextResponse.json({ success: true, message: 'No pending referral' });
    }

    // Mark referral as qualified
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        status: 'qualified',
        qualified_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to qualify referral' }, { status: 500 });
    }

    // Update user's onboarding completion
    await supabase
      .from('profiles')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', user.id);

    // Grant rewards to referrer
    const rewardPromises = [
      // 7 days premium access
      supabase
        .from('referral_rewards')
        .insert({
          user_id: referral.referrer_id,
          referral_id: referral.id,
          reward_type: 'premium_days',
          reward_value: { days: 7 },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days to claim
        }),
      
      // Achievement badge
      supabase
        .from('referral_rewards')
        .insert({
          user_id: referral.referrer_id,
          referral_id: referral.id,
          reward_type: 'badge',
          reward_value: { 
            badge: 'referrer',
            title: 'Squad Builder',
            description: 'Successfully referred a new member'
          }
        })
    ];

    await Promise.all(rewardPromises);

    return NextResponse.json({ 
      success: true,
      qualified: true,
      referralId: referral.id
    });

  } catch (error) {
    console.error('Qualify referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
