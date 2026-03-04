import type { RequestHandler } from '@builder.io/qwik-city'
import {
  clampInt,
  fetchJson,
  readJsonCache,
  writeJsonCache,
} from '~/utils/api-utils'

interface ConnpassV2Response {
  events?: Array<{
    id: number
    title: string
    url: string
    started_at: string
    owner_nickname?: string
  }>
}

interface ConnpassEvent {
  event_id: number
  title: string
  event_url: string
  started_at: string
  is_owner: boolean
  is_presenter: boolean
}

const NICKNAME = 'tyukei'

export const onGet: RequestHandler = async ({ json, query }) => {
  const count = clampInt(query.get('count'), 8, 1, 20)
  const cacheKey = `events_${todayKey()}.json`

  const cached = await readJsonCache<ConnpassEvent[]>(cacheKey)
  if (cached) {
    json(200, { events: cached.slice(0, count) })
    return
  }

  const apiKey = process.env.CONNPASS_API_KEY ?? ''
  const data = await fetchJson<ConnpassV2Response>(
    `https://connpass.com/api/v2/users/${NICKNAME}/presenter_events/?count=100&order=2`,
    {
      headers: {
        'User-Agent': 'portfolio-site/1.0',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
    },
  )

  const map = new Map<number, ConnpassEvent>()
  for (const ev of data?.events ?? []) {
    map.set(ev.id, {
      event_id: ev.id,
      title: ev.title,
      event_url: ev.url,
      started_at: ev.started_at,
      is_owner: (ev.owner_nickname ?? '').toLowerCase() === NICKNAME.toLowerCase(),
      is_presenter: true,
    })
  }

  const events = [...map.values()].sort((a, b) => b.started_at.localeCompare(a.started_at))
  await writeJsonCache(cacheKey, events)
  json(200, { events: events.slice(0, count) })
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
