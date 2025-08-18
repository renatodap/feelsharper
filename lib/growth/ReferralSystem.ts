import { createClient } from '@/lib/supabase/server';

export interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  earnedRewards: number;
  rank: number;
}

export interface ReferralReward {
  type: 'free_month' | 'discount' | 'credits' | 'cash';
  amount: number;
  description: string;
}

export class ReferralSystem {
  private readonly REFERRAL_REWARDS = {
    REFERRER: {
      tier1: { threshold: 1, reward: { type: 'free_month' as const, amount: 1, description: '1 month free' } },
      tier2: { threshold: 3, reward: { type: 'discount' as const, amount: 50, description: '50% off for 3 months' } },
      tier3: { threshold: 5, reward: { type: 'credits' as const, amount: 50, description: '$50 account credit' } },
      tier4: { threshold: 10, reward: { type: 'cash' as const, amount: 100, description: '$100 cash reward' } },
    },
    REFERRED: {
      signup: { type: 'discount' as const, amount: 20, description: '20% off first month' },
      upgrade: { type: 'credits' as const, amount: 10, description: '$10 account credit' },
    }
  };

  async generateReferralCode(userId: string): Promise<string> {
    const supabase = await createClient();
    
    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .single();

    if (existing?.code) {
      return existing.code;
    }

    // Generate unique code
    const code = this.generateUniqueCode(userId);
    
    // Store in database
    await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code,
        created_at: new Date().toISOString(),
      });

    return code;
  }

  async trackReferral(referralCode: string, referredUserId: string): Promise<void> {
    const supabase = await createClient();
    
    // Find referrer
    const { data: referralData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .single();

    if (!referralData) {
      throw new Error('Invalid referral code');
    }

    // Record the referral
    await supabase
      .from('referrals')
      .insert({
        referrer_id: referralData.user_id,
        referred_id: referredUserId,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    // Apply referred user discount
    await this.applyReferredBonus(referredUserId);
    
    // Send notification to referrer
    await this.notifyReferrer(referralData.user_id, referredUserId);
  }

  async confirmReferral(referredUserId: string): Promise<void> {
    const supabase = await createClient();
    
    // Update referral status when referred user upgrades
    const { data: referral } = await supabase
      .from('referrals')
      .update({ 
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('referred_id', referredUserId)
      .eq('status', 'pending')
      .select()
      .single();

    if (referral) {
      // Apply referrer rewards
      await this.applyReferrerRewards(referral.referrer_id);
    }
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const supabase = await createClient();
    
    // Get referral code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .single();

    const code = codeData?.code || await this.generateReferralCode(userId);
    
    // Get referral counts
    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', userId);

    const totalReferrals = referrals?.length || 0;
    const successfulReferrals = referrals?.filter(r => r.status === 'confirmed').length || 0;

    // Get rewards
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('amount, status')
      .eq('user_id', userId);

    const pendingRewards = rewards?.filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0) || 0;
    const earnedRewards = rewards?.filter(r => r.status === 'claimed')
      .reduce((sum, r) => sum + r.amount, 0) || 0;

    // Get leaderboard rank
    const rank = await this.getLeaderboardRank(userId);

    return {
      referralCode: code,
      referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/sign-up?ref=${code}`,
      totalReferrals,
      successfulReferrals,
      pendingRewards,
      earnedRewards,
      rank,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('referral_leaderboard')
      .select(`
        user_id,
        profiles!inner(username, avatar_url),
        total_referrals,
        successful_referrals,
        total_rewards
      `)
      .order('successful_referrals', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private async applyReferrerRewards(referrerId: string): Promise<void> {
    const supabase = await createClient();
    
    // Count successful referrals
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', referrerId)
      .eq('status', 'confirmed');

    const referralCount = count || 0;

    // Determine reward tier
    let reward: ReferralReward | null = null;
    
    if (referralCount >= 10) {
      reward = this.REFERRAL_REWARDS.REFERRER.tier4.reward;
    } else if (referralCount >= 5) {
      reward = this.REFERRAL_REWARDS.REFERRER.tier3.reward;
    } else if (referralCount >= 3) {
      reward = this.REFERRAL_REWARDS.REFERRER.tier2.reward;
    } else if (referralCount >= 1) {
      reward = this.REFERRAL_REWARDS.REFERRER.tier1.reward;
    }

    if (reward) {
      // Record reward
      await supabase
        .from('referral_rewards')
        .insert({
          user_id: referrerId,
          type: reward.type,
          amount: reward.amount,
          description: reward.description,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      // Apply reward based on type
      await this.processReward(referrerId, reward);
    }
  }

  private async applyReferredBonus(userId: string): Promise<void> {
    const supabase = await createClient();
    const reward = this.REFERRAL_REWARDS.REFERRED.signup;

    // Record bonus
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: userId,
        type: reward.type,
        amount: reward.amount,
        description: reward.description,
        status: 'active',
        created_at: new Date().toISOString(),
      });
  }

  private async processReward(userId: string, reward: ReferralReward): Promise<void> {
    const supabase = await createClient();

    switch (reward.type) {
      case 'free_month':
        // Extend subscription
        await this.extendSubscription(userId, 30 * reward.amount);
        break;
        
      case 'discount':
        // Apply discount to next billing
        await supabase
          .from('user_discounts')
          .insert({
            user_id: userId,
            percentage: reward.amount,
            valid_for_months: 3,
            created_at: new Date().toISOString(),
          });
        break;
        
      case 'credits':
        // Add account credits
        await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            amount: reward.amount,
            reason: 'referral_reward',
            created_at: new Date().toISOString(),
          });
        break;
        
      case 'cash':
        // Queue cash payout
        await supabase
          .from('payouts')
          .insert({
            user_id: userId,
            amount: reward.amount,
            status: 'pending',
            type: 'referral_reward',
            created_at: new Date().toISOString(),
          });
        break;
    }
  }

  private async extendSubscription(userId: string, days: number): Promise<void> {
    const supabase = await createClient();
    
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('current_period_end')
      .eq('user_id', userId)
      .single();

    if (subscription) {
      const currentEnd = new Date(subscription.current_period_end);
      const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

      await supabase
        .from('user_subscriptions')
        .update({
          current_period_end: newEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  }

  private async notifyReferrer(referrerId: string, referredUserId: string): Promise<void> {
    // Send email/push notification about new referral
    console.log(`Notifying ${referrerId} about referral from ${referredUserId}`);
  }

  private async getLeaderboardRank(userId: string): Promise<number> {
    const supabase = await createClient();
    
    const { data } = await supabase
      .rpc('get_referral_rank', { user_id: userId });

    return data || 0;
  }

  private generateUniqueCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    const userPart = userId.substring(0, 4);
    return `${userPart}${timestamp}${random}`.toUpperCase();
  }

  // Viral features
  async createShareableContent(userId: string, type: 'progress' | 'achievement' | 'streak'): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const { referralCode } = await this.getReferralStats(userId);
    
    const shareUrls = {
      progress: `${baseUrl}/share/progress/${userId}?ref=${referralCode}`,
      achievement: `${baseUrl}/share/achievement/${userId}?ref=${referralCode}`,
      streak: `${baseUrl}/share/streak/${userId}?ref=${referralCode}`,
    };

    return shareUrls[type];
  }

  async trackViralShare(userId: string, platform: string): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('viral_shares')
      .insert({
        user_id: userId,
        platform,
        shared_at: new Date().toISOString(),
      });

    // Reward for sharing
    const { count } = await supabase
      .from('viral_shares')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count && count % 5 === 0) {
      // Reward every 5 shares
      await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          amount: 5,
          reason: 'viral_sharing',
          created_at: new Date().toISOString(),
        });
    }
  }
}