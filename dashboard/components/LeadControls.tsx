'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { STAGES, STAGE_LABELS } from '@/lib/stages'

interface Props {
  leadId: string
  initialStage: string
  initialNotes: string | null
}

export default function LeadControls({ leadId, initialStage, initialNotes }: Props) {
  const [stage, setStage] = useState(initialStage)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
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

  return (
    <div className="float-in bg-surface border border-border rounded-xl p-6" style={{ animationDelay: '40ms' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Stage &amp; Notes</h3>

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
