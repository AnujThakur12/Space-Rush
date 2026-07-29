interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  layer: number
  phase: number
  tint: string
}

interface Nebula {
  x: number
  y: number
  r: number
  color: string
  opacity: number
  dx: number
  dy: number
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
  rotation: number
  cloudColor: string
}

interface Dust {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
}

interface Station {
  x: number
  y: number
  size: number
  speed: number
  rotation: number
}

interface Asteroid {
  x: number
  y: number
  size: number
  speed: number
  rot: number
  rotSpeed: number
  shape: number[]
}

const STAR_COUNTS = [60, 40, 25, 12]
const STAR_SPEEDS = [0.12, 0.35, 0.8, 1.6]
const STAR_SIZES = [0.3, 0.6, 1.2, 2.2]
const STAR_BRIGHTNESS = [0.2, 0.4, 0.7, 1.0]
const STAR_TINTS = ['#ffffff', '#ffffff', '#aaccff', '#ffddcc', '#ccddff', '#ffeedd']

let stars: Star[] = []
let nebulae: Nebula[] = []
let planets: Planet[] = []
let dustParticles: Dust[] = []
let asteroids: Asteroid[] = []
let stations: Station[] = []
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
        tint: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)],
      })
    }
  }

  nebulae = [
    { x: cw * 0.15, y: ch * 0.25, r: 220, color: '68, 34, 170', opacity: 0.05, dx: -1, dy: 0.3 },
    { x: cw * 0.82, y: ch * 0.7, r: 240, color: '34, 68, 170', opacity: 0.04, dx: 0.5, dy: -0.2 },
    { x: cw * 0.5, y: ch * 0.88, r: 180, color: '136, 34, 102', opacity: 0.035, dx: 0.3, dy: -0.5 },
    { x: cw * 0.08, y: ch * 0.75, r: 150, color: '34, 102, 136', opacity: 0.03, dx: 1, dy: 0.1 },
    { x: cw * 0.65, y: ch * 0.12, r: 190, color: '102, 68, 204', opacity: 0.04, dx: -0.5, dy: 0.4 },
    { x: cw * 0.4, y: ch * 0.45, r: 160, color: '170, 50, 80', opacity: 0.025, dx: 0.2, dy: 0.6 },
  ]

  planets = [
    {
      x: cw * 0.85, y: ch * 0.18, r: 40,
      color: '#774433', atmosphere: 'rgba(200, 120, 70, 0.1)',
      moonX: 0, moonY: 0, moonR: 0, moonAngle: 0,
      rings: true,
      craters: [
        { x: -10, y: -6, r: 7 }, { x: 12, y: 4, r: 5 },
        { x: -4, y: 12, r: 4 }, { x: 14, y: -10, r: 6 },
        { x: -8, y: 8, r: 3 },
      ],
      rotation: 0,
      cloudColor: 'rgba(200, 150, 100, 0.06)',
    },
    {
      x: cw * 0.1, y: ch * 0.38, r: 25,
      color: '#4488aa', atmosphere: 'rgba(80, 160, 200, 0.12)',
      moonX: cw * 0.1 + 45, moonY: ch * 0.38 - 15, moonR: 6, moonAngle: 0,
      rings: false,
      craters: [],
      rotation: 0,
      cloudColor: 'rgba(150, 200, 240, 0.05)',
    },
    {
      x: cw * 0.5, y: ch * 0.06, r: 15,
      color: '#886644', atmosphere: 'rgba(180, 140, 80, 0.08)',
      moonX: 0, moonY: 0, moonR: 0, moonAngle: 0,
      rings: false,
      craters: [{ x: -3, y: 2, r: 3 }, { x: 4, y: -2, r: 2 }],
      rotation: 0,
      cloudColor: 'rgba(200, 160, 100, 0.04)',
    },
  ]

  dustParticles = []
  for (let i = 0; i < 40; i++) {
    dustParticles.push({
      x: Math.random() * cw,
      y: Math.random() * ch,
      size: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 18 + 3,
      alpha: Math.random() * 0.25 + 0.03,
    })
  }

  asteroids = []
  for (let i = 0; i < 12; i++) {
    const sides = 5 + Math.floor(Math.random() * 4)
    const shape: number[] = []
    for (let j = 0; j < sides; j++) {
      shape.push(0.7 + Math.random() * 0.3)
    }
    asteroids.push({
      x: Math.random() * cw * 1.2 - cw * 0.1,
      y: -Math.random() * ch * 0.5,
      size: 4 + Math.random() * 12,
      speed: 20 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      shape,
    })
  }

  stations = []
  for (let i = 0; i < 3; i++) {
    stations.push({
      x: Math.random() * cw,
      y: -Math.random() * ch * 0.3,
      size: 8 + Math.random() * 10,
      speed: 10 + Math.random() * 15,
      rotation: Math.random() * Math.PI * 2,
    })
  }
}

