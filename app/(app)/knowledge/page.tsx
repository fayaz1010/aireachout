'use client'

import { useState } from 'react'
import { BookOpen, Plus, Search, Eye, Edit2, Tag, Clock, ChevronRight, FileText, HelpCircle, Lightbulb, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const ARTICLES = [
  { id: '1', title: 'Getting Started with ReachOut AI', category: 'Getting Started', views: 1243, status: 'PUBLISHED', readTime: 5, updatedAt: '2 days ago', excerpt: 'Learn how to set up your account, create your first project, and launch your first outreach campaign.' },
  { id: '2', title: 'How to Generate AI-Powered Leads', category: 'Lead Generation', views: 876, status: 'PUBLISHED', readTime: 8, updatedAt: '1 week ago', excerpt: 'Use our AI lead generation engine to discover and qualify prospects matching your ideal customer profile.' },
  { id: '3', title: 'Setting Up Multi-Channel Campaigns', category: 'Campaigns', views: 654, status: 'PUBLISHED', readTime: 12, updatedAt: '1 week ago', excerpt: 'Learn how to create campaigns that reach your leads via email, SMS, voice calls, and social media simultaneously.' },
  { id: '4', title: 'Understanding Your Analytics Dashboard', category: 'Analytics', views: 432, status: 'PUBLISHED', readTime: 6, updatedAt: '2 weeks ago', excerpt: 'A deep dive into interpreting your outreach metrics and optimizing for better conversions.' },
  { id: '5', title: 'Configuring API Keys and Integrations', category: 'Settings', views: 321, status: 'DRAFT', readTime: 10, updatedAt: '3 days ago', excerpt: 'Step-by-step guide to connecting SendGrid, Twilio, Vapi, and other third-party services.' },
  { id: '6', title: 'Contact Center: Managing the Inbox', category: 'Contact Center', views: 287, status: 'PUBLISHED', readTime: 7, updatedAt: '1 week ago', excerpt: 'How to use the unified inbox to manage all inbound conversations from your leads and customers.' },
]

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Getting Started': HelpCircle,
  'Lead Generation': Lightbulb,
  Campaigns: FileText,
  Analytics: Eye,
  Settings: Settings,
  'Contact Center': BookOpen,
}

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))]

export default function KnowledgePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || a.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Help articles for your team and customers</p>
        </div>
        <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> New Article
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 max-w-lg">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              category === c
                ? 'aurora-gradient text-white shadow-aurora-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((article) => {
          const Icon = categoryIcons[article.category] || FileText
          return (
            <div key={article.id} className="glass-card stat-card-hover p-4 flex flex-col gap-3 cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{article.category}</span>
                </div>
                {article.status === 'DRAFT' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
                    Draft
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{article.excerpt}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min</span>
                </div>
                <span>{article.updatedAt}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
