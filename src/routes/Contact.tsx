import { component$ } from '@builder.io/qwik'

interface ContactItem {
  icon: string
  name: string
  id?: string
  speed: 'fast' | 'normal' | 'slow'
  url?: string
  copy?: string
}

const CONTACTS: ContactItem[] = [
  {
    icon: 'i-simple-icons:discord',
    name: 'Discord (Community)',
    id: 'Join Server',
    speed: 'fast',
    url: 'https://discord.gg/xpX8aaagNK',
  },
  {
    icon: 'i-tabler:mail',
    name: 'email',
    speed: 'normal',
    copy: 'nakata.keita.12[a]gmail.com',
  },
  {
    icon: 'i-simple-icons:x',
    name: 'X',
    id: '@tyukei3',
    speed: 'slow',
    url: 'https://x.com/tyukei3',
  },
  {
    icon: 'i-simple-icons:linkedin',
    name: 'LinkedIn',
    id: 'Keita Nakata',
    speed: 'slow',
    url: 'https://www.linkedin.com/in/keita-nakata-96bb9a2a6/',
  },
]

const SPEED_LABEL: Record<string, string> = {
  fast: '早い',
  normal: '普通',
  slow: '遅い',
}

const ContactRow = component$<{ item: ContactItem }>((props) => {
  const { item } = props

  return (
    <div
      class="flex items-center justify-between gap-4 py-4"
      style="border-bottom:1px solid var(--border)"
    >
      <div class="flex items-center gap-3">
        <div class={`${item.icon} w-5 h-5`} style="color:var(--text-1)" />
        <span class="text-base font-medium" style="color:var(--text-1)">
          {item.name}
        </span>
        <span class="text-sm" style="color:var(--text-2)">
          ({SPEED_LABEL[item.speed]})
        </span>
      </div>

      <div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--accent)]"
            style="color:var(--text-2)"
          >
            {item.id}
            <div class="i-tabler:external-link w-4 h-4" />
          </a>
        ) : item.copy ? (
          <button
            type="button"
            onClick$={() => navigator.clipboard.writeText(item.copy!)}
            class="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--accent)] cursor-pointer"
            style="color:var(--text-2);background:transparent;border:none;padding:0"
          >
            {item.copy}
            <div class="i-tabler:copy w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
})

export const Contact = component$(() => {
  return (
    <section class="py-12 px-4 md:px-8 mt-4">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold mb-6" style="color:var(--text-1)">
          Contact
        </h2>
        <div class="flex flex-col max-w-2xl">
          {CONTACTS.map((item) => (
            <ContactRow key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
})
