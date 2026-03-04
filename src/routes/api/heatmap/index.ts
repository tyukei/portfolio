import type { RequestHandler } from '@builder.io/qwik-city'
import {
  clampInt,
  fetchJson,
  fetchText,
  getGithubToken,
  parseSpeakerDeckAtom,
  readJsonCache,
  writeJsonCache,
} from '~/utils/api-utils'

interface DayContribution {
  github: number
  zenn: number
  connpass: number
  speakerdeck: number
  total: number
}

interface ContributionData {
  contributions: Record<string, DayContribution>
  summary: {
    github: number
    zenn: number
    connpass: number
    speakerdeck: number
  }
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{
            contributionDays?: Array<{
              date: string
              contributionCount: number
            }>
          }>
        }
      }
    }
  }
}

interface ZennApiResponse {
  articles?: Array<{ published_at?: string }>
}

interface ConnpassV1Response {
  events?: Array<{ started_at?: string }>
}

const GITHUB_USERS = ['tyukei', 'chukei2']
const ZENN_USER = 'kei_ninja'
const CONNPASS_USER = 'tyukei'
const SPEAKERDECK_USER = 'tyukei'

export const onGet: RequestHandler = async ({ json, query }) => {
  const currentYear = new Date().getFullYear()
  const year = clampInt(query.get('year'), currentYear, 2008, currentYear)
  const cacheKey = `heatmap_${year}.json`

  const cached = await readJsonCache<ContributionData>(cacheKey)
  if (cached) {
    json(200, cached)
    return
  }

  const [github, zenn, connpass, speakerdeck] = await Promise.all([
    fetchGitHubMerged(GITHUB_USERS, year),
    fetchZennByDate(ZENN_USER),
    fetchConnpassByDate(CONNPASS_USER),
    fetchSpeakerDeckByDate(SPEAKERDECK_USER),
  ])

  const rangeStart = `${year}-01-01`
  const rangeEnd = `${year}-12-31`
  const dates = new Set([
    ...Object.keys(github),
    ...Object.keys(zenn),
    ...Object.keys(connpass),
    ...Object.keys(speakerdeck),
  ])

  const contributions: Record<string, DayContribution> = {}
  const summary = {
    github: 0,
    zenn: 0,
    connpass: 0,
    speakerdeck: 0,
  }

  for (const date of [...dates].sort()) {
    if (date < rangeStart || date > rangeEnd) continue

    const gh = github[date] ?? 0
    const z = zenn[date] ?? 0
    const c = connpass[date] ?? 0
    const s = speakerdeck[date] ?? 0
    const total = gh + z + c + s
    if (total <= 0) continue

    contributions[date] = {
      github: gh,
      zenn: z,
      connpass: c,
      speakerdeck: s,
      total,
    }

    summary.github += gh
    summary.zenn += z
    summary.connpass += c
    summary.speakerdeck += s
  }

  const response: ContributionData = { contributions, summary }
  await writeJsonCache(cacheKey, response)
  json(200, response)
}

async function fetchGitHubMerged(
  users: string[],
  year: number,
): Promise<Record<string, number>> {
  const merged: Record<string, number> = {}
  for (const user of users) {
    const one = await fetchGitHubUserByDate(user, year)
    for (const [date, count] of Object.entries(one)) {
      merged[date] = (merged[date] ?? 0) + count
    }
  }
  return merged
}

async function fetchGitHubUserByDate(
  username: string,
  year: number,
): Promise<Record<string, number>> {
  const token = await getGithubToken()
  if (!token) return {}

  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const gql = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  const data = await fetchJson<GitHubGraphQLResponse>(
    'https://api.github.com/graphql',
    {
      method: 'POST',
      headers: {
        'User-Agent': 'portfolio-site/1.0',
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: gql,
        variables: { username, from, to },
      }),
    },
  )

  const out: Record<string, number> = {}
  const weeks =
    data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? []

  for (const week of weeks) {
    for (const day of week.contributionDays ?? []) {
      if (day.contributionCount > 0) {
        out[day.date] = day.contributionCount
      }
    }
  }

  return out
}

async function fetchZennByDate(username: string): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  for (let page = 1; page <= 5; page++) {
    const data = await fetchJson<ZennApiResponse>(
      `https://zenn.dev/api/articles?username=${username}&order=latest&count=96&page=${page}`,
      {
        headers: {
          'User-Agent': 'portfolio-site/1.0',
        },
      },
    )
    const articles = data?.articles ?? []
    if (articles.length === 0) break

    for (const article of articles) {
      const date = (article.published_at ?? '').slice(0, 10)
      if (date) out[date] = (out[date] ?? 0) + 1
    }
  }
  return out
}

async function fetchConnpassByDate(username: string): Promise<Record<string, number>> {
  const data = await fetchJson<ConnpassV1Response>(
    `https://connpass.com/api/v1/event/?nickname=${username}&count=100`,
    {
      headers: {
        'User-Agent': 'portfolio-site/1.0',
      },
    },
  )

  const out: Record<string, number> = {}
  for (const ev of data?.events ?? []) {
    const date = (ev.started_at ?? '').slice(0, 10)
    if (date) out[date] = (out[date] ?? 0) + 1
  }
  return out
}

async function fetchSpeakerDeckByDate(username: string): Promise<Record<string, number>> {
  const xml = await fetchText(`https://speakerdeck.com/${username}.atom`, {
    headers: {
      'User-Agent': 'portfolio-site/1.0',
    },
  })
  if (!xml) return {}

  const talks = parseSpeakerDeckAtom(xml)
  const out: Record<string, number> = {}
  for (const talk of talks) {
    if (!talk.date) continue
    out[talk.date] = (out[talk.date] ?? 0) + 1
  }
  return out
}