let time = 0

export function drawBackground(ctx: CanvasRenderingContext2D, cw: number, ch: number, dt: number) {
  init(cw, ch)
  time += dt

  const grd = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.9)
  grd.addColorStop(0, '#08081a')
  grd.addColorStop(0.3, '#050512')
  grd.addColorStop(0.6, '#03030e')
  grd.addColorStop(1, '#010008')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, cw, ch)

  for (const n of nebulae) {
    n.x += n.dx * dt * 2
    n.y += n.dy * dt * 2
    if (n.x < -n.r) n.x = cw + n.r
    if (n.x > cw + n.r) n.x = -n.r
    if (n.y < -n.r) n.y = ch + n.r
    if (n.y > ch + n.r) n.y = -n.r

    const grd2 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
    grd2.addColorStop(0, `rgba(${n.color}, ${n.opacity + 0.02})`)
    grd2.addColorStop(0.4, `rgba(${n.color}, ${n.opacity})`)
    grd2.addColorStop(1, `rgba(${n.color}, 0)`)
    ctx.fillStyle = grd2
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const a of asteroids) {
    a.y += a.speed * dt
    a.rot += a.rotSpeed * dt * 60
    if (a.y > ch + a.size * 2) {
      a.y = -a.size * 2
      a.x = Math.random() * cw
      a.speed = 20 + Math.random() * 30
    }

    ctx.save()
    ctx.translate(a.x, a.y)
    ctx.rotate(a.rot)

    ctx.fillStyle = 'rgba(80, 70, 60, 0.25)'
    ctx.strokeStyle = 'rgba(120, 100, 80, 0.15)'
    ctx.lineWidth = 0.5

    ctx.beginPath()
    const sides = a.shape.length
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
      const r = a.size * a.shape[i]
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  for (const p of planets) {
    p.rotation += dt * 0.15
    ctx.save()
    const grd3 = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r)
    grd3.addColorStop(0, lighten(p.color, 40))
    grd3.addColorStop(0.5, lighten(p.color, 10))
    grd3.addColorStop(0.8, p.color)
    grd3.addColorStop(1, darken(p.color, 50))
    ctx.fillStyle = grd3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    for (const c of p.craters) {
      ctx.fillStyle = darken(p.color, 25)
      ctx.beginPath()
      ctx.arc(p.x + c.x, p.y + c.y, c.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = p.atmosphere
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 1.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const s of stations) {
    s.y += s.speed * dt
    s.rotation += dt * 0.5
    if (s.y > ch + s.size * 2) {
      s.y = -s.size * 2
      s.x = Math.random() * cw
    }

    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.rotation)

    ctx.fillStyle = 'rgba(60, 80, 120, 0.15)'
    ctx.strokeStyle = 'rgba(80, 120, 180, 0.1)'
    ctx.lineWidth = 0.5

    ctx.beginPath()
    ctx.arc(0, 0, s.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(80, 140, 200, 0.08)'
    ctx.beginPath()
    ctx.arc(0, 0, s.size * 0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(100, 160, 220, 0.06)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(0, 0, s.size * 1.3, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  for (const s of stars) {
    s.y += s.speed * dt * 60
    if (s.y > ch + 2) {
      s.y = -2
      s.x = Math.random() * cw
    }

    const twinkle = 0.5 + Math.sin(time * s.speed * 0.4 + s.phase) * 0.5 * 0.35
    const alpha = s.brightness * (0.65 + twinkle * 0.35)

    if (s.layer >= 2 && s.size > 1.2) {
      const crossSize = s.size * 2.5
      ctx.save()
      ctx.globalAlpha = alpha * 0.2
      ctx.fillStyle = s.tint
      ctx.shadowBlur = 6
      ctx.shadowColor = s.tint
      ctx.fillRect(s.x - crossSize * 0.03, s.y - crossSize, crossSize * 0.06, crossSize * 2)
      ctx.fillRect(s.x - crossSize, s.y - crossSize * 0.03, crossSize * 2, crossSize * 0.06)
      ctx.restore()
    }

    ctx.fillStyle = s.tint
    ctx.globalAlpha = alpha
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.shadowBlur = 0
  for (const d of dustParticles) {
    d.y += d.speed * dt * 60
    if (d.y > ch + 2) {
      d.y = -2
      d.x = Math.random() * cw
    }
    ctx.fillStyle = `rgba(140, 170, 255, ${d.alpha})`
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
  asteroids = []
  stations = []
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
