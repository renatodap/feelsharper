import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, PRICING_TIERS } from '@/lib/payments/lemonsqueezy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId, test } = body;

    // Demo/test mode
    if (test) {
      return NextResponse.json({ 
        url: 'http://localhost:3000/settings?mock_upgrade=test',
        success: true 
      });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Get user from session if not provided
    let currentUserId = userId;
    let userEmail = '';
    
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    currentUserId = user.id;
    userEmail = user.email || '';

    // Map plan to pricing tier
    let pricingTier;
    if (plan === 'elite' || plan === 'annual') {
      pricingTier = PRICING_TIERS.ELITE;
    } else {
      pricingTier = PRICING_TIERS.PRO;
    }
    
    // Check if we have LemonSqueezy configured
    if (!process.env.LEMONSQUEEZY_API_KEY || !pricingTier.priceId) {
      // Return mock checkout for development
      const mockUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings?mock_upgrade=${plan}&user=${currentUserId}`;
      
      console.log('Mock checkout created:', { plan, userId: currentUserId });
      console.warn('WARNING: Using mock checkout. Configure LEMONSQUEEZY_API_KEY for production!');
      
      return NextResponse.json({ 
        success: true, 
        checkoutUrl: mockUrl,
        message: 'Using mock checkout (configure LemonSqueezy for production)' 
      });
    }

    // Create real LemonSqueezy checkout
    const result = await createCheckoutSession(
      currentUserId,
      userEmail,
      pricingTier.priceId,
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings?upgraded=true`
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to create checkout');
    }

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: result.checkoutUrl,
      message: 'Checkout created successfully' 
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}