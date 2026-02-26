
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, AlertCircle } from 'lucide-react'

export default async function SuperAdminBilling() {
  await requireSuperAdmin()
  
  // Get billing statistics
  const [
    totalRevenue,
    monthlyRevenue,
    recentInvoices,
    revenueByPlan,
    usageStats,
    overdueBills
  ] = await Promise.all([
    prisma.billingHistory.aggregate({
      where: { 
        type: { in: ['SUBSCRIPTION', 'USAGE_CHARGE'] },
        status: 'SUCCEEDED'
      },
      _sum: { amount: true }
    }),
    prisma.billingHistory.aggregate({
      where: {
        type: { in: ['SUBSCRIPTION', 'USAGE_CHARGE'] },
        status: 'SUCCEEDED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.invoice.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, currentPlan: true }
        }
      }
    }),
    prisma.user.groupBy({
      by: ['currentPlan'],
      _count: { id: true },
      where: { role: { not: 'SUPER_ADMIN' } }
    }),
    prisma.usageLog.groupBy({
      by: ['service', 'operation'],
      _sum: { cost: true, quantity: true },
      where: {
        billable: true,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.invoice.findMany({
      where: {
        status: 'OPEN',
        dueAt: { lt: new Date() }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
  ])
  
  const totalRevenueAmount = totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) / 100 : 0
  const monthlyRevenueAmount = monthlyRevenue._sum.amount ? Number(monthlyRevenue._sum.amount) / 100 : 0
  const totalUsageRevenue = usageStats.reduce((sum: number, stat: any) => sum + (Number(stat._sum.cost) || 0), 0) / 100

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing Management</h1>
          <p className="text-gray-600 mt-2">Monitor revenue, invoices, and billing analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Data</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUsageRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From API usage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueBills.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest billing transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.user.name || invoice.user.email}</p>
                      <p className="text-sm text-gray-500">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(invoice.billingPeriodStart).toLocaleDateString()} - {' '}
                        {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${Number(invoice.total).toFixed(2)}</p>
                      <Badge variant={
                        invoice.status === 'PAID' ? 'default' :
                        invoice.status === 'OPEN' ? 'secondary' :
                        invoice.status === 'VOID' ? 'destructive' : 'outline'
                      }>
                        {invoice.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {invoice.user.currentPlan}
                      </p>
                    </div>
                  </div>
                ))}
                {recentInvoices.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Users by pricing plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByPlan.map((plan: any) => (
                  <div key={plan.currentPlan} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <div>
                        <p className="font-medium">{plan.currentPlan}</p>
                        <p className="text-sm text-gray-500">Pricing plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{plan._count.id}</p>
                      <p className="text-sm text-gray-500">users</p>
                    </div>
                  </div>
                ))}
                {revenueByPlan.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No plan data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Revenue from API usage this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.map((stat: any) => (
                  <div key={`${stat.service}-${stat.operation}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{stat.service}</p>
                      <p className="text-sm text-gray-500">{stat.operation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(Number(stat._sum.cost) / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Number(stat._sum.quantity).toLocaleString()} uses
                      </p>
                    </div>
                  </div>
                ))}
                {usageStats.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No usage data for this month</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Bills</CardTitle>
              <CardDescription>Invoices requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueBills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{bill.user.name || bill.user.email}</p>
                      <p className="text-sm text-red-700">Invoice #{bill.invoiceNumber}</p>
                      <p className="text-xs text-red-600">
                        Due: {new Date(bill.dueAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-900">${Number(bill.total).toFixed(2)}</p>
                      <Button size="sm" className="mt-2">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
                {overdueBills.length === 0 && (
                  <p className="text-green-600 text-center py-8">No overdue bills! 🎉</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
