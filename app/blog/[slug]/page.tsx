
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, ArrowLeft, User, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED'
      },
      include: { 
        author: { 
          select: { 
            name: true, 
            firstName: true, 
            lastName: true, 
            image: true 
          } 
        } 
      }
    })

    if (post) {
      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return post
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.'
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || 'Read this insightful article about AI-powered outreach and lead generation.',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const authorName = post.author.name || 
    (post.author.firstName && post.author.lastName 
      ? `${post.author.firstName} ${post.author.lastName}` 
      : 'AI Reach Out Team')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="outline" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <Card className="border-0 shadow-xl mb-8">
          {post.featuredImage && (
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <CardContent className="p-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <img 
                    src={post.author.image} 
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <User className="w-4 h-4" />
                <span>{authorName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Coming Soon'}
                </span>
              </div>
              
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount} views</span>
              </div>
            </div>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-0 shadow-xl mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Outreach?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of businesses using AI to generate leads and automate their outreach campaigns.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Generate static params for published posts
export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true }
    })
    
    return posts.map((post) => ({
      slug: post.slug
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}
