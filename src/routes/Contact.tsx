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
      class="flex items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-surface)]"
      style="border-bottom:1px solid var(--border)"
    >
      <div class="flex items-center gap-3">
        <div class={`${item.icon} w-4 h-4`} style="color:var(--text-1)" />
        <span class="text-sm font-medium" style="color:var(--text-1)">
          {item.name}
        </span>
        <span class="text-xs" style="color:var(--text-2)">
          ({SPEED_LABEL[item.speed]})
        </span>
      </div>

      <div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-40"
            style="color:var(--text-2)"
          >
            {item.id}
            <div class="i-tabler:arrow-up-right w-3.5 h-3.5" />
          </a>
        ) : item.copy ? (
          <button
            type="button"
            onClick$={() => navigator.clipboard.writeText(item.copy!)}
            class="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-40 cursor-pointer"
            style="color:var(--text-2);background:transparent;border:none;padding:0"
          >
            {item.copy}
            <div class="i-tabler:copy w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
})

export const Contact = component$(() => {
  return (
    <section class="py-24 px-6 md:px-12" style="border-top:1px solid var(--border)">
      <div class="max-w-5xl mx-auto">

        {/* Two-column layout on desktop */}
        <div class="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* Left column: Contact links */}
          <div class="flex-1 max-w-md">
            <div class="flex items-start gap-3 mb-8">
              <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
                Contact
              </h2>
              <span
                class="text-[9px] tracking-widest mt-1 select-none"
                style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.2em"
              >
                お問い合わせ
              </span>
            </div>
            <div class="flex flex-col">
              {CONTACTS.map((item) => (
                <ContactRow key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Right column: Google Form */}
          <div class="flex-1">
            <h2 class="font-serif-jp text-2xl font-bold mb-3" style="color:var(--text-1)">
              お問い合わせフォーム
            </h2>
            <p class="text-sm mb-6" style="color:var(--text-2)">
              ご依頼・ご相談・登壇オファーなどお気軽にどうぞ。
            </p>

            {/* Google Form iframe — color-scheme:light で白背景固定 */}
            <div
              class="w-full rounded-xl overflow-hidden"
              style="border:1px solid var(--border)"
            >
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSfdEG1xBEndfKyPQhqGUvHq0tv_lUWj7CNU-DRn7Fi-OJk9rQ/viewform?embedded=true"
                width="100%"
                height="820"
                style="display:block;border:none;color-scheme:light"
                title="お問い合わせフォーム"
                loading="lazy"
              />
            </div>

            <p class="text-xs mt-3" style="color:var(--text-2);opacity:0.5">
              フォームが表示されない場合は{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfdEG1xBEndfKyPQhqGUvHq0tv_lUWj7CNU-DRn7Fi-OJk9rQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-4 transition-opacity hover:opacity-40"
                style="color:var(--text-1)"
              >
                こちら
              </a>
              {' '}から直接開けます。
            </p>
          </div>

        </div>
      </div>
    </section>
  )
})
