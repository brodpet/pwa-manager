# PWA Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Next.js PWA manager dashboard that stores multiple websites in Supabase and lets you install each as its own PWA from any device.

**Architecture:** Next.js 14 App Router with Tailwind CSS for the UI; Supabase (anon key, no auth) as the hosted database; each website gets a dynamic `/[id]/install` page with its own generated `manifest.json` so the browser's "Add to Home Screen" prompt fires per-site.

**Tech Stack:** Next.js 14, Tailwind CSS, Supabase JS client v2, TypeScript, Vercel deployment

---

## File Map

```
app/
  page.tsx                          # Dashboard page
  layout.tsx                        # Root layout (dark bg, metadata)
  [id]/install/page.tsx             # Per-site install page
  api/
    sites/route.ts                  # GET all, POST new
    sites/[id]/route.ts             # PATCH, DELETE
    sites/[id]/manifest/route.ts    # Dynamic PWA manifest
    favicon/route.ts                # Favicon proxy
components/
  SiteCard.tsx                      # Individual site card
  AddSiteModal.tsx                  # Add/edit site modal
  SearchBar.tsx                     # Search input
lib/
  supabase.ts                       # Supabase client singleton
  types.ts                          # Shared TypeScript types
public/
  manifest.json                     # App-level PWA manifest
  icons/icon-192.png                # App icon placeholders
  icons/icon-512.png
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.ts`
- Create: `.env.local` (gitignored)
- Create: `.gitignore`

- [ ] **Step 1: Scaffold Next.js project**

Run inside `c:\Users\BRODPET\BRODPETCODE\PWA.v2`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*" --no-git
```
Answer prompts: Yes to TypeScript, Yes to Tailwind, Yes to ESLint, Yes to App Router, No to src/ dir.

- [ ] **Step 2: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 3: Create .env.local**

Create `c:\Users\BRODPET\BRODPETCODE\PWA.v2\.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
(Fill in real values from your Supabase project dashboard → Settings → API)

- [ ] **Step 4: Add .env.local to .gitignore**

Open `.gitignore` and confirm `.env.local` is listed (create-next-app adds it by default).

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: Server running at `http://localhost:3000` with default Next.js page.

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Next.js project with Tailwind and Supabase"
```

---

## Task 2: Supabase Setup

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/types.ts`

- [ ] **Step 1: Create Supabase table**

In your Supabase dashboard → SQL Editor, run:
```sql
create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  icon_url text,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 2: Create Supabase client**

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Create shared types**

Create `lib/types.ts`:
```typescript
export interface Site {
  id: string
  name: string
  url: string
  icon_url: string | null
  created_at: string
}

export interface CreateSiteInput {
  name: string
  url: string
  icon_url?: string | null
}

