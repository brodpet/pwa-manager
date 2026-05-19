'use client'

import { Site } from '@/lib/types'

interface Props {
  site: Site
}

export default function InstallClient({ site }: Props) {
  function openSite() {
    window.location.href = site.url
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 px-4">
      {site.icon_url && (
        <img src={site.icon_url} alt={site.name} className="w-24 h-24 rounded-3xl shadow-2xl" />
      )}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{site.name}</h1>
        <p className="text-slate-400 mt-1 text-sm">{site.url}</p>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-6 max-w-sm w-full flex flex-col gap-4 border border-slate-700">
        <p className="text-white font-semibold text-center">How to install</p>

        {/* Step 1 */}
        <div className="flex gap-3 items-start">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <div>
            <p className="text-white text-sm font-medium">Open the website</p>
            <p className="text-slate-400 text-xs mt-0.5">Tap the button below to go to {site.name}</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3 items-start">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
          <div>
            <p className="text-white text-sm font-medium">Install from browser menu</p>
            <p className="text-slate-400 text-xs mt-0.5">
              📱 <strong className="text-slate-300">Android:</strong> Tap ⋮ → "Add to Home Screen"
            </p>
            <p className="text-slate-400 text-xs mt-1">
              🍎 <strong className="text-slate-300">iPhone:</strong> Tap Share → "Add to Home Screen"
            </p>
            <p className="text-slate-400 text-xs mt-1">
              💻 <strong className="text-slate-300">Desktop:</strong> Click ⊕ in address bar
            </p>
          </div>
        </div>

        <button
          onClick={openSite}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base hover:opacity-90 transition-opacity mt-2"
        >
          Open {site.name} →
        </button>
      </div>
    </div>
  )
}
