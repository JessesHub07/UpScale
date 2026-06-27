export interface Lead {
  id: string
  chat_id: string
  name: string | null
  phone: string | null
  email: string | null
  property_type: string | null
  location: string | null
  electricity_spend: string | null
  budget: string | null
  timeline: string | null
  decision_maker: boolean | null
  score: number
  stage: string
  summary: string | null
  source: string
  urgent: boolean
  handed_off: boolean
  notes: string | null
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
  updated_at: string | null
}

export interface Message {
  id: string
  lead_id: string | null
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  channel: string
  created_at: string
}
