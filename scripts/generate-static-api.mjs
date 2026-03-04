import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = process.cwd()
const PUBLIC_API_DIR = join(ROOT, 'public', 'static-api')

const GITHUB_USERS = ['tyukei', 'chukei2']
const ZENN_USER = 'kei_ninja'
const CONNPASS_USER = 'tyukei'
const SPEAKERDECK_USER = 'tyukei'
const START_YEAR = 2020

await loadDotEnv()
await mkdir(join(PUBLIC_API_DIR, 'heatmap'), { recursive: true })

const [articles, events, talks, zennByDate, connpassByDate] = await Promise.all([
  fetchArticles(),
  fetchEvents(),
  fetchTalks(),
  fetchZennByDate(ZENN_USER),
  fetchConnpassByDate(['tyukei', 'chukei']),
])

await writeJsonPreferNonEmpty(
  join(PUBLIC_API_DIR, 'articles.json'),
  { articles },
  (v) => Array.isArray(v?.articles) && v.articles.length > 0,
)
await writeJsonPreferNonEmpty(
  join(PUBLIC_API_DIR, 'events.json'),
  { events },
  (v) => Array.isArray(v?.events) && v.events.length > 0,
)
await writeJsonPreferNonEmpty(
  join(PUBLIC_API_DIR, 'talks.json'),
  { talks },
  (v) => Array.isArray(v?.talks) && v.talks.length > 0,
)

const speakerDeckByDate = talksToByDate(talks)
const currentYear = new Date().getFullYear()

for (let year = START_YEAR; year <= currentYear; year++) {
  const githubByDate = await fetchGitHubMergedByDate(year)
  let heatmap = mergeHeatmapByDate({
    year,
    githubByDate,
    zennByDate,
    connpassByDate,
    speakerDeckByDate,
  })
  const prevYearPath = join(PUBLIC_API_DIR, 'heatmap', `${year}.json`)
  const prevHeatmap = await readJson(prevYearPath)
  heatmap = preserveGithubFromPrevious(heatmap, prevHeatmap)
  await writeJsonPreferNonEmpty(
    prevYearPath,
    heatmap,
    (v) => Object.keys(v?.contributions ?? {}).length > 0,
  )
  if (year === currentYear) {
    await writeJsonPreferNonEmpty(
      join(PUBLIC_API_DIR, 'heatmap.json'),
      heatmap,
      (v) => Object.keys(v?.contributions ?? {}).length > 0,
    )
  }
}

async function loadDotEnv() {
  const envPath = join(ROOT, '.env')
  let raw = ''
  try {
    raw = await readFile(envPath, 'utf-8')
  } catch {
    return
  }

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = stripQuotes(trimmed.slice(idx + 1).trim())
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function stripQuotes(v) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  return v
}

async function writeJson(path, data) {
  await mkdir(join(path, '..'), { recursive: true })
  await writeFile(path, `${JSON.stringify(data)}\n`, 'utf-8')
}

