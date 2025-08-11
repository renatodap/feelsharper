import type { Metadata } from 'next';
import { CommunityHub } from '@/components/social/CommunityHub';

export const metadata: Metadata = {
  title: 'Community Hub — Feel Sharper',
  description: 'Connect with like-minded fitness enthusiasts, join challenges, find workout buddies, and compete on leaderboards.',
};

export default function CommunityPage() {
  return <CommunityHub />;
}