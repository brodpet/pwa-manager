'use client'

import { useEffect, useState } from 'react'
import { Site, CreateSiteInput } from '@/lib/types'
import SiteCard from '@/components/SiteCard'
import AddSiteModal from '@/components/AddSiteModal'
import SearchBar from '@/components/SearchBar'

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sites')
      .then((r) => r.json())
      .then((data) => setSites(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.url.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave(input: CreateSiteInput, id?: string) {
    if (id) {
      const res = await fetch(`/api/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const updated: Site = await res.json()
      setSites((prev) => prev.map((s) => (s.id === id ? updated : s)))
    } else {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const created: Site = await res.json()
      setSites((prev) => [created, ...prev])
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this site?')) return
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    setSites((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleDuplicate(site: Site) {
    await handleSave({
      name: `${site.name} (copy)`,
      url: site.url,
      icon_url: site.icon_url,
    })
  }

  function handleEdit(site: Site) {
    setEditingSite(site)
    setModalOpen(true)
  }

  function handleAdd() {
    setEditingSite(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-semibold text-white">
              Hello, Frenz <span>👋</span>
            </h1>
            <p className="text-xs text-slate-400">Manage your sites and generate PWA packages</p>
          </div>

          <div className="flex-1 flex justify-center">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm text-white">
                <span className="text-emerald-400">⬡</span> {sites.length} / ∞{' '}
                <span className="text-slate-400 text-xs">sites used</span>
              </p>
              <p className="text-xs text-emerald-400">Unlimited sites</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-sm font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              + Add Site
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-sm">
              {search ? 'No sites match your search.' : 'No sites yet. Add one to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </main>

      <AddSiteModal
        open={modalOpen}
        editingSite={editingSite}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
