'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, Trophy, Users, DollarSign, TrendingUp } from 'lucide-react';
import type { ReferralStats } from '@/lib/growth/ReferralSystem';

export default function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralUrl) {
      navigator.clipboard.writeText(stats.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!stats?.referralUrl) return;

    const text = "Join me on FeelSharper - AI-powered fitness tracking! 💪 Get 20% off your first month with my referral link:";
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(stats.referralUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.referralUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats.referralUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + stats.referralUrl)}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-surface rounded-xl"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const rewards = [
    { milestone: 1, reward: '1 Month Free', achieved: stats.successfulReferrals >= 1 },
    { milestone: 3, reward: '50% Off (3 months)', achieved: stats.successfulReferrals >= 3 },
    { milestone: 5, reward: '$50 Credit', achieved: stats.successfulReferrals >= 5 },
    { milestone: 10, reward: '$100 Cash', achieved: stats.successfulReferrals >= 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Refer Friends & Earn Rewards</h2>
        <p className="text-white/80">
          Share FeelSharper with friends. They get 20% off, you earn free months!
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <label className="block text-sm text-text-secondary mb-2">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={stats.referralUrl}
            className="flex-1 px-4 py-3 bg-bg border border-border rounded-lg text-text-primary"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-3 bg-navy text-white rounded-lg hover:bg-navy-600 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => shareOnSocial('twitter')}
            className="flex-1 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Twitter
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="flex-1 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Facebook
          </button>
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="flex-1 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            WhatsApp
          </button>
          <button
            onClick={() => shareOnSocial('linkedin')}
            className="flex-1 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-navy" />
            <span className="text-sm text-text-secondary">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.totalReferrals}</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-text-secondary">Successful</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.successfulReferrals}</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-text-secondary">Pending Rewards</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">${stats.pendingRewards}</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-text-secondary">Leaderboard</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">#{stats.rank}</p>
        </div>
      </div>

      {/* Rewards Progress */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Reward Milestones</h3>
        <div className="space-y-4">
          {rewards.map((reward, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                reward.achieved ? 'bg-green-500/20 text-green-500' : 'bg-surface-light text-text-secondary'
              }`}>
                {reward.milestone}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${reward.achieved ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {reward.reward}
                </p>
                <p className="text-sm text-text-secondary">
                  Refer {reward.milestone} {reward.milestone === 1 ? 'friend' : 'friends'}
                </p>
              </div>
              {reward.achieved && (
                <div className="text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">How It Works</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-text-primary">Share your link</p>
              <p className="text-sm text-text-secondary">Send your referral link to friends</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-text-primary">They sign up</p>
              <p className="text-sm text-text-secondary">Friends get 20% off their first month</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-text-primary">Earn rewards</p>
              <p className="text-sm text-text-secondary">Get free months, credits, or cash rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}