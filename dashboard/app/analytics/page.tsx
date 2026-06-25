import { supabase } from '@/lib/supabase'
import { Lead, Message } from '@/lib/type'
import { STAGE_LABELS, STAGE_COLORS, STAGES } from '@/lib/stages'

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: '#22c55e',
  telegram: '#3b82f6',
}

export default async function AnalyticsPage() {
  const { data: leadsData } = await supabase.from('leads').select('*')
  const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: true })

  const leads = (leadsData ?? []) as Lead[]
  const messages = (messagesData ?? []) as Message[]

  const total = leads.length
  const avgScore = total === 0 ? 0 : Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / total)
  const closedWon = leads.filter(l => l.stage === 'closed_won').length
  const closedLost = leads.filter(l => l.stage === 'closed_lost').length
  const conversionRate = total === 0 ? 0 : Math.round((closedWon / total) * 100)
  const handedOffCount = leads.filter(l => l.handed_off).length

  const stageCounts = STAGES.map(s => ({
    stage: s,
    count: leads.filter(l => l.stage === s).length,
  }))

  const sourceCounts: Record<string, number> = {}
  leads.forEach(l => {
    const src = l.source || 'telegram'
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  })

  // average response time: assistant reply after a user message, per chat
  const byChat: Record<string, Message[]> = {}
  messages.forEach(m => {
    if (!byChat[m.chat_id]) byChat[m.chat_id] = []
    byChat[m.chat_id].push(m)
  })

  const responseTimes: number[] = []
  Object.values(byChat).forEach(thread => {
    for (let i = 0; i < thread.length - 1; i++) {
      if (thread[i].role === 'user' && thread[i + 1].role === 'assistant') {
        const diff = new Date(thread[i + 1].created_at).getTime() - new Date(thread[i].created_at).getTime()
        if (diff >= 0 && diff < 5 * 60 * 1000) responseTimes.push(diff)
      }
    }
  })
  const avgResponseMs = responseTimes.length === 0 ? 0 : responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const avgResponseSec = Math.round(avgResponseMs / 1000)

  const maxStageCount = Math.max(...stageCounts.map(s => s.count), 1)

  // weekly lead volume — last 12 weeks
  const now = new Date()
  const weeks: { label: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = leads.filter(l => {
      const d = new Date(l.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    weeks.push({ label: `W${12 - i}`, count })
  }
  const maxWeekCount = Math.max(...weeks.map(w => w.count), 1)

  const totalSourced = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="min-h-screen bg-page p-8">
      <h1 className="text-xl font-semibold text-text-primary mb-1">Analytics</h1>
      <p className="text-sm text-text-secondary mb-6">How your AI agent has been performing over the last 30 days.</p>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total leads" value={total} />
        <StatCard label="Conversion rate" value={`${conversionRate}%`} />
        <StatCard label="Avg. lead score" value={avgScore} />
        <StatCard label="Avg. AI response" value={avgResponseSec > 0 ? `${avgResponseSec}s` : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Leads over time */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Leads over time</h3>
          <p className="text-xs text-text-tertiary mb-5">Last 12 weeks</p>
          <div className="flex items-end gap-2 h-32">
            {weeks.map(w => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-text-primary/15 rounded-sm transition-all"
                  style={{ height: `${Math.max((w.count / maxWeekCount) * 100, w.count > 0 ? 6 : 2)}%` }}
                />
                <span className="text-[10px] text-text-tertiary">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead sources */}
        <div className="card-hover bg-surface border border-border rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Lead sources</h3>
          <p className="text-xs text-text-tertiary mb-5">Where your leads come from</p>
          <div className="flex flex-col gap-4 flex-1">
            {Object.entries(sourceCounts).map(([source, count]) => {
              const pct = Math.round((count / totalSourced) * 100)
              const color = SOURCE_COLORS[source] || '#6b7280'
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-primary font-medium capitalize">{source}</span>
                    <span className="text-text-secondary">{count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(sourceCounts).length === 0 && (
              <p className="text-xs text-text-tertiary">No data yet</p>
            )}
          </div>
          <div className="border-t border-border mt-4 pt-4">
            <p className="text-xs text-text-secondary">Handed to sales</p>
            <p className="text-2xl font-semibold text-text-primary mt-0.5">
              {handedOffCount} <span className="text-sm font-normal text-text-tertiary">of {total} total leads</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stage distribution */}
      <div className="card-hover bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-0.5">Stage distribution</h3>
        <p className="text-xs text-text-tertiary mb-4">Where your leads currently sit in the funnel.</p>
        <div className="flex flex-col gap-3">
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-24 shrink-0">{STAGE_LABELS[stage]}</span>
              <div className="h-2 bg-border rounded-full overflow-hidden flex-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(count / maxStageCount) * 100}%`, backgroundColor: STAGE_COLORS[stage] }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary w-6 text-right shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 max-w-md">
        <div className="card-hover bg-surface border border-border rounded-xl p-4">
          <p className="text-2xl font-semibold" style={{ color: STAGE_COLORS.closed_won }}>{closedWon}</p>
          <p className="text-xs text-text-secondary mt-0.5">Closed Won</p>
        </div>
        <div className="card-hover bg-surface border border-border rounded-xl p-4">
          <p className="text-2xl font-semibold" style={{ color: STAGE_COLORS.closed_lost }}>{closedLost}</p>
          <p className="text-xs text-text-secondary mt-0.5">Closed Lost</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-hover bg-surface border border-border rounded-xl p-4">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}
