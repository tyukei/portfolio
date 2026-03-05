import { component$, useSignal, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik'
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
  useStylesScoped$(`
    .brain-shell {
      fill: var(--bg-surface);
      stroke: var(--border);
      stroke-width: 1.2;
    }
    .brain-midline {
      stroke: var(--border);
      stroke-width: 1;
      stroke-dasharray: 3 3;
      opacity: 0.8;
    }
    .particle {
      fill: var(--accent);
      opacity: 0.14;
      transform-box: fill-box;
      transform-origin: center;
      animation-name: particle-float;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    .constellation-group {
      transform-box: fill-box;
      transform-origin: center;
      animation-name: constellation-drift;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    .node-glow {
      animation-name: node-pulse;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    @keyframes constellation-drift {
      0% {
        transform: translate(0px, 0px);
      }
      25% {
        transform: translate(2px, -2px);
      }
      50% {
        transform: translate(0px, -3px);
      }
      75% {
        transform: translate(-2px, -1px);
      }
      100% {
        transform: translate(0px, 0px);
      }
    }
    @keyframes node-pulse {
      0% {
        opacity: 0.10;
      }
      50% {
        opacity: 0.28;
      }
      100% {
        opacity: 0.10;
      }
    }
    @keyframes particle-float {
      0% {
        opacity: 0.08;
        transform: translateY(0px) scale(1);
      }
      50% {
        opacity: 0.24;
        transform: translateY(-10px) scale(1.08);
      }
      100% {
        opacity: 0.08;
        transform: translateY(0px) scale(1);
      }
    }
  `)
  const hovered = useSignal<HoverInfo | null>(null)
  const sceneId = 'skills-brain-scene'

  useVisibleTask$(({ cleanup }) => {
    const root = document.getElementById(sceneId)
    if (!root) return

    const floats = Array.from(root.querySelectorAll<SVGGraphicsElement>('[data-float]'))
    let raf = 0
    const start = performance.now()

    const loop = (now: number) => {
      const t = (now - start) / 1000
      for (const el of floats) {
        const ax = Number.parseFloat(el.dataset.ax ?? '0')
        const ay = Number.parseFloat(el.dataset.ay ?? '0')
        const speed = Number.parseFloat(el.dataset.speed ?? '1')
        const phase = Number.parseFloat(el.dataset.phase ?? '0')
        const x = Math.sin(t * speed + phase) * ax
        const y = Math.cos(t * speed * 0.85 + phase) * ay
        el.style.transform = `translate(${x}px, ${y}px)`
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    cleanup(() => cancelAnimationFrame(raf))
  })

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
        id={sceneId}
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
          <BrainBackdrop />
          <BackgroundParticles />
          <BackgroundStars />

          {/* Constellations */}
          {CONSTELLATIONS.map((constellation, constellationIndex) => {
            const { stars, lines, color } = constellation
            const plotted = stars.map((star, starIndex) => {
              const p = projectToBrain(star, starIndex, constellationIndex)
              return {
                ...star,
                px: p.x * CANVAS_W,
                py: p.y * CANVAS_H,
              }
            })
            return (
              <g
                key={constellation.name}
                class="constellation-group"
                data-float="1"
                data-ax={String(1.2 + constellationIndex * 0.25)}
                data-ay={String(1.4 + constellationIndex * 0.25)}
                data-speed={String(0.42 + constellationIndex * 0.08)}
                data-phase={String(constellationIndex * 0.9)}
              >
                {/* Lines between stars */}
                {lines.map(([a, b]) => {
                  const sa = plotted[a]
                  const sb = plotted[b]
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={sa.px}
                      y1={sa.py}
                      x2={sb.px}
                      y2={sb.py}
                      stroke={color}
                      stroke-width="0.8"
                      stroke-opacity="0.4"
                    />
                  )
                })}

                {/* Stars */}
                {plotted.map((star, starIndex) => {
                  const r = star.level * 2.5 + 2
                  const cx = star.px
                  const cy = star.py
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
                        class="node-glow"
                        cx={cx}
                        cy={cy}
                        r={r + 4}
                        fill={color}
                        fill-opacity="0.16"
                        style={`animation-duration:${3.8 + starIndex * 0.33}s;animation-delay:-${starIndex * 0.22}s;`}
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

function projectToBrain(star: Star, starIndex: number, constellationIndex: number) {
  const nx = star.x * 2 - 1 // -1..1
  const ny = star.y * 2 - 1 // -1..1
  const side = nx < 0 ? -1 : 1
  const localX = Math.abs(nx)

  const centerX = side < 0 ? 0.34 : 0.66
  const x =
    centerX +
    (localX - 0.5) * 0.24 +
    Math.sin((ny + constellationIndex * 0.2) * Math.PI) * 0.03 * side

  const y =
    0.52 +
    ny * 0.34 +
    Math.sin((localX + starIndex * 0.07) * Math.PI * 2) * 0.015

  return {
    x: clamp(x, 0.08, 0.92),
    y: clamp(y, 0.08, 0.92),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

const BrainBackdrop = component$(() => {
  return (
    <g>
      <path
        class="brain-shell"
        d="M96,200
           C90,120 145,58 220,66
           C258,44 312,56 340,92
           C360,120 364,156 352,190
           C372,232 360,286 322,318
           C292,344 244,350 214,332
           C156,342 108,304 96,248
           C92,232 92,216 96,200Z"
        fill-opacity="0.36"
      />
      <path
        class="brain-shell"
        d="M504,200
           C510,120 455,58 380,66
           C342,44 288,56 260,92
           C240,120 236,156 248,190
           C228,232 240,286 278,318
           C308,344 356,350 386,332
           C444,342 492,304 504,248
           C508,232 508,216 504,200Z"
        fill-opacity="0.36"
      />
      <path class="brain-midline" d="M300,82 C290,140 290,260 300,322" fill="none" />
    </g>
  )
})

const BackgroundParticles = component$(() => {
  const particles = [
    { x: 72, y: 70, r: 1.6, dur: 7.2, delay: 0.0 },
    { x: 130, y: 300, r: 1.3, dur: 9.1, delay: 0.7 },
    { x: 180, y: 120, r: 1.1, dur: 8.2, delay: 1.1 },
    { x: 242, y: 320, r: 1.7, dur: 10.3, delay: 1.8 },
    { x: 290, y: 58, r: 1.0, dur: 6.8, delay: 2.2 },
    { x: 338, y: 336, r: 1.5, dur: 8.9, delay: 2.8 },
    { x: 392, y: 92, r: 1.1, dur: 7.7, delay: 3.1 },
    { x: 460, y: 294, r: 1.4, dur: 9.6, delay: 3.6 },
    { x: 520, y: 146, r: 1.2, dur: 8.4, delay: 4.0 },
  ]

  return (
    <g>
      {particles.map((p, i) => (
        <circle
          key={i}
          class="particle"
          cx={p.x}
          cy={p.y}
          r={p.r}
          data-float="1"
          data-ax="0"
          data-ay="2.2"
          data-speed={String(0.5 + i * 0.06)}
          data-phase={String(i * 0.7)}
          style={`animation-duration:${p.dur}s;animation-delay:-${p.delay}s;`}
        />
      ))}
    </g>
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
