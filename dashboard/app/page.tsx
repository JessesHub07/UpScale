import { supabase } from '@/lib/supabase'
import LeadPipeline from '@/components/LeadPipeline'

export default async function Home() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return <div>Error loading leads</div>
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <LeadPipeline initialLeads={leads || []} />
    </main>
  )
}