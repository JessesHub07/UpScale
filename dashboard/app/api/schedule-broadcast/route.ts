import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const { stages, minScore, urgentOnly, search, channel, message, sendAt } = await request.json()

  if (!message?.trim() || !Array.isArray(stages) || stages.length === 0 || !sendAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('scheduled_broadcasts').insert({
    stages,
    min_score: minScore ?? 0,
    urgent_only: urgentOnly ?? false,
    search: search || null,
    channel: channel || 'telegram',
    message,
    send_at: sendAt,
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
