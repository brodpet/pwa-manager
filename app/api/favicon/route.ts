import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 })
  }

  try {
    const domain = new URL(url).hostname
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    return NextResponse.json({ icon_url: faviconUrl })
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
}
