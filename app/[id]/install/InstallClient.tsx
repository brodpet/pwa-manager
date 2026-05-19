'use client'

import { useEffect, useState } from 'react'
import { Site } from '@/lib/types'

interface Props {
  site: Site
}

export default function InstallClient({ site }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferredPrompt(null)
    }
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
        {installed ? (
          <p className="text-emerald-400 font-medium text-center">✓ Installed! Check your home screen.</p>
        ) : (
          <>
            <p className="text-white font-semibold text-center">Install {site.name} as App</p>

            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Install App
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <p className="text-slate-300 text-sm">Tap your browser menu</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div className="text-sm">
                    <p className="text-slate-400">📱 <strong className="text-slate-300">Android Chrome:</strong> Tap ⋮ → "Add to Home Screen"</p>
                    <p className="text-slate-400 mt-1">🍎 <strong className="text-slate-300">iPhone Safari:</strong> Tap Share → "Add to Home Screen"</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <p className="text-slate-300 text-sm">The app will open <strong className="text-white">{site.name}</strong> directly when launched</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
