import {
  component$,
  useSignal,
  useVisibleTask$,
  useComputed$,
} from '@builder.io/qwik'
import {
  type ContributionData,
  calcCurrentStreak,
  calcLongestStreak,
} from '~/lib/contributions'

const AnimatedNumber = component$<{ target: number }>((props) => {
  const displayed = useSignal(0)

  useVisibleTask$(({ track }) => {
    track(() => props.target)
    if (props.target === 0) return

    const start = Date.now()
    const duration = 800
    const from = 0
    const to = props.target

    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - (1 - progress) ** 4
      displayed.value = Math.round(from + (to - from) * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

  return <span>{displayed.value}</span>
})

export const StreakBadge = component$<{
  data: ContributionData | null
}>((props) => {
  const currentStreak = useComputed$(() =>
    props.data ? calcCurrentStreak(props.data.contributions) : 0,
  )
  const longestStreak = useComputed$(() =>
    props.data ? calcLongestStreak(props.data.contributions) : 0,
  )

  return (
    <div class="flex flex-wrap items-center gap-4">
      <div
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
        style="background:var(--bg-card);border:1px solid var(--border)"
      >
        <span class="text-lg">🔥</span>
        <span style="color:var(--text-2)">現在のストリーク:</span>
        <span class="font-bold" style="color:var(--accent)">
          <AnimatedNumber target={currentStreak.value} />
          日
        </span>
      </div>

      <div
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
        style="background:var(--bg-card);border:1px solid var(--border)"
      >
        <span class="text-lg">⚡</span>
        <span style="color:var(--text-2)">最長:</span>
        <span class="font-bold" style="color:var(--accent-2)">
          <AnimatedNumber target={longestStreak.value} />
          日
        </span>
      </div>
    </div>
  )
})
