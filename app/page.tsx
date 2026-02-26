import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  MessageSquare,
  Phone,
  Mail,
  BarChart3,
  Shield,
  Bot,
  CheckCircle2,
  Star,
  Flame,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--aurora-bg)', color: 'var(--aurora-text-1)' }}
    >
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Gradient orbs */}
      <div
        className="fixed top-0 left-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }}
      />
      <div
        className="fixed bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #DB2777, transparent 70%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg aurora-gradient shadow-aurora-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">ReachOut AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-aurora-text2 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm">
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-aurora-text2 mb-8 backdrop-blur-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
          Now with Unified Contact Center — in one platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          <span className="text-white">Find leads.</span>
          <br />
          <span className="aurora-gradient-text">Close deals.</span>
          <br />
          <span className="text-white">Delight customers.</span>
        </h1>

        <p className="text-lg md:text-xl text-aurora-text2 max-w-2xl mx-auto leading-relaxed mb-10">
          The only platform that combines AI-powered outreach with a full-featured contact center.
          Find prospects, launch multi-channel campaigns, and manage every conversation — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup">
            <Button
              size="lg"
              className="aurora-gradient text-white hover:opacity-90 shadow-aurora-md gap-2 px-8 h-12 text-base font-semibold"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 text-aurora-text1 hover:bg-white/5 hover:border-white/20 h-12 px-8 text-base"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-aurora-text3">
          14-day free trial · No credit card required · Cancel anytime
        </p>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-20">
        <div className="glass-card-bright rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Leads Generated', value: '2.4M+' },
            { label: 'Emails Sent', value: '18M+' },
            { label: 'Conversations', value: '890K+' },
            { label: 'Avg. Response Rate', value: '47%' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold aurora-gradient-text">{s.value}</p>
              <p className="text-xs text-aurora-text2 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to grow
          </h2>
          <p className="text-aurora-text2 max-w-xl mx-auto">
            From finding your first lead to supporting your thousandth customer — in one seamless platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Bot,
              title: 'AI Lead Generation',
              desc: 'Find ideal prospects using AI-powered search, scraping, and scoring. Import CSVs or let our AI build your list.',
              color: 'text-violet-400 bg-violet-500/10',
            },
            {
              icon: Zap,
              title: 'Multi-Channel Campaigns',
              desc: 'Reach leads via email, SMS, voice calls, LinkedIn, Instagram, and more — with AI-personalized content.',
              color: 'text-rose-400 bg-rose-500/10',
            },
            {
              icon: MessageSquare,
              title: 'Unified Inbox',
              desc: 'All your conversations in one place. Email replies, WhatsApp messages, SMS threads — managed as one.',
              color: 'text-blue-400 bg-blue-500/10',
            },
            {
              icon: Phone,
              title: 'AI Voice Calls',
              desc: 'Make outbound AI or human calls at scale. Record, transcribe, and analyze every conversation automatically.',
              color: 'text-amber-400 bg-amber-500/10',
            },
            {
              icon: Flame,
              title: 'Hot Lead Alerts',
              desc: 'Get real-time alerts when a lead opens your email or clicks your link. Never miss a buying signal again.',
              color: 'text-red-400 bg-red-500/10',
            },
            {
              icon: BarChart3,
              title: 'Unified Analytics',
              desc: 'Track outreach performance and contact center metrics in one dashboard. Understand what drives conversions.',
              color: 'text-emerald-400 bg-emerald-500/10',
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="glass-card stat-card-hover p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${f.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-aurora-text2 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works — the hand-off engine */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          From cold outreach to loyal customer —{' '}
          <span className="aurora-gradient-text">automatically</span>
        </h2>
        <p className="text-aurora-text2 mb-12 max-w-xl mx-auto">
          Our hand-off engine connects your outreach platform with the contact center. When a lead responds, the conversation is already waiting.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-0 justify-center">
          {[
            { label: 'Generate Lead', sub: 'AI finds prospects', icon: Users },
            { label: 'Send Campaign', sub: 'Multi-channel outreach', icon: Mail },
            { label: 'Lead Engages', sub: 'Hot lead alert fires', icon: Flame },
            { label: 'Conversation Opens', sub: 'In the unified inbox', icon: MessageSquare },
            { label: 'Deal Closed', sub: 'Customer converted', icon: CheckCircle2 },
          ].map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl aurora-gradient shadow-aurora-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white">{step.label}</p>
                  <p className="text-[10px] text-aurora-text3">{step.sub}</p>
                </div>
                {i < 4 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-3 shrink-0 hidden sm:block" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Simple, usage-based pricing</h2>
          <p className="text-aurora-text2">Start free. Scale as you grow. No surprise bills.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              name: 'Starter',
              price: '$49',
              desc: 'For solo founders and small teams',
              features: ['1,000 leads/mo', '10,000 emails/mo', '500 SMS/mo', 'Unified inbox', 'Basic analytics'],
              cta: 'Start Free Trial',
            },
            {
              name: 'Professional',
              price: '$149',
              desc: 'For growing sales teams',
              features: ['10,000 leads/mo', '100,000 emails/mo', '5,000 SMS/mo', 'Voice calls (AI)', 'Contact center', 'Priority support'],
              cta: 'Most Popular',
              featured: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              desc: 'For large organizations',
              features: ['Unlimited leads', 'Unlimited emails', 'Unlimited SMS', 'Dedicated infrastructure', 'Custom integrations', 'SLA guarantee'],
              cta: 'Contact Sales',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-5 ${plan.featured ? 'border-violet-500/30 shadow-aurora-md relative' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 aurora-gradient text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-aurora-sm">
                  Most Popular
                </div>
              )}
              <p className="text-xs text-aurora-text2 mb-1">{plan.name}</p>
              <p className="text-3xl font-bold text-white mb-1">
                {plan.price}
                {plan.price !== 'Custom' && <span className="text-sm font-normal text-aurora-text2">/mo</span>}
              </p>
              <p className="text-xs text-aurora-text3 mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-aurora-text2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  size="sm"
                  className={`w-full text-xs ${plan.featured ? 'aurora-gradient text-white hover:opacity-90 shadow-aurora-sm' : 'border-white/10 bg-white/5 hover:bg-white/10 text-aurora-text1'}`}
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mb-24 text-center">
        <div className="glass-card-bright rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 aurora-gradient-subtle" />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl aurora-gradient shadow-aurora-md mx-auto mb-5">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to grow smarter?</h2>
            <p className="text-aurora-text2 mb-8 max-w-lg mx-auto">
              Join forward-thinking sales and marketing teams who use ReachOut AI to find leads, launch campaigns, and support customers — all in one platform.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="aurora-gradient text-white hover:opacity-90 shadow-aurora-md gap-2 px-8 h-12 font-semibold"
              >
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded aurora-gradient">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">ReachOut AI</span>
          </div>
          <p className="text-xs text-aurora-text3">
            © {new Date().getFullYear()} ReachOut AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-aurora-text3">
            <Link href="#" className="hover:text-aurora-text1 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-aurora-text1 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-aurora-text1 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
