'use client'

import { Site } from '@/lib/types'

interface SiteCardProps {
  site: Site
  onEdit: (site: Site) => void
  onDelete: (id: string) => void
  onDuplicate: (site: Site) => void
}

export default function SiteCard({ site, onEdit, onDelete, onDuplicate }: SiteCardProps) {
  const installUrl = `${window.location.origin}/${site.id}/install`

  function handleOpenInstall() {
    window.open(installUrl, '_blank')
  }

  function handleShareLink() {
    navigator.clipboard.writeText(installUrl)
  }

  function handleExternalLink() {
    window.open(site.url, '_blank')
  }

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-4 border border-slate-700/50">
      {/* Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group">
          {site.icon_url ? (
            <img
              src={site.icon_url}
              alt={site.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-400">
              {site.name[0].toUpperCase()}
            </div>
          )}
          <button
            onClick={() => onEdit(site)}
            className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium"
          >
            Replace icon
          </button>
        </div>

        {/* LIVE badge */}
        <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          LIVE
        </span>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="font-semibold text-white text-sm">{site.name}</p>
        <p className="text-slate-400 text-xs mt-0.5 truncate">{new URL(site.url).hostname}</p>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleOpenInstall}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-sm font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Open &amp; Install
        </button>
        <button
          onClick={handleShareLink}
          className="w-full py-2 rounded-lg bg-slate-700 text-sm text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Install Link
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleExternalLink}
          className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center"
          title="Open site"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <button
          onClick={() => onDuplicate(site)}
          className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center"
          title="Duplicate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(site.id)}
          className="flex-1 py-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
