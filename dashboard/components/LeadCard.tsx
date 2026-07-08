'use client'

import { Lead } from '@/lib/type'
import { STAGE_LABELS, STAGE_COLORS, Stage } from '@/lib/stages'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

interface Props {
  lead: Lead
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6b7280'
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color, backgroundColor: `${color}22` }}>
      {score}/100
    </span>
  )
}

function StageBadge({ stage }: { stage: string }) {
  if (stage === 'urgent') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30">
        Urgent
      </span>
    )
  }
  const color = STAGE_COLORS[stage as Stage] || STAGE_COLORS.new
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}50`, backgroundColor: `${color}22` }}
    >
      {STAGE_LABELS[stage as Stage] || stage}
    </span>
  )
}

function QualificationProgress({ lead }: { lead: Lead }) {
  const fields = [
    { label: 'Property type', done: !!lead.property_type },
    { label: 'Budget', done: !!lead.budget },
    { label: 'Timeline', done: !!lead.timeline },
    { label: 'Decision maker', done: lead.decision_maker !== null },
  ]
  return (
    <div className="mt-2 mb-1">
      <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Qualifying</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {fields.map(f => (
          <div key={f.label} className="flex items-center gap-1.5">
            <span style={{ color: f.done ? '#22c55e' : 'var(--text-tertiary)', fontSize: 11 }}>
              {f.done ? '✓' : '○'}
            </span>
            <span className="text-[11px]" style={{ color: f.done ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NextAction({ lead }: { lead: Lead }) {
  const stage = lead.urgent ? 'urgent' : lead.stage
  const map: Record<string, { text: string; color: string }> = {
    urgent: { text: 'Needs human — respond immediately', color: '#ef4444' },
    hot:    { text: 'Call or message today', color: '#22c55e' },
    warm:   { text: 'Schedule a follow-up', color: '#f59e0b' },
    cold:   { text: 'Add to nurture sequence', color: '#6b7280' },
    nurture:{ text: 'Continue nurturing', color: '#6b7280' },
    new:    { text: lead.score === 0 ? 'AI qualifying...' : 'Awaiting more signals', color: '#94a3b8' },
    handed_off: { text: 'Handed to sales team', color: '#22c55e' },
    closed_won: { text: 'Deal closed', color: '#22c55e' },
    closed_lost:{ text: 'Closed — not converted', color: '#6b7280' },
  }
  const action = map[stage] ?? { text: 'Review lead', color: '#94a3b8' }
  return (
    <p className="text-[11px] font-medium mt-2" style={{ color: action.color }}>
      → {action.text}
    </p>
  )
}

export default function LeadCard({ lead }: Props) {
  const router = useRouter()
  const isNew = lead.stage === 'new' && lead.score === 0
  const isHot = lead.score >= 70 || lead.urgent

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('text/plain', lead.id)}
      onClick={() => router.push(`/leads/${lead.id}`)}
      className="card-hover bg-input border border-border rounded-xl p-4 cursor-pointer active:cursor-grabbing hover:border-text-primary/25 hover:bg-surface"
      style={isHot ? { borderColor: 'rgba(34,197,94,0.25)' } : undefined}
    >
      {/* Name and score */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {lead.name || 'Unknown'}
        </h3>
        <ScoreBadge score={lead.score || 0} />
      </div>

      {/* Stage */}
      <div className="mb-2">
        <StageBadge stage={lead.urgent ? 'urgent' : lead.stage} />
      </div>

      {/* New lead: show qualification progress */}
      {isNew ? (
        <QualificationProgress lead={lead} />
      ) : (
        <div className="space-y-1 mt-1">
          {lead.property_type && (
            <p className="text-xs text-text-secondary">
              <span className="text-text-primary/50">Type</span> · {lead.property_type}
            </p>
          )}
          {lead.location && (
            <p className="text-xs text-text-secondary">
              <span className="text-text-primary/50">Location</span> · {lead.location}
            </p>
          )}
          {lead.budget && (
            <p className="text-xs text-text-secondary">
              <span className="text-text-primary/50">Budget</span> · {lead.budget}
            </p>
          )}
          {lead.timeline && (
            <p className="text-xs text-text-secondary">
              <span className="text-text-primary/50">Timeline</span> · {lead.timeline}
            </p>
          )}
        </div>
      )}

      {/* Next action */}
      <NextAction lead={lead} />

      {/* Source and time */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="flex items-center gap-1 text-xs text-text-secondary capitalize">
          <Send size={11} />
          {lead.source || 'telegram'}
        </span>
        <span className="text-xs text-text-secondary">
          {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  )
}
