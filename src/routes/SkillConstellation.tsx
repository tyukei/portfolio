import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'

// ─── Skill data ────────────────────────────────────────────────────────────────
// theta = longitude (0–2π), phi = latitude (0=north, π=south)
interface Skill {
  name: string
  category: string
  color: string
  level: number        // 1–5  →  node size + brightness
  theta: number
  phi: number
  interest?: boolean   // true = "exploring"  →  dashed outline, smaller
}

const SKILLS: Skill[] = [
  // Data Engineering ─ upper-front-left (theta 0.2-1.0, phi 0.8-1.4)
  { name: 'Python', category: 'Data Engineering', color: '#22d3ee', level: 5, theta: 0.38, phi: 0.88 },
  { name: 'BigQuery', category: 'Data Engineering', color: '#22d3ee', level: 4, theta: 0.72, phi: 1.05 },
  { name: 'SQL', category: 'Data Engineering', color: '#22d3ee', level: 4, theta: 0.18, phi: 1.22 },
  { name: 'dbt', category: 'Data Engineering', color: '#22d3ee', level: 3, theta: 0.52, phi: 1.38 },
  { name: 'Pandas', category: 'Data Engineering', color: '#22d3ee', level: 4, theta: 0.88, phi: 0.92 },
  { name: 'MATLAB', category: 'Data Engineering', color: '#22d3ee', level: 2, theta: 0.32, phi: 1.45 },

  // AI / LLM ─ upper-front-center (theta 1.1-1.8, phi 0.6-1.1)
  { name: 'LLM Agent', category: 'AI / LLM', color: '#a78bfa', level: 4, theta: 1.22, phi: 0.64 },
  { name: 'MCP', category: 'AI / LLM', color: '#a78bfa', level: 3, theta: 1.52, phi: 0.76 },
  { name: 'PyTorch', category: 'AI / LLM', color: '#a78bfa', level: 3, theta: 1.35, phi: 1.05 },
  { name: 'Prompt Eng.', category: 'AI / LLM', color: '#a78bfa', level: 4, theta: 1.68, phi: 0.88 },
  { name: 'TensorFlow', category: 'AI / LLM', color: '#a78bfa', level: 3, theta: 1.15, phi: 0.85 },
  { name: 'OpenCV', category: 'AI / LLM', color: '#a78bfa', level: 2, theta: 1.48, phi: 1.20 },

  // Frontend ─ right hemisphere (theta 1.9-2.8, phi 0.8-1.5)
  { name: 'TypeScript', category: 'Frontend', color: '#34d399', level: 4, theta: 2.02, phi: 0.82 },
  { name: 'Qwik', category: 'Frontend', color: '#34d399', level: 3, theta: 2.36, phi: 0.96 },
  { name: 'React', category: 'Frontend', color: '#34d399', level: 3, theta: 2.18, phi: 1.18 },
  { name: 'UnoCSS', category: 'Frontend', color: '#34d399', level: 3, theta: 2.54, phi: 1.28 },
  { name: 'HTML5', category: 'Frontend', color: '#34d399', level: 5, theta: 1.95, phi: 1.05 },
  { name: 'CSS3', category: 'Frontend', color: '#34d399', level: 4, theta: 2.72, phi: 1.12 },
  { name: 'JavaScript', category: 'Frontend', color: '#34d399', level: 5, theta: 2.25, phi: 1.45 },
  { name: 'Tailwind', category: 'Frontend', color: '#34d399', level: 4, theta: 2.85, phi: 0.88 },
  { name: 'Figma', category: 'Frontend', color: '#34d399', level: 3, theta: 1.88, phi: 1.35 },
  { name: 'Jekyll', category: 'Frontend', color: '#34d399', level: 2, theta: 2.65, phi: 1.50 },

  // Cloud ─ back-right (theta 3.1-3.9, phi 0.8-1.5)
  { name: 'GCP', category: 'Cloud', color: '#f59e0b', level: 4, theta: 3.42, phi: 1.06 },
  { name: 'Cloud Run', category: 'Cloud', color: '#f59e0b', level: 3, theta: 3.74, phi: 1.28 },
  { name: 'Terraform', category: 'Cloud', color: '#f59e0b', level: 2, theta: 3.22, phi: 1.48 },
  { name: 'Pub/Sub', category: 'Cloud', color: '#f59e0b', level: 3, theta: 3.58, phi: 0.90 },
  { name: 'Firebase', category: 'Cloud', color: '#f59e0b', level: 4, theta: 3.15, phi: 0.85 },
  { name: 'Heroku', category: 'Cloud', color: '#f59e0b', level: 3, theta: 3.88, phi: 1.02 },
  { name: 'IFTTT', category: 'Cloud', color: '#f59e0b', level: 2, theta: 3.35, phi: 1.25 },

  // Backend ─ back-left (theta 4.1-5.1, phi 1.0-1.6)
  { name: 'FastAPI', category: 'Backend', color: '#60a5fa', level: 4, theta: 4.48, phi: 1.18 },
  { name: 'Node.js', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.82, phi: 1.38 },
  { name: 'PostgreSQL', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.28, phi: 1.46 },
  { name: 'Redis', category: 'Backend', color: '#60a5fa', level: 2, theta: 5.02, phi: 1.28 },
  { name: 'Django', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.15, phi: 1.10 },
  { name: 'Flask', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.65, phi: 0.98 },
  { name: 'Java', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.95, phi: 1.05 },
  { name: 'MySQL', category: 'Backend', color: '#60a5fa', level: 4, theta: 4.35, phi: 1.62 },
  { name: 'PHP', category: 'Backend', color: '#60a5fa', level: 3, theta: 4.75, phi: 1.58 },

  // DevOps ─ left hemisphere (theta 5.4-6.0, phi 0.8-1.5)
  { name: 'Docker', category: 'DevOps', color: '#fb7185', level: 4, theta: 5.52, phi: 0.92 },
  { name: 'GH Actions', category: 'DevOps', color: '#fb7185', level: 3, theta: 5.80, phi: 1.12 },
  { name: 'Linux', category: 'DevOps', color: '#fb7185', level: 3, theta: 5.66, phi: 1.38 },
  { name: 'Git', category: 'DevOps', color: '#fb7185', level: 4, theta: 5.95, phi: 0.95 },
  { name: 'Nginx', category: 'DevOps', color: '#fb7185', level: 3, theta: 5.45, phi: 1.25 },

  // Mobile ─ new category (lower front) (theta 1.0-2.5, phi 1.8-2.4)
  { name: 'Android', category: 'Mobile', color: '#eab308', level: 3, theta: 1.45, phi: 2.05 },
  { name: 'Flutter', category: 'Mobile', color: '#eab308', level: 4, theta: 1.85, phi: 1.92 },
  { name: 'Kotlin', category: 'Mobile', color: '#eab308', level: 3, theta: 1.22, phi: 2.25 },
  { name: 'Swift', category: 'Mobile', color: '#eab308', level: 2, theta: 2.15, phi: 2.18 },

  // Game / Embedded ─ new category (lower back) (theta 3.5-5.0, phi 1.8-2.4)
  { name: 'Arduino', category: 'Game / Embedded', color: '#14b8a6', level: 2, theta: 3.85, phi: 2.15 },
  { name: 'C', category: 'Game / Embedded', color: '#14b8a6', level: 3, theta: 4.55, phi: 2.05 },
  { name: 'C++', category: 'Game / Embedded', color: '#14b8a6', level: 3, theta: 4.25, phi: 1.85 },
  { name: 'C#', category: 'Game / Embedded', color: '#14b8a6', level: 3, theta: 4.88, phi: 1.95 },
  { name: 'Unity', category: 'Game / Embedded', color: '#14b8a6', level: 3, theta: 4.15, phi: 2.25 },

  // Interests / Exploring ─ scattered near poles
  { name: 'Rust', category: 'Exploring', color: '#d1a76a', level: 2, theta: 0.95, phi: 0.46, interest: true },
  { name: 'Go', category: 'Exploring', color: '#d1a76a', level: 1, theta: 2.82, phi: 0.42, interest: true },
  { name: 'Kafka', category: 'Exploring', color: '#d1a76a', level: 2, theta: 4.06, phi: 0.50, interest: true },
  { name: 'WebGL', category: 'Exploring', color: '#d1a76a', level: 1, theta: 1.78, phi: 0.30, interest: true },
  { name: 'Iceberg', category: 'Exploring', color: '#d1a76a', level: 2, theta: 3.88, phi: 0.36, interest: true },
  { name: 'Illustrator', category: 'Exploring', color: '#d1a76a', level: 2, theta: 5.25, phi: 0.45, interest: true },
]

