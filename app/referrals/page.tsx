import { Metadata } from 'next';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';

export const metadata: Metadata = {
  title: 'Referrals | Feel Sharper',
  description: 'Invite friends and earn rewards on Feel Sharper',
};

export default function ReferralsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Invite Friends, Earn Rewards
        </h1>
        <p className="text-slate-600">
          Share Feel Sharper with friends and both of you get premium access and exclusive rewards.
        </p>
      </div>

      <ReferralDashboard />
    </div>
  );
}
