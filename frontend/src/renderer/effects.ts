export function drawFlash(ctx: CanvasRenderingContext2D, intensity: number, color: string, cw: number, ch: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = intensity * 0.35
  ctx.fillStyle = color || '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.restore()
}
