import {
  Slot,
  component$,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik'
import { Link, type RequestHandler } from '@builder.io/qwik-city'

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  })
}

export default component$(() => {
  const isDark = useSignal(false)

  useVisibleTask$(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  return (
    <>
      {/* Nav — minimal, fixed */}
      <nav
        class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 h-14"
        style="background:var(--bg-base);border-bottom:1px solid var(--border)"
      >
        <Link
          href="/"
          class="text-xs font-bold tracking-widest uppercase"
          style="color:var(--text-1);letter-spacing:0.18em"
        >
          tyukei
        </Link>

        <div class="flex items-center gap-6">
          <Link
            href="/now"
            class="text-xs tracking-widest uppercase transition-opacity hover:opacity-40"
            style="color:var(--text-2);letter-spacing:0.14em"
          >
            /now
          </Link>

          <button
            type="button"
            aria-label="Toggle theme"
            class="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-40"
            style="color:var(--text-2)"
            onClick$={() => {
              isDark.value = !isDark.value
              if (isDark.value) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
              } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
              }
            }}
          >
            {isDark.value ? (
              <div class="i-tabler:sun w-4 h-4" />
            ) : (
              <div class="i-tabler:moon w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      <main class="pt-14">
        <Slot />
      </main>

      {/* Footer */}
      <footer
        class="text-center py-12 text-xs tracking-widest uppercase"
        style="color:var(--text-2);border-top:1px solid var(--border);letter-spacing:0.16em"
      >
        © 2024 Keita Nakata · Built with{' '}
        <a
          href="https://qwik.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-4 transition-opacity hover:opacity-40"
          style="color:var(--text-1)"
        >
          Qwik
        </a>
        {' '}+{' '}
        <a
          href="https://unocss.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-4 transition-opacity hover:opacity-40"
          style="color:var(--text-1)"
        >
          UnoCSS
        </a>
      </footer>
    </>
  )
})
