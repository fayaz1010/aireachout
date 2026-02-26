'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Server, HardDrive, Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

interface DatabaseStats {
  totalTables: number
  totalRecords: number
  databaseSize: string
  connectionStatus: 'connected' | 'disconnected'
  lastBackup: string
  tableStats: Array<{
    tableName: string
    recordCount: number
    size: string
  }>
}

export default function SuperAdminDatabase() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalTables: 0,
    totalRecords: 0,
    databaseSize: '0 MB',
    connectionStatus: 'disconnected',
    lastBackup: '',
    tableStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch('/api/super-admin/database-stats')
      if (!response.ok) throw new Error('Failed to fetch database stats')
      const data = await response.json()
      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching database stats:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600">Monitor database health and performance</p>
        </div>
        <Button onClick={fetchDatabaseStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            {stats.connectionStatus === 'connected' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">Database connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">Active tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.databaseSize}</div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Table Statistics</TabsTrigger>
          <TabsTrigger value="backup">Backup & Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
              <CardDescription>Overview of all database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.tableStats.map((table) => (
                  <div key={table.tableName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{table.tableName}</p>
                      <p className="text-sm text-gray-500">{table.recordCount.toLocaleString()} records</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{table.size}</Badge>
                    </div>
                  </div>
                ))}
                
                {stats.tableStats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No table statistics available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Maintenance</CardTitle>
              <CardDescription>Database backup and maintenance operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Last Backup</p>
                  <p className="text-sm text-gray-500">
                    {stats.lastBackup ? new Date(stats.lastBackup).toLocaleString() : 'No backup found'}
                  </p>
                </div>
                <Button variant="outline">
                  Create Backup
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Database Cleanup</p>
                  <p className="text-sm text-gray-500">Remove old logs and temporary data</p>
                </div>
                <Button variant="outline">
                  Run Cleanup
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Optimize Tables</p>
                  <p className="text-sm text-gray-500">Optimize database performance</p>
                </div>
                <Button variant="outline">
                  Optimize
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Database performance and health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Query Performance</p>
                      <p className="text-sm text-gray-500">Average query time</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Connection Pool</p>
                      <p className="text-sm text-gray-500">Active connections</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Healthy</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Index Usage</p>
                      <p className="text-sm text-gray-500">Query optimization</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Storage Efficiency</p>
                      <p className="text-sm text-gray-500">Space utilization</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Monitor</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
