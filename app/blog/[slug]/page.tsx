import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Clock, Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Layout from '../../../components/layout/Layout'
import AffiliateBox from '../../../components/blog/AffiliateBox'
import ComparisonTable from '../../../components/blog/ComparisonTable'
import Callout from '../../../components/blog/Callout'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '../../../lib/blog-data'
import type { BlogPost } from '../../../lib/blog-data'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Related posts (same category, excluding current post)
  const relatedPosts = getRelatedPosts(post.slug, post.category, 3)

  return (
    <Layout
      title={post.title}
      description={post.description}
      image={post.image}
      url={post.url}
    >
      <article className="bg-white">
        {/* Header */}
        <div className="bg-brand-navy">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-amber hover:text-amber-300 transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="inline-flex items-center rounded-full bg-brand-amber px-3 py-1 text-xs font-semibold text-white">
                  {post.category}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime.text}</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>
              
              <p className="text-xl leading-8 text-gray-300 max-w-3xl">
                {post.description}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <div className="prose prose-lg prose-brand max-w-none">
            <div className="text-brand-gray-700 leading-relaxed">
              <p className="text-xl mb-6">{post.description}</p>
              <div className="space-y-4">
                <p>This is a comprehensive guide on {post.title.toLowerCase()}. Our evidence-based approach focuses on practical, actionable strategies that deliver real results.</p>
                <p>Key topics covered in this guide:</p>
                <ul className="list-disc pl-6 space-y-2">
                  {post.tags.map((tag: string) => (
                    <li key={tag} className="capitalize">{tag.replace('-', ' ')}</li>
                  ))}
                </ul>
                <p>Continue reading for detailed implementation strategies and expert recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-brand-gray-50 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                  More on {post.category}
                </h2>
                <p className="mt-4 text-lg leading-8 text-brand-gray-600">
                  Continue optimizing with these related guides.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost: BlogPost) => {
                  return (
                    <article key={relatedPost.id} className="group relative overflow-hidden rounded-xl bg-white border border-brand-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-sm mb-3">
                            <span className="inline-flex items-center rounded-full bg-brand-amber/10 text-brand-amber px-2.5 py-0.5 text-xs font-medium">
                              {relatedPost.category}
                            </span>
                            <div className="flex items-center gap-1 text-brand-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{relatedPost.readingTime.text}</span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-brand-amber transition-colors duration-200">
                            <Link href={relatedPost.url} className="stretched-link">
                              {relatedPost.title}
                            </Link>
                          </h3>
                          
                          <p className="text-sm leading-relaxed mb-4 text-brand-gray-600">
                            {relatedPost.description}
                          </p>
                          
                          <time 
                            dateTime={relatedPost.date} 
                            className="text-xs text-brand-gray-500"
                          >
                            {format(new Date(relatedPost.date), 'MMM d, yyyy')}
                          </time>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="bg-brand-navy py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Keep Getting Sharper
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Join thousands of men who get our weekly insights. 
                One actionable tip every Sunday.
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
      </article>
    </Layout>
  )
}
