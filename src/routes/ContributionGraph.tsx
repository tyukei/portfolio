import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import {
  LEVEL_COLORS,
  type ContributionData,
  type DayContribution,
  buildWeekGrid,
  scoreToLevel,
} from '~/lib/contributions'

const CELL = 11
const GAP = 2
const STRIDE = CELL + GAP
const DAY_LABEL_W = 24
const MONTH_LABEL_H = 20

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface TooltipInfo {
  date: string
  data: DayContribution | null
  x: number
  y: number
}

export const ContributionGraph = component$<{
  data: ContributionData | null
  loading: boolean
  year: number
}>((props) => {
  const tooltip = useSignal<TooltipInfo | null>(null)

  const cells = props.data ? buildWeekGrid(props.data.contributions, props.year) : []
  const numWeeks = Math.ceil(cells.length / 7)

  // Calculate month label positions
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  const yearStart = `${props.year}-01-01`
  const yearEnd = `${props.year}-12-31`
  for (let i = 0; i < cells.length; i++) {
    const date = cells[i].date
    if (date < yearStart || date > yearEnd) continue
    const col = Math.floor(i / 7)
    const month = new Date(date).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_NAMES[month], col })
      lastMonth = month
    }
  }

  const svgW = DAY_LABEL_W + numWeeks * STRIDE
  const svgH = MONTH_LABEL_H + 7 * STRIDE

  return (
    <div class="w-full overflow-x-auto">
      {props.loading ? (
        <div class="flex items-center justify-center h-32 text-[var(--text-2)]">
          <div class="i-tabler:loader-2 w-6 h-6 animate-spin mr-2" />
          Loading activity data...
        </div>
      ) : (
        <div class="relative inline-block">
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style="display:block"
          >
            {/* Month labels */}
            {monthLabels.map(({ label, col }) => (
              <text
                key={label + col}
                x={DAY_LABEL_W + col * STRIDE}
                y={MONTH_LABEL_H - 4}
                font-size="10"
                fill="var(--text-2)"
                font-family="system-ui, sans-serif"
              >
                {label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, row) =>
              label ? (
                <text
                  key={row}
                  x={DAY_LABEL_W - 4}
                  y={MONTH_LABEL_H + row * STRIDE + CELL - 1}
                  font-size="9"
                  fill="var(--text-2)"
                  text-anchor="end"
                  font-family="system-ui, sans-serif"
                >
                  {label}
                </text>
              ) : null,
            )}

            {/* Cells */}
            {cells.map((cell, i) => {
              const col = Math.floor(i / 7)
              const row = i % 7
              const level = scoreToLevel(cell.data?.total ?? 0)
              const x = DAY_LABEL_W + col * STRIDE
              const y = MONTH_LABEL_H + row * STRIDE
              return (
                <rect
                  key={cell.date}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx="2"
                  fill={LEVEL_COLORS[level]}
                  style="cursor:pointer"
                  onMouseEnter$={(e) => {
                    const rect = (e.target as SVGElement).getBoundingClientRect()
                    tooltip.value = {
                      date: cell.date,
                      data: cell.data,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    }
                  }}
                  onMouseLeave$={() => {
                    tooltip.value = null
                  }}
                />
              )
            })}
          </svg>

          {/* Tooltip */}
          {tooltip.value && (
            <TooltipBox info={tooltip.value} />
          )}
        </div>
      )}
    </div>
  )
})

const TooltipBox = component$<{ info: TooltipInfo }>((props) => {
  const { date, data } = props.info
  const d = new Date(date)
  const label = d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      class="fixed z-50 pointer-events-none"
      style={`left:${props.info.x}px;top:${props.info.y - 8}px;transform:translate(-50%,-100%)`}
    >
      <div
        class="rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap"
        style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-1)"
      >
        <div class="font-bold mb-1">{label}</div>
        {data ? (
          <div class="flex flex-col gap-0.5">
            {data.github > 0 && (
              <div>GitHub: {data.github} commits</div>
            )}
            {data.zenn > 0 && (
              <div>Zenn: {data.zenn} articles</div>
            )}
            {data.connpass > 0 && (
              <div>Connpass: {data.connpass} events</div>
            )}
            {data.speakerdeck > 0 && (
              <div>SpeakerDeck: {data.speakerdeck} talks</div>
            )}
            <div class="mt-1 font-semibold" style="color:var(--accent)">
              Score: {data.total}
            </div>
          </div>
        ) : (
          <div style="color:var(--text-2)">No activity</div>
        )}
      </div>
    </div>
  )
})

export const ContributionLegend = component$(() => {
  return (
    <div class="flex items-center gap-2 text-xs" style="color:var(--text-2)">
      <span>Less</span>
      {LEVEL_COLORS.map((color, i) => (
        <div
          key={i}
          style={`width:11px;height:11px;border-radius:2px;background:${color};flex-shrink:0`}
        />
      ))}
      <span>More</span>
    </div>
  )
})
