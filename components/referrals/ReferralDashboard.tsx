'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Users, 
  Share2, 
  Trophy, 
  Gift, 
  Copy, 
  RefreshCw,
  ExternalLink,
  Calendar,
  Award
} from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  tier: string;
}

interface ReferralData {
  referralCode: string;
  stats: ReferralStats;
  recentReferrals: Array<{
    id: string;
    created_at: string;
    status: string;
    qualified_at?: string;
  }>;
  unclaimedRewards: Array<{
    id: string;
    reward_type: string;
    reward_value: any;
    granted_at: string;
    expires_at?: string;
  }>;
}

export default function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const referralData = await response.json();
        setData(referralData);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!data?.referralCode) return;

    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const regenerateCode = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' })
      });

      if (response.ok) {
        const { code } = await response.json();
        setData(prev => prev ? { ...prev, referralCode: code } : null);
      }
    } catch (error) {
      console.error('Failed to regenerate code:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const shareReferral = () => {
    if (!data?.referralCode) return;

    const shareText = `Join me on Feel Sharper and get 7 days premium access! Use my code: ${data.referralCode}`;
    const shareUrl = `${window.location.origin}/onboarding?ref=${data.referralCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join Feel Sharper',
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-600">Failed to load referral data</p>
        <Button onClick={fetchReferralData} className="mt-2">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Your Referral Code</h2>
          </div>
          <Badge className={getTierColor(data.stats.tier)}>
            {getTierIcon(data.stats.tier)} {data.stats.tier.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg border-2 border-dashed border-amber-300 font-mono text-xl font-bold text-amber-800">
            {data.referralCode}
          </div>
          <Button
            onClick={copyReferralCode}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            {copySuccess ? <Award className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            onClick={regenerateCode}
            variant="outline"
            size="sm"
            disabled={isRegenerating}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button onClick={shareReferral} className="bg-amber-600 hover:bg-amber-700 flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Friends
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.totalReferrals}</p>
              <p className="text-sm text-slate-600">Total Referrals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.qualifiedReferrals}</p>
              <p className="text-sm text-slate-600">Qualified Referrals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.unclaimedRewards.length}</p>
              <p className="text-sm text-slate-600">Unclaimed Rewards</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Referrals */}
      {data.recentReferrals.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Referrals
          </h3>
          <div className="space-y-3">
            {data.recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    New referral
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={referral.status === 'qualified' ? 'default' : 'secondary'}>
                  {referral.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unclaimed Rewards */}
      {data.unclaimedRewards.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Unclaimed Rewards
          </h3>
          <div className="space-y-3">
            {data.unclaimedRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">
                    {reward.reward_type === 'premium_days' && `${reward.reward_value.days} Days Premium`}
                    {reward.reward_type === 'badge' && reward.reward_value.title}
                  </p>
                  <p className="text-sm text-green-600">
                    Earned {new Date(reward.granted_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Claim
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
