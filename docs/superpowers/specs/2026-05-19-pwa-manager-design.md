# PWA Manager — Design Spec
**Date:** 2026-05-19  
**Status:** Approved

---

## Overview

A personal Next.js web app that acts as a dashboard for managing multiple websites. Each website can be launched and installed as its own PWA (Progressive Web App) on any device. Data is stored in Supabase (hosted Postgres) so the site list is accessible from any device, even when the home PC is off. The app is deployed to Vercel.

**Scope:** Personal use only. No multi-user auth required.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | Full-stack, easy Vercel deploy |
| Database | Supabase (free tier) | Hosted, multi-device, no server to run |
| Deployment | Vercel | Free, auto-deploy from GitHub |
| Styling | Tailwind CSS | Dark theme, fast to build |

---

## Data Model

### Supabase table: `sites`

| column | type | nullable | notes |
|---|---|---|---|
| id | uuid | no | primary key, default `gen_random_uuid()` |
| name | text | no | display name e.g. "onlinejobs.ph" |
| url | text | no | full URL e.g. "https://onlinejobs.ph" |
| icon_url | text | yes | uploaded icon URL or auto-fetched favicon |
| created_at | timestamptz | no | default `now()` |

No auth, no user_id — single-user personal app.

---

## Routes & Pages

### `/` — Dashboard
- Greeting header: "Hello, Frenz 👋"
- Subtitle: "Manage your sites and generate PWA packages"
- Search bar (filters site cards client-side)
- Site count badge (e.g. "2 / ∞ sites used")
- "+ Add Site" button (opens modal)
- Grid of site cards

### `/[id]/install` — Install Page
- Dynamically generated per site
- Serves a `manifest.json` with that site's name, icon, `start_url`
- Auto-opens the site URL in a new tab
- Browser's "Add to Home Screen" prompt triggers from this page
- This is what "Open & Install" links to

### API Routes

| Method | Route | Action |
|---|---|---|
| GET | `/api/sites` | Fetch all sites |
| POST | `/api/sites` | Create new site |
| PATCH | `/api/sites/[id]` | Update site (name, url, icon_url) |
| DELETE | `/api/sites/[id]` | Delete site |
| GET | `/api/sites/[id]/manifest` | Return dynamic PWA manifest JSON |
| GET | `/api/favicon` | Proxy fetch favicon for a given URL |

---

## UI Components

### Layout
- Background: `#0f172a` (dark navy)
- Full-width header bar, content area below

### Header
- Left: greeting text + subtitle
- Center: search input (placeholder "Search your sites...")
- Right: site count badge + "+ Add Site" button (coral/orange)

### Site Card
- Dark card background (`#1e293b`)
- Site icon (square, rounded corners) — with "Replace icon" button overlay on hover
- "LIVE" green badge
- Site name (bold, white)
- URL (muted gray, smaller)
- "Open & Install" button — full width, coral/orange gradient
- "Share Install Link" button — full width, dark
- Action row: external link icon | duplicate icon | delete icon

### Add / Edit Modal
- Fields: Site Name, URL
- Icon: auto-fetch favicon from URL, or upload custom image
- Save / Cancel buttons

---

## PWA Install Mechanic

Each site at `/[id]/install`:
1. Renders a minimal page with a `<link rel="manifest">` pointing to `/api/sites/[id]/manifest`
2. The manifest includes:
   - `name` — site name
   - `start_url` — the site's URL
   - `icons` — site's icon_url
   - `display: "standalone"`
   - `background_color` + `theme_color`
3. On page load, JS opens the site URL in a new tab
4. Browser detects the manifest and offers "Add to Home Screen"

**"Open & Install" button** → opens `/[id]/install` in a new tab.

**"Share Install Link"** → copies the `/[id]/install` URL to clipboard.

---

## Favicon Auto-Fetch

When user enters a URL in the Add Site modal:
- Front-end calls `/api/favicon?url=<encoded-url>`
- API fetches `https://www.google.com/s2/favicons?domain=<domain>&sz=128` as a proxy
- Returns the favicon image URL
- Pre-fills the icon field — user can override with a custom upload

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both are public (anon key) — acceptable since there's no sensitive data and no auth.

---

## File Structure

```
PWA.v2/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── [id]/
│   │   └── install/
│   │       └── page.tsx          # Install page per site
│   └── api/
│       ├── sites/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/
│       │       ├── route.ts      # PATCH, DELETE
│       │       └── manifest/
│       │           └── route.ts  # Dynamic manifest.json
│       └── favicon/
│           └── route.ts          # Favicon proxy
├── components/
│   ├── SiteCard.tsx
│   ├── AddSiteModal.tsx
│   └── SearchBar.tsx
├── lib/
│   └── supabase.ts               # Supabase client
├── public/
│   ├── manifest.json             # App-level PWA manifest (for the manager itself)
│   └── icons/
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-19-pwa-manager-design.md
```

---

## Out of Scope (personal use, not needed)
- User authentication / login
- Multi-user support
- Site analytics or uptime monitoring
- Push notifications
- Icon file uploads to cloud storage (favicon URL only for now)
