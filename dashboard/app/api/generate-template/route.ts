import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { description, category, action, content: existingContent } = await req.json()

  let prompt: string

  if (action && existingContent) {
    const instructions: Record<string, string> = {
      conversational: 'Rewrite this to sound more natural and conversational, like a real person texting.',
      reply_rate: 'Rewrite this to increase reply rate — add a clear, easy-to-answer question at the end.',
      shorten: 'Shorten this message significantly while keeping the core message intact.',
      professional: 'Rewrite this to sound more professional and polished.',
    }
    prompt = `You are editing a messaging template. ${instructions[action] || 'Improve this template.'}

Keep any {{1}}, {{2}}, {{3}} placeholders exactly as they are.
Write ONLY the improved message, nothing else.

Original:
${existingContent}`
  } else {
    if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })
    prompt = `You are writing a short messaging template for a business.

Description of what this template should do: ${description}
Category: ${category || 'marketing'}

Rules:
- Use {{1}}, {{2}}, {{3}} as numbered placeholders for personalisation (e.g. {{1}} for recipient name, {{2}} for a date or time, {{3}} for another detail)
- Keep it under 200 characters if possible
- Do not use emojis unless they feel natural
- Do not mention any specific industry, product type, or business — keep it generic
- Write ONLY the message body, nothing else
- Do not add a subject line or label`
  }

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
