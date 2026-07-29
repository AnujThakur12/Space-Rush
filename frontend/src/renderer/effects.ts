export function drawFlash(ctx: CanvasRenderingContext2D, intensity: number, color: string, cw: number, ch: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = intensity * 0.35
  ctx.fillStyle = color || '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.restore()
}

export function drawMuzzleFlash(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, duration: number) {
  const intensity = Math.max(0, 1 - time / duration)
  if (intensity <= 0.01) return

  ctx.save()
  ctx.translate(x, y)

  const r = 24 * intensity

  const flashGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 4)
  flashGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`)
  flashGrad.addColorStop(0.2, `rgba(0, 200, 255, ${intensity * 0.6})`)
  flashGrad.addColorStop(0.5, `rgba(0, 100, 255, ${intensity * 0.3})`)
  flashGrad.addColorStop(1, `rgba(0, 50, 255, 0)`)

  ctx.fillStyle = flashGrad
  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 40
  ctx.beginPath()
  ctx.arc(0, 0, r * 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  const spikeCount = 8
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`
  for (let i = 0; i < spikeCount; i++) {
    const a = (i / spikeCount) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r * 5, Math.sin(a) * r * 5)
    ctx.lineTo(Math.cos(a + 0.35) * r, Math.sin(a + 0.35) * r)
    ctx.closePath()
    ctx.fill()
  }

  const spikeCountSmall = 12
  ctx.fillStyle = `rgba(0, 200, 255, ${intensity * 0.3})`
  for (let i = 0; i < spikeCountSmall; i++) {
    const a = (i / spikeCountSmall) * Math.PI * 2 + 0.15
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r * 3, Math.sin(a) * r * 3)
    ctx.lineTo(Math.cos(a + 0.25) * r * 0.6, Math.sin(a + 0.25) * r * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

export function drawEngineTrail(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 10) return

  const len = Math.min(speed * 0.05, 24)

  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#ff6600'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.moveTo(x - 10, y)
  ctx.lineTo(x + 10, y)
  ctx.lineTo(x, y + len)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#ffcc00'
  ctx.shadowColor = '#ff8800'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.moveTo(x - 6, y)
  ctx.lineTo(x + 6, y)
  ctx.lineTo(x, y + len + 8)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.moveTo(x - 3, y)
  ctx.lineTo(x + 3, y)
  ctx.lineTo(x, y + len + 12)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
