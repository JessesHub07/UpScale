'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

export default function DeleteLeadButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('leads').delete().eq('id', leadId)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-text-secondary hover:text-[#ef4444] transition-colors text-sm bg-input hover:bg-[#ef4444]/10 rounded-lg px-2.5 py-1.5"
      >
        <Trash2 size={14} />
        Delete
      </button>

      {confirming && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-text-primary mb-2">Delete this lead?</h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-5">
              This permanently removes <span className="text-text-primary font-medium">{leadName || 'this lead'}</span>
              {' '}and their full conversation history. This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
