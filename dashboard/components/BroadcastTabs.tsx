'use client'

import { useState } from 'react'
import { Lead, Template } from '@/lib/type'
import BroadcastForm from './BroadcastForm'
import TemplatesPanel from './TemplatesPanel'
import { Send, FileText } from 'lucide-react'

interface Props {
  leads: Lead[]
  templates: Template[]
}

export default function BroadcastTabs({ leads, templates }: Props) {
  const [tab, setTab] = useState<'send' | 'templates'>('send')

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab('send')}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            tab === 'send' ? 'bg-text-primary text-page border-text-primary' : 'border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Send size={14} /> Compose
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            tab === 'templates' ? 'bg-text-primary text-page border-text-primary' : 'border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText size={14} /> Templates {templates.length > 0 && `(${templates.length})`}
        </button>
      </div>

      {tab === 'send' ? (
        <BroadcastForm leads={leads} />
      ) : (
        <TemplatesPanel initialTemplates={templates} />
      )}
    </div>
  )
}
