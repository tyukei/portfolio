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
  const isDark = useSignal(true)

  useVisibleTask$(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      isDark.value = false
      document.documentElement.classList.add('light')
    }
  })

  return (
    <>
      {/* Nav */}
      <nav
        class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 h-12"
        style="background:var(--bg-base);border-bottom:1px solid var(--border)"
      >
        <Link
          href="/"
          class="text-sm font-bold tracking-wide"
          style="color:var(--accent)"
        >
          tyukei
        </Link>

        <div class="flex items-center gap-4">
          <Link
            href="/now"
            class="text-sm transition-opacity hover:opacity-70"
            style="color:var(--text-2)"
          >
            /now
          </Link>

          {/* Theme toggle */}
          <button
            type="button"
            aria-label="Toggle theme"
            class="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:opacity-70"
            style="color:var(--text-2)"
            onClick$={() => {
              isDark.value = !isDark.value
              if (isDark.value) {
                document.documentElement.classList.remove('light')
                localStorage.setItem('theme', 'dark')
              } else {
                document.documentElement.classList.add('light')
                localStorage.setItem('theme', 'light')
              }
            }}
          >
            {isDark.value ? (
              <div class="i-tabler:sun w-5 h-5" />
            ) : (
              <div class="i-tabler:moon w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Main content — push down by nav height */}
      <main class="pt-12">
        <Slot />
      </main>

      {/* Footer */}
      <footer
        class="text-center py-6 text-xs"
        style="color:var(--text-2);border-top:1px solid var(--border)"
      >
        © 2024 Keita Nakata. Built with{' '}
        <a
          href="https://qwik.dev"
          target="_blank"
          rel="noopener noreferrer"
          style="color:var(--accent)"
        >
          Qwik
        </a>{' '}
        +{' '}
        <a
          href="https://unocss.dev"
          target="_blank"
          rel="noopener noreferrer"
          style="color:var(--accent)"
        >
          UnoCSS
        </a>
      </footer>
    </>
  )
})
