import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const { leadId, chatId } = await request.json()

  if (!leadId || !chatId) {
    return NextResponse.json({ error: 'Missing leadId or chatId' }, { status: 400 })
  }

  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No conversation found for this lead' }, { status: 404 })
  }

  const conversationText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n')

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'You are a data extraction assistant. Extract information from the conversation and return ONLY a valid JSON object with no explanation, no markdown, no code blocks. Just the raw JSON.',
      messages: [
        {
          role: 'user',
          content: `Extract the following fields from this conversation and return as JSON only. Use null for any field not mentioned. Fields: name, phone, email, property_type (residential or commercial), location, electricity_spend, budget, timeline, decision_maker (true or false), score (0-100 based on: 25 points if property type known, 25 points if budget given, 25 points if timeline given, 25 points if decision maker confirmed), stage (hot if score above 70, warm if score 40 to 69, cold if below 40), summary (2 to 3 sentence summary for a sales rep). Conversation: ${conversationText}`,
        },
      ],
    }),
  })

  if (!claudeRes.ok) {
    const err = await claudeRes.text()
    return NextResponse.json({ error: `Claude API failed: ${err}` }, { status: 502 })
  }

  const claudeData = await claudeRes.json()
  const rawText = claudeData.content[0].text

  let extracted: Record<string, unknown> = {}
  try {
    extracted = JSON.parse(rawText)
  } catch {
    return NextResponse.json({ error: 'Could not parse extraction result' }, { status: 500 })
  }

  const { error } = await supabaseAdmin
    .from('leads')
    .update({
      name: extracted.name ?? null,
      phone: extracted.phone ?? null,
      email: extracted.email ?? null,
      property_type: extracted.property_type ?? null,
      location: extracted.location ?? null,
      electricity_spend: extracted.electricity_spend ?? null,
      budget: extracted.budget ?? null,
      timeline: extracted.timeline ?? null,
      decision_maker: extracted.decision_maker ?? null,
      score: extracted.score ?? 0,
      stage: extracted.stage ?? 'new',
      summary: extracted.summary ?? null,
    })
    .eq('id', leadId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, extracted })
}
