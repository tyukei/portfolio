import type { UserConfig } from '@unocss/core'
import { presetIcons } from '@unocss/preset-icons'
import { presetUno } from '@unocss/preset-uno'

export default {
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetIcons({
      collections: {},
    }),
  ],
  theme: {
    colors: {
      'bg-base': 'var(--bg-base)',
      'bg-surface': 'var(--bg-surface)',
      'bg-card': 'var(--bg-card)',
      border: 'var(--border)',
      'text-1': 'var(--text-1)',
      'text-2': 'var(--text-2)',
      accent: 'var(--accent)',
      'accent-2': 'var(--accent-2)',
    },
  },
} satisfies UserConfig
