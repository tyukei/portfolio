import type { RequestHandler } from '@builder.io/qwik-city'
import {
  clampInt,
  fetchJson,
  readJsonCache,
  writeJsonCache,
} from '~/utils/api-utils'

interface ZennApiResponse {
  articles?: Array<{
    title?: string
    path?: string
    emoji?: string
    article_type?: string
    published_at?: string
    liked_count?: number
  }>
}

interface ZennArticle {
  title: string
  url: string
  emoji: string
  type: string
  published_at: string
  liked_count: number
}

const USERNAME = 'kei_ninja'

export const onGet: RequestHandler = async ({ json, query }) => {
  const count = clampInt(query.get('count'), 6, 1, 20)
  const cacheKey = `articles_${todayKey()}.json`

  const cached = await readJsonCache<ZennArticle[]>(cacheKey)
  if (cached) {
    json(200, { articles: cached.slice(0, count) })
    return
  }

  const data = await fetchJson<ZennApiResponse>(
    `https://zenn.dev/api/articles?username=${USERNAME}&order=latest&count=20`,
    {
      headers: {
        'User-Agent': 'portfolio-site/1.0',
      },
    },
  )

  const articles =
    data?.articles?.map((a) => ({
      title: a.title ?? '',
      url: `https://zenn.dev${a.path ?? ''}`,
      emoji: a.emoji ?? '📝',
      type: a.article_type ?? 'tech',
      published_at: a.published_at ?? '',
      liked_count: a.liked_count ?? 0,
    })) ?? []

  await writeJsonCache(cacheKey, articles)
  json(200, { articles: articles.slice(0, count) })
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
