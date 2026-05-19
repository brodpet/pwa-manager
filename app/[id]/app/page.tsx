import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: site } = await supabase
    .from('sites')
    .select('name, icon_url')
    .eq('id', id)
    .single()

  return {
    title: site?.name ?? 'App',
    manifest: `/api/sites/${id}/manifest`,
  }
}

export default async function AppPage({ params }: Props) {
  const { id } = await params
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-slate-400">Site not found.</p>
      </div>
    )
  }

  return (
    <iframe
      src={site.url}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        margin: 0,
        padding: 0,
      }}
      allow="fullscreen"
      title={site.name}
    />
  )
}
