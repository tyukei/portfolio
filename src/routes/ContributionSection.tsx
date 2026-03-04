import { component$, useSignal } from '@builder.io/qwik'
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
}>((props) => {
  const bestYear =
    YEARS.find((y) => Object.keys(props.byYear[y]?.contributions ?? {}).length > 0) ??
    CURRENT_YEAR
  const selectedYear = useSignal(bestYear)
  const data = props.byYear[selectedYear.value] ?? null

  return (
    <div class="flex flex-col gap-3">
      {/* Year tabs */}
      <div class="flex items-center gap-2 flex-wrap">
        {YEARS.map((y) => (
          <button
            key={y}
            type="button"
            class="px-3 py-1 rounded-full text-sm font-medium transition-all"
            style={
              selectedYear.value === y
                ? 'background:var(--accent);color:#000;'
                : 'background:transparent;color:var(--text-2);border:1px solid var(--border);'
            }
            onClick$={() => {
              selectedYear.value = y
            }}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div
        class="rounded-xl p-4 md:p-5"
        style="background:var(--bg-surface);border:1px solid var(--border)"
      >
        <ContributionGraph data={data} loading={false} year={selectedYear.value} />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <StreakBadge data={data} />
        <ContributionLegend />
      </div>
    </div>
  )
})
