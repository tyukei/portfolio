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
    fontFamily: {
      'serif-jp': "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', 'HG明朝E', serif",
    },
    animation: {
      keyframes: {
        // Seamless marquee: container holds 2× content, translates -50%
        marquee: '{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}',
        // Text reveal from below mask
        'reveal-up': '{from{transform:translateY(110%);opacity:0}to{transform:translateY(0);opacity:1}}',
        // Generic fade-in
        'fade-in': '{from{opacity:0}to{opacity:1}}',
      },
      durations: {
        marquee: '32s',
        'reveal-up': '0.9s',
        'fade-in': '0.6s',
      },
      timingFns: {
        marquee: 'linear',
        'reveal-up': 'cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'ease-out',
      },
      counts: {
        marquee: 'infinite',
      },
    },
  },
} satisfies UserConfig
