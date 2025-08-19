import { lemonSqueezySetup, createCheckout, getProduct, getSubscription, listSubscriptions, getWebhook } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize LemonSqueezy
export function initLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => {
      console.error('LemonSqueezy error:', error);
    }
  });
}

// Pricing tiers
export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic food logging',
      'Weight tracking',
      'Simple progress charts',
      '7-day history',
      'Community support'
    ],
    limits: {
      foodLogsPerDay: 5,
      aiCoachingMinutes: 0,
      customMeals: 3,
      exportData: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
    features: [
      'Unlimited food logging',
      'Advanced analytics',
      'AI-powered coaching',
      'Custom meal templates',
      'Photo food scanning',
      'Voice logging',
      'Export data (CSV/PDF)',
      'Priority support',
      'No ads'
    ],
    limits: {
      foodLogsPerDay: -1, // unlimited
      aiCoachingMinutes: 60,
      customMeals: -1,
      exportData: true
    }
  },
  ELITE: {
    id: 'elite',
    name: 'Elite',
    price: 19.99,
    priceId: process.env.LEMONSQUEEZY_ELITE_VARIANT_ID || '',
    features: [
      'Everything in Pro',
      'Unlimited AI coaching',
      'Personal trainer access',
      'Custom workout programs',
      'Nutrition planning',
      'Weekly check-ins',
      'Body composition analysis',
      'Supplement recommendations',
      'VIP support'
    ],
    limits: {
      foodLogsPerDay: -1,
      aiCoachingMinutes: -1,
      customMeals: -1,
      exportData: true,
      personalTrainer: true
    }
  }
};

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  variantId: string,
  redirectUrl?: string
) {
  initLemonSqueezy();

  try {
    const { data, error } = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutData: {
          email: userEmail,
          custom: {
            user_id: userId
          }
        },
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
          desc: true,
          discount: false,
          dark: true,
          subscriptionPreview: true,
          buttonColor: '#0B2A4A'
        },
        productOptions: {
          enabledVariants: [parseInt(variantId)], // Must be number array
          redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/settings?upgraded=true`,
          receipt_button_text: 'Go to Dashboard',
          receipt_link_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          receipt_thank_you_note: 'Thank you for upgrading to FeelSharper Pro!'
        }
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return { 
      success: true, 
      checkoutUrl: data?.data?.attributes?.url 
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create checkout' 
    };
  }
}

// Get user's subscription status
export async function getUserSubscription(userId: string) {
  initLemonSqueezy();

  try {
    const { data } = await listSubscriptions({
      filter: {
        user_email: userId // LemonSqueezy uses email, not user_id
      }
    });

    if (!data?.data?.length) {
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null
      };
    }

    const subscription = data.data[0];
    const status = subscription.attributes.status;
    const expiresAt = subscription.attributes.renews_at;

    return {
      isActive: status === 'active' || status === 'on_trial',
      tier: subscription.attributes.product_name?.toLowerCase() || 'free',
      status,
      expiresAt,
      cancelledAt: subscription.attributes.cancelled_at,
      resumesAt: subscription.attributes.resumes_at
    };
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return {
      isActive: false,
      tier: 'free',
      expiresAt: null
    };
  }
}

// Verify webhook signature
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const crypto = await import('crypto');
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return hmac === signature;
}

// Process webhook events
export async function processWebhookEvent(eventName: string, data: any) {
  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      // Update user's subscription in database
      await updateUserSubscription(data);
      break;
      
    case 'subscription_cancelled':
      // Handle cancellation
      await handleSubscriptionCancelled(data);
      break;
      
    case 'subscription_payment_failed':
      // Handle failed payment
      await handlePaymentFailed(data);
      break;
      
    default:
      console.log('Unhandled webhook event:', eventName);
  }
}

// Helper functions
async function updateUserSubscription(data: any) {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const userId = data.meta.custom_data?.user_id;
  if (!userId) return;

  const subscription = {
    user_id: userId,
    subscription_id: data.id,
    status: data.attributes.status,
    product_id: data.attributes.product_id,
    variant_id: data.attributes.variant_id,
    current_period_end: data.attributes.renews_at,
    cancel_at: data.attributes.cancelled_at,
    tier: data.attributes.product_name?.toLowerCase() || 'pro'
  };

  await supabase
    .from('user_subscriptions')
    .upsert(subscription, { onConflict: 'user_id' });
}

async function handleSubscriptionCancelled(data: any) {
  const userId = data.meta.custom_data?.user_id;
  if (!userId) return;

  // Send cancellation email
  // Update user's access
  console.log('Subscription cancelled for user:', userId);
}

async function handlePaymentFailed(data: any) {
  const userId = data.meta.custom_data?.user_id;
  if (!userId) return;

  // Send payment failed email
  // Maybe restrict access after multiple failures
  console.log('Payment failed for user:', userId);
}