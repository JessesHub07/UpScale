import { getUpcomingCalendlyEvents } from '@/lib/calendly'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/lib/type'
import CalendarView from '@/components/CalendarView'

export const dynamic = 'force-dynamic'

function normalizePhone(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-10) // compare last 10 digits to dodge country code formatting differences
}

export default async function CalendarPage() {
  const events = await getUpcomingCalendlyEvents()
  const { data: leadsData } = await supabase.from('leads').select('id, name, phone, score')
  const leads = (leadsData ?? []) as Pick<Lead, 'id' | 'name' | 'phone' | 'score'>[]

  const phoneToLead = new Map<string, { id: string; score: number }>()
  leads.forEach(l => {
    const key = normalizePhone(l.phone)
    if (key) phoneToLead.set(key, { id: l.id, score: l.score })
  })

  const matchedEvents = events.map(e => {
    const key = normalizePhone(e.invitee?.phone)
    const match = key ? phoneToLead.get(key) : undefined
    return { ...e, leadId: match?.id ?? null, leadScore: match?.score ?? null }
  })

  return (
    <div className="min-h-screen bg-page p-8">
      <h1 className="text-xl font-semibold text-text-primary mb-1">Calendar</h1>
      <p className="text-sm text-text-secondary mb-6">Upcoming site surveys booked through Helen.</p>

      <CalendarView events={matchedEvents} />
    </div>
  )
}
