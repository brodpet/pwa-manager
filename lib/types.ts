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
