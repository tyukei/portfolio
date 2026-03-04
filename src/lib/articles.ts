export interface ZennArticle {
  title: string
  url: string
  emoji: string
  type: string
  published_at: string
  liked_count: number
}

export interface ArticlesResponse {
  articles: ZennArticle[]
}

function apiUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${normalizedPath}`
}

async function safeFetchJson<T>(url: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new Error('API not reachable')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('json')) throw new Error('not JSON')
  try {
    return (await res.json()) as T
  } catch {
    throw new Error('JSON parse failed')
  }
}

export async function fetchArticles(count = 6): Promise<ZennArticle[]> {
  const data = await safeFetchJson<ArticlesResponse>(apiUrl(`api/articles?count=${count}`))
  return data.articles ?? []
}

export interface ConnpassEvent {
  event_id: number
  title: string
  event_url: string
  started_at: string
  is_owner: boolean
  is_presenter: boolean
}

export interface EventsResponse {
  events: ConnpassEvent[]
}

export async function fetchEvents(count = 8): Promise<ConnpassEvent[]> {
  const data = await safeFetchJson<EventsResponse>(apiUrl(`api/events?count=${count}`))
  return data.events ?? []
}

export interface Talk {
  title: string
  url: string
  date: string | null
  thumbnail: string | null
}

export interface TalksResponse {
  talks: Talk[]
}

export async function fetchTalks(): Promise<Talk[]> {
  const data = await safeFetchJson<TalksResponse>(apiUrl('api/talks'))
  return data.talks ?? []
}
