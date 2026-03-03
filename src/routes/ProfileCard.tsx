import { component$ } from '@builder.io/qwik'

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

export const ProfileCard = component$(() => {
  return (
    <section
      class="w-full pt-8 pb-4 px-4 md:px-8"
      style="background:var(--bg-base)"
    >
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <img
          src="https://github.com/tyukei.png"
          alt="Keita Nakata"
          width="80"
          height="80"
          class="rounded-full flex-shrink-0"
          style="border:2px solid var(--accent)"
        />

        {/* Profile info */}
        <div class="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
          <div class="flex flex-wrap items-baseline gap-2 justify-center sm:justify-start">
            <h1 class="text-2xl font-bold" style="color:var(--text-1)">
              Keita Nakata
            </h1>
            <span class="text-base" style="color:var(--text-2)">
              @tyukei
            </span>
          </div>

          <p class="text-sm" style="color:var(--text-2)">
            沖縄のしがないデータエンジニアでござる
          </p>

          {/* Social links */}
          <div class="flex items-center gap-3 mt-1">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                class="transition-opacity hover:opacity-70"
              >
                <div
                  class={`${link.icon} w-5 h-5`}
                  style="color:var(--text-2)"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})
