import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { About } from './About'

interface SocialLink {
  icon: string
  href: string
  label: string
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: 'i-simple-icons:github',
    href: 'https://github.com/tyukei',
    label: 'GitHub',
  },
  {
    icon: 'i-simple-icons:zenn',
    href: 'https://zenn.dev/kei_ninja',
    label: 'Zenn',
  },
  {
    icon: 'i-tabler:calendar-event',
    href: 'https://connpass.com/user/chukei/',
    label: 'Connpass',
  },
  {
    icon: 'i-simple-icons:speakerdeck',
    href: 'https://speakerdeck.com/tyukei',
    label: 'SpeakerDeck',
  },
  {
    icon: 'i-simple-icons:x',
    href: 'https://x.com/tyukei',
    label: 'X (Twitter)',
  },
]

// CSS filter states for the avatar "expression" cycling
const AVATAR_FILTERS = [
  'none',
  'sepia(0.35) saturate(1.7) hue-rotate(-8deg)',
  'hue-rotate(195deg) saturate(1.2) brightness(1.08)',
  'contrast(1.18) saturate(1.9) brightness(1.03)',
]

const AVATAR_LABELS = ['Normal', 'Warm', 'Cool', 'Vivid']

export const ProfileCard = component$(() => {
  const revealed = useSignal(false)
  const avatarState = useSignal(0)

  // Trigger text reveal shortly after mount
  useVisibleTask$(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        revealed.value = true
      }, 80)
    })
    return () => cancelAnimationFrame(raf)
  })

  return (
    <section
      class="w-full pt-24 pb-20 px-6 md:px-12"
      style="background:var(--bg-base)"
    >
      <div class="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-16">

        {/* Left: Avatar + Name block */}
        <div class="flex flex-col gap-6">

          {/* Avatar — click to cycle filter / "expressions" */}
          <button
            type="button"
            title={`Click to change avatar style (${AVATAR_LABELS[avatarState.value]})`}
            class="relative self-start group cursor-pointer p-0 border-0 bg-transparent"
            onClick$={() => {
              avatarState.value = (avatarState.value + 1) % AVATAR_FILTERS.length
            }}
          >
            <img
              src="https://github.com/tyukei.png"
              alt="Keita Nakata"
              width="88"
              height="88"
              class="rounded-full flex-shrink-0 block transition-all duration-700 ease-out group-hover:scale-105"
              style={`border:1px solid var(--border);filter:${AVATAR_FILTERS[avatarState.value]}`}
            />
            {/* Subtle ring that fades in on hover */}
            <span
              class="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style="box-shadow:0 0 0 3px var(--border)"
            />
          </button>

          {/* Name — text reveal (overflow-hidden mask) */}
          <div>
            <div class="overflow-hidden">
              <h1
                class="font-serif-jp text-4xl md:text-5xl font-bold leading-tight transition-transform"
                style={`color:var(--text-1);transition-duration:900ms;transition-timing-function:cubic-bezier(0.16,1,0.3,1);transform:translateY(${revealed.value ? '0' : '110%'})`}
              >
                Keita Nakata
              </h1>
            </div>

            {/* Handle + role — staggered reveal */}
            <div class="overflow-hidden mt-2">
              <p
                class="text-xs tracking-widest uppercase transition-transform"
                style={`color:var(--text-2);letter-spacing:0.16em;transition-duration:800ms;transition-delay:180ms;transition-timing-function:cubic-bezier(0.16,1,0.3,1);transform:translateY(${revealed.value ? '0' : '110%'})`}
              >
                @tyukei · Data Engineer · 沖縄
              </p>
            </div>

            {/* Bio */}
            <p
              class="text-sm mt-3 transition-opacity"
              style={`color:var(--text-2);transition-duration:600ms;transition-delay:320ms;opacity:${revealed.value ? '1' : '0'}`}
            >
              沖縄のしがないデータエンジニアでござる
            </p>

            {/* Social links */}
            <div
              class="flex items-center gap-5 mt-5 transition-opacity"
              style={`transition-duration:600ms;transition-delay:440ms;opacity:${revealed.value ? '1' : '0'}`}
            >
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  class="transition-opacity hover:opacity-30"
                >
                  <div class={`${link.icon} w-4 h-4`} style="color:var(--text-2)" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: About card */}
        <div
          class="w-full md:w-[360px] rounded-xl p-6 transition-opacity"
          style={`background:var(--bg-surface);border:1px solid var(--border);transition-duration:700ms;transition-delay:260ms;opacity:${revealed.value ? '1' : '0'}`}
        >
          <About />
        </div>
      </div>
    </section>
  )
})
