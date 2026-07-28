import type { Particle } from '../types/game'

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    if (p.alpha <= 0.01) continue

    if (p.type === 'text' && p.text) {
      ctx.save()
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.alpha
      ctx.font = `bold ${p.textSize || 14}px "Inter", "Segoe UI", system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.fillText(p.text, p.x, p.y)
      ctx.restore()
      continue
    }

    ctx.save()
    ctx.globalAlpha = p.alpha * 0.7
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = p.size * 3

    const r = p.size || 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
