export interface ZennArticle {
  title: string
  url: string
  emoji: string
  type: string
  published_at: string
  liked_count: number
}

export interface ConnpassEvent {
  event_id: number
  title: string
  event_url: string
  started_at: string
  is_owner: boolean
  is_presenter: boolean
}

export interface Talk {
  title: string
  url: string
  date: string | null
  thumbnail: string | null
}