export interface UpdateSiteInput {
  name?: string
  url?: string
  icon_url?: string | null
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase.ts lib/types.ts
git commit -m "feat: add Supabase client and shared types"
```

---

## Task 3: API Routes

**Files:**
- Create: `app/api/sites/route.ts`
- Create: `app/api/sites/[id]/route.ts`
- Create: `app/api/sites/[id]/manifest/route.ts`
- Create: `app/api/favicon/route.ts`

- [ ] **Step 1: Create GET all / POST new sites route**

Create `app/api/sites/route.ts`:
```typescript
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
```

- [ ] **Step 2: Create PATCH / DELETE single site route**

Create `app/api/sites/[id]/route.ts`:
```typescript
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
```

- [ ] **Step 3: Create dynamic manifest route**

Create `app/api/sites/[id]/manifest/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  const manifest = {
    name: site.name,
    short_name: site.name,
    start_url: site.url,
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: site.icon_url
      ? [
          { src: site.icon_url, sizes: '192x192', type: 'image/png' },
          { src: site.icon_url, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  }

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
```

- [ ] **Step 4: Create favicon proxy route**

Create `app/api/favicon/route.ts`:
```typescript
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
```

- [ ] **Step 5: Smoke-test routes in browser**

Start dev server (`npm run dev`) and open:
- `http://localhost:3000/api/sites` → should return `[]` (empty array)

- [ ] **Step 6: Commit**

```bash
git add app/api
git commit -m "feat: add sites CRUD, manifest, and favicon API routes"
```

---

## Task 4: Root Layout + Global Styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `public/manifest.json`

- [ ] **Step 1: Update root layout**

Replace `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PWA Manager',
  description: 'Manage your sites and generate PWA packages',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f172a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update globals.css**

Replace `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}
```

- [ ] **Step 3: Create app-level manifest**

Create `public/manifest.json`:
```json
{
  "name": "PWA Manager",
  "short_name": "PWA Manager",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Add placeholder icons**

Create `public/icons/` directory. For now, add any 192x192 and 512x512 PNG files named `icon-192.png` and `icon-512.png`. You can replace these with real icons later.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css public/
git commit -m "feat: root layout, global styles, app-level PWA manifest"
```

---

## Task 5: Shared Components — SearchBar

**Files:**
- Create: `components/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar component**

Create `components/SearchBar.tsx`:
```typescript
'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search your sites..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SearchBar.tsx
git commit -m "feat: add SearchBar component"
```

---

## Task 6: Shared Components — AddSiteModal

**Files:**
- Create: `components/AddSiteModal.tsx`

- [ ] **Step 1: Create AddSiteModal component**

Create `components/AddSiteModal.tsx`:
```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add components/AddSiteModal.tsx
git commit -m "feat: add AddSiteModal component with favicon auto-fetch"
```

---

## Task 7: Shared Components — SiteCard

**Files:**
- Create: `components/SiteCard.tsx`

- [ ] **Step 1: Create SiteCard component**

Create `components/SiteCard.tsx`:
```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add components/SiteCard.tsx
git commit -m "feat: add SiteCard component"
```

---

## Task 8: Dashboard Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Build dashboard page**

Replace `app/page.tsx`:
```typescript
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
```

- [ ] **Step 2: Test the full dashboard**

```bash
npm run dev
```
Open `http://localhost:3000`. You should see the dark dashboard. Click "+ Add Site", enter a URL, verify favicon auto-fetches, save. The card should appear.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build dashboard page with site grid, search, and modal"
```

---

## Task 9: Install Page

**Files:**
- Create: `app/[id]/install/page.tsx`

- [ ] **Step 1: Create install page**

Create `app/[id]/install/page.tsx`:
```typescript
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import InstallClient from './InstallClient'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: site } = await supabase
    .from('sites')
    .select('name, icon_url')
    .eq('id', params.id)
    .single()

  return {
    title: site ? `Install ${site.name}` : 'Install',
    manifest: `/api/sites/${params.id}/manifest`,
  }
}

export default async function InstallPage({ params }: Props) {
  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!site) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-slate-400">Site not found.</p>
      </div>
    )
  }

  return <InstallClient site={site} />
}
```

- [ ] **Step 2: Create InstallClient component**

Create `app/[id]/install/InstallClient.tsx`:
```typescript
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
```

- [ ] **Step 3: Test install page**

Add a site via the dashboard, then open `http://localhost:3000/<id>/install`. The site should open in a new tab and the install page should render with the site's icon and name.

- [ ] **Step 4: Commit**

```bash
git add app/[id]/
git commit -m "feat: add per-site install page with dynamic manifest"
```

---

## Task 10: Deploy to Vercel

**Files:** None — configuration only

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/pwa-manager.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Import project in Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: Next.js (auto-detected)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click Deploy

- [ ] **Step 3: Verify production deploy**

Open your Vercel URL. Add a site, verify it saves (Supabase), open the install page from a mobile device, try "Add to Home Screen".

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: production-ready PWA manager"
git push
```

---

## Spec Coverage Check

| Spec requirement | Covered by |
|---|---|
| Dashboard with site grid | Task 8 |
| Search bar | Task 5, 8 |
| Site count badge | Task 8 |
| Add Site button + modal | Task 6, 8 |
| Site card (icon, LIVE badge, name, URL) | Task 7 |
| Open & Install button | Task 7, 9 |
| Share Install Link (copy to clipboard) | Task 7 |
| External link, duplicate, delete actions | Task 7, 8 |
| Replace icon (edit modal) | Task 6, 7 |
| Dynamic manifest per site | Task 3 |
| Favicon auto-fetch | Task 3, 6 |
| Supabase CRUD | Task 2, 3 |
| App-level PWA manifest | Task 4 |
| Dark navy theme | Task 4, 5, 6, 7, 8, 9 |
| Vercel deployment | Task 10 |
