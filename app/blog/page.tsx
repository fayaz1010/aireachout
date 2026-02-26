
import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, ArrowRight, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { name: true, firstName: true, lastName: true } } },
      orderBy: { publishedAt: 'desc' }
    })
    return posts
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

function BlogPostSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </CardHeader>
    </Card>
  )
}

async function BlogPostsList() {
  const posts = await getBlogPosts()

  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No blog posts yet</h2>
        <p className="text-gray-600">Check back soon for our latest insights and updates.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const authorName = post.author.name || 
          (post.author.firstName && post.author.lastName 
            ? `${post.author.firstName} ${post.author.lastName}` 
            : 'AI Outreach Team')
        
        return (
          <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full flex flex-col">
            {post.featuredImage && (
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <CardHeader className="flex-grow">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <User className="w-4 h-4" />
                <span>{authorName}</span>
                <span>•</span>
                <CalendarDays className="w-4 h-4" />
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Coming Soon'}</span>
                {post.readTime && (
                  <>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} min read</span>
                  </>
                )}
              </div>
              
              {post.category && (
                <Badge variant="secondary" className="w-fit mb-3">
                  {post.category}
                </Badge>
              )}
              
              <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </CardTitle>
              
              {post.excerpt && (
                <CardContent className="text-gray-600 mb-4 p-0">
                  {post.excerpt}
                </CardContent>
              )}
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            
            <div className="px-6 pb-6 mt-auto">
              <Link 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold group-hover:translate-x-1 transition-all"
              >
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI Outreach Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends, strategies, and insights in AI-powered outreach and lead generation.
          </p>
        </div>

        <Suspense fallback={
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <BlogPostSkeleton key={i} />
            ))}
          </div>
        }>
          <BlogPostsList />
        </Suspense>
      </div>
    </div>
  )
}
