'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Template } from '@/lib/type'
import { Plus, Info } from 'lucide-react'

interface Props {
  initialTemplates: Template[]
}

const STATUS_COLORS: Record<Template['status'], string> = {
  draft: '#6b7280',
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
}

export default function TemplatesPanel({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Template['category']>('marketing')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertVariable(token: string) {
    const el = textareaRef.current
    if (!el) {
      setContent(prev => prev + token)
      return
    }
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
    const { data, error } = await supabase
      .from('templates')
      .insert({ name, category, content, status: 'draft' })
      .select()
      .single()
    setSaving(false)
    if (!error && data) {
      setTemplates(prev => [data as Template, ...prev])
      setName('')
      setContent('')
      setShowForm(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-input border border-border rounded-xl p-4 mb-4 flex items-start gap-3">
        <Info size={16} className="text-text-secondary mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          WhatsApp isn't connected yet, so templates created here are saved as drafts only. Once WhatsApp Business
          API is live, drafts can be submitted to Meta for approval directly from here, no need to touch Meta's own
          dashboard.
        </p>
      </div>

      {/* Variable guide */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-1">What do {'{{1}}'}, {'{{2}}'} mean?</h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Meta templates use numbered placeholders, in the order they appear, each one gets swapped for a real value
          when the message is actually sent to a specific lead. You decide what each number means by how you write
          the template, Meta doesn't assign meaning, you do.
        </p>
        <div className="bg-input rounded-lg p-3 mb-3">
          <p className="text-[11px] text-text-tertiary mb-1">Example template</p>
          <p className="text-sm text-text-primary leading-relaxed mb-2">
            &quot;Hi <span className="text-[#22c55e] font-medium">{'{{1}}'}</span>, this is a reminder for your site survey tomorrow at <span className="text-[#22c55e] font-medium">{'{{2}}'}</span>. Our engineer <span className="text-[#22c55e] font-medium">{'{{3}}'}</span> will call before arriving.&quot;
          </p>
          <div className="flex flex-col gap-1 text-[11px] text-text-secondary">
            <p><span className="text-[#22c55e] font-medium">{'{{1}}'}</span> → the lead&apos;s name (e.g. &quot;Priya&quot;)</p>
            <p><span className="text-[#22c55e] font-medium">{'{{2}}'}</span> → the appointment time (e.g. &quot;10:00 AM&quot;)</p>
            <p><span className="text-[#22c55e] font-medium">{'{{3}}'}</span> → the engineer&apos;s name (e.g. &quot;Daniel&quot;)</p>
          </div>
        </div>
        <p className="text-[11px] text-text-tertiary">
          When this actually sends, our system fills in {'{{1}}'}, {'{{2}}'}, {'{{3}}'} per recipient automatically,
          using whatever data is stored for that lead, nobody fills these in by hand per message.
        </p>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity mb-6"
        >
          <Plus size={14} /> New Template
        </button>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">New template</h3>

          <label className="text-xs font-medium text-text-secondary block mb-1.5">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. New Product Announcement"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary mb-4 focus:outline-none focus:border-text-primary/30"
          />

          <label className="text-xs font-medium text-text-secondary block mb-1.5">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Template['category'])}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary mb-4 focus:outline-none focus:border-text-primary/30"
          >
            <option value="marketing">Marketing</option>
            <option value="utility">Utility</option>
            <option value="authentication">Authentication</option>
          </select>

          <label className="text-xs font-medium text-text-secondary block mb-1.5">Message</label>
          <div className="flex items-center gap-1.5 mb-2">
            {['{{1}}', '{{2}}', '{{3}}'].map(token => (
              <button
                key={token}
                type="button"
                onClick={() => insertVariable(token)}
                className="text-[11px] font-medium px-2 py-1 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors"
              >
                {token}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Hi {{1}}, we just added a new product you might be interested in…"
            rows={3}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none mb-1.5 focus:outline-none focus:border-text-primary/30"
          />
          <p className="text-[11px] text-text-tertiary mb-4">
            Click a variable above to insert it at your cursor, then assign it meaning by where you place it, see the
            guide above for an example.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              disabled={saving || !name.trim() || !content.trim()}
              className="flex-1 text-sm font-medium px-3 py-2 rounded-lg bg-text-primary text-page hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {templates.length === 0 ? (
          <p className="text-xs text-text-tertiary text-center py-8">No templates yet.</p>
        ) : (
          templates.map(t => (
            <div key={t.id} className="card-hover bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: STATUS_COLORS[t.status], backgroundColor: `${STATUS_COLORS[t.status]}18` }}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-text-tertiary capitalize mb-2">{t.category}</p>
              <p className="text-sm text-text-secondary leading-relaxed">{t.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
