import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, Zap, Trophy, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing - FeelSharper | AI Fitness Tracking Plans',
  description: 'Choose the perfect FeelSharper plan. Free forever option or upgrade to Pro for AI coaching, unlimited tracking, and advanced analytics.',
  keywords: 'fitness app pricing, AI coach subscription, workout tracker cost, nutrition app plans',
  openGraph: {
    title: 'FeelSharper Pricing - Start Free, Upgrade Anytime',
    description: 'Track fitness free forever or unlock AI coaching for $9.99/month',
    images: ['/images/pricing-og.png'],
  },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Track 5 foods per day',
      'Basic weight tracking',
      'Simple progress charts',
      '7-day history',
      'Community support',
    ],
    limitations: [
      'No AI coaching',
      'Limited food database',
      'No photo scanning',
      'No data export',
    ],
    cta: 'Start Free',
    href: '/sign-up',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious fitness enthusiasts',
    features: [
      'Unlimited food tracking',
      'AI-powered coaching',
      'Photo food scanning',
      'Voice logging',
      'Advanced analytics',
      'Custom meal templates',
      'Export data (CSV/PDF)',
      'Priority support',
      'No ads',
    ],
    limitations: [],
    cta: 'Start 7-Day Trial',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Elite',
    price: '$19.99',
    period: '/month',
    description: 'Complete transformation package',
    features: [
      'Everything in Pro',
      'Unlimited AI coaching',
      'Personal trainer access',
      'Custom workout programs',
      'Nutrition planning',
      'Weekly check-ins',
      'Body composition analysis',
      'Supplement recommendations',
      'VIP support',
    ],
    limitations: [],
    cta: 'Go Elite',
    href: '/sign-up?plan=elite',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Start free and upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                7-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-surface border rounded-2xl p-8 ${
                  plan.popular
                    ? 'border-navy shadow-xl shadow-navy/10'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-navy text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-text-secondary mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-text-primary">
                      {plan.price}
                    </span>
                    <span className="text-text-secondary">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-text-primary">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-3 opacity-60">
                      <X className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full py-3 px-6 text-center rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-navy text-white hover:bg-navy-600'
                      : 'bg-surface-light text-text-primary hover:bg-surface-lighter border border-border'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Trusted by 10,000+ Users
            </h2>
            <p className="text-text-secondary">
              Join thousands achieving their fitness goals with FeelSharper
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-text-primary mb-4">
                "The AI coach is like having a personal trainer in my pocket. Worth every penny!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy/10 rounded-full" />
                <div>
                  <p className="font-medium text-text-primary">Sarah M.</p>
                  <p className="text-sm text-text-secondary">Pro Member</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-text-primary mb-4">
                "Lost 15 lbs in 2 months. The food tracking and analytics are game-changers."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy/10 rounded-full" />
                <div>
                  <p className="font-medium text-text-primary">Mike T.</p>
                  <p className="text-sm text-text-secondary">Elite Member</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-text-primary mb-4">
                "Free version is great to start, upgraded for the AI features. No regrets!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy/10 rounded-full" />
                <div>
                  <p className="font-medium text-text-primary">Emma L.</p>
                  <p className="text-sm text-text-secondary">Pro Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-surface border border-border rounded-xl hover:bg-surface-light">
                <span className="font-medium text-text-primary">
                  Can I cancel my subscription anytime?
                </span>
                <span className="text-text-secondary group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <p className="px-4 py-3 text-text-secondary">
                Yes! You can cancel your subscription at any time from your account settings. 
                You'll continue to have access until the end of your billing period.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-surface border border-border rounded-xl hover:bg-surface-light">
                <span className="font-medium text-text-primary">
                  What's included in the AI coaching?
                </span>
                <span className="text-text-secondary group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <p className="px-4 py-3 text-text-secondary">
                AI coaching includes personalized workout recommendations, nutrition advice, 
                progress analysis, form corrections, and 24/7 chat support with our AI trainer.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-surface border border-border rounded-xl hover:bg-surface-light">
                <span className="font-medium text-text-primary">
                  Do you offer student discounts?
                </span>
                <span className="text-text-secondary group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <p className="px-4 py-3 text-text-secondary">
                Yes! Students get 20% off all paid plans. Email support@feelsharper.com 
                with your .edu email address to get your discount code.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-surface border border-border rounded-xl hover:bg-surface-light">
                <span className="font-medium text-text-primary">
                  Can I switch plans later?
                </span>
                <span className="text-text-secondary group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <p className="px-4 py-3 text-text-secondary">
                Absolutely! You can upgrade or downgrade your plan at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-navy mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands achieving their goals with AI-powered tracking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors font-medium"
            >
              Start Free Today
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3 bg-surface-light text-text-primary rounded-xl hover:bg-surface-lighter transition-colors font-medium border border-border"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}