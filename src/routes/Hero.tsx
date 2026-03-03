import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { type ContributionData, fetchContributions } from '~/lib/contributions'
import { ContributionGraph, ContributionLegend } from './ContributionGraph'
import { StreakBadge } from './StreakBadge'

const PLATFORMS = [
  { name: 'GitHub', color: '#e8f0e9', dot: '#e8f0e9' },
  { name: 'Zenn', color: '#22d3ee', dot: '#22d3ee' },
  { name: 'Connpass', color: '#34d399', dot: '#34d399' },
  { name: 'SpeakerDeck', color: '#a78bfa', dot: '#a78bfa' },
]

export const Hero = component$(() => {
  const data = useSignal<ContributionData | null>(null)
  const loading = useSignal(true)
  const error = useSignal<string | null>(null)

  useVisibleTask$(async () => {
    try {
      data.value = await fetchContributions()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load'
    } finally {
      loading.value = false
    }
  })

  return (
    <section
      class="w-full px-4 md:px-8 py-6"
      style="background:var(--bg-base)"
    >
      <div class="max-w-5xl mx-auto w-full">
        {/* Platform legend */}
        <div class="flex flex-wrap items-center gap-4 mb-4">
          {PLATFORMS.map((p) => (
            <div key={p.name} class="flex items-center gap-1.5 text-sm">
              <div
                class="w-2.5 h-2.5 rounded-full"
                style={`background:${p.dot}`}
              />
              <span style={`color:${p.color}`}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* Contribution Graph */}
        <div
          class="rounded-xl p-4 md:p-6 mb-4"
          style="background:var(--bg-surface);border:1px solid var(--border)"
        >
          {error.value ? (
            <div
              class="flex items-center gap-2 text-sm py-8 justify-center"
              style="color:var(--text-2)"
            >
              <div class="i-tabler:alert-circle w-5 h-5" />
              <span>Activity data unavailable: {error.value}</span>
            </div>
          ) : (
            <ContributionGraph data={data.value} loading={loading.value} year={new Date().getFullYear()} />
          )}
        </div>

        {/* Stats row */}
        <div class="flex flex-wrap items-center justify-between gap-4">
          <StreakBadge data={data.value} />

          <div class="flex flex-wrap items-center gap-4">
            {data.value && (
              <>
                <SummaryBadge
                  label="GitHub"
                  count={data.value.summary.github}
                  color="#e8f0e9"
                />
                <SummaryBadge
                  label="Zenn"
                  count={data.value.summary.zenn}
                  color="#22d3ee"
                />
                <SummaryBadge
                  label="Connpass"
                  count={data.value.summary.connpass}
                  color="#34d399"
                />
                <SummaryBadge
                  label="Slides"
                  count={data.value.summary.speakerdeck}
                  color="#a78bfa"
                />
              </>
            )}
            <ContributionLegend />
          </div>
        </div>
      </div>
    </section>
  )
})

const SummaryBadge = component$<{
  label: string
  count: number
  color: string
}>((props) => {
  return (
    <div class="text-sm">
      <span style={`color:${props.color};font-weight:600`}>
        {props.count}
      </span>{' '}
      <span style="color:var(--text-2)">{props.label}</span>
    </div>
  )
})
