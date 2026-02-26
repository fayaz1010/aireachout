import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  FolderOpen,
  Users,
  Mail,
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Flame,
  MessageSquare,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  change: string
  positive?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="glass-card stat-card-hover p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            positive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-amber-500/10 text-amber-400'
          )}
        >
          {change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  gradient,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  gradient: string
}) {
  return (
    <Link href={href}>
      <div className="glass-card group p-4 cursor-pointer transition-all duration-200 hover:border-white/10 hover:-translate-y-0.5">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-3', gradient)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
          Get started
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

const campaignStatusStyles: Record<string, string> = {
  SENT: 'bg-emerald-500/10 text-emerald-400',
  SCHEDULED: 'bg-blue-500/10 text-blue-400',
  SENDING: 'bg-violet-500/10 text-violet-400',
  DRAFT: 'bg-white/5 text-aurora-text2',
  PAUSED: 'bg-amber-500/10 text-amber-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [projectsCount, leadsCount, campaignsCount, emailsSent, recentProjects] =
    await Promise.all([
      prisma.project.count({ where: { userId: session.user.id } }),
      prisma.lead.count({ where: { project: { userId: session.user.id } } }),
      prisma.campaign.count({ where: { userId: session.user.id } }),
      prisma.emailHistory.count({ where: { userId: session.user.id } }),
      prisma.project.findMany({
        where: { userId: session.user.id },
        take: 4,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { leads: true, campaigns: true } },
        },
      }),
    ])

  const recentCampaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    take: 4,
    orderBy: { updatedAt: 'desc' },
    include: { project: { select: { name: true } } },
  })

  const firstName = (session.user as any).firstName || session.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Good morning, {firstName}{' '}
            <span className="aurora-gradient-text">✦</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your outreach today.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={projectsCount}
          change="+2 this month"
          positive
          icon={FolderOpen}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          title="Total Leads"
          value={leadsCount}
          change="+12% this week"
          positive
          icon={Users}
          color="bg-rose-500/10 text-rose-400"
        />
        <StatCard
          title="Campaigns"
          value={campaignsCount}
          change="3 active"
          icon={Mail}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          title="Emails Sent"
          value={emailsSent}
          change="+45% vs last month"
          positive
          icon={TrendingUp}
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Quick actions + Hot leads */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-3">
          <QuickAction
            href="/leads/generate"
            icon={Target}
            label="Generate Leads"
            description="AI-powered prospect discovery with scoring"
            gradient="bg-gradient-to-br from-violet-600 to-violet-800"
          />
          <QuickAction
            href="/campaigns/new"
            icon={Zap}
            label="New Campaign"
            description="Multi-channel outreach with AI personalization"
            gradient="bg-gradient-to-br from-rose-600 to-rose-800"
          />
          <QuickAction
            href="/analytics"
            icon={BarChart3}
            label="Analytics"
            description="Performance insights and optimization tips"
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          />
          <QuickAction
            href="/inbox"
            icon={MessageSquare}
            label="Inbox"
            description="All conversations in one unified view"
            gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          />
          <QuickAction
            href="/calls"
            icon={Phone}
            label="Calls"
            description="Manage incoming and outbound voice calls"
            gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          />
          <QuickAction
            href="/marketing"
            icon={Sparkles}
            label="AI Marketing"
            description="Generate full marketing strategies with AI"
            gradient="bg-gradient-to-br from-purple-600 to-purple-800"
          />
        </div>

        {/* Hot leads */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-semibold text-foreground">Hot Leads</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 pulse-dot" />
            </div>
            <Link href="/leads" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-2.5 flex-1">
            {[
              { name: 'Sarah Johnson', company: 'TechCorp', action: 'Opened email', time: '2m ago', score: 92 },
              { name: 'Mike Chen', company: 'GrowthCo', action: 'Clicked link', time: '8m ago', score: 87 },
              { name: 'Lisa Wang', company: 'StartupXYZ', action: 'Replied', time: '23m ago', score: 95 },
              { name: 'Alex Rivera', company: 'SalesPro', action: 'Visited pricing', time: '45m ago', score: 78 },
            ].map((lead) => (
              <Link
                key={lead.name}
                href="/leads"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full aurora-gradient text-[10px] font-bold text-white">
                  {lead.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{lead.action} · {lead.time}</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 shrink-0">{lead.score}</span>
              </Link>
            ))}
          </div>
          <Link href="/leads/generate">
            <Button variant="outline" size="sm" className="w-full text-xs border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5">
              Generate more leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent projects + campaigns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Projects</h3>
              <p className="text-xs text-muted-foreground">Your latest marketing projects</p>
            </div>
            <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <FolderOpen className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {project._count.leads} leads · {project._count.campaigns} campaigns
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            ) : (
              <div className="py-8 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No projects yet</p>
                <Link href="/projects/new">
                  <Button variant="outline" size="sm" className="mt-3 text-xs border-white/10">
                    Create first project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Campaigns</h3>
              <p className="text-xs text-muted-foreground">Latest outreach campaigns</p>
            </div>
            <Link href="/campaigns" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{campaign.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full',
                        campaignStatusStyles[campaign.status] || campaignStatusStyles.DRAFT
                      )}
                    >
                      {campaign.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center">
                <Mail className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No campaigns yet</p>
                <Link href="/campaigns/new">
                  <Button variant="outline" size="sm" className="mt-3 text-xs border-white/10">
                    Create first campaign
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
