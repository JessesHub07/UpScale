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

export default function LeadCard({ lead }: Props) {
  const router = useRouter()

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('text/plain', lead.id)}
      onClick={() => router.push(`/leads/${lead.id}`)}
      className="card-hover bg-input border border-border rounded-xl p-4 cursor-pointer active:cursor-grabbing hover:border-text-primary/25 hover:bg-surface"
    >
      {/* Name and score */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {lead.name || 'Unknown'}
        </h3>
        <ScoreBadge score={lead.score || 0} />
      </div>

      {/* Stage */}
      <div className="mb-3">
        <StageBadge stage={lead.urgent ? 'urgent' : lead.stage} />
      </div>

      {/* Details */}
      <div className="space-y-1">
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

      {/* Source and time */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="flex items-center gap-1 text-xs text-text-secondary capitalize">
          <Send size={11} />
          {lead.source || 'telegram'}
        </span>
        <span className="text-xs text-text-secondary">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}