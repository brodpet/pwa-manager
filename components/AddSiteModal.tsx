'use client'

import { useState, useEffect } from 'react'
import { Site, CreateSiteInput } from '@/lib/types'

interface AddSiteModalProps {
  open: boolean
  editingSite: Site | null
  onClose: () => void
  onSave: (input: CreateSiteInput, id?: string) => Promise<void>
}

export default function AddSiteModal({ open, editingSite, onClose, onSave }: AddSiteModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingFavicon, setFetchingFavicon] = useState(false)

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name)
      setUrl(editingSite.url)
      setIconUrl(editingSite.icon_url ?? '')
    } else {
      setName('')
      setUrl('')
      setIconUrl('')
    }
  }, [editingSite, open])

  async function handleUrlBlur() {
    if (!url || iconUrl) return
    setFetchingFavicon(true)
    try {
      const res = await fetch(`/api/favicon?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        setIconUrl(data.icon_url)
        if (!name) {
          setName(new URL(url).hostname.replace('www.', ''))
        }
      }
    } catch {
      // ignore favicon fetch failure
    } finally {
      setFetchingFavicon(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSave(
      { name, url, icon_url: iconUrl || null },
      editingSite?.id
    )
    setLoading(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">
          {editingSite ? 'Edit Site' : 'Add Site'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">URL</label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="Site name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Icon URL {fetchingFavicon && <span className="text-slate-500 text-xs">(fetching...)</span>}
            </label>
            {iconUrl && (
              <img src={iconUrl} alt="icon preview" className="w-10 h-10 rounded-lg mb-2 object-cover" />
            )}
            <input
              type="url"
              placeholder="https://... (auto-fetched from URL)"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
