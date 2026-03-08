import { Slot, component$ } from '@builder.io/qwik'

const BIRTH = new Date('2000-07-08T20:00:00+09:00').getTime()

const Row = component$<{ icon: string; last?: boolean }>((props) => {
  return (
    <li
      class="flex items-start gap-3 py-3"
      style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
    >
      <div
        class={`${props.icon} w-4 h-4 mt-0.5 flex-shrink-0`}
        style="color:var(--text-2)"
      />
      <span class="text-sm" style="color:var(--text-1)">
        <Slot />
      </span>
    </li>
  )
})

export const About = component$(() => {
  return (
    <div class="relative">
      <div
        class="absolute left-0 top-1 bottom-1 w-px"
        style="background:linear-gradient(to bottom, transparent, var(--border), transparent)"
      />
      <div class="pl-5 md:pl-6">
        {/* Heading with vertical writing decoration */}
        <div class="flex items-start gap-3 mb-4">
          <h2
            class="font-serif-jp text-[2.25rem] leading-none font-bold"
            style="color:var(--text-1)"
          >
            About
          </h2>
          <span
            class="text-[9px] tracking-widest mt-1 select-none"
            style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.22em"
          >
            アバウト
          </span>
        </div>

        <ul class="flex flex-col">
          <Row icon="i-tabler:user">Keita Nakata / 中田 継太</Row>
          <Row icon="i-tabler:cake">
            <span class="live-age font-mono" data-birth={String(BIRTH)}>
              ---.---------
            </span>{' '}
            y/o{' '}
            <script
              dangerouslySetInnerHTML={`(() => {
  if (window.__liveAgeRaf) return;
  const YEAR_MS = 365.24219 * 24 * 3600 * 1000;
  // Combine Date.now() epoch with performance.now() delta for sub-ms precision
  const t0ms = Date.now();
  const t0perf = performance.now();
  const now = () => t0ms + (performance.now() - t0perf);
  const renderAge = () => {
    const elements = document.querySelectorAll('.live-age');
    for (const el of elements) {
      const birth = Number(el.getAttribute('data-birth'));
      if (!Number.isFinite(birth)) continue;
      const age = (now() - birth) / YEAR_MS;
      const intPart = Math.floor(age);
      const frac = (age % 1).toFixed(9).slice(2);
      el.textContent = \`\${intPart}.\${frac}\`;
    }
    window.__liveAgeRaf = requestAnimationFrame(renderAge);
  };
  window.__liveAgeRaf = requestAnimationFrame(renderAge);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(window.__liveAgeRaf);
    window.__liveAgeRaf = 0;
  }, { once: true });
})();`}
            />
          </Row>
          <Row icon="i-tabler:map-pin" last>
            国頭郡, 沖縄, 日本
          </Row>
        </ul>
      </div>
    </div>
  )
})
