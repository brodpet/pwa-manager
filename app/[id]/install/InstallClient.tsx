'use client'

import { useEffect, useState } from 'react'
import { Site } from '@/lib/types'

interface Props {
  site: Site
}

export default function InstallClient({ site }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [showManual, setShowManual] = useState(false)

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
    } else {
      setShowManual(true)
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

      <div className="bg-[#1e293b] rounded-xl p-6 max-w-sm w-full text-center border border-slate-700 flex flex-col gap-4">
        {installed ? (
          <p className="text-emerald-400 font-medium">✓ Installed successfully!</p>
        ) : (
          <>
            <button
              onClick={handleInstall}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Install as App
            </button>

            {showManual && (
              <div className="text-left text-sm text-slate-400 space-y-2 pt-2 border-t border-slate-700">
                <p className="text-white font-medium text-center mb-2">Install manually:</p>
                <p>📱 <strong className="text-white">Android Chrome:</strong> Tap ⋮ menu → "Add to Home Screen"</p>
                <p>🍎 <strong className="text-white">iPhone Safari:</strong> Tap Share → "Add to Home Screen"</p>
                <p>💻 <strong className="text-white">Desktop Chrome:</strong> Click ⊕ in address bar</p>
              </div>
            )}
          </>
        )}
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
