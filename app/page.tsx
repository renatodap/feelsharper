import Link from 'next/link'
import { ArrowRight, Target, Zap, Brain, Moon } from 'lucide-react'
import { getAllPosts, getFeaturedPosts } from '../lib/blog-data'

export default function HomePage() {
  const allPosts = getAllPosts()
  const featuredPosts = getFeaturedPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Feel<span className="text-amber-500 underline decoration-2 underline-offset-4">Sharper</span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            <Link href="/blog" className="text-sm font-semibold text-gray-900 hover:text-amber-500">Blog</Link>
            <Link href="/about" className="text-sm font-semibold text-gray-900 hover:text-amber-500">About</Link>
            <Link href="/newsletter" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg">
              Get Sharp →
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Peak Performance for <span className="text-amber-500">Modern Men</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Most men drift through life accepting mediocrity as inevitable. Feel Sharper rejects this. 
              We believe peak performance isn't about hacks or shortcuts—it's about understanding your body's fundamentals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/blog"
                className="rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Start Reading
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Optimize What Matters
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Evidence-based strategies to enhance your sleep, energy, focus, and vitality.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <Moon className="h-5 w-5 flex-none text-amber-500" />
                  Sleep
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Master your circadian rhythm and sleep architecture for peak recovery.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <Zap className="h-5 w-5 flex-none text-amber-500" />
                  Energy
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Optimize nutrition, hydration, and metabolic health for sustained energy.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <Brain className="h-5 w-5 flex-none text-amber-500" />
                  Focus
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Enhance cognitive performance through targeted lifestyle interventions.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <Target className="h-5 w-5 flex-none text-amber-500" />
                  Vitality
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Build long-term health through evidence-based optimization strategies.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Latest Guides
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Practical, evidence-based strategies for peak performance.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {recentPosts.map((post) => (
              <article key={post.id} className="flex flex-col items-start">
                <div className="flex items-center gap-x-4 text-xs">
                  <time className="text-gray-500">{post.date}</time>
                  <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
                    {post.category}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-slate-900 group-hover:text-gray-600">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <div className="text-sm leading-6">
                    <p className="text-gray-600">
                      <span className="font-semibold text-slate-900">{post.readingTime.text}</span> read
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-slate-900">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get Sharp Weekly
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Evidence-based insights delivered every Tuesday. No fluff, just actionable strategies for peak performance.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/newsletter"
                className="rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-slate-900">
              Feel<span className="text-amber-500">Sharper</span>
            </Link>
            <p className="text-sm text-gray-600">
              &copy; 2024 Feel Sharper. Evidence-based performance optimization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