const LEGEND = [
  { label: 'Data Engineering', color: '#22d3ee' },
  { label: 'AI / LLM', color: '#a78bfa' },
  { label: 'Frontend', color: '#34d399' },
  { label: 'Cloud', color: '#f59e0b' },
  { label: 'Backend', color: '#60a5fa' },
  { label: 'DevOps', color: '#fb7185' },
  { label: 'Mobile', color: '#eab308' },
  { label: 'Game / Embedded', color: '#14b8a6' },
  { label: 'Exploring', color: '#d1a76a' },
]

// ─── 3D Math ───────────────────────────────────────────────────────────────────
type V3 = [number, number, number]
const TWO_PI = Math.PI * 2

function ry(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
}
function rx(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
}
function spherePt(theta: number, phi: number): V3 {
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ]
}

// Fibonacci sphere — most uniform sampling on a unit sphere
function fibSphere(n: number): V3[] {
  const out: V3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = golden * i
    out.push([r * Math.cos(t), y, r * Math.sin(t)])
  }
  return out
}

// Procedural brain surface displacement (gyri + sulci)
function brainBump(x: number, y: number, z: number): number {
  return 0.068 * (
    Math.sin(x * 6.1 + y * 3.7) * Math.cos(z * 5.2) +
    Math.sin(y * 7.8 + z * 2.9) * Math.cos(x * 6.5) * 0.65 +
    Math.sin(z * 8.3 + x * 1.8) * Math.cos(y * 5.9) * 0.40
  )
}

