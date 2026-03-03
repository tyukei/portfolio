import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { NOW_DATA, NOW_UPDATED } from '~/data/now'

export default component$(() => {
  return (
    <div class="max-w-2xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2" style="color:var(--text-1)">
          /now
        </h1>
        <p class="text-sm" style="color:var(--text-2)">
          今この瞬間に何をしているか。最終更新:{' '}
          <time dateTime={NOW_UPDATED}>{NOW_UPDATED}</time>
        </p>
        <div class="mt-2">
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs transition-opacity hover:opacity-70"
            style="color:var(--accent)"
          >
            /now ページとは？
          </a>
        </div>
      </div>

      {/* Sections */}
      <div class="flex flex-col gap-10">
        {NOW_DATA.map((section) => (
          <section key={section.title}>
            <h2
              class="text-lg font-bold mb-4 pb-2"
              style="color:var(--accent);border-bottom:1px solid var(--border)"
            >
              {section.title}
            </h2>
            <div class="flex flex-col gap-4">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  class="rounded-xl p-4"
                  style="background:var(--bg-card);border:1px solid var(--border)"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">{item.emoji}</span>
                    <span class="font-semibold text-sm" style="color:var(--text-1)">
                      {item.label}
                    </span>
                  </div>
                  <p class="text-sm leading-relaxed" style="color:var(--text-2)">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Back link */}
      <div class="mt-12 pt-6" style="border-top:1px solid var(--border)">
        <a
          href="/"
          class="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style="color:var(--accent)"
        >
          <div class="i-tabler:arrow-left w-4 h-4" />
          トップに戻る
        </a>
      </div>
    </div>
  )
})

export const head: DocumentHead = {
  title: '/now — Keita Nakata',
  meta: [
    {
      name: 'description',
      content: 'Keita Nakata が今取り組んでいること、読んでいるもの、最近ハマっていることを紹介するページ。',
    },
  ],
}
