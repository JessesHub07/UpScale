'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { STAGES, STAGE_LABELS } from '@/lib/stages'
import { Sparkles } from 'lucide-react'

interface Props {
  leadId: string
  chatId: string
  initialStage: string
  initialNotes: string | null
}

export default function LeadControls({ leadId, chatId, initialStage, initialNotes }: Props) {
  const router = useRouter()
  const [stage, setStage] = useState(initialStage)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function updateStage(newStage: string) {
    setStage(newStage)
    await supabase.from('leads').update({ stage: newStage }).eq('id', leadId)
  }

  function updateNotes(value: string) {
    setNotes(value)
    setSaving(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await supabase.from('leads').update({ notes: value }).eq('id', leadId)
      setSaving(false)
    }, 600)
  }

  async function reanalyze() {
    setAnalyzing(true)
    setAnalyzeError('')
    const res = await fetch('/api/analyze-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, chatId }),
    })
    setAnalyzing(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setAnalyzeError(data.error || 'Re-analysis failed')
    }
  }

  return (
    <div className="float-in bg-surface border border-border rounded-xl p-6" style={{ animationDelay: '40ms' }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Stage &amp; Notes</h3>
        <button
          onClick={reanalyze}
          disabled={analyzing}
          title="Re-reads the full conversation and recalculates score, stage, and summary"
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors disabled:opacity-50"
        >
          <Sparkles size={12} />
          {analyzing ? 'Analyzing…' : 'Re-analyze Conversation'}
        </button>
      </div>
      <p className="text-[11px] text-text-tertiary mb-3">
        Re-reads the full chat, including anything you typed yourself, and updates score, stage, and summary.
      </p>
      {analyzeError && <p className="text-xs text-[#ef4444] mb-3">{analyzeError}</p>}

      <div className="flex flex-wrap gap-2 mb-5">
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => updateStage(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              stage === s
                ? 'bg-text-primary border-text-primary text-page'
                : 'border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30'
            }`}
          >
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-tertiary">Internal notes</p>
        {saving && <span className="text-[10px] text-text-tertiary">Saving…</span>}
      </div>
      <textarea
        value={notes}
        onChange={e => updateNotes(e.target.value)}
        placeholder="Add internal notes about this lead…"
        rows={3}
        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-text-primary/30"
      />
    </div>
  )
}
