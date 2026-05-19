'use client'

import { useEffect } from 'react'
import { Site } from '@/lib/types'

interface Props {
  site: Site
}

export default function InstallClient({ site }: Props) {
  useEffect(() => {
    window.open(site.url, '_blank')
  }, [site.url])

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 px-4">
      {site.icon_url && (
        <img src={site.icon_url} alt={site.name} className="w-24 h-24 rounded-3xl shadow-2xl" />
      )}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{site.name}</h1>
        <p className="text-slate-400 mt-1 text-sm">{site.url}</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl p-6 max-w-sm w-full text-center border border-slate-700">
        <p className="text-white font-medium mb-2">Install as App</p>
        <p className="text-slate-400 text-sm">
          Look for the <strong className="text-white">"Add to Home Screen"</strong> or{' '}
          <strong className="text-white">"Install App"</strong> option in your browser menu to install this site.
        </p>
      </div>
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-400 hover:text-white transition-colors underline"
      >
        Open {site.name} directly →
      </a>
    </div>
  )
}
