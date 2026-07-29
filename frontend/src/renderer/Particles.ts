import type { Particle } from '../types/game'

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    if (p.alpha <= 0.01) continue

    if (p.type === 'text' && p.text) {
      ctx.save()
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.alpha
      ctx.font = `bold ${p.textSize || 22}px "Inter", "Segoe UI", system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.shadowColor = p.color
      ctx.shadowBlur = 16
      ctx.fillText(p.text, p.x, p.y)
      ctx.restore()
      continue
    }

    ctx.save()
    ctx.globalAlpha = p.alpha * 0.7
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = p.size * 4

    const r = p.size || 2

    if (p.type === 'spark') {
      const angle = Math.atan2(p.vy, p.vx)
      ctx.rotate(angle)
      ctx.fillRect(-r * 0.5, -r * 0.5, r * 2.5, r * 0.8)
    } else if (p.type === 'smoke') {
      ctx.globalAlpha = p.alpha * 0.25
      ctx.fillStyle = `rgba(100, 100, 120, ${p.alpha * 0.25})`
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()

      if (p.size > 4) {
        ctx.globalAlpha = p.alpha * 0.25
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(p.x - r * 0.25, p.y - r * 0.25, r * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }
}
