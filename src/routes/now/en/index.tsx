import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { component$ } from '@builder.io/qwik'
import { Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city'
import { NOW_DATA_EN, NOW_UPDATED, type NowSection } from '~/data/now'

interface NowJson {
  updatedAt: string
  sections: NowSection[]
}

// Loads public/static-api/now-en.json at build time (SSG).
// Falls back to src/data/now.ts (NOW_DATA_EN) when the JSON hasn't been generated yet.
export const useNowDataEn = routeLoader$(async (): Promise<NowJson> => {
  try {
    const path = join(process.cwd(), 'public', 'static-api', 'now-en.json')
    const raw = await readFile(path, 'utf-8')
    const data = JSON.parse(raw) as NowJson
    if (Array.isArray(data.sections) && data.sections.length > 0) {
      return data
    }
  } catch {
    // File not yet generated — fall through to static fallback
  }
  return { updatedAt: NOW_UPDATED, sections: NOW_DATA_EN }
})

export default component$(() => {
  const now = useNowDataEn()
  const { updatedAt, sections } = now.value

  return (
    <div class="max-w-2xl mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div class="mb-12">
        <h1
          class="font-serif-jp text-4xl font-bold mb-3"
          style="color:var(--text-1)"
        >
          /now
        </h1>
        <p class="text-sm" style="color:var(--text-2)">
          What I'm doing right now. Last updated:{' '}
          <time dateTime={updatedAt}>{updatedAt}</time>
        </p>
        <div class="flex items-center gap-4 mt-3 text-xs" style="color:var(--text-2)">
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 transition-opacity hover:opacity-40"
          >
            What is a /now page?
            <div class="i-tabler:arrow-up-right w-3 h-3" />
          </a>
          <span style="opacity:0.3">·</span>
          <span class="flex items-center gap-1" style="opacity:0.5">
            <div class="i-tabler:refresh w-3 h-3" />
            Updated every Monday
          </span>
          <span style="opacity:0.3">·</span>
          <Link
            href="/now"
            class="flex items-center gap-1 transition-opacity hover:opacity-40"
          >
            <div class="i-tabler:language w-3 h-3" />
            日本語
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div class="flex flex-col gap-14">
        {sections.map((section) => (
          <section key={section.title}>
            <div
              class="flex items-start gap-3 mb-6 pb-3"
              style="border-bottom:1px solid var(--border)"
            >
              <h2 class="font-serif-jp text-lg font-bold" style="color:var(--text-1)">
                {section.title}
              </h2>
            </div>

            <div class="flex flex-col gap-4">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  class="rounded-xl p-5 transition-colors duration-200 hover:bg-[var(--bg-surface)]"
                  style="background:var(--bg-card);border:1px solid var(--border)"
                >
                  <div class="flex items-center gap-2.5 mb-2.5">
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
      <div class="mt-16 pt-8" style="border-top:1px solid var(--border)">
        <Link
          href="/"
          class="flex items-center gap-2 text-sm transition-opacity hover:opacity-40"
          style="color:var(--text-2)"
        >
          <div class="i-tabler:arrow-left w-4 h-4" />
          Back to top
        </Link>
      </div>
    </div>
  )
})

export const head: DocumentHead = {
  title: '/now (EN) — Keita Nakata',
  meta: [
    {
      name: 'description',
      content:
        "What Keita Nakata is working on, reading, and into right now. Auto-updated weekly by Gemini.",
    },
  ],
}
