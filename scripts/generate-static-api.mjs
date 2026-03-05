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

const [articles, events, talks, repositories, zennByDate, connpassByDate] = await Promise.all([
  fetchArticles(),
  fetchEvents(),
  fetchTalks(),
  fetchRepositories(),
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
await writeJsonPreferNonEmpty(
  join(PUBLIC_API_DIR, 'repositories.json'),
  { repositories },
  (v) => Array.isArray(v?.repositories) && v.repositories.length > 0,
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

async function fetchRepositories() {
  const merged = new Map()
  for (const username of GITHUB_USERS) {
    const tokens = resolveGithubTokensForUser(username)
    const repos = await fetchGitHubRepos(username, tokens)
    for (const repo of repos) {
      merged.set(repo.full_name, repo)
    }
  }

  return [...merged.values()]
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, 20)
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
    const tokens = resolveGithubTokensForUser(username)
    if (tokens.length === 0) continue
    const one = await fetchGitHubContribByDate(username, year, tokens)
    for (const [date, count] of Object.entries(one)) {
      merged[date] = (merged[date] ?? 0) + count
    }
  }
  return merged
}

function resolveGithubTokensForUser(username) {
  const suffix = username.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  const newKey = `PORTFOLIO_TOKEN_${suffix}`
  const oldKey = `GITHUB_TOKEN_${suffix}`
  const seen = new Set()
  const out = []
  for (const token of [
    process.env[newKey],
    process.env[oldKey],
    process.env.GITHUB_TOKEN,
  ]) {
    if (!token || seen.has(token)) continue
    seen.add(token)
    out.push(token)
  }
  return out
}

async function fetchGitHubUserByDate(username, year, token) {
  if (!token) throw new Error('missing token')

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

  const data = await fetchGitHubGraphQL(token, gql, { username, from, to })

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

  const data = await fetchGitHubGraphQL(token, gql, { from, to })

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

async function fetchGitHubContribByDate(username, year, tokens) {
  for (const token of tokens) {
    try {
      const viewer = await fetchGitHubViewerByDate(year, token)
      if (viewer.login && viewer.login.toLowerCase() === username.toLowerCase()) {
        return viewer.contributions
      }
      return await fetchGitHubUserByDate(username, year, token)
    } catch {
      // try next token
    }
  }
  return fetchGitHubPublicByDate(username, year)
}

async function fetchGitHubGraphQL(token, query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-site/1.0',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`)
  const data = await res.json()
  if (data?.errors?.length) throw new Error('GitHub GraphQL errors')
  return data
}

async function fetchGitHubPublicByDate(username, year) {
  const from = `${year}-01-01`
  const to = `${year}-12-31`
  const html = await fetchText(
    `https://github.com/users/${username}/contributions?from=${from}&to=${to}`,
    { headers: { 'User-Agent': 'portfolio-site/1.0' } },
  )
  if (!html) return {}

  const out = {}
  const re = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"/g
  let m = null
  while ((m = re.exec(html)) !== null) {
    const date = m[1]
    const count = Number.parseInt(m[2], 10)
    if (count > 0) out[date] = count
  }
  return out
}

async function fetchGitHubRepos(username, tokens) {
  const headers = { 'User-Agent': 'portfolio-site/1.0' }
  if (tokens[0]) headers.Authorization = `Bearer ${tokens[0]}`
  const all = []

  for (let page = 1; page <= 2; page++) {
    const data = await fetchJson(
      `https://api.github.com/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
      { headers },
    )
    if (!Array.isArray(data) || data.length === 0) break

    for (const repo of data) {
      if (repo?.private || repo?.fork || repo?.archived) continue
      if (!repo?.full_name || !repo?.html_url || !repo?.pushed_at) continue
      all.push({
        name: repo.name ?? '',
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description ?? null,
        language: repo.language ?? null,
        stargazers_count: Number(repo.stargazers_count ?? 0),
        forks_count: Number(repo.forks_count ?? 0),
        pushed_at: repo.pushed_at,
        owner: repo?.owner?.login ?? username,
      })
    }
  }

  return all
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
