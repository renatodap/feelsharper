import Link from 'next/link'
import { ArrowRight, Target, Zap, Brain, Moon, TrendingUp, Shield } from 'lucide-react'
import { getAllPosts, getFeaturedPosts } from '../lib/blog-data'
import BlogCard from '../components/blog/BlogCard'

export default function HomePage() {
  const allPosts = getAllPosts()
  const featuredPosts = getFeaturedPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      {/* Remove duplicate navigation - use Navbar component instead */}

      {/* Hero Section - Enhanced with emotional design */}
      <section className="relative isolate overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gray-50 via-white to-brand-amber-light/20 opacity-60" />
        
        {/* Floating elements for depth */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-amber/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative px-6 pt-20 pb-32 sm:pt-32 sm:pb-40 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Tension-building pre-headline */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-brand-navy/5 px-4 py-2 text-sm font-medium text-brand-navy backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-brand-amber" />
              <span>Evidence-based optimization for modern men</span>
            </div>
            
            {/* Main headline with enhanced hierarchy */}
            <h1 className="font-heading text-5xl font-bold tracking-tight text-brand-navy sm:text-7xl lg:text-8xl">
              Peak Performance for{' '}
              <span className="gradient-text bg-gradient-to-r from-brand-amber via-brand-amber-dark to-brand-navy bg-clip-text text-transparent">
                Modern Men
              </span>
            </h1>
            
            {/* Enhanced value proposition with rhythm */}
            <div className="mt-8 space-y-6">
              <p className="text-xl leading-relaxed text-brand-gray-700 max-w-3xl mx-auto font-medium">
                Most men drift through life accepting mediocrity as inevitable.
              </p>
              <p className="text-lg leading-relaxed text-brand-gray-600 max-w-2xl mx-auto">
                <strong className="text-brand-navy">Feel Sharper rejects this.</strong> We believe peak performance isn't about hacks or shortcuts—it's about understanding your body's fundamentals and optimizing them systematically.
              </p>
            </div>
            
            {/* Enhanced CTA section with social proof */}
            <div className="mt-12 space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/blog"
                  className="group btn btn-primary px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Optimizing
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/about" 
                  className="text-base font-semibold text-brand-gray-700 hover:text-brand-amber transition-colors duration-200 group"
                >
                  Learn our approach
                  <ArrowRight className="ml-1 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Subtle social proof */}
              <div className="flex items-center justify-center gap-6 text-sm text-brand-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-amber" />
                  <span>Evidence-based</span>
                </div>
                <div className="w-1 h-1 bg-brand-gray-300 rounded-full" />
                <span>No hype, no shortcuts</span>
                <div className="w-1 h-1 bg-brand-gray-300 rounded-full" />
                <span>Anonymous authority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars - Enhanced with depth and interaction */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-brand-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
              Optimize What <span className="text-brand-amber">Actually</span> Matters
            </h2>
            <p className="mt-6 text-xl leading-8 text-brand-gray-600">
              Four evidence-based pillars that determine 80% of your performance.
            </p>
          </div>
          
          <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-28 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-4">
              <div className="group relative">
                <div className="card p-8 h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-brand-navy mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-amber/10 group-hover:bg-brand-amber/20 transition-colors duration-300">
                      <Moon className="h-6 w-6 text-brand-amber" />
                    </div>
                    Sleep
                  </dt>
                  <dd className="text-base leading-7 text-brand-gray-600">
                    <p>Master your circadian rhythm and sleep architecture. Quality sleep is the foundation of everything else.</p>
                  </dd>
                </div>
              </div>
              <div className="group relative">
                <div className="card p-8 h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-brand-navy mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-amber/10 group-hover:bg-brand-amber/20 transition-colors duration-300">
                      <Zap className="h-6 w-6 text-brand-amber" />
                    </div>
                    Energy
                  </dt>
                  <dd className="text-base leading-7 text-brand-gray-600">
                    <p>Optimize metabolic health and sustained energy. No more afternoon crashes or caffeine dependence.</p>
                  </dd>
                </div>
              </div>
              <div className="group relative">
                <div className="card p-8 h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-brand-navy mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-amber/10 group-hover:bg-brand-amber/20 transition-colors duration-300">
                      <Brain className="h-6 w-6 text-brand-amber" />
                    </div>
                    Focus
                  </dt>
                  <dd className="text-base leading-7 text-brand-gray-600">
                    <p>Build unshakeable concentration and mental clarity. Deep work in a distracted world.</p>
                  </dd>
                </div>
              </div>
              <div className="group relative">
                <div className="card p-8 h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-brand-navy mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-amber/10 group-hover:bg-brand-amber/20 transition-colors duration-300">
                      <Target className="h-6 w-6 text-brand-amber" />
                    </div>
                    Vitality
                  </dt>
                  <dd className="text-base leading-7 text-brand-gray-600">
                    <p>Build long-term health and resilience. Systematic optimization that compounds over decades.</p>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Featured Content - Enhanced with proper BlogCard components */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
              Latest <span className="text-brand-amber">Evidence</span>
            </h2>
            <p className="mt-6 text-xl leading-8 text-brand-gray-600">
              Practical, research-backed strategies you can implement today.
            </p>
          </div>
          
          {/* Featured post */}
          {featuredPosts.length > 0 && (
            <div className="mt-16">
              <BlogCard post={featuredPosts[0]} featured={true} />
            </div>
          )}
          
          {/* Recent posts grid */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {recentPosts.slice(0, 3).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          
          {/* View all link */}
          <div className="mt-12 text-center">
            <Link 
              href="/blog" 
              className="group inline-flex items-center gap-2 text-base font-semibold text-brand-amber hover:text-brand-amber-dark transition-colors duration-200"
            >
              View all guides
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA - Enhanced with emotional design */}
      <section className="relative bg-brand-navy overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-gray-800 to-brand-navy opacity-90" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-amber/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-amber/5 rounded-full blur-2xl" />
        
        <div className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get Sharp <span className="text-brand-amber">Weekly</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-brand-gray-300">
              Join 12,000+ men who get our Sunday newsletter. One evidence-based insight every week. 
              <strong className="text-white">No fluff, no spam</strong>—just actionable strategies for peak performance.
            </p>
            
            {/* Enhanced CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/newsletter"
                className="group btn btn-primary px-8 py-4 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Sharp Weekly
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-brand-gray-400">
              <span>✓ Evidence-based</span>
              <span>✓ No spam</span>
              <span>✓ Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Remove duplicate footer - use Footer component instead */}
    </div>
  )
}
