import type { Metadata } from 'next';
import GoalFirstOnboarding from '@/components/onboarding/GoalFirstOnboarding';

export const metadata: Metadata = {
  title: 'Get Started — Feel Sharper',
  description: 'Personalized fitness journey starts here. Let\'s understand your goals and create your perfect plan.',
};

export default function OnboardingPage() {
  return <GoalFirstOnboarding />;
}