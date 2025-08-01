import { Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import BlogCard from '../../components/blog/BlogCard'
import { getAllPosts, getFeaturedPosts, getPostsByCategory } from '../../lib/blog-data'
import type { BlogPost } from '../../lib/blog-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Evidence-Based Performance Optimization | Feel Sharper',
  description: 'Practical guides and insights to optimize your sleep, energy, focus, and long-term vitality. No hype, just results.',
  openGraph: {
    title: 'Blog - Evidence-Based Performance Optimization | Feel Sharper',
    description: 'Practical guides and insights to optimize your sleep, energy, focus, and long-term vitality. No hype, just results.',
    url: 'https://feelsharper.com/blog',
    siteName: 'Feel Sharper',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Evidence-Based Performance Optimization | Feel Sharper',
    description: 'Practical guides and insights to optimize your sleep, energy, focus, and long-term vitality. No hype, just results.',
  },
}

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Sleep', slug: 'sleep' },
  { name: 'Energy', slug: 'energy' },
  { name: 'Focus', slug: 'focus' },
  { name: 'Libido', slug: 'libido' },
]

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams
  const selectedCategory = resolvedSearchParams.category || 'all'
  
  // Get all posts
  const allPostsSorted = getAllPosts()
  
  // Filter posts by category
  const filteredPosts = selectedCategory === 'all' 
    ? allPostsSorted 
    : getPostsByCategory(selectedCategory)
  
  // Get featured post (most recent)
  const featuredPost = getFeaturedPosts()[0] || allPostsSorted[0]

  const regularPosts = filteredPosts.slice(1)

  return (
    <Layout 
      title="Blog - Evidence-Based Performance Optimization"
      description="Practical guides and insights to optimize your sleep, energy, focus, and long-term vitality. No hype, just results."
      url="/blog"
    >
      <div className="bg-white">
        {/* Header */}
        <div className="bg-brand-navy">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                The Feel Sharper Blog
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Evidence-based strategies to optimize your performance. 
                No shortcuts, no hype—just systematic improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-brand-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={category.slug === 'all' ? '/blog' : `/blog?category=${category.slug}`}
                    className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.slug
                        ? 'border-brand-amber text-brand-amber'
                        : 'border-transparent text-brand-gray-500 hover:border-brand-gray-300 hover:text-brand-gray-700'
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
              
              <div className="hidden sm:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-64 rounded-lg border border-brand-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-amber focus:outline-none focus:ring-1 focus:ring-brand-amber"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Suspense fallback={<div>Loading...</div>}>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-brand-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-brand-gray-600">
                  Try selecting a different category or check back later for new content.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Featured Post */}
                {featuredPost && (
                  <section>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-brand-navy">Featured</h2>
                      <p className="mt-2 text-brand-gray-600">
                        Our most comprehensive guide on the topic.
                      </p>
                    </div>
                    <div className="max-w-4xl">
                      <BlogCard post={featuredPost} featured={true} />
                    </div>
                  </section>
                )}

                {/* Regular Posts */}
                {regularPosts.length > 0 && (
                  <section>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-brand-navy">
                        {selectedCategory === 'all' ? 'All Articles' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
                      </h2>
                      <p className="mt-2 text-brand-gray-600">
                        {regularPosts.length} article{regularPosts.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {regularPosts.map((post: BlogPost) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </Suspense>
        </div>

        {/* Newsletter CTA */}
        <section className="bg-brand-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Stay Sharp
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-gray-600">
                Get our best insights delivered weekly. One actionable tip every Sunday.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/newsletter"
                  className="rounded-lg bg-brand-amber px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-amber-600 transition-all duration-200"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
