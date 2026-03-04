import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CACHE_ROOT = join(process.cwd(), '.cache', 'api')
const LEGACY_ENV_PATH = join(process.cwd(), 'api', '.env')

let cachedGithubToken: string | null | undefined

export function clampInt(
  raw: string | null,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (Number.isNaN(n)) return defaultValue
  return Math.min(Math.max(n, min), max)
}

export async function readJsonCache<T>(key: string): Promise<T | null> {
  try {
    const file = join(CACHE_ROOT, key)
    const raw = await readFile(file, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function writeJsonCache(key: string, data: unknown): Promise<void> {
  await mkdir(CACHE_ROOT, { recursive: true })
  const file = join(CACHE_ROOT, key)
  await writeFile(file, JSON.stringify(data), 'utf-8')
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchText(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export interface SpeakerDeckTalk {
  title: string
  url: string
  date: string | null
  thumbnail: string | null
}

export function parseSpeakerDeckAtom(xml: string): SpeakerDeckTalk[] {
  const talks: SpeakerDeckTalk[] = []
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/g) ?? []

  for (const entry of entries) {
    const title = decodeXmlEntity(extractTagText(entry, 'title') ?? '')
    const link = extractLinkHref(entry) ?? decodeXmlEntity(extractTagText(entry, 'id') ?? '')
    const updated = extractTagText(entry, 'updated') ?? extractTagText(entry, 'published') ?? ''
    const date = updated ? updated.slice(0, 10) : null
    const thumbnail = extractThumbnail(entry)
    talks.push({
      title,
      url: link,
      date,
      thumbnail,
    })
  }

  return talks
}

export async function getGithubToken(): Promise<string | undefined> {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  if (cachedGithubToken !== undefined) return cachedGithubToken ?? undefined

  try {
    const raw = await readFile(LEGACY_ENV_PATH, 'utf-8')
    const fromFile = parseDotEnv(raw).GITHUB_TOKEN
    cachedGithubToken = fromFile ?? null
    return fromFile
  } catch {
    cachedGithubToken = null
    return undefined
  }
}

function parseDotEnv(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (key) out[key] = stripOptionalQuotes(value)
  }
  return out
}

function stripOptionalQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function extractTagText(input: string, tag: string): string | null {
  const m = input.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : null
}

function extractLinkHref(entry: string): string | null {
  const m = entry.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i)
  return m ? decodeXmlEntity(m[1]) : null
}

function extractThumbnail(entry: string): string | null {
  const attr = entry.match(/data-thumbnail=["']([^"']+)["']/i)
  if (attr) return decodeXmlEntity(attr[1])
  const img = entry.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
  if (img) return decodeXmlEntity(img[1])
  return null
}

function decodeXmlEntity(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, h: string) =>
      String.fromCodePoint(Number.parseInt(h, 16)),
    )
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}
