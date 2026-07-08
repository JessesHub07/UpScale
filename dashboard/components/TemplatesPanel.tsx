'use client'

import { useRef, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Template } from '@/lib/type'
import { Plus, X, Sparkles, ChevronDown, ChevronUp, Copy, Edit2, Check } from 'lucide-react'

interface Props {
  initialTemplates: Template[]
}

const STATUS_COLORS: Record<Template['status'], string> = {
  draft: '#6b7280',
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
}

const STATUS_ICONS: Record<Template['status'], string> = {
  draft: '○',
  pending: '⏳',
  approved: '✓',
  rejected: '✗',
}

const CATEGORIES: { value: Template['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'utility', label: 'Utility' },
  { value: 'authentication', label: 'Authentication' },
]

const STATUSES: { value: Template['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const VARIABLE_EXAMPLES = ['Jesse', '10:00 AM', 'Daniel']

function renderPreview(content: string) {
  return content
    .replace(/\{\{1\}\}/g, VARIABLE_EXAMPLES[0])
    .replace(/\{\{2\}\}/g, VARIABLE_EXAMPLES[1])
    .replace(/\{\{3\}\}/g, VARIABLE_EXAMPLES[2])
}

function highlightVariables(content: string) {
  const parts = content.split(/(\{\{\d+\}\})/g)
  return parts.map((part, i) =>
    /^\{\{\d+\}\}$/.test(part)
      ? <span key={i} className="text-[#22c55e] font-semibold">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
}: {
  template: Template
  onEdit: (t: Template) => void
  onDuplicate: (t: Template) => void
}) {
  const color = STATUS_COLORS[template.status]
  const icon = STATUS_ICONS[template.status]
  const timeAgo = (() => {
    const diff = Date.now() - new Date(template.created_at).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  })()

  return (
    <div className="card-hover bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary leading-tight">{template.name}</p>
        <span
          className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ color, backgroundColor: `${color}18` }}
        >
          <span>{icon}</span>
          <span className="capitalize">{template.status}</span>
        </span>
      </div>
      <p className="text-[11px] text-text-tertiary capitalize">{template.category}</p>
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
        {highlightVariables(template.content)}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-[11px] text-text-tertiary">{timeAgo}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(template)}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded-lg hover:bg-input transition-colors"
          >
            <Edit2 size={11} /> Edit
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded-lg hover:bg-input transition-colors"
          >
            <Copy size={11} /> Duplicate
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPanel({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [categoryFilter, setCategoryFilter] = useState<Template['category'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Template['status'] | 'all'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Template['category']>('marketing')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [improving, setImproving] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filtered = useMemo(() => templates.filter(t =>
    (categoryFilter === 'all' || t.category === categoryFilter) &&
    (statusFilter === 'all' || t.status === statusFilter)
  ), [templates, categoryFilter, statusFilter])

  function openNew() {
    setEditingTemplate(null)
    setName('')
    setCategory('marketing')
    setContent('')
    setShowAI(false)
    setEditorOpen(true)
  }

  function openEdit(t: Template) {
    setEditingTemplate(t)
    setName(t.name)
    setCategory(t.category)
    setContent(t.content)
    setShowAI(false)
    setEditorOpen(true)
  }

  async function duplicate(t: Template) {
    const { data, error } = await supabase
      .from('templates')
      .insert({ name: `${t.name} (copy)`, category: t.category, content: t.content, status: 'draft' })
      .select().single()
    if (!error && data) setTemplates(prev => [data as Template, ...prev])
  }

  function insertVariable(token: string) {
    const el = textareaRef.current
    if (!el) { setContent(prev => prev + token); return }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const next = content.slice(0, start) + token + content.slice(end)
    setContent(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    })
  }

  async function saveTemplate() {
    if (!name.trim() || !content.trim()) return
    setSaving(true)
    if (editingTemplate) {
      const { data, error } = await supabase
        .from('templates')
        .update({ name, category, content })
        .eq('id', editingTemplate.id)
        .select().single()
      setSaving(false)
      if (!error && data) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data as Template : t))
        setEditorOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('templates')
        .insert({ name, category, content, status: 'draft' })
        .select().single()
      setSaving(false)
      if (!error && data) {
        setTemplates(prev => [data as Template, ...prev])
        setEditorOpen(false)
      }
    }
  }

  async function generateWithAI() {
    setAiLoading(true)
    const res = await fetch('/api/generate-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        announcement: aiPrompt,
        tone: 'friendly',
        cta: '',
        audience: `${category} template for WhatsApp Business. Use {{1}}, {{2}}, {{3}} as numbered placeholders.`,
      }),
    })
    setAiLoading(false)
    if (res.ok) {
      const data = await res.json()
      setContent(data.message)
      setShowAI(false)
    }
  }

  async function improveWith(instruction: string) {
    if (!content.trim()) return
    setImproving(instruction)
    const res = await fetch('/api/generate-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        announcement: `Rewrite the following WhatsApp template message. Instruction: ${instruction}.\n\nOriginal:\n${content}`,
        tone: 'friendly',
        cta: '',
        audience: 'Keep numbered placeholders {{1}} {{2}} {{3}} where they appear.',
      }),
    })
    setImproving(null)
    if (res.ok) {
      const data = await res.json()
      setContent(data.message)
    }
  }

  const variablesUsed = Array.from(new Set((content.match(/\{\{\d+\}\}/g) || [])))
    .sort()

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Templates</h2>
          <p className="text-sm text-text-secondary max-w-lg">
            Create reusable WhatsApp templates for reminders, promotions, follow-ups, appointment confirmations, and more.
          </p>
        </div>
        <button
          onClick={openNew}
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-text-primary text-page hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-text-tertiary mr-1">Category</span>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value as typeof categoryFilter)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                categoryFilter === c.value
                  ? 'bg-text-primary text-page border-text-primary'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-text-tertiary mr-1">Status</span>
          {STATUSES.map(s => {
            const color = s.value !== 'all' ? STATUS_COLORS[s.value as Template['status']] : undefined
            const active = statusFilter === s.value
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value as typeof statusFilter)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
                style={active && color
                  ? { borderColor: color, color, backgroundColor: `${color}15` }
                  : active
                  ? { backgroundColor: 'var(--text-primary)', color: 'var(--page-bg)', borderColor: 'var(--text-primary)' }
                  : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                }
              >
                {s.value !== 'all' && STATUS_ICONS[s.value as Template['status']]} {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-sm text-text-tertiary mb-3">No templates yet.</p>
          <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-text-primary text-page hover:opacity-90 transition-opacity mx-auto">
            <Plus size={14} /> Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {filtered.map(t => (
            <TemplateCard key={t.id} template={t} onEdit={openEdit} onDuplicate={duplicate} />
          ))}
        </div>
      )}

      {/* How variables work — collapsible */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowGuide(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <span>How variables work</span>
          {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showGuide && (
          <div className="px-5 pb-5 border-t border-border">
            <p className="text-xs text-text-secondary leading-relaxed mt-4 mb-3">
              Meta templates use numbered placeholders in the order they appear. Each one gets swapped for a real value when sent.
            </p>
            <div className="bg-input rounded-xl p-4 text-sm text-text-secondary leading-relaxed">
              "Hi <span className="text-[#22c55e] font-semibold">{'{{1}}'}</span>, your inspection is confirmed for <span className="text-[#22c55e] font-semibold">{'{{2}}'}</span>. Engineer <span className="text-[#22c55e] font-semibold">{'{{3}}'}</span> will call before arriving."
            </div>
            <div className="flex flex-col gap-1 mt-3 text-xs text-text-tertiary">
              <p><span className="text-[#22c55e]">{'{{1}}'}</span> → Customer name</p>
              <p><span className="text-[#22c55e]">{'{{2}}'}</span> → Appointment time</p>
              <p><span className="text-[#22c55e]">{'{{3}}'}</span> → Engineer name</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor overlay */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm" onClick={() => setEditorOpen(false)}>
          <div
            className="ml-auto h-full w-full max-w-4xl bg-page border-l border-border flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Editor header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h3 className="text-sm font-semibold text-text-primary">
                {editingTemplate ? 'Edit template' : 'New template'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Editor body */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

                {/* Left — form */}
                <div className="p-6 flex flex-col gap-5 border-r border-border overflow-y-auto">

                  {/* Name + category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">Template name</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Appointment Reminder"
                        className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as Template['category'])}
                        className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-primary/30"
                      >
                        <option value="marketing">Marketing</option>
                        <option value="utility">Utility</option>
                        <option value="authentication">Authentication</option>
                      </select>
                    </div>
                  </div>

                  {/* AI generate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary">Message body</label>
                      <button
                        onClick={() => setShowAI(v => !v)}
                        className="flex items-center gap-1 text-xs font-medium text-[#22c55e] hover:opacity-80 transition-opacity"
                      >
                        <Sparkles size={11} /> Generate with AI
                      </button>
                    </div>

                    {showAI && (
                      <div className="bg-input border border-[#22c55e]/25 rounded-xl p-4 mb-3">
                        <p className="text-[11px] font-semibold text-text-primary mb-2">✨ Describe the template you need</p>
                        <textarea
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="e.g. A follow-up message for customers who booked a survey but haven't responded in 5 days"
                          rows={3}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none mb-3"
                        />
                        <button
                          onClick={generateWithAI}
                          disabled={!aiPrompt.trim() || aiLoading}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#22c55e] text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
                        >
                          <Sparkles size={11} /> {aiLoading ? 'Generating…' : 'Generate'}
                        </button>
                      </div>
                    )}

                    {/* Variable tokens */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] text-text-tertiary">Insert:</span>
                      {['{{1}}', '{{2}}', '{{3}}'].map(token => (
                        <button
                          key={token}
                          onClick={() => insertVariable(token)}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors"
                        >
                          {token}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder={"Hi {{1}}, this is a reminder for your site survey tomorrow at {{2}}…"}
                      rows={6}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-text-primary/30"
                    />
                  </div>

                  {/* Variables used */}
                  {variablesUsed.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-text-secondary mb-2">Variables used</p>
                      <div className="flex flex-col gap-1.5">
                        {variablesUsed.map((v, i) => (
                          <div key={v} className="flex items-center gap-3 text-xs">
                            <span className="font-mono text-[#22c55e] w-8">{v}</span>
                            <span className="text-text-tertiary">{VARIABLE_EXAMPLES[i] ? `e.g. "${VARIABLE_EXAMPLES[i]}"` : 'Custom value'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI improve */}
                  {content.trim() && (
                    <div>
                      <p className="text-xs font-medium text-text-secondary mb-2">✨ Improve with AI</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Make more conversational',
                          'Increase reply rate',
                          'Shorten message',
                          'Rewrite professionally',
                        ].map(suggestion => (
                          <button
                            key={suggestion}
                            onClick={() => improveWith(suggestion)}
                            disabled={!!improving}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors disabled:opacity-40 flex items-center gap-1"
                          >
                            {improving === suggestion ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : null}
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — live preview */}
                <div className="p-6 flex flex-col bg-input overflow-y-auto">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Live Preview</p>

                  {/* Phone mockup */}
                  <div className="flex-1 flex items-start justify-center">
                    <div className="w-full max-w-xs">
                      <div className="bg-[#0b141a] rounded-2xl overflow-hidden shadow-xl border border-white/10">
                        {/* Phone status bar */}
                        <div className="bg-[#202c33] px-4 py-2.5 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[10px] text-[#22c55e] font-bold">A</div>
                          <div>
                            <p className="text-[11px] font-semibold text-white leading-tight">{name || 'Template Preview'}</p>
                            <p className="text-[9px] text-white/40">WhatsApp Business</p>
                          </div>
                        </div>
                        {/* Chat area */}
                        <div className="bg-[#0b141a] p-4 min-h-[200px]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                          {content.trim() ? (
                            <div className="bg-[#202c33] rounded-xl rounded-tl-none px-3 py-2.5 max-w-[90%] shadow-sm">
                              <p className="text-sm text-[#e9edef] leading-relaxed whitespace-pre-wrap">
                                {renderPreview(content)}
                              </p>
                              <p className="text-[9px] text-white/35 text-right mt-1">12:00 PM ✓✓</p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-white/20 text-center mt-8">Start typing to see the preview…</p>
                          )}
                        </div>
                      </div>

                      <p className="text-[10px] text-text-tertiary text-center mt-3">
                        Variables replaced with example values
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 shrink-0 bg-page">
              <p className="text-[11px] text-text-tertiary">
                {editingTemplate ? 'Changes saved as draft until submitted to Meta.' : 'Saved as draft. Submit to Meta once WhatsApp is connected.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditorOpen(false)}
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={saving || !name.trim() || !content.trim()}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {saving ? 'Saving…' : <><Check size={14} /> {editingTemplate ? 'Save changes' : 'Save draft'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
