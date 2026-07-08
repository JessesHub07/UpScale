'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Send } from 'lucide-react'
import { Lead, Message } from '@/lib/type'

interface Props {
  lead: Lead
  transcript: Message[]
}

export default function ConversationPanel({ lead, transcript }: Props) {
  const router = useRouter()
  const [paused, setPaused] = useState(lead.ai_paused)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [messages, setMessages] = useState<Message[]>(transcript)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function deleteMessage(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id))
    await fetch('/api/delete-message', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: id }),
    })
  }

  useEffect(() => {
    if (paused) {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      inputRef.current?.focus()
    }
  }, [paused])

  async function toggleTakeover() {
    setToggling(true)
    const next = !paused
    await supabase.from('leads').update({ ai_paused: next }).eq('id', lead.id)
    setPaused(next)
    setToggling(false)
  }

  async function sendMessage() {
    if (!message.trim()) return
    setSending(true)
    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: lead.chat_id, leadId: lead.id, message }),
    })
    setSending(false)
    if (res.ok) {
      setMessage('')
      router.refresh()
      setMessages(prev => [...prev])
    }
  }

  return (
    <div className="float-in bg-surface border border-border rounded-xl flex flex-col" style={{ minHeight: '600px', animationDelay: '120ms' }}>
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-text-primary flex items-center justify-center shrink-0">
          <span className="text-page font-semibold text-sm">H</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Helen (AI)</p>
          <p className="text-xs text-text-tertiary capitalize">{lead.source} · {transcript.length} Messages</p>
        </div>
        {!paused && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot" />
            <span className="text-xs text-text-secondary">Active</span>
          </div>
        )}
        <button
          onClick={toggleTakeover}
          disabled={toggling}
          title={paused ? 'Hand the conversation back to Helen' : 'Pause Helen and message this lead yourself'}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
            paused
              ? 'bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#f59e0b]'
              : 'border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          {paused ? 'AI Paused — Resume' : 'Take Over'}
        </button>
      </div>

      <div className="chat-pattern flex-1 p-4 overflow-y-auto flex flex-col gap-2" style={{ backgroundColor: 'var(--chat-bg)' }}>
        {messages.length === 0 ? (
          <p className="text-xs text-text-tertiary text-center py-8">No messages yet.</p>
        ) : (
          messages.map((m, i) => {
            const isAssistant = m.role.trim() === 'assistant'
            const prevIsAssistant = i > 0 ? messages[i - 1].role.trim() === 'assistant' : null
            const showLabel = isAssistant !== prevIsAssistant
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isAssistant ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {showLabel && (
                  <span className="text-[10px] text-text-tertiary mb-0.5 px-1">
                    {isAssistant ? 'Helen (AI)' : lead.name || 'Customer'}
                  </span>
                )}
                <div className={`flex items-end gap-1.5 ${isAssistant ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      isAssistant ? 'rounded-tr-none' : 'rounded-tl-none'
                    }`}
                    style={{
                      backgroundColor: isAssistant ? 'var(--bubble-sent-bg)' : 'var(--bubble-received-bg)',
                      color: isAssistant ? 'var(--bubble-sent-text)' : 'var(--bubble-received-text)',
                    }}
                  >
                    <p>{m.content}</p>
                    <p className="text-[10px] mt-1 opacity-60 text-right">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {hoveredId === m.id && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      title="Delete message"
                      className="text-text-tertiary hover:text-red-400 transition-colors shrink-0 mb-1"
                      style={{ fontSize: 13 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {paused && (
        <div className="px-4 py-3 border-t border-border flex items-center gap-2 rounded-b-xl">
          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
            placeholder="Type a message as yourself…"
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !message.trim()}
            className="bg-text-primary text-page p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
