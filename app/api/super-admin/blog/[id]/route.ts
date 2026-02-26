
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const postId = params.id

    // Calculate estimated read time if content is provided
    let readTime: number | undefined
    if (data.content) {
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      readTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    // Update the post
    const updatedData: any = {
      ...data,
      publishedAt: data.status === 'PUBLISHED' && !data.publishedAt ? new Date() : data.publishedAt,
    }

    if (readTime !== undefined) {
      updatedData.readTime = readTime
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updatedData,
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
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id

    await prisma.blogPost.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
