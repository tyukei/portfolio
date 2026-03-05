import { component$ } from '@builder.io/qwik'

// The text that scrolls across the banner
// Duplicated in the DOM so the -50% translate creates a seamless loop
const ITEMS = [
  'Be. Higashi Free LLM',
  'Data Engineering & Agent Crafting',
  'Okinawa, Japan',
  'Be. Higashi Free LLM',
  'Data Engineering & Agent Crafting',
  'Okinawa, Japan',
]

const SEP = '·'

export const Marquee = component$(() => {
  return (
    <div
      class="overflow-hidden border-y py-3.5 select-none"
      style="border-color:var(--border)"
      aria-hidden="true"
    >
      {/* animate-marquee translates from 0 → -50%; content is duplicated so the loop is seamless */}
      <div class="flex whitespace-nowrap animate-marquee">
        {/* First half */}
        {ITEMS.map((text, i) => (
          <span
            key={i}
            class="inline-flex items-center gap-6 text-xs tracking-widest uppercase"
            style="color:var(--text-2);letter-spacing:0.18em;padding-right:3rem"
          >
            {text}
            <span style="opacity:0.25">{SEP}</span>
          </span>
        ))}
        {/* Second half — identical, enables seamless loop */}
        {ITEMS.map((text, i) => (
          <span
            key={`d${i}`}
            class="inline-flex items-center gap-6 text-xs tracking-widest uppercase"
            style="color:var(--text-2);letter-spacing:0.18em;padding-right:3rem"
          >
            {text}
            <span style="opacity:0.25">{SEP}</span>
          </span>
        ))}
      </div>
    </div>
  )
})
