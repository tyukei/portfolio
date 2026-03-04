import { Slot, component$ } from '@builder.io/qwik'

const BIRTH = new Date('2000-07-08T20:00:00+09:00').getTime()

const Row = component$<{ icon: string }>((props) => {
  return (
    <li class="flex items-start gap-3">
      <div
        class={`${props.icon} w-5 h-5 mt-0.5 flex-shrink-0`}
        style="color:var(--accent)"
      />
      <span style="color:var(--text-1)">
        <Slot />
      </span>
    </li>
  )
})

export const About = component$(() => {
  return (
    <div>
      <h2 class="text-2xl font-bold mb-4" style="color:var(--text-1)">
        About
      </h2>
      <ul class="flex flex-col gap-3">
        <Row icon="i-tabler:user">Keita Nakata / 中田 継太</Row>
        <Row icon="i-tabler:cake">
          <span class="live-age font-mono" data-birth={String(BIRTH)}>
            ---.---------
          </span>{' '}
          y/o{' '}
          <script
            dangerouslySetInnerHTML={`(() => {
  if (window.__liveAgeTimer) return;
  const YEAR = 1000 * 60 * 60 * 24 * 365.24219;
  const renderAge = () => {
    const elements = document.querySelectorAll('.live-age');
    if (!elements.length) return;
    for (const el of elements) {
      const birth = Number(el.getAttribute('data-birth'));
      if (!Number.isFinite(birth)) continue;
      const age = (Date.now() - birth) / YEAR;
      const intPart = Math.floor(age);
      const fracPart = (Math.floor((age % 1) * 1_000_000_000) / 1_000_000_000)
        .toString()
        .slice(2)
        .padEnd(9, '0');
      el.textContent = \`\${intPart}.\${fracPart}\`;
    }
  };
  renderAge();
  window.__liveAgeTimer = window.setInterval(renderAge, 250);
  window.addEventListener('pagehide', () => {
    if (window.__liveAgeTimer) {
      window.clearInterval(window.__liveAgeTimer);
      window.__liveAgeTimer = 0;
    }
  }, { once: true });
})();`}
          />
        </Row>
        <Row icon="i-tabler:map-pin">国頭郡, 沖縄, 日本</Row>
      </ul>
    </div>
  )
})
