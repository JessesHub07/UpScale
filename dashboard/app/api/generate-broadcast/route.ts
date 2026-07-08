import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { announcement, tone, cta, audience } = await req.json()
  if (!announcement) return NextResponse.json({ error: 'announcement required' }, { status: 400 })

  const toneMap: Record<string, string> = {
    friendly: 'warm, conversational, and approachable',
    professional: 'professional and confident',
    urgent: 'urgent and direct with a clear call to action',
  }

  const prompt = `You are writing a short WhatsApp or Telegram broadcast message for a business.

Context:
- Announcement: ${announcement}
- Audience: ${audience || 'existing leads'}
- Tone: ${toneMap[tone] || 'friendly'}
- CTA: ${cta || 'get in touch'}

Rules:
- Keep it under 160 characters if possible, 200 max
- No emojis unless they feel natural
- Use {{first_name}} at the start if appropriate
- Do not include a subject line
- Write ONLY the message body, nothing else`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  return NextResponse.json({ message: text })
}
