'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FolderOpen,
  Plus,
  Users,
  Mail,
  Globe,
  Tag,
  ArrowRight,
  Search,
  MoreHorizontal,
  Building2,
  Layers,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  status: string
  keywords: string[]
  _count: { leads: number; campaigns: number }
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ARCHIVED: 'bg-white/5 text-muted-foreground border-white/10',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : data.projects || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = projects.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.industry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize your leads and campaigns by project
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 max-w-sm">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="h-4 w-32 rounded shimmer" />
              <div className="h-3 w-48 rounded shimmer" />
              <div className="h-8 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="glass-card stat-card-hover p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <FolderOpen className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    {project.industry && (
                      <p className="text-xs text-muted-foreground">{project.industry}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', statusColors[project.status] || statusColors.ACTIVE)}>
                    {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
                  </span>
                  <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/5">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}

              {project.keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.keywords.slice(0, 3).map((kw) => (
                    <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                      {kw}
                    </span>
                  ))}
                  {project.keywords.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{project.keywords.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3.5 w-3.5 text-rose-400" />
                  <span className="font-semibold text-foreground">{project._count.leads}</span>
                  <span className="text-muted-foreground">leads</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-semibold text-foreground">{project._count.campaigns}</span>
                  <span className="text-muted-foreground">campaigns</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link href={`/leads/generate?project=${project.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 gap-1">
                    <Users className="h-3 w-3" /> Add Leads
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" className="text-xs aurora-gradient text-white hover:opacity-90 gap-1">
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl aurora-gradient-subtle mx-auto mb-4">
            <Layers className="h-7 w-7 text-violet-400" />
          </div>
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create a project to start organizing your leads and campaigns
          </p>
          <Link href="/projects/new">
            <Button size="sm" className="aurora-gradient text-white gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
