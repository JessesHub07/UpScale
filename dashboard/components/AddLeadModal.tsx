'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Upload } from 'lucide-react'

interface Props {
  onClose: () => void
}

const HEADER_MAP: Record<string, string> = {
  name: 'name', 'full name': 'name', 'lead name': 'name',
  phone: 'phone', 'phone number': 'phone', mobile: 'phone',
  email: 'email',
  property_type: 'property_type', 'property type': 'property_type',
  location: 'location',
  budget: 'budget',
  timeline: 'timeline',
  notes: 'notes', message: 'notes',
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase()
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (char === '"') { inQuotes = false }
      else { current += char }
    } else {
      if (char === '"') inQuotes = true
      else if (char === ',') { result.push(current); current = '' }
      else current += char
    }
  }
  result.push(current)
  return result.map(v => v.trim())
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return { rows: [], skipped: 0, total: 0 }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader)
  const fieldKeys = headers.map(h => HEADER_MAP[h] ?? null)

  const rows: Record<string, string>[] = []
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i])
    const row: Record<string, string> = {}
    fieldKeys.forEach((key, idx) => {
      if (key && values[idx]) row[key] = values[idx]
    })
    if (!row.name || !row.phone) {
      skipped++
      continue
    }
    rows.push(row)
  }

  return { rows, skipped, total: lines.length - 1 }
}

export default function AddLeadModal({ onClose }: Props) {
  const [tab, setTab] = useState<'manual' | 'csv'>('manual')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', property_type: 'residential', location: '', budget: '', timeline: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [csvPreview, setCsvPreview] = useState<{ rows: Record<string, string>[]; skipped: number; total: number } | null>(null)
  const [csvResult, setCsvResult] = useState<{ imported: number } | null>(null)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('leads').insert({
      chat_id: `manual-${crypto.randomUUID()}`,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      property_type: form.property_type || null,
      location: form.location || null,
      budget: form.budget || null,
      timeline: form.timeline || null,
      notes: form.notes || null,
      source: 'manual',
      stage: 'new',
      score: 0,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    onClose()
  }

  function handleFile(file: File) {
    setCsvResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setCsvPreview(parseCsv(text))
    }
    reader.readAsText(file)
  }

  async function handleCsvImport() {
    if (!csvPreview || csvPreview.rows.length === 0) return
    setSaving(true)
    setError('')

    const payload = csvPreview.rows.map(row => ({
      chat_id: `manual-${crypto.randomUUID()}`,
      name: row.name,
      phone: row.phone,
      email: row.email || null,
      property_type: row.property_type || null,
      location: row.location || null,
      budget: row.budget || null,
      timeline: row.timeline || null,
      notes: row.notes || null,
      source: 'manual',
      stage: 'new',
      score: 0,
    }))

    const { error } = await supabase.from('leads').insert(payload)
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setCsvResult({ imported: payload.length })
    setCsvPreview(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Add Leads</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-input border border-border rounded-full p-0.5 mb-4 w-fit">
          <button
            onClick={() => setTab('manual')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              tab === 'manual' ? 'bg-text-primary text-page' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              tab === 'csv' ? 'bg-text-primary text-page' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Import CSV
          </button>
        </div>

        <p className="text-xs text-text-tertiary mb-5">
          For leads sourced outside Helen's channels, e.g. referrals or events. Helen won't message them automatically,
          you'll need to follow up directly or share the booking/chat link.
        </p>

        {tab === 'manual' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Name" required>
              <input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Phone" required>
              <input required value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Property type">
                <select value={form.property_type} onChange={e => update('property_type', e.target.value)} className={inputClass}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={e => update('location', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget">
                <input value={form.budget} onChange={e => update('budget', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Timeline">
                <input value={form.timeline} onChange={e => update('timeline', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>

            {error && <p className="text-xs text-[#ef4444]">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full bg-text-primary text-page text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add Lead'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-tertiary">
              Expected columns: <code className="text-text-secondary">name, phone</code> (required), plus optional
              <code className="text-text-secondary"> email, property_type, location, budget, timeline, notes</code>.
              Column order doesn't matter, extra columns are ignored.
            </p>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-6 cursor-pointer hover:border-text-primary/30 transition-colors">
              <Upload size={18} className="text-text-tertiary" />
              <span className="text-xs text-text-secondary">Click to select a .csv file</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>

            {csvPreview && (
              <div className="bg-input border border-border rounded-lg p-3 text-xs">
                <p className="text-text-primary font-medium">{csvPreview.rows.length} leads ready to import</p>
                {csvPreview.skipped > 0 && (
                  <p className="text-text-tertiary mt-1">
                    {csvPreview.skipped} row{csvPreview.skipped > 1 ? 's' : ''} skipped, missing name or phone.
                  </p>
                )}
              </div>
            )}

            {csvResult && (
              <p className="text-xs text-[#22c55e]">Imported {csvResult.imported} leads successfully.</p>
            )}

            {error && <p className="text-xs text-[#ef4444]">{error}</p>}

            <button
              onClick={handleCsvImport}
              disabled={!csvPreview || csvPreview.rows.length === 0 || saving}
              className="w-full bg-text-primary text-page text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Importing…' : 'Import Leads'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const inputClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text-secondary">
        {label} {required && <span className="text-[#ef4444]">*</span>}
      </span>
      {children}
    </label>
  )
}