async function readJson(path) {
  try {
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeJsonPreferNonEmpty(path, nextData, isNonEmpty) {
  if (isNonEmpty(nextData)) {
    await writeJson(path, nextData)
    return
  }
  const prev = await readJson(path)
  if (isNonEmpty(prev)) return
  await writeJson(path, nextData)
}

async function fetchJson(url, init = {}, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchText(url, init = {}, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchArticles() {
  const data = await fetchJson(
    `https://zenn.dev/api/articles?username=${ZENN_USER}&order=latest&count=20`,
    { headers: { 'User-Agent': 'portfolio-site/1.0' } },
  )
  const list = data?.articles ?? []
  return list
    .map((a) => ({
      title: a?.title ?? '',
      url: `https://zenn.dev${a?.path ?? ''}`,
      emoji: a?.emoji ?? '📝',
      type: a?.article_type ?? 'tech',
      published_at: a?.published_at ?? '',
      liked_count: a?.liked_count ?? 0,
    }))
    .filter((a) => a.title && a.url)
}

async function fetchEvents() {
  const apiKey = process.env.CONNPASS_API_KEY ?? ''
  const map = new Map()

  if (apiKey) {
    const data = await fetchJson(
      `https://connpass.com/api/v2/users/${CONNPASS_USER}/presenter_events/?count=100&order=2`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'portfolio-site/1.0',
          'X-API-Key': apiKey,
        },
      },
    )
    for (const ev of data?.events ?? []) {
      map.set(ev.id, {
        event_id: ev.id,
        title: ev.title,
        event_url: ev.url,
        started_at: ev.started_at,
        is_owner: (ev.owner_nickname ?? '').toLowerCase() === CONNPASS_USER.toLowerCase(),
        is_presenter: true,
      })
    }
  }

  if (map.size === 0) {
    const data = await fetchJson(
      `https://connpass.com/api/v1/event/?nickname=${CONNPASS_USER}&count=100`,
      { headers: { 'User-Agent': 'portfolio-site/1.0' } },
    )
    for (const ev of data?.events ?? []) {
      map.set(ev.event_id, {
        event_id: ev.event_id,
        title: ev.title ?? '',
        event_url: ev.event_url ?? '',
        started_at: ev.started_at ?? '',
        is_owner: (ev.owner_nickname ?? '').toLowerCase() === CONNPASS_USER.toLowerCase(),
        is_presenter: true,
      })
    }
  }

  return [...map.values()].sort((a, b) => b.started_at.localeCompare(a.started_at))
}

async function fetchTalks() {
  const xml = await fetchText(`https://speakerdeck.com/${SPEAKERDECK_USER}.atom`, {
    headers: { 'User-Agent': 'portfolio-site/1.0' },
  })
  if (!xml) return []
  return parseSpeakerDeckAtom(xml)
}

function parseSpeakerDeckAtom(xml) {
  const talks = []
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/g) ?? []
  for (const entry of entries) {
    const title = decodeXmlEntity(extractTagText(entry, 'title') ?? '')
    const link = extractLinkHref(entry) ?? decodeXmlEntity(extractTagText(entry, 'id') ?? '')
    const updated = extractTagText(entry, 'updated') ?? extractTagText(entry, 'published') ?? ''
    const date = updated ? updated.slice(0, 10) : null
    const thumbnail = extractThumbnail(entry)
    if (!title || !link) continue
    talks.push({ title, url: link, date, thumbnail })
  }
  return talks
}

function extractTagText(input, tag) {
  const m = input.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : null
}

function extractLinkHref(entry) {
  const m = entry.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i)
  return m ? decodeXmlEntity(m[1]) : null
}

function extractThumbnail(entry) {
  const attr = entry.match(/data-thumbnail=["']([^"']+)["']/i)
  if (attr) return decodeXmlEntity(attr[1])
  const img = entry.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
  if (img) return decodeXmlEntity(img[1])
  return null
}

function decodeXmlEntity(input) {
  return input
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number.parseInt(n, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

async function fetchZennByDate(username) {
  const out = {}
  for (let page = 1; page <= 5; page++) {
    const data = await fetchJson(
      `https://zenn.dev/api/articles?username=${username}&order=latest&count=96&page=${page}`,
      { headers: { 'User-Agent': 'portfolio-site/1.0' } },
    )
    const articles = data?.articles ?? []
    if (articles.length === 0) break
    for (const article of articles) {
      const date = (article?.published_at ?? '').slice(0, 10)
      if (date) out[date] = (out[date] ?? 0) + 1
    }
  }
  return out
}

async function fetchConnpassByDate(usernames) {
  const out = {}
  for (const username of usernames) {
    const data = await fetchJson(
      `https://connpass.com/api/v1/event/?nickname=${username}&count=100`,
      { headers: { 'User-Agent': 'portfolio-site/1.0' } },
    )
    for (const ev of data?.events ?? []) {
      const date = (ev?.started_at ?? '').slice(0, 10)
      if (date) out[date] = (out[date] ?? 0) + 1
    }
  }
  return out
}

function talksToByDate(talks) {
  const out = {}
  for (const talk of talks) {
    if (!talk.date) continue
    out[talk.date] = (out[talk.date] ?? 0) + 1
  }
  return out
}

async function fetchGitHubMergedByDate(year) {
  const merged = {}
  for (const username of GITHUB_USERS) {
    const token = resolveGithubTokenForUser(username)
    if (!token) continue
    const one = await fetchGitHubContribByDate(username, year, token)
    for (const [date, count] of Object.entries(one)) {
      merged[date] = (merged[date] ?? 0) + count
    }
  }
  return merged
}

function resolveGithubTokenForUser(username) {
  const key = `GITHUB_TOKEN_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
  return process.env[key] || process.env.GITHUB_TOKEN || ''
}

async function fetchGitHubUserByDate(username, year, token) {
  if (!token) return {}

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

  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`

  const data = await fetchJson('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-site/1.0',
    },
    body: JSON.stringify({
      query: gql,
      variables: { username, from, to },
    }),
  })

  const out = {}
  const days =
    data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (w) => w?.contributionDays ?? [],
    ) ?? []
  for (const day of days) {
    if ((day?.contributionCount ?? 0) > 0) {
      out[day.date] = day.contributionCount
    }
  }
  return out
}

