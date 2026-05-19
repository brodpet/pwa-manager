import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateSiteInput } from '@/lib/types'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body: UpdateSiteInput = await request.json()

  const { data, error } = await supabase
    .from('sites')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
