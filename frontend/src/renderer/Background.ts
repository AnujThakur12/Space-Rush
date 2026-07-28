interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  layer: number
}

interface Nebula {
  x: number
  y: number
  r: number
  color: string
  opacity: number
}

const STAR_COUNTS = [120, 80, 50]
const STAR_SPEEDS = [0.3, 0.8, 1.8]
const STAR_SIZES = [0.5, 1.0, 1.8]
const STAR_BRIGHTNESS = [0.3, 0.5, 0.8]

let stars: Star[] = []
let nebulae: Nebula[] = []
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
      })
    }
  }

  nebulae = [
    { x: cw * 0.2, y: ch * 0.3, r: 120, color: 'rgba(68, 34, 170, 0.04)', opacity: 1 },
    { x: cw * 0.8, y: ch * 0.6, r: 150, color: 'rgba(34, 68, 170, 0.03)', opacity: 1 },
    { x: cw * 0.5, y: ch * 0.8, r: 100, color: 'rgba(136, 34, 102, 0.03)', opacity: 1 },
    { x: cw * 0.1, y: ch * 0.7, r: 90, color: 'rgba(34, 102, 136, 0.03)', opacity: 1 },
    { x: cw * 0.7, y: ch * 0.2, r: 110, color: 'rgba(102, 68, 204, 0.04)', opacity: 1 },
  ]
}

export function drawBackground(ctx: CanvasRenderingContext2D, cw: number, ch: number, dt: number) {
  init(cw, ch)

  const grd = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.7)
  grd.addColorStop(0, '#050510')
  grd.addColorStop(0.5, '#030310')
  grd.addColorStop(1, '#010008')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, cw, ch)

  for (const n of nebulae) {
    const grd2 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
    grd2.addColorStop(0, n.color.replace('0.04', '0.06').replace('0.03', '0.04'))
    grd2.addColorStop(0.5, n.color)
    grd2.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd2
    ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2)
  }

  for (const s of stars) {
    s.y += s.speed * dt * 60
    if (s.y > ch + 2) {
      s.y = -2
      s.x = Math.random() * cw
    }

    const alpha = s.brightness * (0.5 + Math.sin(Date.now() / 1000 * s.speed + s.x) * 0.5 * 0.3)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function resetBackground() {
  initialized = false
  stars = []
  nebulae = []
}
