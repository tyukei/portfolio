export interface DayContribution {
  github: number
  zenn: number
  connpass: number
  speakerdeck: number
  total: number
}

export interface ContributionSummary {
  github: number
  zenn: number
  connpass: number
  speakerdeck: number
}

export interface ContributionData {
  contributions: Record<string, DayContribution>
  summary: ContributionSummary
}

export async function fetchContributions(year?: number): Promise<ContributionData> {
  const url = year ? `/api/heatmap.php?year=${year}` : '/api/heatmap.php'
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new Error('PHP サーバーが必要です (npm run dev では /api/ は動作しません)')
  }

  if (!res.ok) {
    throw new Error(`heatmap API error: ${res.status}`)
  }

  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('json')) {
    throw new Error('PHP サーバーが必要です (/api/heatmap.php が JSON を返していません)')
  }

  try {
    return (await res.json()) as ContributionData
  } catch {
    throw new Error('API レスポンスの JSON パースに失敗しました')
  }
}

/**
 * Returns a sorted array of cells covering the full calendar year (Jan 1 – Dec 31),
 * padded so the first column starts on Sunday.
 */
export function buildWeekGrid(
  contributions: Record<string, DayContribution>,
  year: number,
): { date: string; data: DayContribution | null }[] {
  // Start from the Sunday on or before Jan 1
  const jan1 = new Date(year, 0, 1)
  const startDay = new Date(jan1)
  startDay.setDate(jan1.getDate() - jan1.getDay()) // back to Sunday

  // End: the Saturday on or after Dec 31
  const dec31 = new Date(year, 11, 31)
  const endDay = new Date(dec31)
  endDay.setDate(dec31.getDate() + (6 - dec31.getDay())) // forward to Saturday

  const cells: { date: string; data: DayContribution | null }[] = []
  const cur = new Date(startDay)

  while (cur <= endDay) {
    const dateStr = cur.toISOString().slice(0, 10)
    cells.push({
      date: dateStr,
      data: contributions[dateStr] ?? null,
    })
    cur.setDate(cur.getDate() + 1)
  }

  return cells
}

/**
 * Calculate contribution level (0..5) from total score.
 */
export function scoreToLevel(total: number): number {
  if (total === 0) return 0
  if (total <= 2) return 1
  if (total <= 5) return 2
  if (total <= 10) return 3
  if (total <= 20) return 4
  return 5
}

export const LEVEL_COLORS = [
  '#1c2620', // 0: empty
  '#0e4f4f', // 1: very light teal
  '#0f766e', // 2: light teal
  '#0d9488', // 3: medium teal
  '#14b8a6', // 4: bright teal
  '#22d3ee', // 5: accent
]

/**
 * Calculate current streak (consecutive days with activity, from today backwards).
 */
export function calcCurrentStreak(
  contributions: Record<string, DayContribution>,
): number {
  const today = new Date()
  let streak = 0
  const cur = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = cur.toISOString().slice(0, 10)
    const day = contributions[dateStr]
    if (day && day.total > 0) {
      streak++
    } else if (i > 0) {
      // Allow today to be 0 (day not over yet), check yesterday first
      break
    }
    cur.setDate(cur.getDate() - 1)
  }

  return streak
}

/**
 * Calculate longest streak in the contributions data.
 */
export function calcLongestStreak(
  contributions: Record<string, DayContribution>,
): number {
  const dates = Object.keys(contributions).sort()
  if (dates.length === 0) return 0

  let longest = 0
  let current = 0
  let prevDate: Date | null = null

  for (const dateStr of dates) {
    const day = contributions[dateStr]
    if (!day || day.total === 0) {
      current = 0
      prevDate = null
      continue
    }

    const d = new Date(dateStr)
    if (prevDate) {
      const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current++
      } else {
        current = 1
      }
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
    prevDate = d
  }

  return longest
}
