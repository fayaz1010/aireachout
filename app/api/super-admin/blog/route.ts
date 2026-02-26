
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ALL'
    
    const whereClause = status === 'ALL' ? {} : { status: status as any }

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Find the user by session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists and make it unique
    let slug = baseSlug
    let counter = 1
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Calculate estimated read time (average 200 words per minute)
    const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status || 'DRAFT',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        category: data.category || null,
        tags: data.tags || [],
        readTime,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
