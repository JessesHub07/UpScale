import { Shield, Mail, MessageSquare, Bell, Receipt, History } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { supabase } from '@/lib/supabase'

const MONTHLY_QUOTA = 2000

export const dynamic = 'force-dynamic'

const ACTIVITY_LOG = [
  { action: 'Updated closing script for budget objections', date: 'Jun 24' },
  { action: 'Added site survey booking link to handoff flow', date: 'Jun 23' },
  { action: 'Tuned lead scoring weights for decision-maker signal', date: 'Jun 21' },
]

export default async function SettingsPage() {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
  const leadsThisMonth = count ?? 0
  const usagePct = Math.min(Math.round((leadsThisMonth / MONTHLY_QUOTA) * 100), 100)

  return (
    <div className="min-h-screen bg-page p-8">
      <h1 className="text-xl font-semibold text-text-primary mb-1">Settings</h1>
      <p className="text-sm text-text-secondary mb-6">Your dashboard is configured and managed by Axliq.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Business profile</h3>
          <p className="text-xs text-text-tertiary mb-4">The information your AI agent uses when speaking to leads.</p>
          <div className="flex flex-col divide-y divide-border">
            <ProfileRow label="Business name" value="Atmax Green Planet" />
            <ProfileRow label="Industry" value="Solar Energy" />
            <ProfileRow label="AI agent name" value="Helen" />
            <ProfileRow label="Primary contact" value="ops@atmaxgreen.com" />
          </div>
        </div>

        {/* Notifications */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-0.5">
            <Bell size={14} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          </div>
          <p className="text-xs text-text-tertiary mb-4">Where new and urgent leads get sent.</p>
          <div className="flex flex-col divide-y divide-border">
            <ProfileRow label="Urgent leads" value="Email + Telegram" />
            <ProfileRow label="New hot leads" value="Email" />
            <ProfileRow label="Daily digest" value="6:00 PM" />
          </div>
        </div>

        {/* Channels */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Channels</h3>
          <p className="text-xs text-text-tertiary mb-4">Where Helen is currently listening for new leads.</p>
          <div className="flex flex-col divide-y divide-border">
            <ChannelRow label="Telegram Bot" status="connected" />
            <ChannelRow label="WhatsApp Business" status="coming_soon" />
          </div>
        </div>

        {/* Billing & Plan */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-0.5">
            <Receipt size={14} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">Billing &amp; plan</h3>
          </div>
          <p className="text-xs text-text-tertiary mb-4">Current plan and usage this month.</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Growth plan</span>
            <span className="text-sm font-medium text-text-primary">{leadsThisMonth} / {MONTHLY_QUOTA} leads</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#6366f1] rounded-full transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          <p className="text-xs text-text-tertiary">Renews on the 1st of each month.</p>
        </div>

        {/* Theme */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Theme</h3>
          <p className="text-xs text-text-tertiary mb-4">Light or dark — your choice is remembered.</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-primary">Appearance</p>
            <ThemeToggle />
          </div>
        </div>

        {/* Activity Log */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-0.5">
            <History size={14} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">Activity log</h3>
          </div>
          <p className="text-xs text-text-tertiary mb-4">Recent changes Axliq has made on your behalf.</p>
          <div className="flex flex-col divide-y divide-border">
            {ACTIVITY_LOG.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                <span className="text-sm text-text-secondary">{item.action}</span>
                <span className="text-xs text-text-tertiary shrink-0">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Managed by Axliq */}
        <div className="bg-surface-strong rounded-xl p-6 lg:col-span-2">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Shield size={15} className="text-white/80" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Managed by Axliq</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Configuration of Helen's knowledge base, qualification scripts, scoring rules, and routing is handled by
                Axliq on your behalf. Reach out anytime to request changes — turnaround is usually one business day.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="mailto:support@axliq.com"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
            >
              <Mail size={13} /> Email support
            </a>
            <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors">
              <MessageSquare size={13} /> Open ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}

function ChannelRow({ label, status }: { label: string; status: 'connected' | 'coming_soon' }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-primary font-medium">{label}</span>
      <span className="flex items-center gap-1.5 text-xs text-text-secondary">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: status === 'connected' ? '#22c55e' : 'var(--text-tertiary)' }}
        />
        {status === 'connected' ? 'Connected' : 'Coming soon'}
      </span>
    </div>
  )
}
