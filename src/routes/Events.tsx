import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { type ConnpassEvent, fetchEvents } from '~/lib/articles'

const EventCard = component$<{ event: ConnpassEvent; last: boolean }>((props) => {
  const { event } = props
  const date = event.started_at
    ? new Date(event.started_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : ''

  return (
    <a
      href={event.event_url}
      target="_blank"
      rel="noopener noreferrer"
      class="block group"
    >
      <div
        class="py-3 transition-opacity group-hover:opacity-70"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="text-sm font-medium leading-snug" style="color:var(--text-1)">
          {event.title}
        </div>
        <div class="flex items-center gap-3 mt-1 text-xs" style="color:var(--text-2)">
          <span>{date}</span>
          {event.is_owner && (
            <span
              class="px-1.5 py-0.5 rounded text-xs font-medium"
              style="background:var(--bg-surface);color:var(--accent-2);border:1px solid var(--accent-2)"
            >
              主催
            </span>
          )}
        </div>
      </div>
    </a>
  )
})

export const Events = component$(() => {
  const events = useSignal<ConnpassEvent[]>([])
  const loading = useSignal(true)

  useVisibleTask$(async () => {
    try {
      events.value = await fetchEvents(3)
    } catch {
      // silently fail
    } finally {
      loading.value = false
    }
  })

  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold" style="color:var(--text-1)">
          Events
        </h2>
        <a
          href="https://connpass.com/user/tyukei/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
          style="color:var(--accent)"
        >
          Connpass でみる
          <div class="i-tabler:external-link w-3 h-3" />
        </a>
      </div>

      {loading.value ? (
        <div class="flex items-center gap-2 text-sm py-4" style="color:var(--text-2)">
          <div class="i-tabler:loader-2 w-4 h-4 animate-spin" />
          Loading...
        </div>
      ) : events.value.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          イベントが見つかりませんでした。
        </p>
      ) : (
        <div>
          {events.value.map((event, i) => (
            <EventCard key={event.event_id} event={event} last={i === events.value.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
