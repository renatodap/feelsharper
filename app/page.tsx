import { Metadata } from 'next';
import Hero from '../components/feature/Hero';
import FeatureGrid from '../components/feature/FeatureGrid';
import ArticlePreview from '@/components/feature/ArticlePreview';
import FeelTracker from '../components/feature/FeelTracker';
import { getAllPosts } from '../lib/blog-data';
import SEOHead from '../components/SEOHead';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Feel Sharper | Your Sharpest Self, Every Day',
  description: 'Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.',
};

/**
 * Redesigned homepage emphasizing the AI assistant and modern wellness experience
 * Features clean typography, strategic CTAs, and cohesive brand messaging
 */
export default async function HomePage() {
  // Comment out redirect for now - will implement proper homepage
  // redirect('/dashboard');
  const posts = await getAllPosts();
  const featuredPosts = posts.slice(0, 3);

  return (
    <>
      <SEOHead 
        title="Feel Sharper | Your Sharpest Self, Every Day"
        description="Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support."
      />
      
      {/* Modern Hero Section with AI emphasis */}
      <Hero />

      {/* Core wellness categories with enhanced design */}
      <FeatureGrid />

      {/* Featured articles with modern card design */}
      <ArticlePreview posts={featuredPosts} />

      {/* Feel Tracker teaser component */}
      <FeelTracker />
    </>
  );
}
