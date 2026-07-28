let bloomCanvas: HTMLCanvasElement | null = null

export function drawFlash(ctx: CanvasRenderingContext2D, intensity: number, color: string, cw: number, ch: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = intensity * 0.4
  ctx.fillStyle = color || '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.restore()
}

export function applyBloom(source: HTMLCanvasElement, dest: CanvasRenderingContext2D, cw: number, ch: number) {
  dest.save()
  dest.globalAlpha = 0.3
  dest.filter = 'blur(8px) brightness(1.5)'
  dest.drawImage(source, 0, 0)
  dest.filter = 'blur(4px) brightness(2)'
  dest.globalAlpha = 0.15
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

export function drawEngineTrail(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 10) return

  const len = Math.min(speed * 0.05, 15)
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#ff8800'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.moveTo(x - 3, y)
  ctx.lineTo(x + 3, y)
  ctx.lineTo(x, y + len)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