// hex → r,g,b
function hexRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Rocket Easter Egg node position: +X axis (right equator of sphere)
const ROCKET_PT: V3 = [1, 0, 0]

// ─── Component ─────────────────────────────────────────────────────────────────
export const SkillConstellation = component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>()

  useVisibleTask$(({ cleanup }) => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let rafId = 0

    // ── Responsive sizing ─────────────────────────────────────────────────
    const container = canvas.parentElement!
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const w = container.clientWidth
      const h = Math.round(Math.min(w * 0.72, 500))
      canvas.width = Math.round(w * dpr)
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // ── Pre-generate brain surface (once) ─────────────────────────────────
    const N = 1800
    const basePts = fibSphere(N)
    // Apply displacement and re-normalise to unit sphere
    const brainPts: V3[] = basePts.map(([x, y, z]) => {
      const d = brainBump(x, y, z)
      const nx = x * (1 + d), ny = y * (1 + d), nz = z * (1 + d)
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      return [nx / len, ny / len, nz / len]
    })
    // Brightness per point: gyri (positive d) = lighter, sulci = darker
    const brainBr: number[] = basePts.map(([x, y, z]) => brainBump(x, y, z))

    // ── Skill 3D positions ─────────────────────────────────────────────────
    const skillPts: V3[] = SKILLS.map(s => spherePt(s.theta, s.phi))

    // ── Category connection pairs (pre-computed) ──────────────────────────
    const connPairs: [number, number][] = []
    for (let i = 0; i < SKILLS.length; i++) {
      for (let j = i + 1; j < SKILLS.length; j++) {
        if (
          SKILLS[i].category === SKILLS[j].category &&
          !SKILLS[i].interest && !SKILLS[j].interest
        ) {
          connPairs.push([i, j])
        }
      }
    }

    // ── Rotation + interaction state ──────────────────────────────────────
    let rotY = 0.5, rotX = -0.22
    let velY = 0.0022, velX = 0
    let dragging = false, dragX = 0, dragY = 0
    let hovIdx = -1
    let rocketHov = false

    // Project a 3D point to canvas 2D
    const project = (p: V3, R: number, cx: number, cy: number) => {
      const [px, py, pz] = rx(ry(p, rotY), rotX)
      const depth = pz + 2.8          // always positive: 1.8 .. 3.8
      const scale = R * 2.2 / depth   // perspective scale
      return { x: cx + px * scale, y: cy - py * scale, z: pz }
    }

    // ── Main render ────────────────────────────────────────────────────────
    const render = () => {
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.38
      ctx.clearRect(0, 0, W, H)

      const isDark = document.documentElement.classList.contains('dark')
      const baseRgb = isDark ? '200,165,150' : '130,90,80'

      // ── Sphere background glow ─────────────────────────────────────────
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05)
      grd.addColorStop(0, isDark ? 'rgba(40,40,40,0.40)' : 'rgba(245,240,235,0.60)')
      grd.addColorStop(0.8, isDark ? 'rgba(25,25,25,0.20)' : 'rgba(240,235,228,0.30)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.05, 0, TWO_PI)
      ctx.fillStyle = grd
      ctx.fill()

      // ── Project brain surface ─────────────────────────────────────────
      type BP = { x: number; y: number; z: number; br: number }
      const bpArr: BP[] = new Array(N)
      for (let i = 0; i < N; i++) {
        const { x, y, z } = project(brainPts[i], R, cx, cy)
        bpArr[i] = { x, y, z, br: brainBr[i] }
      }
      bpArr.sort((a, b) => a.z - b.z)  // back → front

      // Draw in 3 depth layers (batched fill for performance)
      const drawBrainLayer = (zMin: number, zMax: number, dotR: number, alpha: number) => {
        ctx.beginPath()
        for (const p of bpArr) {
          if (p.z < zMin || p.z >= zMax) continue
          // gyri = slightly larger dots, sulci = smaller
          const r = dotR * (p.br > 0.02 ? 1.3 : p.br < -0.02 ? 0.75 : 1.0)
          ctx.moveTo(p.x + r, p.y)
          ctx.arc(p.x, p.y, r, 0, TWO_PI)
        }
        ctx.fillStyle = `rgba(${baseRgb},${alpha})`
        ctx.fill()
      }
      drawBrainLayer(-1.0, -0.25, 0.75, isDark ? 0.055 : 0.07)
      drawBrainLayer(-0.25, 0.20, 1.0, isDark ? 0.10 : 0.13)
      drawBrainLayer(0.20, 1.0, 1.35, isDark ? 0.18 : 0.23)

      // ── Hemisphere fissure (longitudinal groove) ──────────────────────
      {
        const fissurePts: { x: number; y: number; z: number }[] = []
        for (let phi = 0; phi <= Math.PI; phi += Math.PI / 28) {
          fissurePts.push(project(spherePt(0, phi), R, cx, cy))
        }
        ctx.save()
        ctx.beginPath()
        for (let i = 0; i < fissurePts.length; i++) {
          const { x, y } = fissurePts[i]
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = isDark ? 'rgba(180,150,140,0.12)' : 'rgba(100,70,60,0.14)'
        ctx.lineWidth = 0.8
        ctx.setLineDash([2.5, 3])
        ctx.stroke()
        ctx.restore()
      }

      // ── Project skill points ──────────────────────────────────────────
      const sp = skillPts.map((p, i) => ({ ...project(p, R, cx, cy), skill: SKILLS[i], idx: i }))

      // ── Category connection lines ──────────────────────────────────────
      for (const [ai, bi] of connPairs) {
        const a = sp[ai], b = sp[bi]
        const avgZ = (a.z + b.z) / 2
        if (avgZ < -0.5) continue
        const alpha = Math.max(0, (avgZ + 0.5) / 1.5) * 0.45
        const [r, g, bl2] = hexRgb(SKILLS[ai].color)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(${r},${g},${bl2},${alpha})`
        ctx.lineWidth = 0.9
        ctx.stroke()
      }

      // ── Skill nodes (sorted back → front) ────────────────────────────
      const sortedSp = [...sp].sort((a, b) => a.z - b.z)
      for (const { x, y, z, skill, idx } of sortedSp) {
        const depth = Math.max(0, Math.min(1, (z + 1) / 2))
        const isHov = idx === hovIdx
        const baseR = skill.interest ? 3.5 * dpr : (3 + skill.level * 1.5) * dpr
        const nodeR = baseR * (0.55 + depth * 0.45)

        if (skill.interest) {
          // Dashed outline — "exploring"
          ctx.save()
          ctx.beginPath()
          ctx.arc(x, y, nodeR, 0, TWO_PI)
          const [r, g, b] = hexRgb(skill.color)
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.25 + depth * 0.55})`
          ctx.lineWidth = 1 * dpr
          ctx.setLineDash([2 * dpr, 3 * dpr])
          ctx.stroke()
          ctx.restore()
        } else {
          const [r, g, b] = hexRgb(skill.color)
          const alpha = 0.40 + depth * 0.60
          // Glow ring for hovered or front nodes
          if (isHov || depth > 0.7) {
            ctx.save()
            ctx.shadowColor = skill.color
            ctx.shadowBlur = (isHov ? 18 : 10) * dpr * depth
            ctx.beginPath()
            ctx.arc(x, y, nodeR, 0, TWO_PI)
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.restore()
          } else {
            ctx.beginPath()
            ctx.arc(x, y, nodeR, 0, TWO_PI)
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.fill()
          }
        }

        // Label: show when front-facing OR hovered
        if (z > 0.1 || isHov) {
          const labelAlpha = isHov ? 0.95 : Math.max(0, (z - 0.1) / 0.9) * 0.75
          const fontSize = Math.round((isHov ? 11 : 9) * dpr)
          ctx.font = `${isHov ? '600 ' : ''}${fontSize}px system-ui,sans-serif`
          ctx.textAlign = 'center'
          ctx.fillStyle = isDark
            ? `rgba(230,230,230,${labelAlpha})`
            : `rgba(17,17,17,${labelAlpha})`
          ctx.fillText(skill.name, x, y - nodeR / dpr - 4)

          // On hover: also show category + level
          if (isHov) {
            const stars = skill.interest ? '(exploring)' : '★'.repeat(skill.level) + '☆'.repeat(5 - skill.level)
            ctx.font = `${Math.round(8.5 * dpr)}px system-ui,sans-serif`
            ctx.fillStyle = isDark ? 'rgba(200,200,200,0.65)' : 'rgba(80,80,80,0.65)'
            ctx.fillText(`${skill.category}  ${stars}`, x, y - nodeR / dpr - 4 - 13)
          }
        }
      }

      // ── "Drag to rotate" hint (fades out after first drag) ────────────
      if (!hasInteracted) {
        ctx.font = `${Math.round(9.5 * dpr)}px system-ui,sans-serif`
        ctx.textAlign = 'center'
        ctx.fillStyle = isDark ? 'rgba(180,180,180,0.30)' : 'rgba(80,80,80,0.25)'
        ctx.fillText('drag to rotate', cx, H - 10 * dpr)
      }

      // ── Rocket Easter Egg node ─────────────────────────────────────────
      {
        const rp = project(ROCKET_PT, R, cx, cy)
        const alpha = Math.max(0, (rp.z + 0.15) / 0.55)
        if (alpha > 0) {
          const pulse = 0.88 + 0.12 * Math.sin(performance.now() * 0.0034)
          const emojiSize = Math.round((rocketHov ? 20 : 15) * dpr * (0.5 + Math.max(0, rp.z) * 0.5) * pulse)
          ctx.save()
          ctx.globalAlpha = Math.min(1, alpha)
          ctx.font = `${emojiSize}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('🚀', rp.x, rp.y)
          if (rp.z > 0.3 || rocketHov) {
            ctx.font = `${Math.round(7.5 * dpr)}px system-ui,sans-serif`
            ctx.textBaseline = 'alphabetic'
            ctx.fillStyle = isDark ? 'rgba(255,160,60,0.9)' : 'rgba(200,70,0,0.85)'
            ctx.globalAlpha = Math.min(1, alpha) * (rocketHov ? 1 : 0.65)
            ctx.fillText(rocketHov ? 'Click to launch!' : 'Launch?', rp.x, rp.y - emojiSize * 0.65 - 4 * dpr)
          }
          ctx.restore()
        }
      }
    }

    // ── Animation loop ─────────────────────────────────────────────────────
    let hasInteracted = false
    const loop = () => {
      if (!dragging) {
        rotY += velY
        rotX += velX
        velY = velY * 0.97 + (0.0022 - velY) * 0.008  // settle back to slow auto-rotate
        velX = velX * 0.96
        rotX = Math.max(-0.55, Math.min(0.55, rotX))  // clamp tilt
      }
      render()
      rafId = requestAnimationFrame(loop)
    }
    loop()

    // ── Rocket Easter Egg animation ────────────────────────────────────────
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

    const launchRocket = () => {
      const OW = window.innerWidth, OH = window.innerHeight
      const ov = document.createElement('canvas')
      ov.width = Math.round(OW * dpr)
      ov.height = Math.round(OH * dpr)
      ov.style.cssText = `position:fixed;top:0;left:0;width:${OW}px;height:${OH}px;z-index:9999;pointer-events:none`
      document.body.appendChild(ov)
      const oc = ov.getContext('2d')!
      const OWd = ov.width, OHd = ov.height

      // Stars
      const stars = Array.from({ length: 260 }, () => ({
        x: Math.random() * OWd,
        y: Math.random() * OHd,
        r: (Math.random() * 1.5 + 0.3) * dpr,
        seed: Math.random() * Math.PI * 2,
      }))

      // Draw rocket (pointing up, nose at top)
      const drawRocket = (cx2: number, cy2: number, sz: number) => {
        if (sz < 1.5) return
        oc.save()
        oc.translate(cx2, cy2)

        // Body
        const bg = oc.createLinearGradient(-sz * 0.35, -sz * 0.6, sz * 0.35, sz * 0.5)
        bg.addColorStop(0, '#eeeef5')
        bg.addColorStop(0.5, '#c8c8d8')
        bg.addColorStop(1, '#909098')
        oc.beginPath()
        oc.moveTo(-sz * 0.28, -sz * 0.6)
        oc.lineTo(-sz * 0.28, sz * 0.35)
        oc.arc(0, sz * 0.35, sz * 0.28, Math.PI, 0)
        oc.lineTo(sz * 0.28, -sz * 0.6)
        oc.closePath()
        oc.fillStyle = bg
        oc.fill()

        // Nose cone
        oc.beginPath()
        oc.moveTo(-sz * 0.28, -sz * 0.6)
        oc.quadraticCurveTo(-sz * 0.28, -sz * 1.08, 0, -sz * 1.22)
        oc.quadraticCurveTo(sz * 0.28, -sz * 1.08, sz * 0.28, -sz * 0.6)
        oc.closePath()
        oc.fillStyle = '#cc2222'
        oc.fill()

        // Porthole
        const pg = oc.createRadialGradient(-sz * 0.05, -sz * 0.1, sz * 0.01, sz * 0.02, -sz * 0.07, sz * 0.17)
        pg.addColorStop(0, '#ccecff')
        pg.addColorStop(1, '#2255aa')
        oc.beginPath()
        oc.arc(0, -sz * 0.08, sz * 0.15, 0, Math.PI * 2)
        oc.fillStyle = pg
        oc.fill()
        oc.strokeStyle = 'rgba(80,80,90,0.55)'
        oc.lineWidth = sz * 0.04
        oc.stroke()

        // Left fin
        oc.beginPath()
        oc.moveTo(-sz * 0.28, sz * 0.12)
        oc.lineTo(-sz * 0.64, sz * 0.55)
        oc.lineTo(-sz * 0.28, sz * 0.38)
        oc.closePath()
        oc.fillStyle = '#cc2222'
        oc.fill()

        // Right fin
        oc.beginPath()
        oc.moveTo(sz * 0.28, sz * 0.12)
        oc.lineTo(sz * 0.64, sz * 0.55)
        oc.lineTo(sz * 0.28, sz * 0.38)
        oc.closePath()
        oc.fillStyle = '#cc2222'
        oc.fill()

        // Exhaust flame
        if (sz > 4) {
          const ft = performance.now() * 0.011
          const fh = sz * (0.52 + Math.sin(ft * 3.3) * 0.10)
          const fg = oc.createLinearGradient(0, sz * 0.45, 0, sz * 0.45 + fh)
          fg.addColorStop(0, 'rgba(255,252,80,0.97)')
          fg.addColorStop(0.32, 'rgba(255,128,0,0.88)')
          fg.addColorStop(0.72, 'rgba(255,40,0,0.50)')
          fg.addColorStop(1, 'rgba(255,30,0,0)')
          oc.beginPath()
          oc.moveTo(-sz * 0.22, sz * 0.46)
          oc.quadraticCurveTo(-sz * 0.08, sz * 0.46 + fh * 0.55, 0, sz * 0.46 + fh)
          oc.quadraticCurveTo(sz * 0.08, sz * 0.46 + fh * 0.55, sz * 0.22, sz * 0.46)
          oc.closePath()
          oc.fillStyle = fg
          oc.fill()
        }

        oc.restore()
      }

      // Draw ceiling crack
      const drawCrack = (progress: number) => {
        const branch = (x: number, y: number, len: number, angle: number, depth: number) => {
          if (depth <= 0 || len < 5 * dpr) return
          const p = Math.min(progress, 1)
          const ex = x + Math.cos(angle) * len * p
          const ey = y + Math.sin(angle) * len * p
          oc.moveTo(x, y)
          oc.lineTo(ex, ey)
          if (progress > 0.4) {
            branch(ex, ey, len * 0.58, angle - 0.42, depth - 1)
            branch(ex, ey, len * 0.52, angle + 0.55, depth - 1)
          }
        }
        oc.beginPath()
        oc.strokeStyle = 'rgba(60,40,20,0.72)'
        oc.lineWidth = 2.2 * dpr
        branch(OWd / 2, 0, OHd * 0.30, Math.PI * 0.5 + 0.08, 5)
        branch(OWd / 2, 0, OHd * 0.26, Math.PI * 0.5 - 0.18, 4)
        branch(OWd / 2 - OWd * 0.09, 0, OHd * 0.19, Math.PI * 0.5 + 0.38, 3)
        branch(OWd / 2 + OWd * 0.11, 0, OHd * 0.16, Math.PI * 0.5 - 0.44, 3)
        oc.stroke()
      }

      // Animation: total 7.5s
      // t=0→1 over 7500ms
      // launch  : t 0.00–0.15  (0–1125ms)  rocket rises
      // crack   : t 0.10–0.22  (750–1650ms) ceiling cracks
      // space-in: t 0.18–0.30  (1350–2250ms) dark bg fades in
      // travel  : t 0.27–0.55  (2025–4125ms) rocket shrinks into space
      // return  : t 0.55–0.85  (4125–6375ms) rocket grows back
      // flash   : t 0.87–1.00  (6525–7500ms) white flash
      const TOTAL_MS = 7500
      const start = performance.now()
      let ovRaf = 0

      const frame = () => {
        const now = performance.now()
        const t = clamp((now - start) / TOTAL_MS, 0, 1)
        oc.clearRect(0, 0, OWd, OHd)

        const pLaunch = clamp((t - 0.00) / 0.15, 0, 1)
        const pCrack  = clamp((t - 0.10) / 0.12, 0, 1)
        const pSpace  = clamp((t - 0.18) / 0.12, 0, 1)
        const pTravel = clamp((t - 0.27) / 0.28, 0, 1)
        const pReturn = clamp((t - 0.55) / 0.30, 0, 1)
        const pFlash  = clamp((t - 0.87) / 0.13, 0, 1)

        // Dark space background
        if (pSpace > 0) {
          oc.fillStyle = `rgba(0,0,8,${pSpace * 0.96})`
          oc.fillRect(0, 0, OWd, OHd)
        }

        // White flash
        if (pFlash > 0) {
          oc.fillStyle = `rgba(255,255,255,${pFlash})`
          oc.fillRect(0, 0, OWd, OHd)
        }

        // Stars
        if (pSpace > 0.15 && pFlash < 0.85) {
          const starA = clamp((pSpace - 0.15) / 0.35, 0, 1) * (1 - pFlash)
          for (const s of stars) {
            const tw = 0.65 + 0.35 * Math.sin(now * 0.002 + s.seed)
            oc.beginPath()
            oc.arc(s.x, s.y, s.r, 0, Math.PI * 2)
            oc.fillStyle = `rgba(255,255,255,${starA * tw})`
            oc.fill()
          }
        }

        // Ceiling crack
        if (pCrack > 0 && pSpace < 0.92) {
          drawCrack(pCrack)
        }

        // Phase 1: rocket launches (rises from bottom, before travel takes over)
        if (pTravel < 0.04) {
          const ease = 1 - Math.pow(1 - pLaunch, 2.8)
          const ry2 = OHd * 0.72 - ease * OHd * 0.88
          drawRocket(OWd / 2, ry2, 38 * dpr)
        }

        // Phase 2: space travel (shrinks as it goes up and away)
        if (pTravel > 0 && pReturn < 0.02) {
          const easeT = Math.pow(pTravel, 1.7)
          const ry2 = OHd * 0.04 - easeT * OHd * 0.55
          const sz = 38 * dpr * (1 - easeT * 0.90)
          drawRocket(OWd / 2, ry2, sz)
        }

        // Phase 3: rocket returns (grows from tiny to massive)
        if (pReturn > 0 && pFlash < 0.45) {
          const easeR = 1 - Math.pow(1 - pReturn, 2.5)
          const ry2 = -OHd * 0.55 + easeR * OHd * 1.1
          const sz = 3 * dpr + easeR * OHd * 0.52
          drawRocket(OWd / 2, ry2, sz)
        }

        if (t < 1) {
          ovRaf = requestAnimationFrame(frame)
        } else {
          if (document.body.contains(ov)) document.body.removeChild(ov)
        }
      }
      ovRaf = requestAnimationFrame(frame)
    }

    // ── Input helpers ──────────────────────────────────────────────────────
    const canvasXY = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return [(clientX - rect.left) * dpr, (clientY - rect.top) * dpr] as const
    }

    const findHover = (cx2: number, cy2: number) => {
      const W = canvas.width, H = canvas.height
      const cxc = W / 2, cyc = H / 2
      const R = Math.min(W, H) * 0.38
      let best = -1, bestD = 18 * dpr
      for (let i = 0; i < SKILLS.length; i++) {
        const { x, y } = project(skillPts[i], R, cxc, cyc)
        const d = Math.hypot(x - cx2, y - cy2)
        if (d < bestD) { bestD = d; best = i }
      }
      hovIdx = best
    }

    const onDown = (cx2: number, cy2: number) => {
      dragging = true
      dragX = cx2; dragY = cy2
      velY = 0; velX = 0
      hasInteracted = true
    }
    // Helper to check if a canvas point is over the rocket node
    const checkRocketHov = (cx2: number, cy2: number) => {
      const W2 = canvas.width, H2 = canvas.height
      const Rr = Math.min(W2, H2) * 0.38
      const rp = project(ROCKET_PT, Rr, W2 / 2, H2 / 2)
      const prev = rocketHov
      rocketHov = rp.z > -0.1 && Math.hypot(rp.x - cx2, rp.y - cy2) < 26 * dpr
      if (rocketHov !== prev) {
        canvas.style.cursor = rocketHov ? 'pointer' : ''
      }
    }

    const onMove = (cx2: number, cy2: number) => {
      if (dragging) {
        const dx = cx2 - dragX, dy = cy2 - dragY
        velY = dx * 0.005; velX = dy * 0.005
        rotY += dx * 0.005; rotX += dy * 0.005
        dragX = cx2; dragY = cy2
      } else {
        findHover(cx2, cy2)
        checkRocketHov(cx2, cy2)
      }
    }
    const onUp = () => { dragging = false }
    const onLeave = () => { dragging = false; hovIdx = -1; rocketHov = false; canvas.style.cursor = '' }

    canvas.addEventListener('mousedown', e => { const [x, y] = canvasXY(e.clientX, e.clientY); onDown(x, y) })
    canvas.addEventListener('mousemove', e => { const [x, y] = canvasXY(e.clientX, e.clientY); onMove(x, y) })
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', e => {
      const [cx2, cy2] = canvasXY(e.clientX, e.clientY)
      const W2 = canvas.width, H2 = canvas.height
      const rp = project(ROCKET_PT, Math.min(W2, H2) * 0.38, W2 / 2, H2 / 2)
      if (rp.z > -0.1 && Math.hypot(rp.x - cx2, rp.y - cy2) < 26 * dpr) {
        launchRocket()
      }
    })
    canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; const [x, y] = canvasXY(t.clientX, t.clientY); onDown(x, y) }, { passive: false })
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; const [x, y] = canvasXY(t.clientX, t.clientY); onMove(x, y) }, { passive: false })
    canvas.addEventListener('touchend', onUp)

    cleanup(() => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    })
  })

  return (
    <div>
      {/* Section heading */}
      <div class="flex items-start gap-3 mb-2">
        <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
          Skills
        </h2>
        <span
          class="text-[9px] tracking-widest mt-1 select-none"
          style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.2em"
        >
          スキル
        </span>
      </div>
      <p class="text-xs mb-5" style="color:var(--text-2)">
        ドラッグで脳を回転 · ホバーで詳細
      </p>

      {/* 3D Canvas */}
      <div
        class="w-full rounded-2xl overflow-hidden"
        style="background:var(--bg-surface);border:1px solid var(--border)"
      >
        <canvas
          ref={canvasRef}
          class="block w-full cursor-grab active:cursor-grabbing touch-none"
        />
      </div>

      {/* Legend */}
      <div class="flex flex-wrap gap-x-5 gap-y-2 mt-5">
        {LEGEND.map(({ label, color }) => (
          <div key={label} class="flex items-center gap-1.5">
            <div
              class="w-2 h-2 rounded-full flex-shrink-0"
              style={`background:${color}`}
            />
            <span class="text-xs" style="color:var(--text-2)">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
