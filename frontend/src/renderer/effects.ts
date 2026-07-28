let bloomCanvas: HTMLCanvasElement | null = null

export function drawFlash(ctx: CanvasRenderingContext2D, intensity: number, color: string, cw: number, ch: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = intensity * 0.35
  ctx.fillStyle = color || '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.restore()
}

export function applyBloom(source: HTMLCanvasElement, dest: CanvasRenderingContext2D, cw: number, ch: number) {
  dest.save()
  dest.globalAlpha = 0.25
  dest.filter = 'blur(8px) brightness(1.5)'
  dest.drawImage(source, 0, 0)
  dest.filter = 'blur(4px) brightness(2)'
  dest.globalAlpha = 0.12
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

  const r = 8 * intensity

  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(0, 200, 255, ${intensity * 0.6})`
  ctx.shadowBlur = 30
  ctx.beginPath()
  ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
  ctx.fill()

  const spikeCount = 4
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.4})`
  ctx.shadowBlur = 0
  for (let i = 0; i < spikeCount; i++) {
    const a = (i / spikeCount) * Math.PI * 2 + time * 0.5
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r * 3, Math.sin(a) * r * 3)
    ctx.lineTo(Math.cos(a + 0.3) * r, Math.sin(a + 0.3) * r)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

export function drawEngineTrail(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 10) return

  const len = Math.min(speed * 0.04, 12)

  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#ff8800'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(x - 4, y)
  ctx.lineTo(x + 4, y)
  ctx.lineTo(x, y + len)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#ffcc00'
  ctx.shadowColor = '#ff8800'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(x - 2, y)
  ctx.lineTo(x + 2, y)
  ctx.lineTo(x, y + len + 4)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
