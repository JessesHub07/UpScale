import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const { chatId, leadId, message } = await request.json()

  if (!chatId || !message) {
    return NextResponse.json({ error: 'Missing chatId or message' }, { status: 400 })
  }

  const telegramRes = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    }
  )

  if (!telegramRes.ok) {
    const err = await telegramRes.text()
    return NextResponse.json({ error: `Telegram send failed: ${err}` }, { status: 502 })
  }

  await supabaseAdmin.from('messages').insert({
    chat_id: chatId,
    lead_id: leadId ?? null,
    role: 'assistant',
    content: message,
    channel: 'telegram',
  })

  return NextResponse.json({ success: true })
}
