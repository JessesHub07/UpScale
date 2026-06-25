import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, phone, email, property_type, location, message } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }

  const chatId = `web-${crypto.randomUUID()}`

  const { error } = await supabase.from('leads').insert({
    chat_id: chatId,
    name,
    phone,
    email: email || null,
    property_type: property_type || null,
    location: location || null,
    source: 'web_form',
    stage: 'new',
    score: 0,
    notes: message ? `Initial message from web form: "${message}"` : null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
