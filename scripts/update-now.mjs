/**
 * scripts/update-now.mjs
 *
 * Weekly /now page generator.
 * Fetches recent Zenn / Connpass / GitHub activity, then asks
 * Gemini 2.0 Flash Lite (with Google Search grounding) to write
 * the /now page content as structured JSON.
 *
 * Usage (requires GEMINI_API_KEY env var):
 *   bun scripts/update-now.mjs
 *   # or:
 *   GEMINI_API_KEY=xxx bun scripts/update-now.mjs
 *
 * Output: public/static-api/now.json
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// ─── Config ───────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required')
  process.exit(1)
}

// Change to gemini-2.0-flash if you need a more capable model
const GEMINI_MODEL = 'gemini-2.0-flash-lite'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.PORTFOLIO_TOKEN_TYUKEI
const GITHUB_USER = 'tyukei'
const ZENN_USER = 'kei_ninja'
const CONNPASS_USER = 'tyukei'

const ROOT = process.cwd()
const OUTPUT_PATH = join(ROOT, 'public', 'static-api', 'now.json')

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

/** Zenn latest articles */
async function fetchZennArticles() {
  try {
    const res = await fetch(
      `https://zenn.dev/api/articles?username=${ZENN_USER}&order=latest&count=5`,
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.articles ?? []).slice(0, 5).map((a) => ({
      title: a.title,
      published_at: a.published_at,
      liked_count: a.liked_count,
    }))
  } catch {
    return []
  }
}

/** Connpass recent events */
async function fetchConnpassEvents() {
  try {
    const res = await fetch(
      `https://connpass.com/api/v1/event/?nickname=${CONNPASS_USER}&order=2&count=5`,
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.events ?? []).slice(0, 5).map((e) => ({
      title: e.title,
      started_at: e.started_at,
      is_owner: e.owner_nickname === CONNPASS_USER,
    }))
  } catch {
    return []
  }
}

/** GitHub recent push/PR events */
async function fetchGitHubActivity() {
  try {
    const headers = { Accept: 'application/vnd.github.v3+json' }
    if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/events?per_page=30`,
      { headers },
    )
    if (!res.ok) return []

    const events = await res.json()
    const relevant = events
      .filter((e) => ['PushEvent', 'PullRequestEvent', 'CreateEvent'].includes(e.type))
      .slice(0, 10)
      .map((e) => {
        if (e.type === 'PushEvent') {
          const msg = e.payload?.commits?.[0]?.message?.split('\n')[0] ?? ''
          return `[Push] ${e.repo.name}: ${msg}`
        }
        if (e.type === 'PullRequestEvent') {
          return `[PR ${e.payload.action}] ${e.repo.name}: ${e.payload.pull_request?.title ?? ''}`
        }
        return `[Create ${e.payload?.ref_type}] ${e.repo.name}`
      })
    return relevant
  } catch {
    return []
  }
}

// ─── Gemini call ───────────────────────────────────────────────────────────────

/** Extract the first JSON object from a string (handles markdown code blocks) */
function extractJson(text) {
  // Strip markdown code block if present
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = blockMatch ? blockMatch[1] : text

  // Try direct parse
  try {
    return JSON.parse(candidate.trim())
  } catch {}

  // Try to find { ... } span
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1))
    } catch {}
  }

  return null
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const body = {
    // Google Search grounding lets Gemini look up current tech trends
    tools: [{ googleSearch: {} }],
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Gemini returned empty response')
  return text
}

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt({ articles, events, githubActivity, today }) {
  const articlesText =
    articles.length > 0
      ? articles.map((a) => `- ${a.title} (${a.published_at?.slice(0, 10) ?? ''})`).join('\n')
      : '（最近の記事なし）'

  const eventsText =
    events.length > 0
      ? events
          .map((e) => `- ${e.title} (${e.started_at?.slice(0, 10) ?? ''})${e.is_owner ? ' ※主催' : ''}`)
          .join('\n')
      : '（最近のイベントなし）'

  const githubText =
    githubActivity.length > 0 ? githubActivity.join('\n') : '（最近の活動なし）'

  return `あなたはデータエンジニアの中田継太（GitHub: tyukei / Zenn: kei_ninja）です。
以下の最新情報を参考に、今週の /now ページコンテンツを生成してください。

## 基本プロフィール
- 場所: 沖縄, 日本
- 職種: データエンジニア
- メインスキル: Python, BigQuery, GCP, LLM Agent, MCP, dbt, Cloud Run
- 趣味: SUP（スタンドアップパドル）、コーヒー自家焙煎

## 最近のZenn記事（最新5件）
${articlesText}

## 最近のConnpassイベント参加（最新5件）
${eventsText}

## 最近のGitHubアクティビティ（最新10件）
${githubText}

## 今日の日付
${today}

---

上記の情報とウェブ検索で把握した最新の技術トレンドを踏まえ、
「今この人物が実際に取り組んでいること・読んでいること・ハマっていること」を
自然に反映した /now ページを生成してください。

**出力形式:** 以下のJSON のみを出力してください（マークダウンのコードブロック・説明文は不要）。

{
  "updatedAt": "${today}",
  "sections": [
    {
      "title": "今取り組んでいること",
      "items": [
        { "emoji": "🤖", "label": "項目名", "detail": "2〜3文の詳細説明。具体的なツールや技術名を含めること。" }
      ]
    },
    {
      "title": "読んでいるもの",
      "items": [
        { "emoji": "📖", "label": "書籍・記事名", "detail": "読んでいる理由や気づき。" }
      ]
    },
    {
      "title": "最近ハマっていること",
      "items": [
        { "emoji": "🏄", "label": "活動名", "detail": "楽しんでいる様子。" }
      ]
    },
    {
      "title": "最近参加したイベント・勉強会",
      "items": [
        { "emoji": "🎤", "label": "イベント名", "detail": "参加した感想や学び。" }
      ]
    }
  ]
}

各セクションに 2〜3 アイテムを含めること。GitHubやZennのデータをできるだけ反映させること。`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10)

console.log('Fetching recent activity...')
const [articles, events, githubActivity] = await Promise.all([
  fetchZennArticles(),
  fetchConnpassEvents(),
  fetchGitHubActivity(),
])

console.log(`  Zenn articles: ${articles.length}`)
console.log(`  Connpass events: ${events.length}`)
console.log(`  GitHub events: ${githubActivity.length}`)

console.log(`\nCalling Gemini (${GEMINI_MODEL}) with Google Search grounding...`)
const prompt = buildPrompt({ articles, events, githubActivity, today })
const rawText = await callGemini(prompt)

console.log('\nParsing response...')
const nowData = extractJson(rawText)
if (!nowData) {
  console.error('Failed to parse JSON from Gemini response:')
  console.error(rawText)
  process.exit(1)
}

// Validate minimal structure
if (!Array.isArray(nowData.sections)) {
  console.error('Invalid structure: missing sections array')
  process.exit(1)
}

// Ensure updatedAt is set
nowData.updatedAt = nowData.updatedAt ?? today

console.log(`\nWriting to ${OUTPUT_PATH}`)
console.log(`  Sections: ${nowData.sections.length}`)
nowData.sections.forEach((s) => console.log(`    - ${s.title} (${s.items?.length ?? 0} items)`))

await mkdir(join(ROOT, 'public', 'static-api'), { recursive: true })
await writeFile(OUTPUT_PATH, JSON.stringify(nowData, null, 2), 'utf-8')

console.log('\n✓ now.json updated successfully')
