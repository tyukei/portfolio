import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = process.cwd()
const USERS = ['tyukei', 'chukei2']
const year = Number(process.argv[2] ?? new Date().getFullYear())

await loadDotEnv()

for (const user of USERS) {
  const token = resolveGithubTokenForUser(user)
  if (!token) {
    console.log(`${user}: token missing`)
    continue
  }

  let viewer
  let userData
  try {
    viewer = await fetchViewer(year, token)
    userData = await fetchUser(user, year, token)
  } catch (e) {
    console.log(`${user}: fetch failed (${e instanceof Error ? e.message : String(e)})`)
    continue
  }

  const viewerCount = Object.values(viewer.contributions).reduce((a, b) => a + b, 0)
  const userCount = Object.values(userData).reduce((a, b) => a + b, 0)

  const usingViewer =
    viewer.login && viewer.login.toLowerCase() === user.toLowerCase()
  const finalCount = usingViewer ? viewerCount : userCount

  console.log(
    `${user}: login=${viewer.login || '-'} mode=${usingViewer ? 'viewer' : 'user'} count=${finalCount} (viewer=${viewerCount}, user=${userCount})`,
  )
}

function resolveGithubTokenForUser(username) {
  const suffix = username.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return (
    process.env[`PORTFOLIO_TOKEN_${suffix}`] ||
    process.env[`GITHUB_TOKEN_${suffix}`] ||
    process.env.GITHUB_TOKEN ||
    ''
  )
}

async function fetchViewer(year, token) {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const query = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        login
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
  `
  const data = await gql(token, query, { from, to })
  const out = {}
  const days =
    data?.data?.viewer?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (w) => w?.contributionDays ?? [],
    ) ?? []
  for (const day of days) {
    if ((day?.contributionCount ?? 0) > 0) out[day.date] = day.contributionCount
  }
  return { login: data?.data?.viewer?.login ?? '', contributions: out }
}

async function fetchUser(username, year, token) {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
  `
  const data = await gql(token, query, { username, from, to })
  const out = {}
  const days =
    data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (w) => w?.contributionDays ?? [],
    ) ?? []
  for (const day of days) {
    if ((day?.contributionCount ?? 0) > 0) out[day.date] = day.contributionCount
  }
  return out
}

async function gql(token, query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-site/1.0',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}`)
  }
  return await res.json()
}

async function loadDotEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf-8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx === -1) continue
      const key = t.slice(0, idx).trim()
      const value = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // ignore
  }
}
