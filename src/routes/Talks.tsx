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
        class="py-3 flex gap-3 items-start transition-opacity group-hover:opacity-70"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        {talk.thumbnail ? (
          <img
            src={talk.thumbnail}
            alt={talk.title}
            width="56"
            height="36"
            class="rounded flex-shrink-0 object-cover"
            style="background:var(--bg-surface)"
          />
        ) : (
          <div
            class="w-14 h-9 rounded flex items-center justify-center flex-shrink-0"
            style="background:var(--bg-surface)"
          >
            <div class="i-simple-icons:speakerdeck w-4 h-4" style="color:#a78bfa" />
          </div>
        )}
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
      </div>
    </a>
  )
})

export const Talks = component$<{ talks: Talk[] }>((props) => {
  const talks = props.talks.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold" style="color:var(--text-1)">
          Talks
        </h2>
        <a
          href="https://speakerdeck.com/tyukei"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
          style="color:var(--accent)"
        >
          SpeakerDeck でみる
          <div class="i-tabler:external-link w-3 h-3" />
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
