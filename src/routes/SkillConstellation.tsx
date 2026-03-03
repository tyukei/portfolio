import { component$, useSignal } from '@builder.io/qwik'
import { CONSTELLATIONS, type Star } from '~/data/skills'

const CANVAS_W = 600
const CANVAS_H = 400

interface HoverInfo {
  name: string
  level: number
  color: string
  x: number
  y: number
}

export const SkillConstellation = component$(() => {
  const hovered = useSignal<HoverInfo | null>(null)

  return (
    <div>
      <h2 class="text-2xl font-bold mb-4" style="color:var(--text-1)">
        Skills
      </h2>

      {/* Legend */}
      <div class="flex flex-wrap gap-3 mb-4">
        {CONSTELLATIONS.map((c) => (
          <div key={c.name} class="flex items-center gap-1.5 text-xs">
            <div
              class="w-2 h-2 rounded-full"
              style={`background:${c.color}`}
            />
            <span style="color:var(--text-2)">{c.name}</span>
          </div>
        ))}
      </div>

      <div
        class="relative rounded-xl overflow-hidden"
        style="background:var(--bg-card);border:1px solid var(--border)"
      >
        <svg
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          width="100%"
          style="display:block"
          onMouseLeave$={() => {
            hovered.value = null
          }}
        >
          {/* Background stars (decorative) */}
          <BackgroundStars />

          {/* Constellations */}
          {CONSTELLATIONS.map((constellation) => {
            const { stars, lines, color } = constellation
            return (
              <g key={constellation.name}>
                {/* Lines between stars */}
                {lines.map(([a, b]) => {
                  const sa = stars[a]
                  const sb = stars[b]
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={sa.x * CANVAS_W}
                      y1={sa.y * CANVAS_H}
                      x2={sb.x * CANVAS_W}
                      y2={sb.y * CANVAS_H}
                      stroke={color}
                      stroke-width="0.8"
                      stroke-opacity="0.4"
                    />
                  )
                })}

                {/* Stars */}
                {stars.map((star) => {
                  const r = star.level * 2.5 + 2
                  const cx = star.x * CANVAS_W
                  const cy = star.y * CANVAS_H
                  return (
                    <g
                      key={star.name}
                      onMouseEnter$={() => {
                        hovered.value = {
                          name: star.name,
                          level: star.level,
                          color,
                          x: cx,
                          y: cy,
                        }
                      }}
                    >
                      {/* Glow */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r + 4}
                        fill={color}
                        fill-opacity="0.15"
                      />
                      {/* Star */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={color}
                        fill-opacity="0.9"
                        style="cursor:pointer"
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* Hover label */}
          {hovered.value && (
            <StarLabel info={hovered.value} />
          )}
        </svg>
      </div>

      {/* Level legend */}
      <div class="flex items-center gap-3 mt-3 text-xs" style="color:var(--text-2)">
        <span>経験レベル:</span>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div key={lvl} class="flex items-center gap-1">
            <svg width={lvl * 5 + 4} height={lvl * 5 + 4}>
              <circle
                cx={(lvl * 5 + 4) / 2}
                cy={(lvl * 5 + 4) / 2}
                r={lvl * 2.5 + 2}
                fill="var(--accent)"
                fill-opacity="0.8"
              />
            </svg>
            <span>{lvl}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

const BackgroundStars = component$(() => {
  // Static decorative stars using deterministic positions
  const bgStars = [
    { cx: 45, cy: 15 }, { cx: 120, cy: 35 }, { cx: 200, cy: 10 },
    { cx: 310, cy: 20 }, { cx: 400, cy: 8 }, { cx: 490, cy: 30 },
    { cx: 560, cy: 12 }, { cx: 580, cy: 50 }, { cx: 15, cy: 80 },
    { cx: 90, cy: 100 }, { cx: 170, cy: 90 }, { cx: 260, cy: 110 },
    { cx: 350, cy: 85 }, { cx: 440, cy: 105 }, { cx: 530, cy: 95 },
    { cx: 30, cy: 150 }, { cx: 140, cy: 170 }, { cx: 230, cy: 155 },
    { cx: 370, cy: 165 }, { cx: 460, cy: 145 }, { cx: 570, cy: 160 },
    { cx: 60, cy: 220 }, { cx: 190, cy: 240 }, { cx: 280, cy: 210 },
    { cx: 410, cy: 230 }, { cx: 510, cy: 215 }, { cx: 590, cy: 245 },
    { cx: 25, cy: 290 }, { cx: 110, cy: 310 }, { cx: 220, cy: 300 },
    { cx: 330, cy: 285 }, { cx: 480, cy: 305 }, { cx: 560, cy: 290 },
    { cx: 70, cy: 360 }, { cx: 160, cy: 375 }, { cx: 270, cy: 355 },
    { cx: 395, cy: 370 }, { cx: 495, cy: 360 }, { cx: 580, cy: 380 },
  ]

  return (
    <g>
      {bgStars.map((s) => (
        <circle
          key={`${s.cx}-${s.cy}`}
          cx={s.cx}
          cy={s.cy}
          r="0.7"
          fill="#e8f0e9"
          fill-opacity="0.25"
        />
      ))}
    </g>
  )
})

const StarLabel = component$<{ info: HoverInfo }>((props) => {
  const { name, level, color, x, y } = props.info
  const textX = x + 12
  const textY = y - 4

  return (
    <g>
      <rect
        x={textX - 4}
        y={textY - 14}
        width={name.length * 7 + 56}
        height={20}
        rx="4"
        fill="#0a0f0d"
        fill-opacity="0.9"
        stroke={color}
        stroke-width="0.5"
      />
      <text
        x={textX}
        y={textY}
        font-size="11"
        fill={color}
        font-family="system-ui, sans-serif"
        font-weight="600"
      >
        {name}
      </text>
      <text
        x={textX + name.length * 7 + 4}
        y={textY}
        font-size="10"
        fill="var(--text-2)"
        font-family="system-ui, sans-serif"
      >
        Lv.{level}
      </text>
    </g>
  )
})
