'use client'

import { useRouter } from 'next/navigation'
import { Lead } from '@/lib/type'
import { STAGE_LABELS, STAGE_COLORS, Stage } from '@/lib/stages'

interface Props {
  leads: Lead[]
}

export default function LeadTable({ leads }: Props) {
  const router = useRouter()

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-3 font-semibold">Name</th>
            <th className="text-left px-4 py-3 font-semibold">Score</th>
            <th className="text-left px-4 py-3 font-semibold">Stage</th>
            <th className="text-left px-4 py-3 font-semibold">Property</th>
            <th className="text-left px-4 py-3 font-semibold">Location</th>
            <th className="text-left px-4 py-3 font-semibold">Budget</th>
            <th className="text-left px-4 py-3 font-semibold">Timeline</th>
            <th className="text-left px-4 py-3 font-semibold">Source</th>
            <th className="text-left px-4 py-3 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-10 text-text-tertiary text-xs">No leads yet</td>
            </tr>
          ) : (
            leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover transition-colors"
              >
                <td className="px-4 py-3 font-medium text-text-primary">{lead.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.score ?? 0}/100</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={{
                      color: lead.urgent ? '#ef4444' : STAGE_COLORS[lead.stage as Stage] || '#6b7280',
                      borderColor: lead.urgent ? '#ef4444' : STAGE_COLORS[lead.stage as Stage] || '#6b7280',
                    }}
                  >
                    {lead.urgent ? 'Urgent' : STAGE_LABELS[lead.stage as Stage] || lead.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary capitalize">{lead.property_type || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.location || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.budget || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.timeline || '—'}</td>
                <td className="px-4 py-3 text-text-secondary capitalize">{lead.source || 'telegram'}</td>
                <td className="px-4 py-3 text-text-secondary">{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
