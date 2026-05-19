import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateSiteInput } from '@/lib/types'

export async function GET() {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body: CreateSiteInput = await request.json()

  if (!body.name || !body.url) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sites')
    .insert({ name: body.name, url: body.url, icon_url: body.icon_url ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
