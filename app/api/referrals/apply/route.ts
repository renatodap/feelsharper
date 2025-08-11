import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// POST /api/referrals/apply - Apply a referral code during onboarding
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Check if user already has a referrer
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', user.id)
      .single();

    if (existingReferral) {
      return NextResponse.json({ error: 'User already has a referrer' }, { status: 400 });
    }

    // Find the referral code
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('id, user_id, max_uses, current_uses, is_active, expires_at')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Invalid or expired referral code' }, { status: 400 });
    }

    // Check if code is expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Referral code has expired' }, { status: 400 });
    }

    // Check if code has reached max uses
    if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
      return NextResponse.json({ error: 'Referral code has reached maximum uses' }, { status: 400 });
    }

    // Check if user is trying to refer themselves
    if (codeData.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Create the referral relationship
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referee_id: user.id,
        referral_code_id: codeData.id,
        status: 'pending'
      })
      .select()
      .single();

    if (referralError) {
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }

    // Update referral code usage count
    await supabase
      .from('referral_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    // Update profile with referrer info
    await supabase
      .from('profiles')
      .update({ referred_by: codeData.user_id })
      .eq('id', user.id);

    return NextResponse.json({ 
      success: true,
      referralId: referral.id 
    });

  } catch (error) {
    console.error('Apply referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
