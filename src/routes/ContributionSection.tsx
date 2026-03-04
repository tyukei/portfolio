import { component$ } from '@builder.io/qwik'
import type { ContributionData } from '~/lib/contributions'
import { ContributionGraph, ContributionLegend } from './ContributionGraph'
import { StreakBadge } from './StreakBadge'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2020 + 1 },
  (_, i) => CURRENT_YEAR - i,
)

export const ContributionSection = component$<{
  byYear: Record<number, ContributionData>
  selectedYear: number
}>((props) => {
  const selectedYear = props.selectedYear
  const ACTIVE_CLASS = 'bg-[var(--accent)] text-black'
  const INACTIVE_CLASS =
    'bg-transparent text-[var(--text-2)] border border-[var(--border)]'
  const sectionId = 'contrib-section'

  return (
    <div class="flex flex-col gap-3" id={sectionId}>
      {/* Year tabs */}
      <div class="flex items-center gap-2 flex-wrap">
        {YEARS.map((y) => (
          <a
            key={y}
            href={y === CURRENT_YEAR ? `#${sectionId}` : `?year=${y}#${sectionId}`}
            class={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedYear === y ? ACTIVE_CLASS : INACTIVE_CLASS
            }`}
            aria-current={selectedYear === y ? 'page' : undefined}
          >
            {y}
          </a>
        ))}
      </div>

      {YEARS.map((y) => {
        const data = props.byYear[y] ?? null
        return (
          <div
            key={y}
            data-year-panel={String(y)}
            style={selectedYear === y ? '' : 'display:none;'}
            class="flex flex-col gap-3"
          >
            <div
              class="rounded-xl p-4 md:p-5"
              style="background:var(--bg-surface);border:1px solid var(--border)"
            >
              <ContributionGraph data={data} loading={false} year={y} />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <StreakBadge data={data} />
              <ContributionLegend />
            </div>
          </div>
        )
      })}
    </div>
  )
})
