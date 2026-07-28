interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  layer: number
  phase: number
}

interface Nebula {
  x: number
  y: number
  r: number
  color: string
  opacity: number
}

interface Planet {
  x: number
  y: number
  r: number
  color: string
  atmosphere: string
  moonX: number
  moonY: number
  moonR: number
  moonAngle: number
  rings: boolean
  craters: { x: number; y: number; r: number }[]
}

interface Dust {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
}

const STAR_COUNTS = [100, 70, 40, 20]
const STAR_SPEEDS = [0.15, 0.4, 0.9, 1.8]
const STAR_SIZES = [0.3, 0.6, 1.2, 2.0]
const STAR_BRIGHTNESS = [0.2, 0.4, 0.7, 1.0]

let stars: Star[] = []
let nebulae: Nebula[] = []
let planets: Planet[] = []
let dustParticles: Dust[] = []
let initialized = false

function init(cw: number, ch: number) {
  if (initialized) return
  initialized = true

  stars = []
  for (let layer = 0; layer < STAR_COUNTS.length; layer++) {
    const count = STAR_COUNTS[layer]
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        size: (Math.random() * 0.5 + 0.5) * STAR_SIZES[layer],
        speed: STAR_SPEEDS[layer] * (0.5 + Math.random() * 0.5),
        brightness: STAR_BRIGHTNESS[layer] * (0.3 + Math.random() * 0.7),
        layer,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  nebulae = [
    { x: cw * 0.15, y: ch * 0.25, r: 180, color: '68, 34, 170', opacity: 0.04 },
    { x: cw * 0.8, y: ch * 0.65, r: 200, color: '34, 68, 170', opacity: 0.035 },
    { x: cw * 0.5, y: ch * 0.85, r: 140, color: '136, 34, 102', opacity: 0.03 },
    { x: cw * 0.1, y: ch * 0.7, r: 120, color: '34, 102, 136', opacity: 0.025 },
    { x: cw * 0.7, y: ch * 0.15, r: 150, color: '102, 68, 204', opacity: 0.035 },
  ]

  planets = [
    {
      x: cw * 0.85, y: ch * 0.2, r: 35,
      color: '#664433', atmosphere: 'rgba(180, 120, 80, 0.08)',
      moonX: 0, moonY: 0, moonR: 0, moonAngle: 0,
      rings: true,
      craters: [
        { x: -8, y: -5, r: 6 }, { x: 10, y: 3, r: 4 },
        { x: -3, y: 10, r: 3 }, { x: 12, y: -8, r: 5 },
      ],
    },
    {
      x: cw * 0.12, y: ch * 0.4, r: 22,
      color: '#5588aa', atmosphere: 'rgba(80, 140, 180, 0.1)',
      moonX: cw * 0.12 + 40, moonY: ch * 0.4 - 12, moonR: 5, moonAngle: 0,
      rings: false,
      craters: [],
    },
  ]

  dustParticles = []
  for (let i = 0; i < 60; i++) {
    dustParticles.push({
      x: Math.random() * cw,
      y: Math.random() * ch,
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 15 + 5,
      alpha: Math.random() * 0.3 + 0.05,
    })
  }
}

let time = 0

export function drawBackground(ctx: CanvasRenderingContext2D, cw: number, ch: number, dt: number) {
  init(cw, ch)
  time += dt

  const grd = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.8)
  grd.addColorStop(0, '#070712')
  grd.addColorStop(0.4, '#040410')
  grd.addColorStop(0.7, '#020210')
  grd.addColorStop(1, '#010008')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, cw, ch)

  for (const n of nebulae) {
    const grd2 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
    grd2.addColorStop(0, `rgba(${n.color}, ${n.opacity + 0.02})`)
    grd2.addColorStop(0.4, `rgba(${n.color}, ${n.opacity})`)
    grd2.addColorStop(1, `rgba(${n.color}, 0)`)
    ctx.fillStyle = grd2
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const p of planets) {
    ctx.save()

    ctx.shadowColor = p.atmosphere.replace('0.08', '0.15').replace('0.1', '0.2')
    ctx.shadowBlur = 30

    const grd3 = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r)
    grd3.addColorStop(0, lighten(p.color, 30))
    grd3.addColorStop(0.7, p.color)
    grd3.addColorStop(1, darken(p.color, 40))
    ctx.fillStyle = grd3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    for (const c of p.craters) {
      ctx.fillStyle = darken(p.color, 20)
      ctx.beginPath()
      ctx.arc(p.x + c.x, p.y + c.y, c.r, 0, Math.PI * 2)
      ctx.fill()
    }

    if (p.rings) {
      ctx.strokeStyle = 'rgba(180, 140, 100, 0.2)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.r * 1.8, p.r * 0.3, 0.3, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(180, 140, 100, 0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.r * 2.1, p.r * 0.35, 0.3, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = p.atmosphere
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 1.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255,255,255,0.01)'
    ctx.beginPath()
    ctx.arc(p.x - p.r * 0.4, p.y - p.r * 0.4, p.r * 0.15, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  for (const s of stars) {
    s.y += s.speed * dt * 60
    if (s.y > ch + 2) {
      s.y = -2
      s.x = Math.random() * cw
    }

    const twinkle = 0.5 + Math.sin(time * s.speed * 0.5 + s.phase) * 0.5 * 0.4
    const alpha = s.brightness * (0.6 + twinkle * 0.4)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()

    if (s.layer >= 2 && s.size > 1) {
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.3})`
      ctx.shadowBlur = 4
      ctx.shadowColor = '#aaccff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.shadowBlur = 0
  for (const d of dustParticles) {
    d.y += d.speed * dt * 60
    if (d.y > ch + 2) {
      d.y = -2
      d.x = Math.random() * cw
    }
    ctx.fillStyle = `rgba(150, 180, 255, ${d.alpha})`
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function resetBackground() {
  initialized = false
  stars = []
  nebulae = []
  planets = []
  dustParticles = []
}

function lighten(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`
}

function darken(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})`
}
