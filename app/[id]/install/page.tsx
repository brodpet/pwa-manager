import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import InstallClient from './InstallClient'

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
    title: site ? `Install ${site.name}` : 'Install',
    manifest: `/api/sites/${id}/manifest`,
  }
}

export default async function InstallPage({ params }: Props) {
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

  return <InstallClient site={site} />
}
