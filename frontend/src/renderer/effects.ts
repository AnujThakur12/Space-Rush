let bloomCanvas: HTMLCanvasElement | null = null

export function drawFlash(ctx: CanvasRenderingContext2D, intensity: number, color: string, cw: number, ch: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = intensity * 0.3
  ctx.fillStyle = color || '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.restore()
}

export function applyBloom(source: HTMLCanvasElement, dest: CanvasRenderingContext2D, cw: number, ch: number) {
  dest.save()
  dest.globalAlpha = 0.2
  dest.filter = 'blur(8px) brightness(1.5)'
  dest.drawImage(source, 0, 0)
  dest.filter = 'blur(4px) brightness(2)'
  dest.globalAlpha = 0.1
  dest.drawImage(source, 0, 0)
  dest.restore()
}

export function initBloomCanvas(cw: number, ch: number): HTMLCanvasElement {
  if (!bloomCanvas || bloomCanvas.width !== cw || bloomCanvas.height !== ch) {
    bloomCanvas = document.createElement('canvas')
    bloomCanvas.width = cw
    bloomCanvas.height = ch
  }
  return bloomCanvas
}

export function drawMuzzleFlash(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, duration: number) {
  const intensity = Math.max(0, 1 - time / duration)
  if (intensity <= 0.01) return

  ctx.save()
  ctx.translate(x, y)

  const r = 10 * intensity

  const flashGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
  flashGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`)
  flashGrad.addColorStop(0.2, `rgba(0, 200, 255, ${intensity * 0.6})`)
  flashGrad.addColorStop(0.5, `rgba(0, 100, 255, ${intensity * 0.3})`)
  flashGrad.addColorStop(1, `rgba(0, 50, 255, 0)`)

  ctx.fillStyle = flashGrad
  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 25
  ctx.beginPath()
  ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  const spikeCount = 6
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`
  for (let i = 0; i < spikeCount; i++) {
    const a = (i / spikeCount) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r * 4, Math.sin(a) * r * 4)
    ctx.lineTo(Math.cos(a + 0.4) * r * 0.8, Math.sin(a + 0.4) * r * 0.8)
    ctx.closePath()
    ctx.fill()
  }

  const spikeCountSmall = 8
  ctx.fillStyle = `rgba(0, 200, 255, ${intensity * 0.3})`
  for (let i = 0; i < spikeCountSmall; i++) {
    const a = (i / spikeCountSmall) * Math.PI * 2 + 0.2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r * 2.5, Math.sin(a) * r * 2.5)
    ctx.lineTo(Math.cos(a + 0.3) * r * 0.5, Math.sin(a + 0.3) * r * 0.5)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

export function drawEngineTrail(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 10) return

  const len = Math.min(speed * 0.04, 14)

  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#ff6600'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(x - 5, y)
  ctx.lineTo(x + 5, y)
  ctx.lineTo(x, y + len)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#ffcc00'
  ctx.shadowColor = '#ff8800'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.moveTo(x - 3, y)
  ctx.lineTo(x + 3, y)
  ctx.lineTo(x, y + len + 5)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.moveTo(x - 1.5, y)
  ctx.lineTo(x + 1.5, y)
  ctx.lineTo(x, y + len + 8)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
