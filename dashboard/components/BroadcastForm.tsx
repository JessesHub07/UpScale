'use client'

import { useMemo, useState } from 'react'
import { Lead } from '@/lib/type'
import { STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/stages'
import { Send, AlertTriangle, Search, Plus, Calendar, MessageCircle, Camera, Check } from 'lucide-react'

interface Props {
  leads: Lead[]
}

type Channel = 'telegram' | 'whatsapp'

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

  const stageCounts = useMemo(() => {
    return STAGES.reduce((acc, s) => {
      acc[s] = leads.filter(l => l.stage === s).length
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

  const previewName = selected[0]?.name || 'your lead'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* LEFT */}
      <div className="flex flex-col gap-4">
        {/* Audience */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Audience</h3>
          <p className="text-xs text-text-tertiary mb-4">Pick which leads should receive this broadcast.</p>

          <p className="text-xs font-medium text-text-secondary mb-2">Send via</p>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setChannel('telegram')}
              className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left min-w-[110px] transition-colors ${
                channel === 'telegram' ? 'border-text-primary bg-input' : 'border-border'
              }`}
            >
              <span className="text-sm font-medium text-text-primary">Telegram</span>
              <span className="text-[10px] text-[#22c55e]">Connected</span>
            </button>
            <button
              disabled
              title="Connect WhatsApp Business in Settings to enable this"
              className="flex flex-col items-start px-3 py-2 rounded-lg border border-border text-left min-w-[110px] opacity-50 cursor-not-allowed"
            >
              <span className="text-sm font-medium text-text-primary">WhatsApp</span>
              <span className="text-[10px] text-text-tertiary">Not connected</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowChannelPicker(v => !v)}
                title="Connect a new channel"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-tertiary hover:text-text-primary hover:border-text-primary/30 transition-colors"
              >
                <Plus size={14} />
              </button>
              {showChannelPicker && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg z-20 p-2">
                  <p className="text-[11px] font-medium text-text-tertiary px-2 py-1.5">Available channels</p>
                  {[
                    { icon: MessageCircle, label: 'WhatsApp Business' },
                    { icon: MessageCircle, label: 'Messenger' },
                    { icon: Camera, label: 'Instagram DMs' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-input">
                      <span className="flex items-center gap-2 text-sm text-text-primary">
                        <Icon size={14} className="text-text-tertiary" />
                        {label}
                      </span>
                      <span className="text-[10px] text-text-tertiary">Not connected</span>
                    </div>
                  ))}
                  <div className="border-t border-border mt-1 pt-2 px-2">
                    <p className="text-[11px] text-text-tertiary leading-relaxed">
                      Connecting a Meta channel requires registering a Meta Business App and verifying the account,
                      that's set up by Axliq during onboarding, not a one-click toggle here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs font-medium text-text-secondary mb-2">Stages</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {STAGES.map(s => (
              <button
                key={s}
                onClick={() => toggleStage(s)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
                style={
                  selectedStages.has(s)
                    ? { backgroundColor: `${STAGE_COLORS[s]}18`, borderColor: STAGE_COLORS[s], color: STAGE_COLORS[s] }
                    : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                }
              >
                {STAGE_LABELS[s]}
                <span className="opacity-70">{stageCounts[s] || 0}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">
                Minimum score: <span className="text-text-primary">{minScore}</span>
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-current"
              />
              <p className="text-[10px] text-text-tertiary mt-1">Only leads scoring this or higher are included.</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Only urgent leads</p>
              <button
                onClick={() => setUrgentOnly(v => !v)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  urgentOnly ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]' : 'border-border text-text-secondary'
                }`}
              >
                {urgentOnly ? 'Urgent leads only' : 'All leads'}
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location"
              className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30"
            />
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-text-secondary">
              Recipients · {selected.length} of {matched.length} selected
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDeselected(new Set())}
                className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                Select all
              </button>
              <span className="text-text-tertiary text-[11px]">·</span>
              <button
                onClick={() => setDeselected(new Set(matched.map(l => l.id)))}
                className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                Select none
              </button>
            </div>
          </div>
          <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border">
            {matched.length === 0 ? (
              <p className="text-xs text-text-tertiary text-center py-6">No leads match these filters.</p>
            ) : (
              matched.map(l => {
                const isSelected = !deselected.has(l.id)
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLead(l.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${isSelected ? '' : 'opacity-40'} hover:bg-input`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                        style={isSelected ? { backgroundColor: 'var(--text-primary)', borderColor: 'var(--text-primary)' } : { borderColor: 'var(--border-color)' }}
                      >
                        {isSelected && <Check size={11} className="text-page" />}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-input flex items-center justify-center text-[11px] font-semibold text-text-secondary shrink-0">
                        {(l.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">{l.name || 'Unknown'}</p>
                        <p className="text-[11px] text-text-tertiary truncate">{l.location || '—'}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ color: STAGE_COLORS[l.stage as keyof typeof STAGE_COLORS] || '#6b7280', backgroundColor: `${STAGE_COLORS[l.stage as keyof typeof STAGE_COLORS] || '#6b7280'}18` }}
                    >
                      {l.score ?? 0}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Message */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Message</h3>
          <p className="text-xs text-text-tertiary mb-4">
            Telegram messages send as plain text. Personalization variables are only needed for WhatsApp templates,
            see the Templates tab for that.
          </p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write the message to send…"
            rows={4}
            maxLength={1024}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-text-primary/30 mb-1"
          />
          <p className="text-[11px] text-text-tertiary text-right mb-4">{message.length} / 1024</p>

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
              <Calendar size={12} /> Schedule for later
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

          <button
            onClick={() => setConfirming(true)}
            disabled={!message.trim() || (sendMode === 'now' ? selected.length === 0 : matched.length === 0) || (sendMode === 'later' && !sendAt)}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send size={14} /> {sendMode === 'now' ? `Send to ${selected.length}` : 'Schedule Broadcast'}
          </button>

          {result && (
            <p className="text-xs text-[#22c55e] mt-3">
              Sent to {result.sent} of {result.total}{result.failed > 0 ? ` (${result.failed} skipped, manually-added leads have no chat)` : ''}.
            </p>
          )}
          {scheduled && <p className="text-xs text-[#22c55e] mt-3">Broadcast scheduled.</p>}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Preview</p>
          <div className="bg-input rounded-lg p-3">
            <p className="text-[11px] text-text-tertiary mb-2">As {previewName} would see it, via {channel}</p>
            <div className="bg-[#005c4b] text-white rounded-lg rounded-tr-none px-3 py-2 text-sm leading-relaxed max-w-[90%] ml-auto">
              {message || 'Your message will appear here…'}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Recipients</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Channel</span>
              <span className="text-text-primary capitalize">{channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Timing</span>
              <span className="text-text-primary">{sendMode === 'now' ? 'Send immediately' : 'Scheduled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Recipients</span>
              <span className="text-text-primary">{sendMode === 'now' ? selected.length : matched.length}</span>
            </div>
          </div>
          {channel === 'whatsapp' && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
              <AlertTriangle size={14} className="text-[#f59e0b] mt-0.5 shrink-0" />
              <p className="text-[11px] text-text-secondary leading-relaxed">
                WhatsApp Business isn't connected yet. Switch to Telegram, or ask Axliq to finish the Meta connection.
              </p>
            </div>
          )}
        </div>
      </div>

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
                  {sendMode === 'now' ? "This sends immediately and can't be recalled." : 'The audience is recalculated at send time, so the count may shift slightly.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
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
