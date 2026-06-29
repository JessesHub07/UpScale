import { supabase } from '@/lib/supabase'
import { Lead, Message } from '@/lib/type'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import LeadControls from '@/components/LeadControls'
import DeleteLeadButton from '@/components/DeleteLeadButton'
import ConversationPanel from '@/components/ConversationPanel'
import { Phone, Mail, MapPin, Home, Zap, Wallet, Calendar, UserCheck, ArrowLeft } from 'lucide-react'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) notFound()

  const l = lead as Lead

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', l.chat_id)
    .order('created_at', { ascending: true })

  const transcript = (messages ?? []) as Message[]

  const scoreColor = l.score >= 70 ? '#22c55e' : l.score >= 40 ? '#f59e0b' : '#6b7280'
  const stageLabel = l.urgent ? 'URGENT' : l.stage.toUpperCase()
  const stageColor = l.urgent ? '#ef4444' : l.stage === 'hot' ? '#22c55e' : l.stage === 'warm' ? '#f59e0b' : '#6b7280'

  const scoreBreakdown = [
    { label: 'Need Clarity', value: l.property_type ? 25 : 0 },
    { label: 'Budget', value: l.budget ? 25 : 0 },
    { label: 'Timeline', value: l.timeline ? 25 : 0 },
    { label: 'Decision Maker', value: l.decision_maker ? 25 : 0 },
  ]

  return (
    <div className="min-h-screen bg-page text-text-primary">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm bg-input hover:bg-border rounded-lg px-2.5 py-1.5"
        >
          <ArrowLeft size={14} />
          Pipeline
        </Link>
        <span className="text-border">|</span>
        <h1 className="text-sm font-medium text-text-primary flex-1">{l.name ?? 'Unknown Lead'}</h1>
        <DeleteLeadButton leadId={l.id} leadName={l.name ?? ''} />
        <ThemeToggle />
      </header>

      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Lead Info */}
        <div className="flex flex-col gap-6">

          {/* Identity Card */}
          <div className="float-in bg-surface border border-border rounded-xl p-6" style={{ animationDelay: '0ms' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{l.name ?? '—'}</h2>
                <p className="text-text-secondary text-sm mt-1 capitalize">{l.source} · {new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{l.score}/100</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full border" style={{ color: stageColor, borderColor: stageColor }}>
                  {stageLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {l.phone && <InfoRow icon={Phone} label="Phone" value={l.phone} />}
              {l.email && <InfoRow icon={Mail} label="Email" value={l.email} />}
              {l.property_type && <InfoRow icon={Home} label="Property" value={l.property_type} />}
              {l.location && <InfoRow icon={MapPin} label="Location" value={l.location} />}
              {l.electricity_spend && <InfoRow icon={Zap} label="Electricity Spend" value={l.electricity_spend} />}
              {l.budget && <InfoRow icon={Wallet} label="Budget" value={l.budget} />}
              {l.timeline && <InfoRow icon={Calendar} label="Timeline" value={l.timeline} />}
              <InfoRow icon={UserCheck} label="Decision Maker" value={l.decision_maker === true ? 'Yes' : l.decision_maker === false ? 'No' : 'Unknown'} />
            </div>
          </div>

          {/* Stage + Notes */}
          <LeadControls leadId={l.id} chatId={l.chat_id} initialStage={l.stage} initialNotes={l.notes} />

          {/* Score Breakdown */}
          <div className="float-in bg-surface border border-border rounded-xl p-6" style={{ animationDelay: '80ms' }}>
            <h3 className="text-sm font-semibold text-text-primary mb-0.5">Score breakdown</h3>
            <p className="text-xs text-text-tertiary mb-4">How Helen scored this lead</p>
            <div className="flex flex-col gap-3">
              {scoreBreakdown.map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-medium" style={{ color: value > 0 ? '#22c55e' : '#6b7280' }}>{value}/25</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(value / 25) * 100}%`, backgroundColor: value > 0 ? '#22c55e' : '#374151' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {l.summary && (
            <div className="float-in bg-surface border border-border rounded-xl p-6" style={{ animationDelay: '160ms' }}>
              <h3 className="text-sm font-semibold text-text-primary mb-0.5">AI summary</h3>
              <p className="text-xs text-text-tertiary mb-3">Written by Helen</p>
              <p className="text-text-primary/80 text-sm leading-relaxed">{l.summary}</p>
            </div>
          )}
        </div>

        {/* RIGHT — Conversation Transcript */}
        <ConversationPanel lead={l} transcript={transcript} />

      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-text-tertiary mt-0.5 shrink-0" />
      <div>
        <p className="text-text-tertiary text-xs mb-0.5">{label}</p>
        <p className="text-text-primary font-medium capitalize text-sm">{value}</p>
      </div>
    </div>
  )
}
