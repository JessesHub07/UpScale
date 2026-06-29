import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Recipient {
  leadId: string
  chatId: string
}

export async function POST(request: NextRequest) {
  const { recipients, message } = await request.json() as { recipients: Recipient[]; message: string }

  if (!message?.trim() || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: 'Missing message or recipients' }, { status: 400 })
  }

  let sent = 0
  let failed = 0

  for (const r of recipients) {
    if (!r.chatId || r.chatId.startsWith('manual-')) {
      failed++
      continue
    }

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: r.chatId, text: message }),
      }
    )

    if (telegramRes.ok) {
      sent++
      await supabaseAdmin.from('messages').insert({
        chat_id: r.chatId,
        lead_id: r.leadId,
        role: 'assistant',
        content: message,
        channel: 'telegram',
      })
    } else {
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: recipients.length })
}
