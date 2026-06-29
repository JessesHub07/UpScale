import { supabase } from '@/lib/supabase'
import { Lead, Template } from '@/lib/type'
import BroadcastTabs from '@/components/BroadcastTabs'

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  const { data: leadsData } = await supabase.from('leads').select('*').order('score', { ascending: false })
  const leads = (leadsData ?? []) as Lead[]

  const { data: templatesData } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })
  const templates = (templatesData ?? []) as Template[]

  return (
    <div className="min-h-screen bg-page p-8">
      <h1 className="text-xl font-semibold text-text-primary mb-1">Broadcast</h1>
      <p className="text-sm text-text-secondary mb-6">
        Reach a segment of leads with a single message. Useful for reactivation, seasonal offers, or announcements.
      </p>
      <BroadcastTabs leads={leads} templates={templates} />
    </div>
  )
}
