'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Search, Filter, Download, RefreshCw, User, Mail, Phone, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'

interface ActivityLog {
  id: string
  userId: string
  userName: string | null
  userEmail: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  status: 'SUCCESS' | 'FAILED' | 'WARNING'
}

export default function SuperAdminActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('/api/super-admin/activity-logs')
      if (!response.ok) throw new Error('Failed to fetch activity logs')
      const data = await response.json()
      setActivities(data.activities || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.resource.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === 'all' || activity.action === actionFilter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    
    return matchesSearch && matchesAction && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="w-4 h-4" />
      case 'email_sent':
        return <Mail className="w-4 h-4" />
      case 'sms_sent':
        return <MessageSquare className="w-4 h-4" />
      case 'voice_call':
        return <Phone className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Activity Monitor</h1>
          <p className="text-gray-600">Track user activities and system events</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchActivityLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.status === 'SUCCESS').length}
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.status === 'FAILED').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => {
                const activityDate = new Date(a.timestamp)
                const today = new Date()
                return activityDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="email_sent">Email Sent</SelectItem>
                <SelectItem value="sms_sent">SMS Sent</SelectItem>
                <SelectItem value="voice_call">Voice Call</SelectItem>
                <SelectItem value="api_call">API Call</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredActivities.length})</CardTitle>
          <CardDescription>Real-time user and system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(activity.status)}
                    {getActionIcon(activity.action)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{activity.action.replace('_', ' ').toUpperCase()}</p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.userName || activity.userEmail} • {activity.resource}
                    </p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()} • IP: {activity.ipAddress}
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No activities found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
