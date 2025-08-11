import { CheckCircle, Mail, Target, Zap, Brain } from 'lucide-react'
import Layout from '../../components/layout/Layout'

export default function NewsletterPage() {
  return (
    <Layout
      title="Newsletter - Get Sharp Weekly"
      description="Join thousands of men who get our weekly insights. One actionable tip every Sunday."
      url="/newsletter"
    >
      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-brand-navy">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Mail className="h-16 w-16 text-brand-amber mx-auto mb-8" />
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Get Sharp Weekly
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
                Join 12,000+ men who get our Sunday newsletter. One actionable insight every week. 
                No fluff, no spam—just evidence-based strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-2xl px-6">
            <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-brand-navy mb-4">
                  Start Getting Sharper Today
                </h2>
                <p className="text-brand-gray-600">
                  Enter your email and get your first insight this Sunday.
                </p>
              </div>
              
              <form className="space-y-6">
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-brand-gray-300 px-4 py-3 focus:border-brand-amber focus:outline-none focus:ring-1 focus:ring-brand-amber"
                  placeholder="your@email.com"
                />
                
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-amber px-6 py-3 text-lg font-semibold text-white hover:bg-amber-600 transition-all duration-200"
                >
                  Get Sharp Weekly →
                </button>
                
                <div className="flex items-center gap-2 text-sm text-brand-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free forever. Unsubscribe anytime.</span>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-brand-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold text-center text-brand-navy mb-16">
              What You&apos;ll Get
            </h2>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="bg-white rounded-xl p-8 text-center">
                <Target className="h-12 w-12 text-brand-amber mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-navy mb-4">
                  One Actionable Insight
                </h3>
                <p className="text-brand-gray-600">
                  Every Sunday, get one evidence-based strategy you can implement immediately.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center">
                <Zap className="h-12 w-12 text-brand-amber mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-navy mb-4">
                  No Fluff, No Spam
                </h3>
                <p className="text-brand-gray-600">
                  Just practical advice that moves the needle on your performance.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center">
                <Brain className="h-12 w-12 text-brand-amber mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-navy mb-4">
                  Exclusive Content
                </h3>
                <p className="text-brand-gray-600">
                  Subscriber-only insights and early access to new guides.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
