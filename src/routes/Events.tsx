import { component$ } from '@builder.io/qwik'
import type { ConnpassEvent } from '~/lib/articles'

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
        class="py-4 px-3 -mx-3 rounded-lg transition-colors duration-200 group-hover:bg-[var(--bg-surface)]"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-medium leading-snug" style="color:var(--text-1)">
              {event.title}
            </div>
            <div class="flex items-center gap-3 mt-1.5 text-xs" style="color:var(--text-2)">
              <span>{date}</span>
              {event.is_owner && (
                <span
                  class="px-1.5 py-0.5 rounded text-xs font-medium"
                  style="background:var(--bg-card);color:var(--text-2);border:1px solid var(--border)"
                >
                  主催
                </span>
              )}
            </div>
          </div>
          {/* Arrow slides right on hover */}
          <span
            class="flex-shrink-0 text-base transition-transform duration-300 ease-out group-hover:translate-x-1"
            style="color:var(--text-2)"
          >
            →
          </span>
        </div>
      </div>
    </a>
  )
})

export const Events = component$<{ events: ConnpassEvent[] }>((props) => {
  const events = props.events.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        {/* Serif heading with vertical writing accent */}
        <div class="flex items-start gap-2">
          <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
            Events
          </h2>
          <span
            class="text-[9px] tracking-widest mt-1 select-none"
            style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.2em"
          >
            イベント
          </span>
        </div>
        <a
          href="https://connpass.com/user/tyukei/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 tracking-wider uppercase transition-opacity hover:opacity-40"
          style="color:var(--text-2);letter-spacing:0.12em"
        >
          Connpass
          <div class="i-tabler:arrow-up-right w-3 h-3" />
        </a>
      </div>

      {events.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          イベントが見つかりませんでした。
        </p>
      ) : (
        <div>
          {events.map((event, i) => (
            <EventCard key={event.event_id} event={event} last={i === events.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
