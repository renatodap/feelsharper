import type { Metadata } from 'next';
import { ProgressPhotoComparison } from '@/components/progress/ProgressPhotoComparison';

export const metadata: Metadata = {
  title: 'Progress Photos — Feel Sharper',
  description: 'Track your transformation visually with progress photos, measurements, and side-by-side comparisons.',
};

export default function ProgressPhotoPage() {
  return <ProgressPhotoComparison />;
}