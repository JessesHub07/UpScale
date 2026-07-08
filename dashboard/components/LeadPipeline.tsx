'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/lib/type'
import LeadCard from './LeadCard'
import LeadTable from './LeadTable'
import ThemeToggle from './ThemeToggle'
import StatsBar from './StatsBar'
import { STAGE_COLORS, STAGE_LABELS, STAGES } from '@/lib/stages'
import { Search, AlertTriangle, Download, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AddLeadModal from './AddLeadModal'

interface Props {
  initialLeads: Lead[]
}

export default function LeadPipeline({ initialLeads }: Props) {
  const router = useRouter()
  const [allLeads, setAllLeads] = useState<Lead[]>(initialLeads)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [query, setQuery] = useState('')
  const [showAddLead, setShowAddLead] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('leads-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAllLeads(prev => {
            const incoming = payload.new as Lead
            if (prev.some(l => l.id === incoming.id)) return prev
            return [incoming, ...prev]
          })
        } else if (payload.eventType === 'UPDATE') {
          setAllLeads(prev => prev.map(lead =>
            lead.id === (payload.new as Lead).id ? payload.new as Lead : lead
          ))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const leads = useMemo(() => {
    if (!query.trim()) return allLeads
    const q = query.toLowerCase()
    const matchingStages = STAGES.filter(s =>
      s.replace('_', ' ').includes(q) || STAGE_LABELS[s].toLowerCase().includes(q)
    )
    return allLeads.filter(l =>
      (l.name || '').toLowerCase().includes(q) || matchingStages.includes(l.stage as typeof STAGES[number])
    )
  }, [allLeads, query])

  const urgent = leads.filter(l => l.urgent)
  const newLeads = leads.filter(l => l.stage === 'new')
  const hot = leads.filter(l => !l.urgent && l.stage === 'hot')
  const warm = leads.filter(l => l.stage === 'warm')
  const cold = leads.filter(l => l.stage === 'cold')
  const nurture = leads.filter(l => l.stage === 'nurture')
  const handedOff = leads.filter(l => l.stage === 'handed_off')
  const closedWon = leads.filter(l => l.stage === 'closed_won')
  const closedLost = leads.filter(l => l.stage === 'closed_lost')

  async function updateStage(leadId: string, newStage: string) {
    setAllLeads(prev => prev.map(l => (l.id === leadId ? { ...l, stage: newStage } : l)))
    await supabase.from('leads').update({ stage: newStage }).eq('id', leadId)
  }

  function exportCsv() {
    const columns: (keyof Lead)[] = ['name', 'phone', 'email', 'score', 'stage', 'property_type', 'location', 'budget', 'timeline', 'source', 'created_at']
    const header = columns.join(',')
    const rows = leads.map(l =>
      columns.map(c => {
        const value = l[c]
        const str = value === null || value === undefined ? '' : String(value)
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upscale-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-8 py-3 bg-page sticky top-0 z-20">
        {/* Title row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Atmax Green Planet</p>
            <h2 className="text-xl font-bold tracking-tight text-text-primary leading-tight">Pipeline</h2>
            <p className="text-[11px] text-text-secondary">
              {allLeads.length} leads · {hot.length} hot · {warm.length} warm
              {urgent.length > 0 && <span className="text-[#ef4444] font-medium"> · {urgent.length} urgent</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={exportCsv}
              title="Export CSV"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setShowAddLead(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity"
            >
              <UserPlus size={13} />
              <span className="hidden sm:inline">Add Lead</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
        {/* Search + view toggle row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name or stage"
              className="bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary w-full focus:outline-none focus:border-text-primary/30"
            />
          </div>
          <div className="flex items-center gap-0.5 bg-input border border-border rounded-full p-0.5 shrink-0">
            <button
              onClick={() => setView('kanban')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                view === 'kanban' ? 'bg-text-primary text-page' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                view === 'table' ? 'bg-text-primary text-page' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </header>

      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}

      {/* Pipeline */}
      <div className="p-4 sm:p-8">
        <StatsBar leads={allLeads} />

        {/* Urgent Banner */}
        {urgent.map(lead => (
          <div key={lead.id} className="mb-4 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-[#ef4444] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">{lead.name || 'Unknown'} asked to speak with a human.</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {lead.location || '—'} · score {lead.score ?? 0}/100 · {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/leads/${lead.id}`)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors shrink-0"
            >
              Open conversation
            </button>
          </div>
        ))}

        {/* Kanban or Table View */}
        {view === 'kanban' ? (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">
                AI Qualification — automatic
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PipelineColumn stage="new" title={STAGE_LABELS.new} count={newLeads.length} leads={newLeads} color={STAGE_COLORS.new} onDropLead={updateStage} />
                <PipelineColumn stage="hot" title={STAGE_LABELS.hot} count={hot.length} leads={hot} color={STAGE_COLORS.hot} onDropLead={updateStage} />
                <PipelineColumn stage="warm" title={STAGE_LABELS.warm} count={warm.length} leads={warm} color={STAGE_COLORS.warm} onDropLead={updateStage} />
                <PipelineColumn stage="cold" title={STAGE_LABELS.cold} count={cold.length} leads={cold} color={STAGE_COLORS.cold} onDropLead={updateStage} />
              </div>
            </div>

            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">
                Sales Pipeline — manual
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PipelineColumn stage="nurture" title={STAGE_LABELS.nurture} count={nurture.length} leads={nurture} color={STAGE_COLORS.nurture} onDropLead={updateStage} />
                <PipelineColumn stage="handed_off" title={STAGE_LABELS.handed_off} count={handedOff.length} leads={handedOff} color={STAGE_COLORS.handed_off} onDropLead={updateStage} />
                <PipelineColumn stage="closed_won" title={STAGE_LABELS.closed_won} count={closedWon.length} leads={closedWon} color={STAGE_COLORS.closed_won} onDropLead={updateStage} />
                <PipelineColumn stage="closed_lost" title={STAGE_LABELS.closed_lost} count={closedLost.length} leads={closedLost} color={STAGE_COLORS.closed_lost} onDropLead={updateStage} />
              </div>
            </div>
          </div>
        ) : (
          <LeadTable leads={leads} />
        )}
      </div>
    </div>
  )
}

function PipelineColumn({ stage, title, count, leads, color, onDropLead }: {
  stage: string
  title: string
  count: number
  leads: Lead[]
  color: string
  onDropLead: (leadId: string, newStage: string) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        setDragOver(false)
        const leadId = e.dataTransfer.getData('text/plain')
        if (leadId) onDropLead(leadId, stage)
      }}
      className={`bg-surface border rounded-xl p-4 transition-colors ${dragOver ? 'border-text-primary/40 bg-input' : 'border-border'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color }}>
          {title}
        </h2>
        <span className="text-xs bg-border text-text-secondary px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {leads.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-8">No leads</p>
        ) : (
          leads.map(lead => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}