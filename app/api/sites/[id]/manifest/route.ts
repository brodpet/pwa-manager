import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  const manifest = {
    name: site.name,
    short_name: site.name,
    start_url: site.url,
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: site.icon_url
      ? [
          { src: site.icon_url, sizes: '192x192', type: 'image/png' },
          { src: site.icon_url, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  }

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
