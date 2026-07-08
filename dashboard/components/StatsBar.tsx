import { Lead } from '@/lib/type'

interface Props {
  leads: Lead[]
}

export default function StatsBar({ leads }: Props) {
  const total = leads.length
  const salesReady = leads.filter(l => l.urgent || l.stage === 'hot').length
  const highestScore = total === 0 ? 0 : Math.max(...leads.map(l => l.score || 0))
  const closedWon = leads.filter(l => l.stage === 'closed_won').length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = leads.filter(l => new Date(l.created_at) >= today).length

  const stats = [
    {
      label: 'Sales ready',
      value: salesReady,
      caption: salesReady > 0 ? 'Respond now' : 'None yet today',
      accent: salesReady > 0,
    },
    {
      label: 'New today',
      value: todayCount,
      caption: `${total} total leads`,
      accent: false,
    },
    {
      label: 'Highest score',
      value: highestScore,
      caption: 'out of 100',
      accent: false,
    },
    {
      label: 'Closed won',
      value: closedWon,
      caption: closedWon === 0 ? 'Keep qualifying' : `of ${total} leads`,
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div
          key={s.label}
          className="card-hover bg-surface border rounded-xl p-4"
          style={{ borderColor: s.accent ? 'rgba(34,197,94,0.35)' : 'var(--border-color)' }}
        >
          <p className="text-xs text-text-secondary mb-1.5">{s.label}</p>
          <p
            className="text-2xl font-semibold"
            style={{ color: s.accent ? '#22c55e' : 'var(--text-primary)' }}
          >
            {s.value}
          </p>
          <p
            className="text-[11px] mt-1 font-medium"
            style={{ color: s.accent ? '#22c55e' : 'var(--text-tertiary)' }}
          >
            {s.caption}
          </p>
        </div>
      ))}
    </div>
  )
}
