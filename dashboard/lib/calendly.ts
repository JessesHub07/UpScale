export interface CalendlyEvent {
  uri: string
  name: string
  start_time: string
  end_time: string
  location: { type: string; location?: string }
  invitee: { name: string; email: string; phone: string | null; address: string | null } | null
}

export async function getUpcomingCalendlyEvents(): Promise<CalendlyEvent[]> {
  const token = process.env.CALENDLY_API_TOKEN
  if (!token) return []

  const headers = { Authorization: `Bearer ${token}` }

  const userRes = await fetch('https://api.calendly.com/users/me', { headers, cache: 'no-store' })
  if (!userRes.ok) return []
  const userData = await userRes.json()
  const userUri = userData.resource.uri

  const params = new URLSearchParams({
    user: userUri,
    status: 'active',
    min_start_time: new Date().toISOString(),
    sort: 'start_time:asc',
  })

  const eventsRes = await fetch(`https://api.calendly.com/scheduled_events?${params}`, { headers, cache: 'no-store' })
  if (!eventsRes.ok) return []
  const eventsData = await eventsRes.json()
  const events = eventsData.collection ?? []

  const withInvitees = await Promise.all(
    events.map(async (e: { uri: string; name: string; start_time: string; end_time: string; location: { type: string; location?: string } }) => {
      const inviteesRes = await fetch(`${e.uri}/invitees`, { headers, cache: 'no-store' })
      const inviteesData = inviteesRes.ok ? await inviteesRes.json() : { collection: [] }
      const inviteeRaw = inviteesData.collection?.[0]

      const addressAnswer = inviteeRaw?.questions_and_answers?.find((qa: { question: string }) =>
        qa.question.toLowerCase().includes('address')
      )?.answer

      return {
        uri: e.uri,
        name: e.name,
        start_time: e.start_time,
        end_time: e.end_time,
        location: e.location,
        invitee: inviteeRaw
          ? {
              name: inviteeRaw.name,
              email: inviteeRaw.email,
              phone: inviteeRaw.text_reminder_number ?? null,
              address: addressAnswer ?? null,
            }
          : null,
      }
    })
  )

  return withInvitees
}
