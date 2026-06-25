import { Lead } from '@/lib/type'

interface Props {
  leads: Lead[]
}

export default function StatsBar({ leads }: Props) {
  const total = leads.length
  const avgScore = total === 0 ? 0 : Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / total)
  const closedWon = leads.filter(l => l.stage === 'closed_won').length
  const handedOff = leads.filter(l => l.stage === 'handed_off' || l.stage === 'closed_won' || l.stage === 'closed_lost').length
  const conversionRate = total === 0 ? 0 : Math.round((closedWon / total) * 100)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = leads.filter(l => new Date(l.created_at) >= today).length

  const stats = [
    { label: 'Total leads', value: total, caption: `${todayCount} today` },
    { label: 'Conversion rate', value: `${conversionRate}%`, caption: `${closedWon} closed won` },
    { label: 'Avg. lead score', value: avgScore, caption: 'out of 100' },
    { label: 'Handed off', value: handedOff, caption: 'to sales team' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className="card-hover bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary mb-1.5">{s.label}</p>
          <p className="text-2xl font-semibold text-text-primary">{s.value}</p>
          <p className="text-[11px] text-text-tertiary mt-1">{s.caption}</p>
        </div>
      ))}
    </div>
  )
}