async function fetchGitHubViewerByDate(year, token) {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const gql = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        login
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

  const data = await fetchJson('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-site/1.0',
    },
    body: JSON.stringify({
      query: gql,
      variables: { from, to },
    }),
  })

  const out = {}
  const days =
    data?.data?.viewer?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (w) => w?.contributionDays ?? [],
    ) ?? []
  for (const day of days) {
    if ((day?.contributionCount ?? 0) > 0) {
      out[day.date] = day.contributionCount
    }
  }
  return {
    login: data?.data?.viewer?.login ?? '',
    contributions: out,
  }
}

async function fetchGitHubContribByDate(username, year, token) {
  const viewer = await fetchGitHubViewerByDate(year, token)
  if (viewer.login && viewer.login.toLowerCase() === username.toLowerCase()) {
    return viewer.contributions
  }
  return fetchGitHubUserByDate(username, year, token)
}

function mergeHeatmapByDate({
  year,
  githubByDate,
  zennByDate,
  connpassByDate,
  speakerDeckByDate,
}) {
  const contributions = {}
  const summary = { github: 0, zenn: 0, connpass: 0, speakerdeck: 0 }
  const start = `${year}-01-01`
  const end = `${year}-12-31`

  const dates = new Set([
    ...Object.keys(githubByDate),
    ...Object.keys(zennByDate),
    ...Object.keys(connpassByDate),
    ...Object.keys(speakerDeckByDate),
  ])

  for (const date of [...dates].sort()) {
    if (date < start || date > end) continue
    const github = githubByDate[date] ?? 0
    const zenn = zennByDate[date] ?? 0
    const connpass = connpassByDate[date] ?? 0
    const speakerdeck = speakerDeckByDate[date] ?? 0
    const total = github + zenn + connpass + speakerdeck
    if (total <= 0) continue

    contributions[date] = { github, zenn, connpass, speakerdeck, total }
    summary.github += github
    summary.zenn += zenn
    summary.connpass += connpass
    summary.speakerdeck += speakerdeck
  }

  return { contributions, summary }
}

function preserveGithubFromPrevious(nextData, prevData) {
  const nextGithub = Number(nextData?.summary?.github ?? 0)
  const prevGithub = Number(prevData?.summary?.github ?? 0)
  if (nextGithub > 0 || prevGithub <= 0) return nextData

  const merged = {
    contributions: { ...(nextData?.contributions ?? {}) },
    summary: { ...(nextData?.summary ?? {}) },
  }

  for (const [date, prev] of Object.entries(prevData?.contributions ?? {})) {
    const prevCount = Number(prev?.github ?? 0)
    if (prevCount <= 0) continue

    const cur = merged.contributions[date] ?? {
      github: 0,
      zenn: 0,
      connpass: 0,
      speakerdeck: 0,
      total: 0,
    }

    const diff = prevCount - Number(cur.github ?? 0)
    if (diff <= 0) continue

    cur.github = prevCount
    cur.total = Number(cur.total ?? 0) + diff
    merged.contributions[date] = cur
    merged.summary.github = Number(merged.summary.github ?? 0) + diff
  }

  return merged
}
