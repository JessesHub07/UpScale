'use client'

import { useMemo, useState } from 'react'
import { Lead } from '@/lib/type'
import { STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/stages'
import { Send, AlertTriangle, Search, Plus, Calendar, MessageCircle, Camera, Check, Sparkles, X } from 'lucide-react'

interface Props {
  leads: Lead[]
}

type Channel = 'telegram' | 'whatsapp'
type Tone = 'friendly' | 'professional' | 'urgent'

const VARIABLES = ['{{location}}', '{{budget}}']

export default function BroadcastForm({ leads }: Props) {
  const [channel, setChannel] = useState<Channel>('telegram')
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set(STAGES))
  const [minScore, setMinScore] = useState(0)
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [sendMode, setSendMode] = useState<'now' | 'later'>('now')
  const [sendAt, setSendAt] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [showChannelPicker, setShowChannelPicker] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const [deselected, setDeselected] = useState<Set<string>>(new Set())
  const [showAI, setShowAI] = useState(false)
  const [aiAnnouncement, setAiAnnouncement] = useState('')
  const [aiTone, setAiTone] = useState<Tone>('friendly')
  const [aiCta, setAiCta] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const stageCounts = useMemo(() => {
    return STAGES.reduce((acc, s) => {
      acc[s] = leads.filter(l => l.stage === s).length
      return acc
    }, {} as Record<string, number>)
  }, [leads])

  const stageAvgScore = useMemo(() => {
    return STAGES.reduce((acc, s) => {
      const group = leads.filter(l => l.stage === s)
      acc[s] = group.length === 0 ? 0 : Math.round(group.reduce((sum, l) => sum + (l.score || 0), 0) / group.length)
      return acc
    }, {} as Record<string, number>)
  }, [leads])

  const matched = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter(l =>
      selectedStages.has(l.stage) &&
      (l.score ?? 0) >= minScore &&
      (!urgentOnly || l.urgent) &&
      (q === '' || (l.name || '').toLowerCase().includes(q) || (l.location || '').toLowerCase().includes(q))
    )
  }, [leads, selectedStages, minScore, urgentOnly, search])

  const selected = useMemo(() => matched.filter(l => !deselected.has(l.id)), [matched, deselected])

  const stageSummary = useMemo(() => {
    return STAGES.reduce((acc, s) => {
      acc[s] = selected.filter(l => l.stage === s).length
      return acc
    }, {} as Record<string, number>)
  }, [selected])

  const variableCount = (message.match(/\{\{[^}]+\}\}/g) || []).length

  function toggleStage(stage: string) {
    setSelectedStages(prev => {
      const next = new Set(prev)
      if (next.has(stage)) next.delete(stage)
      else next.add(stage)
      return next
    })
  }

  function toggleLead(id: string) {
    setDeselected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function insertVariable(v: string) {
    setMessage(m => m + v)
  }

  async function generateWithAI() {
    setAiLoading(true)
    const res = await fetch('/api/generate-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        announcement: aiAnnouncement,
        tone: aiTone,
        cta: aiCta,
        audience: Array.from(selectedStages).join(', ') + ' leads',
      }),
    })
    setAiLoading(false)
    if (res.ok) {
      const data = await res.json()
      setMessage(data.message)
      setShowAI(false)
    }
  }

  async function sendNow() {
    setSending(true)
    setResult(null)
    const recipients = selected.map(l => ({ leadId: l.id, chatId: l.chat_id }))
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients, message }),
    })
    setSending(false)
    setConfirming(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
      setMessage('')
    }
  }

  async function scheduleSend() {
    setSending(true)
    const res = await fetch('/api/schedule-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stages: Array.from(selectedStages),
        minScore,
        urgentOnly,
        search,
        channel,
        message,
        sendAt: new Date(sendAt).toISOString(),
      }),
    })
    setSending(false)
    setConfirming(false)
    if (res.ok) {
      setScheduled(true)
      setMessage('')
    }
  }

  const previewText = message || 'Your message will appear here…'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

      {/* LEFT */}
      <div className="flex flex-col gap-5">

        {/* AUDIENCE */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Audience</h3>
          <p className="text-xs text-text-tertiary mb-5">Select which leads receive this broadcast.</p>

          {/* Stage cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {STAGES.map(s => {
              const active = selectedStages.has(s)
              const color = STAGE_COLORS[s as keyof typeof STAGE_COLORS] || '#6b7280'
              const count = stageCounts[s] || 0
              const avg = stageAvgScore[s] || 0
              return (
                <button
                  key={s}
                  onClick={() => toggleStage(s)}
                  className="relative text-left p-3 rounded-xl border transition-all"
                  style={active
                    ? { borderColor: color, backgroundColor: `${color}12` }
                    : { borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)' }
                  }
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                      <Check size={9} className="text-white" />
                    </span>
                  )}
                  <p className="text-xs font-semibold mb-1" style={{ color: active ? color : 'var(--text-secondary)' }}>
                    {STAGE_LABELS[s as keyof typeof STAGE_LABELS]}
                  </p>
                  <p className="text-lg font-bold" style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {count}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    {count === 1 ? 'contact' : 'contacts'}{avg > 0 ? ` · avg ${avg}` : ''}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-[11px] text-text-secondary mb-1.5">Min score</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMinScore(v => Math.max(0, v - 5))}
                  disabled={minScore === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 text-base"
                >‹</button>
                <span className="w-8 text-center text-sm font-semibold text-text-primary tabular-nums">{minScore}</span>
                <button
                  onClick={() => setMinScore(v => Math.min(100, v + 5))}
                  disabled={minScore === 100}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 text-base"
                >›</button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-text-secondary mb-1.5">Urgent only</p>
              <button
                onClick={() => setUrgentOnly(v => !v)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  urgentOnly ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]' : 'border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {urgentOnly ? 'Urgent only' : 'All leads'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location"
              className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30"
            />
          </div>

          {/* Recipient list */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-text-secondary">
              {selected.length} of {matched.length} selected
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setDeselected(new Set())} className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors">Select all</button>
              <span className="text-text-tertiary text-[11px]">·</span>
              <button onClick={() => setDeselected(new Set(matched.map(l => l.id)))} className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors">None</button>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border max-h-72 overflow-y-auto">
            {matched.length === 0 ? (
              <p className="text-xs text-text-tertiary text-center py-6">No leads match these filters.</p>
            ) : matched.map(l => {
              const isSelected = !deselected.has(l.id)
              const scoreColor = (l.score || 0) >= 70 ? '#22c55e' : (l.score || 0) >= 40 ? '#f59e0b' : '#6b7280'
              const stageColor = STAGE_COLORS[l.stage as keyof typeof STAGE_COLORS] || '#6b7280'
              const now = Date.now()
              const created = new Date(l.created_at).getTime()
              const hoursAgo = Math.round((now - created) / 3600000)
              const timeLabel = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLead(l.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-input ${!isSelected ? 'opacity-40' : ''}`}
                >
                  <div
                    className="mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                    style={isSelected ? { backgroundColor: 'var(--text-primary)', borderColor: 'var(--text-primary)' } : { borderColor: 'var(--border-color)' }}
                  >
                    {isSelected && <Check size={10} className="text-page" />}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-input border border-border flex items-center justify-center text-[11px] font-semibold text-text-secondary shrink-0">
                    {(l.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-text-primary truncate">{l.name || 'Unknown'}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: stageColor, backgroundColor: `${stageColor}18` }}>
                        {STAGE_LABELS[l.stage as keyof typeof STAGE_LABELS]}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: scoreColor }}>{l.score ?? 0}</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary truncate">
                      {[l.property_type, l.location].filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{timeLabel}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CHANNEL */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Channel</h3>
          <p className="text-xs text-text-tertiary mb-4">Choose where this message is delivered.</p>

          <div className="flex items-start gap-3 flex-wrap">
            <button
              onClick={() => setChannel('telegram')}
              className={`flex flex-col items-start px-4 py-3 rounded-xl border transition-colors min-w-[130px] ${
                channel === 'telegram' ? 'border-text-primary bg-input' : 'border-border'
              }`}
            >
              <span className="text-sm font-semibold text-text-primary">Telegram</span>
              <span className="text-[10px] text-[#22c55e] font-medium mt-0.5">● Connected</span>
            </button>

            <div className="flex flex-col items-start px-4 py-3 rounded-xl border border-dashed border-border min-w-[130px] opacity-75">
              <span className="text-sm font-semibold text-text-primary">WhatsApp</span>
              <span className="text-[10px] text-text-tertiary mt-0.5">Business API</span>
              <button className="text-[10px] text-[#22c55e] font-medium mt-1.5 hover:underline">
                Connect →
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowChannelPicker(v => !v)}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-dashed border-border text-text-tertiary hover:text-text-primary hover:border-text-primary/30 transition-colors"
              >
                <Plus size={15} />
              </button>
              {showChannelPicker && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg z-20 p-2">
                  <p className="text-[11px] font-medium text-text-tertiary px-2 py-1.5">Coming soon</p>
                  {[
                    { icon: MessageCircle, label: 'Messenger' },
                    { icon: Camera, label: 'Instagram DMs' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center justify-between px-2 py-2 rounded-lg opacity-50">
                      <span className="flex items-center gap-2 text-sm text-text-primary">
                        <Icon size={14} className="text-text-tertiary" />
                        {label}
                      </span>
                      <span className="text-[10px] text-text-tertiary">Soon</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-sm font-semibold text-text-primary">Message</h3>
            <button
              onClick={() => setShowAI(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/8 hover:bg-[#22c55e]/15 transition-colors"
            >
              <Sparkles size={12} /> Generate with AI
            </button>
          </div>
          <p className="text-xs text-text-tertiary mb-4">Write your message or generate one with AI.</p>

          {/* AI panel */}
          {showAI && (
            <div className="bg-input border border-[#22c55e]/25 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-primary">✨ AI Message Generator</p>
                <button onClick={() => setShowAI(false)}><X size={13} className="text-text-tertiary" /></button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">What are you announcing?</label>
                  <input
                    value={aiAnnouncement}
                    onChange={e => setAiAnnouncement(e.target.value)}
                    placeholder="e.g. Solar panel installation promo, 20% off this week"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Tone</label>
                    <div className="flex gap-1.5">
                      {(['friendly', 'professional', 'urgent'] as Tone[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setAiTone(t)}
                          className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-colors ${
                            aiTone === t ? 'bg-text-primary text-page border-text-primary' : 'border-border text-text-secondary'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[11px] text-text-secondary block mb-1">CTA (optional)</label>
                    <input
                      value={aiCta}
                      onChange={e => setAiCta(e.target.value)}
                      placeholder="Book inspection, Reply YES"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={generateWithAI}
                    disabled={!aiAnnouncement.trim() || aiLoading}
                    className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-[#22c55e] text-black hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Sparkles size={12} /> {aiLoading ? 'Generating…' : 'Generate'}
                  </button>
                  <button
                    onClick={() => setConfirming(true)}
                    disabled={!message.trim() || (sendMode === 'now' ? selected.length === 0 : matched.length === 0) || (sendMode === 'later' && !sendAt)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-30"
                  >
                    <Send size={11} />
                    {sendMode === 'now' ? `Send${selected.length > 0 ? ` to ${selected.length}` : ''}` : 'Schedule'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message… or use Generate with AI above"
              rows={5}
              maxLength={1024}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 pb-10 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-text-primary/30"
            />
            <button
              onClick={() => setConfirming(true)}
              disabled={!message.trim() || (sendMode === 'now' ? selected.length === 0 : matched.length === 0) || (sendMode === 'later' && !sendAt)}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              <Send size={11} />
              {sendMode === 'now' ? `Send${selected.length > 0 ? ` to ${selected.length}` : ''}` : 'Schedule'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-text-tertiary">Insert:</span>
              {VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-text-tertiary shrink-0">{message.length} / 1024</span>
          </div>

          {/* When to send */}
          <p className="text-xs font-medium text-text-secondary mb-2">When to send</p>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setSendMode('now')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                sendMode === 'now' ? 'bg-text-primary text-page border-text-primary' : 'border-border text-text-secondary'
              }`}
            >
              Send now
            </button>
            <button
              onClick={() => setSendMode('later')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                sendMode === 'later' ? 'bg-text-primary text-page border-text-primary' : 'border-border text-text-secondary'
              }`}
            >
              <Calendar size={12} /> Schedule
            </button>
          </div>
          {sendMode === 'later' && (
            <input
              type="datetime-local"
              value={sendAt}
              onChange={e => setSendAt(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary mb-3 focus:outline-none focus:border-text-primary/30"
            />
          )}

          {result && (
            <p className="text-xs text-[#22c55e] mt-2">
              Sent to {result.sent} of {result.total}{result.failed > 0 ? ` · ${result.failed} skipped (no chat ID)` : ''}.
            </p>
          )}
          {scheduled && <p className="text-xs text-[#22c55e] mt-2">Broadcast scheduled.</p>}
        </div>
      </div>

      {/* RIGHT — Campaign summary + preview */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start order-first lg:order-last">

        {/* Campaign summary */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Campaign Summary</p>
          <div className="flex flex-col gap-3 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-text-secondary">Audience</span>
              <span className="text-text-primary font-medium">{selected.length} leads</span>
            </div>
            {STAGES.filter(s => stageSummary[s] > 0).map(s => (
              <div key={s} className="flex justify-between pl-3">
                <span className="text-text-tertiary text-xs">{STAGE_LABELS[s as keyof typeof STAGE_LABELS]}</span>
                <span className="text-text-secondary text-xs">{stageSummary[s]}</span>
              </div>
            ))}
            <div className="border-t border-border my-1" />
            <div className="flex justify-between">
              <span className="text-text-secondary">Channel</span>
              <span className="text-text-primary capitalize">{channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Timing</span>
              <span className="text-text-primary">{sendMode === 'now' ? 'Immediately' : 'Scheduled'}</span>
            </div>
            {variableCount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Personalisation</span>
                <span className="text-[#22c55e]">{variableCount} variable{variableCount > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">Est. delivery</span>
              <span className="text-text-primary">&lt; 10 seconds</span>
            </div>
          </div>

          {channel === 'whatsapp' && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
              <AlertTriangle size={13} className="text-[#f59e0b] mt-0.5 shrink-0" />
              <p className="text-[11px] text-text-secondary leading-relaxed">WhatsApp isn't connected. Switch to Telegram or ask Axliq to finish the setup.</p>
            </div>
          )}

          <button
            onClick={() => setConfirming(true)}
            disabled={!message.trim() || (sendMode === 'now' ? selected.length === 0 : matched.length === 0) || (sendMode === 'later' && !sendAt)}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-35"
          >
            <Send size={14} />
            {sendMode === 'now' ? `Send to ${selected.length} leads` : 'Schedule Broadcast'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Preview</p>
          <div className="bg-[#e5ddd5] rounded-xl p-4 min-h-[120px] flex flex-col gap-2">
            <p className="text-[10px] text-[#667781] mb-1">As your lead sees it · {channel}</p>
            <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 text-sm leading-relaxed text-[#111b21] self-start max-w-[90%] shadow-sm">
              {previewText}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirming(false)}>
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-[#f59e0b] mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-text-primary mb-1">
                  {sendMode === 'now' ? `Send to ${selected.length} leads?` : `Schedule for ${matched.length} leads?`}
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {sendMode === 'now' ? "This sends immediately and can't be recalled." : 'Audience is recalculated at send time so the count may shift slightly.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
              <button
                onClick={sendMode === 'now' ? sendNow : scheduleSend}
                disabled={sending}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? 'Working…' : sendMode === 'now' ? 'Send Now' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
