import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Camera, 
  Brain, 
  TrendingUp, 
  Mic, 
  Download, 
  Users,
  Smartphone,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features - FeelSharper | AI-Powered Fitness Tracking',
  description: 'Discover FeelSharper features: AI coaching, photo food scanning, voice logging, advanced analytics, and more. Transform your fitness journey today.',
  keywords: 'fitness app features, AI personal trainer, food scanner app, workout tracker features, nutrition analytics',
  openGraph: {
    title: 'FeelSharper Features - Your Complete Fitness Solution',
    description: 'AI coaching, photo scanning, voice logging, and advanced analytics in one app',
    images: ['/images/features-og.png'],
  },
};

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Coaching',
    description: 'Get personalized workout and nutrition advice from our advanced AI coach, available 24/7.',
    details: [
      'Personalized recommendations',
      'Form corrections',
      'Progress analysis',
      'Motivation support',
    ],
  },
  {
    icon: Camera,
    title: 'Photo Food Scanning',
    description: 'Simply take a photo of your meal and our AI instantly logs calories and nutrients.',
    details: [
      'Instant recognition',
      'Portion estimation',
      'Multi-food detection',
      'Barcode scanning',
    ],
  },
  {
    icon: Mic,
    title: 'Voice Logging',
    description: 'Log your workouts and meals by simply speaking. Perfect for hands-free tracking.',
    details: [
      'Natural language processing',
      'Multiple languages',
      'Quick corrections',
      'Offline support',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Deep insights into your progress with beautiful charts and actionable recommendations.',
    details: [
      'Progress predictions',
      'Trend analysis',
      'Goal tracking',
      'Performance metrics',
    ],
  },
  {
    icon: Users,
    title: 'Social Features',
    description: 'Connect with friends, join challenges, and stay motivated together.',
    details: [
      'Friend challenges',
      'Leaderboards',
      'Achievement sharing',
      'Community support',
    ],
  },
  {
    icon: Download,
    title: 'Data Export',
    description: 'Your data belongs to you. Export everything in CSV or PDF format anytime.',
    details: [
      'Full data ownership',
      'Multiple formats',
      'Automated backups',
      'API access',
    ],
  },
];

const additionalFeatures = [
  { icon: Smartphone, label: 'Mobile PWA', description: 'Works offline' },
  { icon: Zap, label: 'Real-time Sync', description: 'Across all devices' },
  { icon: Shield, label: 'Privacy First', description: 'Your data is encrypted' },
  { icon: Globe, label: 'Multi-language', description: '12 languages supported' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Everything You Need to
              <span className="text-navy"> Feel Sharper</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Powerful features designed to make fitness tracking effortless and effective. 
              From AI coaching to social challenges, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="px-8 py-3 bg-surface-light text-text-primary rounded-xl hover:bg-surface-lighter transition-colors font-medium border border-border"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Core Features
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Everything you need to track, analyze, and improve your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 bg-navy rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Coach Spotlight */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-surface to-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">
                Your Personal AI Fitness Coach
              </h2>
              <p className="text-text-secondary mb-6">
                Our AI coach learns from your habits, preferences, and progress to provide 
                truly personalized guidance. It's like having a personal trainer, nutritionist, 
                and motivational coach in your pocket.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Adaptive Programs</h4>
                    <p className="text-sm text-text-secondary">
                      Workouts adjust based on your progress and recovery
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Smart Reminders</h4>
                    <p className="text-sm text-text-secondary">
                      Get notified at the perfect time based on your schedule
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Instant Answers</h4>
                    <p className="text-sm text-text-secondary">
                      Ask anything about fitness, nutrition, or your progress
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-8">
              <div className="space-y-4">
                <div className="bg-bg rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">You</p>
                  <p className="text-text-primary">
                    How many calories should I eat to lose 2 lbs per week?
                  </p>
                </div>
                <div className="bg-navy/10 rounded-xl p-4">
                  <p className="text-sm text-navy mb-1">AI Coach</p>
                  <p className="text-text-primary">
                    Based on your current intake and activity, aim for 1,800 calories daily. 
                    This creates a 500-calorie deficit for healthy 1-2 lb weekly loss. 
                    I've updated your nutrition targets.
                  </p>
                </div>
                <div className="bg-bg rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">You</p>
                  <p className="text-text-primary">
                    What should I eat for dinner tonight?
                  </p>
                </div>
                <div className="bg-navy/10 rounded-xl p-4">
                  <p className="text-sm text-navy mb-1">AI Coach</p>
                  <p className="text-text-primary">
                    You have 650 calories and 35g protein remaining. Try grilled chicken 
                    with quinoa and roasted vegetables. Want me to log it when you're done?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Plus Everything Else You'd Expect
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="text-center p-6 bg-surface border border-border rounded-xl"
                >
                  <Icon className="w-8 h-8 text-navy mx-auto mb-3" />
                  <h4 className="font-medium text-text-primary mb-1">
                    {feature.label}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              How We Compare
            </h2>
            <p className="text-text-secondary">
              See why users are switching to FeelSharper
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-text-primary">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-text-primary">FeelSharper</th>
                  <th className="text-center py-4 px-4 font-medium text-text-secondary">MyFitnessPal</th>
                  <th className="text-center py-4 px-4 font-medium text-text-secondary">Fitbit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-text-primary">AI Coaching</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">Limited</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-text-primary">Photo Food Scanning</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">Premium</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-text-primary">Voice Logging</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-text-primary">Price</td>
                  <td className="text-center py-4 px-4 font-medium text-text-primary">
                    $9.99/mo
                  </td>
                  <td className="text-center py-4 px-4 text-text-secondary">
                    $19.99/mo
                  </td>
                  <td className="text-center py-4 px-4 text-text-secondary">
                    $9.99/mo
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-text-primary">Free Version</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">Generous</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">Limited</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-text-secondary">Basic</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-bg to-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Experience the Difference
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands who've transformed their fitness with FeelSharper
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors font-medium"
            >
              Start 7-Day Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-surface-light text-text-primary rounded-xl hover:bg-surface-lighter transition-colors font-medium border border-border"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}