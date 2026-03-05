import { component$ } from '@builder.io/qwik'
import type { Talk } from '~/lib/articles'

const TalkCard = component$<{ talk: Talk; last: boolean }>((props) => {
  const { talk } = props
  const date = talk.date
    ? new Date(talk.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : ''

  return (
    <a
      href={talk.url}
      target="_blank"
      rel="noopener noreferrer"
      class="block group"
    >
      <div
        class="py-4 px-3 -mx-3 rounded-lg flex gap-3 items-start transition-colors duration-200 group-hover:bg-[var(--bg-surface)]"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        {/* Thumbnail with zoom on hover */}
        {talk.thumbnail ? (
          <div
            class="overflow-hidden rounded flex-shrink-0"
            style="width:60px;height:38px"
          >
            <img
              src={talk.thumbnail}
              alt={talk.title}
              width="60"
              height="38"
              class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              style="background:var(--bg-surface)"
            />
          </div>
        ) : (
          <div
            class="w-15 h-9.5 rounded flex items-center justify-center flex-shrink-0"
            style="background:var(--bg-surface);width:60px;height:38px"
          >
            <div class="i-simple-icons:speakerdeck w-4 h-4" style="color:var(--text-2)" />
          </div>
        )}

        <div class="min-w-0 flex-1 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div
              class="text-sm font-medium leading-snug"
              style="color:var(--text-1)"
            >
              {talk.title}
            </div>
            {date && (
              <div class="text-xs mt-1" style="color:var(--text-2)">
                {date}
              </div>
            )}
          </div>
          {/* Arrow slides right on hover */}
          <span
            class="flex-shrink-0 text-base transition-transform duration-300 ease-out group-hover:translate-x-1 mt-0.5"
            style="color:var(--text-2)"
          >
            →
          </span>
        </div>
      </div>
    </a>
  )
})

export const Talks = component$<{ talks: Talk[] }>((props) => {
  const talks = props.talks.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        {/* Serif heading with vertical writing accent */}
        <div class="flex items-start gap-2">
          <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
            Talks
          </h2>
          <span
            class="text-[9px] tracking-widest mt-1 select-none"
            style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.2em"
          >
            登壇
          </span>
        </div>
        <a
          href="https://speakerdeck.com/tyukei"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 tracking-wider uppercase transition-opacity hover:opacity-40"
          style="color:var(--text-2);letter-spacing:0.12em"
        >
          SpeakerDeck
          <div class="i-tabler:arrow-up-right w-3 h-3" />
        </a>
      </div>

      {talks.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          スライドが見つかりませんでした。
        </p>
      ) : (
        <div>
          {talks.map((talk, i) => (
            <TalkCard key={talk.url} talk={talk} last={i === talks.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
