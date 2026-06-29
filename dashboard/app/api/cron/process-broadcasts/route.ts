import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data: due } = await supabaseAdmin
    .from('scheduled_broadcasts')
    .select('*')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())

  if (!due || due.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  for (const broadcast of due) {
    let query = supabaseAdmin.from('leads').select('id, chat_id, name, score, urgent').in('stage', broadcast.stages)
    if (broadcast.min_score) query = query.gte('score', broadcast.min_score)
    if (broadcast.urgent_only) query = query.eq('urgent', true)

    const { data: matchedLeads } = await query
    let leads = matchedLeads ?? []

    if (broadcast.search) {
      const q = broadcast.search.toLowerCase()
      leads = leads.filter(l => (l.name || '').toLowerCase().includes(q))
    }

    let sent = 0
    let failed = 0

    for (const lead of leads) {
      if (!lead.chat_id || lead.chat_id.startsWith('manual-')) {
        failed++
        continue
      }
      const telegramRes = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: lead.chat_id, text: broadcast.message }),
        }
      )
      if (telegramRes.ok) {
        sent++
        await supabaseAdmin.from('messages').insert({
          chat_id: lead.chat_id,
          lead_id: lead.id,
          role: 'assistant',
          content: broadcast.message,
          channel: 'telegram',
        })
      } else {
        failed++
      }
    }

    await supabaseAdmin
      .from('scheduled_broadcasts')
      .update({ status: 'sent', sent_count: sent, failed_count: failed })
      .eq('id', broadcast.id)
  }

  return NextResponse.json({ processed: due.length })
}
