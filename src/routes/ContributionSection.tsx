import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { type ContributionData, fetchContributions } from '~/lib/contributions'
import { ContributionGraph, ContributionLegend } from './ContributionGraph'
import { StreakBadge } from './StreakBadge'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2020 + 1 },
  (_, i) => CURRENT_YEAR - i,
)

export const ContributionSection = component$(() => {
  const selectedYear = useSignal(CURRENT_YEAR)
  const cache = useSignal<Record<number, ContributionData>>({})
  const loading = useSignal(true)

  const data = cache.value[selectedYear.value] ?? null

  useVisibleTask$(async ({ track }) => {
    const year = track(() => selectedYear.value)
    if (cache.value[year]) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      const result = await fetchContributions(year)
      cache.value = { ...cache.value, [year]: result }
    } catch {
      // silently fail
    } finally {
      loading.value = false
    }
  })

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
        <ContributionGraph data={data} loading={loading.value} year={selectedYear.value} />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <StreakBadge data={data} />
        <ContributionLegend />
      </div>
    </div>
  )
})
