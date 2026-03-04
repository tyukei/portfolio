import { component$ } from '@builder.io/qwik'
import type { ContributionData } from '~/lib/contributions'
import { ContributionGraph, ContributionLegend } from './ContributionGraph'
import { StreakBadge } from './StreakBadge'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2020 + 1 },
  (_, i) => CURRENT_YEAR - i,
)

export const ContributionSection = component$<{
  byYear: Record<number, ContributionData>
  selectedYear: number
}>((props) => {
  const selectedYear = props.selectedYear
  const ACTIVE_STYLE = 'background:var(--accent);color:#000;'
  const INACTIVE_STYLE =
    'background:transparent;color:var(--text-2);border:1px solid var(--border);'
  const ACTIVE_CLASS = 'bg-[var(--accent)] text-black'
  const INACTIVE_CLASS =
    'bg-transparent text-[var(--text-2)] border border-[var(--border)]'
  const sectionId = 'contrib-section'

  return (
    <div class="flex flex-col gap-3" id={sectionId}>
      {/* Year tabs */}
      <div class="flex items-center gap-2 flex-wrap">
        {YEARS.map((y) => (
          <a
            key={y}
            href={y === CURRENT_YEAR ? `#${sectionId}` : `?year=${y}#${sectionId}`}
            data-year-tab={String(y)}
            class={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedYear === y ? ACTIVE_CLASS : INACTIVE_CLASS
            }`}
            style={selectedYear === y ? ACTIVE_STYLE : INACTIVE_STYLE}
            aria-current={selectedYear === y ? 'page' : undefined}
          >
            {y}
          </a>
        ))}
      </div>

      {YEARS.map((y) => {
        const data = props.byYear[y] ?? null
        return (
          <div
            key={y}
            data-year-panel={String(y)}
            style={selectedYear === y ? '' : 'display:none;'}
            class="flex flex-col gap-3"
          >
            <div
              class="rounded-xl p-4 md:p-5"
              style="background:var(--bg-surface);border:1px solid var(--border)"
            >
              <ContributionGraph data={data} loading={false} year={y} />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <StreakBadge data={data} />
              <ContributionLegend />
            </div>
          </div>
        )
      })}

      <script
        dangerouslySetInnerHTML={`(() => {
  const root = document.getElementById('${sectionId}');
  if (!root) return;
  const CURRENT_YEAR = '${CURRENT_YEAR}';
  const ACTIVE_STYLE = '${ACTIVE_STYLE}';
  const INACTIVE_STYLE = '${INACTIVE_STYLE}';
  const tabs = Array.from(root.querySelectorAll('[data-year-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-year-panel]'));
  if (!tabs.length || !panels.length) return;

  const validYears = new Set(tabs.map((t) => t.getAttribute('data-year-tab')));
  const fromUrl = new URL(window.location.href).searchParams.get('year');
  const initialYear = validYears.has(fromUrl) ? fromUrl : CURRENT_YEAR;

  const setYear = (year) => {
    for (const tab of tabs) {
      const active = tab.getAttribute('data-year-tab') === year;
      tab.setAttribute('style', active ? ACTIVE_STYLE : INACTIVE_STYLE);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    }
    for (const panel of panels) {
      panel.setAttribute('style', panel.getAttribute('data-year-panel') === year ? '' : 'display:none;');
    }
  };

  setYear(initialYear);

  for (const tab of tabs) {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const year = tab.getAttribute('data-year-tab');
      if (!year) return;
      setYear(year);
      const url = new URL(window.location.href);
      if (year === CURRENT_YEAR) url.searchParams.delete('year');
      else url.searchParams.set('year', year);
      url.hash = '${sectionId}';
      window.history.replaceState(null, '', url.toString());
    });
  }
})();`}
      />
    </div>
  )
})
