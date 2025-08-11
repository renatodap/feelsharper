import Link from 'next/link'
import { Target, Zap, Brain, Shield } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const principles = [
  {
    icon: Target,
    title: 'Evidence-Based Only',
    description: 'Every recommendation is backed by peer-reviewed research and real-world testing. No pseudoscience, no marketing hype.'
  },
  {
    icon: Zap,
    title: 'Systems Over Hacks',
    description: 'We focus on sustainable systems that compound over time, not quick fixes that fade after a week.'
  },
  {
    icon: Brain,
    title: 'Fundamentals First',
    description: 'Master sleep, nutrition, and movement before chasing advanced optimization techniques. The basics deliver 80% of results.'
  },
  {
    icon: Shield,
    title: 'Anonymous Authority',
    description: 'Our credibility comes from results and research, not personal brands or social media following.'
  }
]

export default function AboutPage() {
  return (
    <Layout
      title="About - Our Mission to Reject Mediocrity"
      description="Feel Sharper exists to help men optimize their performance through evidence-based strategies. No hype, no shortcuts—just systematic improvement."
      url="/about"
    >
      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-brand-navy">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Most men accept mediocrity.
                <span className="block text-brand-amber mt-2">
                  We reject it.
                </span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
                Feel Sharper exists to help men aged 25-45 systematically optimize their sleep, energy, 
                libido, focus, and long-term vitality through evidence-based strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl mb-6">
                  The Feel Sharper Manifesto
                </h2>
              </div>
              
              <div className="prose prose-lg prose-brand max-w-none">
                <div className="bg-brand-gray-50 rounded-2xl p-8 border-l-4 border-brand-amber">
                  <p className="text-lg leading-8 text-brand-gray-700 mb-6">
                    <strong>Most men drift through life accepting mediocrity as inevitable.</strong> They wake up 
                    groggy, drag through the day on caffeine and willpower, and collapse into bed exhausted, 
                    only to repeat the cycle tomorrow.
                  </p>
                  
                  <p className="text-lg leading-8 text-brand-gray-700 mb-6">
                    <strong>Feel Sharper rejects this.</strong> We believe peak performance isn't about hacks 
                    or shortcuts—it&apos;s about understanding your body&apos;s fundamentals and optimizing them systematically.
                  </p>
                  
                  <p className="text-lg leading-8 text-brand-gray-700 mb-6">
                    We don&apos;t promise overnight transformations or miracle supplements. We offer something better: 
                    <strong>evidence-based strategies that compound over time.</strong>
                  </p>
                  
                  <p className="text-lg leading-8 text-brand-gray-700">
                    <strong>Sleep better. Think clearer. Move with purpose.</strong> This isn&apos;t about perfection—it&apos;s 
                    about consistent improvement and refusing to accept &quot;good enough&quot; when you could be sharper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Principles */}
        <section className="py-24 sm:py-32 bg-brand-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Our Principles
              </h2>
              <p className="mt-6 text-lg leading-8 text-brand-gray-600">
                These four principles guide everything we create and recommend.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2">
              {principles.map((principle, index) => {
                const Icon = principle.icon
                return (
                  <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-brand-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-amber/10">
                          <Icon className="h-6 w-6 text-brand-amber" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-brand-navy mb-3">
                          {principle.title}
                        </h3>
                        <p className="text-brand-gray-600 leading-7">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why Anonymous */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl mb-6">
                  Why We Stay Anonymous
                </h2>
              </div>
              
              <div className="prose prose-lg prose-brand max-w-none">
                <p className="text-lg leading-8 text-brand-gray-700 mb-6">
                  In a world of fitness influencers and biohacking gurus, we choose to remain anonymous. 
                  This isn&apos;t about hiding—it&apos;s about focus.
                </p>
                
                <div className="grid gap-8 md:grid-cols-2 my-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">What We Reject:</h3>
                    <ul className="space-y-2 text-red-800">
                      <li>• Personal brand building over substance</li>
                      <li>• Social proof over scientific proof</li>
                      <li>• Selling courses and coaching programs</li>
                      <li>• Promoting unproven &quot;biohacks&quot;</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">What We Focus On:</h3>
                    <ul className="space-y-2 text-green-800">
                      <li>• Research-backed recommendations</li>
                      <li>• Practical, actionable strategies</li>
                      <li>• Long-term systematic improvement</li>
                      <li>• Honest product recommendations</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-lg leading-8 text-brand-gray-700">
                  Our credibility comes from results and research, not follower counts or transformation photos. 
                  When you read Feel Sharper, you&apos;re getting information that stands on its own merit, 
                  not because someone with abs told you to buy it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Make Money */}
        <section className="py-24 sm:py-32 bg-brand-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl mb-6">
                  Transparency in Business
                </h2>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-brand-gray-200">
                <p className="text-lg leading-8 text-brand-gray-700 mb-6">
                  <strong>We&apos;re transparent about how we make money.</strong> Feel Sharper is supported through 
                  carefully selected affiliate partnerships with companies whose products we genuinely use and recommend.
                </p>
                
                <div className="grid gap-6 md:grid-cols-2 my-8">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy mb-3">Our Standards:</h3>
                    <ul className="space-y-2 text-brand-gray-700">
                      <li>• We only recommend products we personally use</li>
                      <li>• Every recommendation is research-backed</li>
                      <li>• We clearly mark all affiliate links</li>
                      <li>• Our opinions are never for sale</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy mb-3">What We Don&apos;t Do:</h3>
                    <ul className="space-y-2 text-brand-gray-700">
                      <li>• Sell courses or coaching programs</li>
                      <li>• Accept sponsored content</li>
                      <li>• Promote MLM or supplement scams</li>
                      <li>• Recommend products just for commissions</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-lg leading-8 text-brand-gray-700">
                  If we recommend something, it&apos;s because it works. If you buy through our links, 
                  you help support our research and content creation at no extra cost to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-brand-navy py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Get Sharp?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Join thousands of men who refuse to accept mediocrity. 
                Start with our evidence-based guides.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/blog"
                  className="rounded-lg bg-brand-amber px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-amber-600 transition-all duration-200"
                >
                  Start Reading
                </Link>
                <Link
                  href="/newsletter"
                  className="text-lg font-semibold leading-6 text-white hover:text-brand-amber transition-colors duration-200"
                >
                  Get Weekly Insights →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
