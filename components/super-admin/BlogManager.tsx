'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, Calendar, User, ExternalLink } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  metaTitle?: string
  metaDescription?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  category?: string
  tags: string[]
  viewCount: number
  readTime?: number
  createdAt: string
  updatedAt: string
  author: {
    name?: string
    firstName?: string
    lastName?: string
    email: string
  }
}

interface BlogFormData {
  title: string
  excerpt: string
  content: string
  featuredImage: string
  metaTitle: string
  metaDescription: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  category: string
  tags: string
}

const initialFormData: BlogFormData = {
  title: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  metaTitle: '',
  metaDescription: '',
  status: 'DRAFT',
  category: '',
  tags: ''
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/super-admin/blog?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        toast.error('Failed to fetch blog posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Error fetching blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      featuredImage: post.featuredImage || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      status: post.status,
      category: post.category || '',
      tags: post.tags.join(', ')
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const url = editingPost 
        ? `/api/super-admin/blog/${editingPost.id}` 
        : '/api/super-admin/blog'
      
      const method = editingPost ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast.success(editingPost ? 'Blog post updated!' : 'Blog post created!')
        setIsDialogOpen(false)
        fetchPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save blog post')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('Error saving blog post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/super-admin/blog/${post.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Blog post deleted!')
        fetchPosts()
      } else {
        toast.error('Failed to delete blog post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Error deleting blog post')
    }
  }

  const getAuthorName = (author: BlogPost['author']) => {
    return author.name || 
      (author.firstName && author.lastName 
        ? `${author.firstName} ${author.lastName}` 
        : author.email)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading blog posts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Blog Management</CardTitle>
              <p className="text-gray-600 mt-2">Create and manage blog posts</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreatePost} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Brief description of the post..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your blog post content here. You can use HTML tags for formatting."
                        rows={12}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="featuredImage">Featured Image URL</Label>
                      <Input
                        id="featuredImage"
                        type="url"
                        value={formData.featuredImage}
                        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                        placeholder="https://i.ytimg.com/vi/BnVK7jecJ0o/hqdefault.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., AI, Marketing, Lead Generation"
                        />
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="AI, Marketing, Lead Generation (comma-separated)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                        <Input
                          id="metaTitle"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          placeholder="Custom title for search engines"
                        />
                      </div>

                      <div>
                        <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                        <Textarea
                          id="metaDescription"
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          placeholder="Brief description for search engines"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Posts</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Drafts</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600">Create your first blog post to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getAuthorName(post.author)}
                          </div>
                          
                          {post.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewCount} views
                          </div>
                          
                          {post.category && (
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {post.status === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
