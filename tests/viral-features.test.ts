import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Viral Features', () => {
  let testUserId: string;
  let testReferralCode: string;

  beforeEach(async () => {
    // Create test user
    const { data: authData } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    testUserId = authData.user?.id || '';
  });

  afterEach(async () => {
    // Cleanup test data
    if (testUserId) {
      await supabase.from('referrals').delete().eq('referrer_id', testUserId);
      await supabase.from('referrals').delete().eq('referee_id', testUserId);
      await supabase.from('referral_codes').delete().eq('user_id', testUserId);
      await supabase.from('profiles').delete().eq('id', testUserId);
    }
  });

  describe('Referral System', () => {
    it('should create referral code on profile creation', async () => {
      // Create profile (should trigger referral code creation)
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          locale: 'en'
        })
        .select()
        .single();

      expect(profile).toBeTruthy();

      // Check if referral code was created
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', testUserId)
        .single();

      expect(referralCode).toBeTruthy();
      expect(referralCode.code).toMatch(/^[A-Z0-9]{6}$/);
      testReferralCode = referralCode.code;
    });

    it('should apply referral code correctly', async () => {
      // Create referrer profile first
      await supabase.from('profiles').insert({
        id: testUserId,
        locale: 'en'
      });

      // Get referral code
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', testUserId)
        .single();

      // Create referee
      const { data: refereeAuth } = await supabase.auth.signUp({
        email: `referee-${Date.now()}@example.com`,
        password: 'testpassword123'
      });
      const refereeId = refereeAuth.user?.id || '';

      // Apply referral code
      const response = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralCode.code })
      });

      expect(response.ok).toBe(true);

      // Check if referral was created
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', testUserId)
        .eq('referee_id', refereeId)
        .single();

      expect(referral).toBeTruthy();
      expect(referral.status).toBe('pending');

      // Cleanup referee
      await supabase.from('referrals').delete().eq('referee_id', refereeId);
      await supabase.from('profiles').delete().eq('id', refereeId);
    });

    it('should qualify referral on onboarding completion', async () => {
      // Setup referral relationship
      const { data: refereeAuth } = await supabase.auth.signUp({
        email: `referee-${Date.now()}@example.com`,
        password: 'testpassword123'
      });
      const refereeId = refereeAuth.user?.id || '';

      await supabase.from('referrals').insert({
        referrer_id: testUserId,
        referee_id: refereeId,
        referral_code_id: 'test-code-id',
        status: 'pending'
      });

      // Qualify referral
      const response = await fetch('/api/referrals/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.ok).toBe(true);

      // Check if referral was qualified
      const { data: referral } = await supabase
        .from('referrals')
        .select('status, qualified_at')
        .eq('referee_id', refereeId)
        .single();

      expect(referral.status).toBe('qualified');
      expect(referral.qualified_at).toBeTruthy();

      // Check if rewards were granted
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', testUserId);

      expect(rewards.length).toBeGreaterThan(0);

      // Cleanup
      await supabase.from('referral_rewards').delete().eq('user_id', testUserId);
      await supabase.from('referrals').delete().eq('referee_id', refereeId);
      await supabase.from('profiles').delete().eq('id', refereeId);
    });
  });

  describe('Squad System', () => {
    let testSquadId: string;

    it('should create squad with invite code', async () => {
      const response = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Squad',
          description: 'A test squad',
          isPublic: true
        })
      });

      expect(response.ok).toBe(true);
      const { squad } = await response.json();

      expect(squad.name).toBe('Test Squad');
      expect(squad.invite_code).toMatch(/^[A-Z0-9]{8}$/);
      testSquadId = squad.id;

      // Check if creator was added as owner
      const { data: membership } = await supabase
        .from('squad_members')
        .select('role')
        .eq('squad_id', testSquadId)
        .eq('user_id', testUserId)
        .single();

      expect(membership.role).toBe('owner');

      // Cleanup
      await supabase.from('squad_members').delete().eq('squad_id', testSquadId);
      await supabase.from('squads').delete().eq('id', testSquadId);
    });

    it('should join squad by invite code', async () => {
      // Create squad first
      const { data: squad } = await supabase
        .from('squads')
        .insert({
          name: 'Test Squad',
          created_by: testUserId,
          is_public: true
        })
        .select()
        .single();

      // Create another user to join
      const { data: joinerAuth } = await supabase.auth.signUp({
        email: `joiner-${Date.now()}@example.com`,
        password: 'testpassword123'
      });
      const joinerId = joinerAuth.user?.id || '';

      // Join squad
      const response = await fetch('/api/squads/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: squad.invite_code })
      });

      expect(response.ok).toBe(true);

      // Check membership
      const { data: membership } = await supabase
        .from('squad_members')
        .select('*')
        .eq('squad_id', squad.id)
        .eq('user_id', joinerId)
        .single();

      expect(membership).toBeTruthy();
      expect(membership.role).toBe('member');

      // Cleanup
      await supabase.from('squad_members').delete().eq('squad_id', squad.id);
      await supabase.from('squads').delete().eq('id', squad.id);
      await supabase.from('profiles').delete().eq('id', joinerId);
    });
  });

  describe('Challenge System', () => {
    it('should create challenge correctly', async () => {
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next week

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Challenge',
          description: 'A test challenge',
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          category: 'workouts',
          challengeType: 'individual'
        })
      });

      expect(response.ok).toBe(true);
      const { challenge } = await response.json();

      expect(challenge.title).toBe('Test Challenge');
      expect(challenge.category).toBe('workouts');
      expect(challenge.is_active).toBe(true);

      // Cleanup
      await supabase.from('challenges').delete().eq('id', challenge.id);
    });
  });

  describe('Anti-Abuse Features', () => {
    it('should detect and flag suspicious referral activity', async () => {
      // Create multiple referrals quickly (should trigger fraud detection)
      const referralPromises = Array.from({ length: 6 }, async (_, i) => {
        const { data: refereeAuth } = await supabase.auth.signUp({
          email: `suspicious-${i}-${Date.now()}@example.com`,
          password: 'testpassword123'
        });

        return supabase.from('referrals').insert({
          referrer_id: testUserId,
          referee_id: refereeAuth.user?.id,
          referral_code_id: 'test-code-id'
        });
      });

      await Promise.all(referralPromises);

      // Check if suspicious activity was detected
      const { data: suspiciousActivity } = await supabase
        .from('suspicious_activities')
        .select('*')
        .eq('user_id', testUserId)
        .eq('activity_type', 'fake_referrals');

      expect(suspiciousActivity.length).toBeGreaterThan(0);

      // Cleanup
      await supabase.from('suspicious_activities').delete().eq('user_id', testUserId);
    });

    it('should enforce rate limits', async () => {
      // Test rate limiting function
      const { data: firstCheck } = await supabase.rpc('check_rate_limit', {
        p_user_id: testUserId,
        p_action_type: 'test_action',
        p_limit: 2,
        p_window_minutes: 60
      });

      expect(firstCheck).toBe(true);

      const { data: secondCheck } = await supabase.rpc('check_rate_limit', {
        p_user_id: testUserId,
        p_action_type: 'test_action',
        p_limit: 2,
        p_window_minutes: 60
      });

      expect(secondCheck).toBe(true);

      // Third call should be rate limited
      const { data: thirdCheck } = await supabase.rpc('check_rate_limit', {
        p_user_id: testUserId,
        p_action_type: 'test_action',
        p_limit: 2,
        p_window_minutes: 60
      });

      expect(thirdCheck).toBe(false);

      // Cleanup
      await supabase.from('rate_limits').delete().eq('user_id', testUserId);
    });
  });

  describe('Feature Flags', () => {
    it('should return correct feature access', async () => {
      const response = await fetch('/api/features');
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.features).toBeTruthy();
      expect(data.trustScore).toBeGreaterThanOrEqual(0);
      expect(data.trustScore).toBeLessThanOrEqual(100);
    });
  });
});
