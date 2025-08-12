import { Metadata } from 'next';
import FitnessHero from '@/components/home/FitnessHero';

export const metadata: Metadata = {
  title: 'Feel Sharper | Free Fitness Tracker',
  description: 'Track food, workouts, and weight with clean graphs. Completely free, no ads, no subscriptions.',
};

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section */}
      <FitnessHero />
      
      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">
            Built for Everyone
          </h2>
          <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
            Whether you're a beginner or advanced athlete, Feel Sharper keeps your fitness tracking simple and effective.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally, a fitness tracker that just works. No complicated features, just results.",
                author: "Sarah C.",
                role: "Beginner Runner",
                avatar: "🏃‍♀️"
              },
              {
                quote: "Love the clean interface. I can log my workouts in seconds.",
                author: "Marcus J.",
                role: "Powerlifter",
                avatar: "🏋️‍♂️"
              },
              {
                quote: "The food logging is so much faster than other apps I've tried.",
                author: "Alex R.",
                role: "CrossFit Athlete",
                avatar: "🤸‍♀️"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-surface-2 border border-border rounded-xl p-6 group hover:scale-105 hover:bg-surface-3 transition-all duration-300">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-text-secondary mb-4 italic">"{testimonial.quote}"</p>
                <div className="font-semibold text-text-primary">{testimonial.author}</div>
                <div className="text-sm text-text-muted">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-navy">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Tracking Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            No credit card required. No trial period. Just free fitness tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-navy bg-white rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              Sign Up Free
            </a>
            <a 
              href="/today" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}