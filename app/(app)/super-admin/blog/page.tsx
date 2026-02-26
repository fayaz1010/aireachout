'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlogManager from '@/components/super-admin/BlogManager'
import { FileText, Eye, Edit, Trash2, Plus, TrendingUp } from 'lucide-react'

export default function SuperAdminBlog() {
  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    monthlyViews: 0,
    topPosts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogStats()
  }, [])

  const fetchBlogStats = async () => {
    try {
      const response = await fetch('/api/super-admin/blog-stats')
      if (!response.ok) throw new Error('Failed to fetch blog stats')
      const data = await response.json()
      setBlogStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching blog stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage blog posts and content</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">All blog posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">Live posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.draftPosts}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <BlogManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monthly Performance</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">This Month Views</p>
                      <p className="text-sm text-gray-500">{blogStats.monthlyViews.toLocaleString()} views</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+12%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Average Read Time</p>
                      <p className="text-sm text-gray-500">3.5 minutes</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Top Performing Posts</h3>
                  {blogStats.topPosts.length > 0 ? (
                    blogStats.topPosts.map((post: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">{post.views} views</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No blog posts available for analytics.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
              <CardDescription>Configure blog preferences and SEO settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-publish</p>
                  <p className="text-sm text-gray-500">Automatically publish scheduled posts</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SEO Settings</p>
                  <p className="text-sm text-gray-500">Default meta tags and descriptions</p>
                </div>
                <Button variant="outline">Edit</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Comment Moderation</p>
                  <p className="text-sm text-gray-500">Manage blog comments and feedback</p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
