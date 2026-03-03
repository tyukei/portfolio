import {
  Slot,
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik'

const BIRTH = new Date('2000-07-08T20:00:00+09:00').getTime()

const Row = component$<{ icon: string }>((props) => {
  return (
    <li class="flex items-start gap-3">
      <div
        class={`${props.icon} w-5 h-5 mt-0.5 flex-shrink-0`}
        style="color:var(--accent)"
      />
      <span style="color:var(--text-1)">
        <Slot />
      </span>
    </li>
  )
})

export const About = component$(() => {
  const now = useSignal(Date.now())

  useVisibleTask$(({ cleanup }) => {
    let running = true
    const step = () => {
      now.value = Date.now()
      if (running) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    cleanup(() => {
      running = false
    })
  })

  const age = useComputed$(
    () => (now.value - BIRTH) / 1000 / 3600 / 24 / 365.24219,
  )

  return (
    <div>
      <h2 class="text-2xl font-bold mb-4" style="color:var(--text-1)">
        About
      </h2>
      <ul class="flex flex-col gap-3">
        <Row icon="i-tabler:user">Keita Nakata / 中田 継太</Row>
        <Row icon="i-tabler:cake">
          {Math.floor(age.value)}.
          <span class="text-sm font-mono">
            {(Math.floor((age.value % 1) * 1_000_000_000) / 1_000_000_000)
              .toString()
              .slice(2)
              .padEnd(9, '0')}
          </span>{' '}
          y/o
        </Row>
        <Row icon="i-tabler:map-pin">国頭郡, 沖縄, 日本</Row>
      </ul>
    </div>
  )
})
