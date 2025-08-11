import type { Metadata } from 'next';
import { AIFitnessCoach } from '@/components/coach/AIFitnessCoach';

export const metadata: Metadata = {
  title: 'AI Fitness Coach — Feel Sharper',
  description: 'Your personal AI coach for training, nutrition, and performance optimization.',
};

export default function CoachPage() {
  return <AIFitnessCoach />;
}
