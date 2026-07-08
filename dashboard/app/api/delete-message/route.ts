import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(req: NextRequest) {
  const { messageId } = await req.json()
  if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 })

  const { error } = await supabase.from('messages').delete().eq('id', messageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
