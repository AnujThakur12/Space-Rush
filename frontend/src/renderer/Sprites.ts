import type { Player, Enemy, Boss, Bullet } from '../types/game'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, time: number) {
  const cx = p.x
  const cy = p.y
  const s = p.width * 0.5
  const t = time

  ctx.save()
  ctx.translate(cx, cy)

  const roll = Math.min(Math.max(p.vx / 250, -0.2), 0.2)
  const hover = Math.sin(t * 2) * 1.5
  ctx.translate(0, hover)
  ctx.rotate(roll)

  const enginePulse = 0.6 + Math.sin(t * 6) * 0.3 + Math.sin(t * 13) * 0.1

  ctx.shadowColor = '#0044ff'
  ctx.shadowBlur = 20

  const bodyGrad = ctx.createLinearGradient(0, -s * 1.3, 0, s * 0.7)
  bodyGrad.addColorStop(0, '#1a2a5a')
  bodyGrad.addColorStop(0.3, '#0f1a3a')
  bodyGrad.addColorStop(0.6, '#162050')
  bodyGrad.addColorStop(1, '#0a1228')
  ctx.fillStyle = bodyGrad

  ctx.beginPath()
  ctx.moveTo(0, -s * 1.3)
  ctx.lineTo(-s * 0.08, -s * 0.75)
  ctx.lineTo(-s * 0.12, -s * 0.5)
  ctx.lineTo(-s * 0.15, -s * 0.3)
  ctx.lineTo(-s * 0.35, -s * 0.1)
  ctx.lineTo(-s * 0.55, s * 0.05)
  ctx.lineTo(-s * 0.6, s * 0.12)
  ctx.lineTo(-s * 0.55, s * 0.2)
  ctx.lineTo(-s * 0.35, s * 0.22)
  ctx.lineTo(-s * 0.15, s * 0.35)
  ctx.lineTo(-s * 0.12, s * 0.55)
  ctx.lineTo(-s * 0.08, s * 0.58)
  ctx.lineTo(s * 0.08, s * 0.58)
  ctx.lineTo(s * 0.12, s * 0.55)
  ctx.lineTo(s * 0.15, s * 0.35)
  ctx.lineTo(s * 0.35, s * 0.22)
  ctx.lineTo(s * 0.55, s * 0.2)
  ctx.lineTo(s * 0.6, s * 0.12)
  ctx.lineTo(s * 0.55, s * 0.05)
  ctx.lineTo(s * 0.35, -s * 0.1)
  ctx.lineTo(s * 0.15, -s * 0.3)
  ctx.lineTo(s * 0.12, -s * 0.5)
  ctx.lineTo(s * 0.08, -s * 0.75)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(80, 140, 255, 0.3)'
  ctx.lineWidth = 0.8
  ctx.stroke()

  ctx.shadowBlur = 0

  const cockpitGrad = ctx.createRadialGradient(0, -s * 0.85, 0, 0, -s * 0.85, s * 0.12)
  cockpitGrad.addColorStop(0, 'rgba(120, 200, 255, 0.6)')
  cockpitGrad.addColorStop(0.5, 'rgba(40, 100, 200, 0.3)')
  cockpitGrad.addColorStop(1, 'rgba(0, 40, 120, 0.1)')
  ctx.fillStyle = cockpitGrad
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.85, s * 0.1, s * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(100, 180, 255, 0.25)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.85, s * 0.1, s * 0.16, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = 'rgba(60, 120, 255, 0.15)'
  ctx.beginPath()
  ctx.moveTo(-s * 0.06, -s * 0.7)
  ctx.lineTo(0, -s * 0.95)
  ctx.lineTo(s * 0.06, -s * 0.7)
  ctx.closePath()
  ctx.fill()

  const wingGrad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.2)
  wingGrad.addColorStop(0, '#1a3060')
  wingGrad.addColorStop(0.5, '#0f1f40')
  wingGrad.addColorStop(1, '#0a1530')
  ctx.fillStyle = wingGrad
  ctx.strokeStyle = 'rgba(60, 120, 200, 0.25)'
  ctx.lineWidth = 0.8

  ctx.beginPath()
  ctx.moveTo(-s * 0.15, -s * 0.25)
  ctx.lineTo(-s * 0.6, s * 0.12)
  ctx.lineTo(-s * 0.35, s * 0.22)
  ctx.lineTo(-s * 0.15, -s * 0.05)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(s * 0.15, -s * 0.25)
  ctx.lineTo(s * 0.6, s * 0.12)
  ctx.lineTo(s * 0.35, s * 0.22)
  ctx.lineTo(s * 0.15, -s * 0.05)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.shadowColor = '#0088ff'
  ctx.shadowBlur = 6
  ctx.fillStyle = 'rgba(0, 136, 255, 0.2)'
  ctx.beginPath()
  ctx.moveTo(-s * 0.1, -s * 0.35)
  ctx.lineTo(-s * 0.02, -s * 0.25)
  ctx.lineTo(-s * 0.02, -s * 0.1)
  ctx.lineTo(-s * 0.12, -s * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.1, -s * 0.35)
  ctx.lineTo(s * 0.02, -s * 0.25)
  ctx.lineTo(s * 0.02, -s * 0.1)
  ctx.lineTo(s * 0.12, -s * 0.15)
  ctx.closePath()
  ctx.fill()

  const wingTipGlow = 0.4 + Math.sin(t * 3 + p.hp) * 0.2
  ctx.shadowBlur = 8
  ctx.shadowColor = '#ff4400'
  ctx.fillStyle = `rgba(255, 68, 0, ${wingTipGlow})`
  ctx.beginPath()
  ctx.arc(-s * 0.6, s * 0.12, s * 0.025, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(s * 0.6, s * 0.12, s * 0.025, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowColor = '#ffaa00'
  ctx.fillStyle = `rgba(255, 170, 0, ${0.3 + Math.sin(t * 5) * 0.2})`
  ctx.beginPath()
  ctx.arc(-s * 0.15, s * 0.35, s * 0.018, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(s * 0.15, s * 0.35, s * 0.018, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0

  const exhLen = s * (0.3 + Math.random() * 0.15) * enginePulse
  const exhW = s * 0.08

  ctx.shadowColor = '#00aaff'
  ctx.shadowBlur = 4
  ctx.fillStyle = 'rgba(0, 60, 120, 0.3)'
  ctx.beginPath()
  ctx.ellipse(-s * 0.09, s * 0.56, s * 0.05, s * 0.04, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(s * 0.09, s * 0.56, s * 0.05, s * 0.04, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 20
  ctx.fillStyle = `rgba(255, 140, 0, ${0.5 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-s * 0.10, s * 0.58)
  ctx.lineTo(s * 0.10, s * 0.58)
  ctx.lineTo(s * 0.06, s * 0.58 + exhLen)
  ctx.lineTo(-s * 0.06, s * 0.58 + exhLen)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 25
  ctx.fillStyle = `rgba(255, 200, 50, ${0.35 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-s * 0.05, s * 0.58)
  ctx.lineTo(s * 0.05, s * 0.58)
  ctx.lineTo(s * 0.03, s * 0.58 + exhLen * 0.65)
  ctx.lineTo(-s * 0.03, s * 0.58 + exhLen * 0.65)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 15
  ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-s * 0.018, s * 0.58)
  ctx.lineTo(s * 0.018, s * 0.58)
  ctx.lineTo(0, s * 0.58 + exhLen * 0.4)
  ctx.closePath()
  ctx.fill()

  if (p.invincible > 0 && Math.sin(t * 30) > 0) {
    ctx.shadowBlur = 0
    const shieldAlpha = 0.3 + Math.sin(t * 8) * 0.15
    ctx.strokeStyle = `rgba(100, 180, 255, ${shieldAlpha})`
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha * 0.5})`
    ctx.lineWidth = 0.8
    ctx.setLineDash([2, 8])
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore()
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)

  const flash = e.flashTimer > 0
  const bw = (e.width * 0.5)
  const bh = (e.height * 0.5)
  const t = time

  switch (e.type) {
    case 'basic': {
      const bob = Math.sin(t * 3 + e.x * 0.01) * 1.5
      ctx.translate(0, bob)
      const rot = Math.sin(t * 0.5) * 0.03
      ctx.rotate(rot)

      ctx.shadowBlur = flash ? 16 : 8
      ctx.shadowColor = flash ? '#ffffff' : '#00ddcc'
      ctx.fillStyle = flash ? '#ffffff' : '#0a2a2a'

      ctx.beginPath()
      ctx.moveTo(0, -bh - 6)
      ctx.lineTo(-bw * 0.35, -bh * 0.3)
      ctx.lineTo(-bw * 0.45, -bh * 0.1)
      ctx.lineTo(-bw * 0.6, bh * 0.2)
      ctx.lineTo(-bw * 0.5, bh * 0.4)
      ctx.lineTo(-bw * 0.25, bh * 0.5)
      ctx.lineTo(0, bh * 0.35)
      ctx.lineTo(bw * 0.25, bh * 0.5)
      ctx.lineTo(bw * 0.5, bh * 0.4)
      ctx.lineTo(bw * 0.6, bh * 0.2)
      ctx.lineTo(bw * 0.45, -bh * 0.1)
      ctx.lineTo(bw * 0.35, -bh * 0.3)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(0, 220, 200, 0.4)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      ctx.shadowBlur = 12
      ctx.shadowColor = '#00ffcc'
      ctx.fillStyle = flash ? '#ffffff' : '#00ffcc'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.1, bh * 0.12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#006655'
      ctx.shadowBlur = 6
      ctx.shadowColor = '#00aa88'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.1, bh * 0.05, 0, Math.PI * 2)
      ctx.fill()

      const glowPulse = 0.3 + Math.sin(t * 4) * 0.2
      ctx.shadowBlur = 8
      ctx.shadowColor = '#00ccaa'
      ctx.fillStyle = `rgba(0, 200, 170, ${glowPulse})`
      ctx.beginPath()
      ctx.arc(-bw * 0.3, bh * 0.28, bh * 0.03, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.3, bh * 0.28, bh * 0.03, 0, Math.PI * 2)
      ctx.fill()

      break
    }
    case 'fast': {
      const hoverBob = Math.sin(t * 4 + e.x * 0.01) * 1
      ctx.translate(0, hoverBob)
      const waggle = Math.sin(t * 3) * 0.06
      ctx.rotate(waggle)

      ctx.shadowBlur = flash ? 16 : 8
      ctx.shadowColor = flash ? '#ffffff' : '#ff8800'
      ctx.fillStyle = flash ? '#ffffff' : '#1a0f05'

      ctx.beginPath()
      ctx.moveTo(0, -bh - 8)
      ctx.lineTo(-bw * 0.2, -bh * 0.4)
      ctx.lineTo(-bw * 0.4, -bh * 0.1)
      ctx.lineTo(-bw * 0.5, bh * 0.15)
      ctx.lineTo(-bw * 0.35, bh * 0.25)
      ctx.lineTo(-bw * 0.2, bh * 0.15)
      ctx.lineTo(-bw * 0.15, bh * 0.45)
      ctx.lineTo(0, bh * 0.35)
      ctx.lineTo(bw * 0.15, bh * 0.45)
      ctx.lineTo(bw * 0.2, bh * 0.15)
      ctx.lineTo(bw * 0.35, bh * 0.25)
      ctx.lineTo(bw * 0.5, bh * 0.15)
      ctx.lineTo(bw * 0.4, -bh * 0.1)
      ctx.lineTo(bw * 0.2, -bh * 0.4)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(255, 136, 0, 0.35)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      ctx.shadowColor = '#ff8800'
      ctx.shadowBlur = 14
      ctx.fillStyle = flash ? '#ffffff' : '#ff8800'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.15, bh * 0.09, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#cc5500'
      ctx.shadowBlur = 6
      ctx.shadowColor = '#ff6600'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.15, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      const exhFlicker = 0.6 + Math.random() * 0.4
      ctx.shadowBlur = 16
      ctx.shadowColor = '#ff6600'
      ctx.fillStyle = `rgba(255, 120, 0, ${0.5 * exhFlicker})`
      ctx.beginPath()
      ctx.moveTo(-bw * 0.04, bh * 0.35)
      ctx.lineTo(bw * 0.04, bh * 0.35)
      ctx.lineTo(bw * 0.02, bh * 0.35 + bh * 0.5 * exhFlicker)
      ctx.lineTo(-bw * 0.02, bh * 0.35 + bh * 0.5 * exhFlicker)
      ctx.closePath()
      ctx.fill()

      break
    }
    case 'tank': {
      const slowBob = Math.sin(t * 1.5 + e.x * 0.01) * 0.8
      ctx.translate(0, slowBob)

      ctx.shadowBlur = flash ? 18 : 10
      ctx.shadowColor = flash ? '#ffffff' : '#9933ff'
      ctx.fillStyle = flash ? '#ffffff' : '#0f0a1a'

      ctx.beginPath()
      ctx.moveTo(0, -bh - 4)
      ctx.lineTo(-bw * 0.4, -bh * 0.2)
      ctx.lineTo(-bw * 0.7, 0)
      ctx.lineTo(-bw * 0.8, bh * 0.15)
      ctx.lineTo(-bw * 0.65, bh * 0.35)
      ctx.lineTo(-bw * 0.4, bh * 0.55)
      ctx.lineTo(-bw * 0.15, bh * 0.5)
      ctx.lineTo(0, bh * 0.6)
      ctx.lineTo(bw * 0.15, bh * 0.5)
      ctx.lineTo(bw * 0.4, bh * 0.55)
      ctx.lineTo(bw * 0.65, bh * 0.35)
      ctx.lineTo(bw * 0.8, bh * 0.15)
      ctx.lineTo(bw * 0.7, 0)
      ctx.lineTo(bw * 0.4, -bh * 0.2)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(153, 51, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.shadowBlur = 14
      ctx.shadowColor = '#aa44ff'
      ctx.fillStyle = flash ? '#ffffff' : '#8833cc'
      ctx.beginPath()
      ctx.arc(0, 0, bh * 0.14, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#441166'
      ctx.shadowBlur = 6
      ctx.shadowColor = '#6622aa'
      ctx.beginPath()
      ctx.arc(0, 0, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()

      const enginePulse = 0.4 + Math.sin(t * 2 + e.x) * 0.25
      ctx.shadowBlur = 10
      ctx.shadowColor = '#aa44ff'
      ctx.fillStyle = `rgba(170, 68, 255, ${enginePulse})`
      ctx.beginPath()
      ctx.arc(-bw * 0.55, bh * 0.4, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.55, bh * 0.4, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 8
      ctx.fillStyle = 'rgba(170, 68, 255, 0.15)'
      ctx.beginPath()
      ctx.arc(-bw * 0.55, bh * 0.4, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.55, bh * 0.4, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()

      break
    }
    case 'shooter': {
      const float = Math.sin(t * 2 + e.x * 0.01) * 1.2
      ctx.translate(0, float)

      ctx.shadowBlur = flash ? 16 : 8
      ctx.shadowColor = flash ? '#ffffff' : '#ff2266'
      ctx.fillStyle = flash ? '#ffffff' : '#1a0610'

      ctx.beginPath()
      ctx.moveTo(0, -bh - 5)
      ctx.lineTo(-bw * 0.3, -bh * 0.2)
      ctx.lineTo(-bw * 0.6, 0)
      ctx.lineTo(-bw * 0.55, bh * 0.2)
      ctx.lineTo(-bw * 0.7, bh * 0.4)
      ctx.lineTo(-bw * 0.5, bh * 0.55)
      ctx.lineTo(-bw * 0.2, bh * 0.4)
      ctx.lineTo(0, bh * 0.5)
      ctx.lineTo(bw * 0.2, bh * 0.4)
      ctx.lineTo(bw * 0.5, bh * 0.55)
      ctx.lineTo(bw * 0.7, bh * 0.4)
      ctx.lineTo(bw * 0.55, bh * 0.2)
      ctx.lineTo(bw * 0.6, 0)
      ctx.lineTo(bw * 0.3, -bh * 0.2)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(255, 34, 102, 0.3)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      ctx.shadowColor = '#ff2266'
      ctx.shadowBlur = 16
      ctx.fillStyle = flash ? '#ffffff' : '#ff2266'
      ctx.beginPath()
      ctx.arc(0, bh * 0.05, bh * 0.1, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#ff4488'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#ff4488'
      ctx.beginPath()
      ctx.arc(0, bh * 0.05, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      const pulse = 0.3 + Math.sin(t * 3) * 0.2
      ctx.shadowBlur = 8
      ctx.shadowColor = '#ff4488'
      ctx.fillStyle = `rgba(255, 68, 136, ${pulse})`
      ctx.beginPath()
      ctx.arc(-bw * 0.45, bh * 0.3, bh * 0.03, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.45, bh * 0.3, bh * 0.03, 0, Math.PI * 2)
      ctx.fill()

      break
    }
    case 'elite': {
      const drift = Math.sin(t * 1.2 + e.x * 0.01) * 0.03
      ctx.rotate(drift)

      ctx.shadowBlur = flash ? 22 : 12
      ctx.shadowColor = flash ? '#ffffff' : '#ff0033'
      ctx.fillStyle = flash ? '#ffffff' : '#120008'

      ctx.beginPath()
      ctx.moveTo(0, -bh - 8)
      ctx.lineTo(-bw * 0.2, -bh * 0.5)
      ctx.lineTo(-bw * 0.35, -bh * 0.25)
      ctx.lineTo(-bw * 0.55, -bh * 0.1)
      ctx.lineTo(-bw * 0.5, bh * 0.15)
      ctx.lineTo(-bw * 0.7, bh * 0.35)
      ctx.lineTo(-bw * 0.6, bh * 0.5)
      ctx.lineTo(-bw * 0.35, bh * 0.45)
      ctx.lineTo(-bw * 0.2, bh * 0.6)
      ctx.lineTo(-bw * 0.08, bh * 0.5)
      ctx.lineTo(0, bh * 0.55)
      ctx.lineTo(bw * 0.08, bh * 0.5)
      ctx.lineTo(bw * 0.2, bh * 0.6)
      ctx.lineTo(bw * 0.35, bh * 0.45)
      ctx.lineTo(bw * 0.6, bh * 0.5)
      ctx.lineTo(bw * 0.7, bh * 0.35)
      ctx.lineTo(bw * 0.5, bh * 0.15)
      ctx.lineTo(bw * 0.55, -bh * 0.1)
      ctx.lineTo(bw * 0.35, -bh * 0.25)
      ctx.lineTo(bw * 0.2, -bh * 0.5)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(255, 0, 51, 0.35)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.shadowColor = '#ff0033'
      ctx.shadowBlur = 18
      ctx.fillStyle = flash ? '#ffffff' : '#ff0033'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.2, bh * 0.12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#ffffff'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#ff2222'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.2, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      const sideGlow = 0.4 + Math.sin(t * 3) * 0.25
      ctx.shadowColor = '#ff4400'
      ctx.shadowBlur = 10
      ctx.fillStyle = `rgba(255, 68, 0, ${sideGlow})`
      ctx.beginPath()
      ctx.arc(-bw * 0.35, bh * 0.25, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.35, bh * 0.25, bh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      const corePulse = 0.3 + Math.sin(t * 4) * 0.2
      ctx.shadowColor = '#ff0066'
      ctx.shadowBlur = 14
      ctx.fillStyle = `rgba(255, 0, 102, ${corePulse})`
      ctx.beginPath()
      ctx.arc(0, bh * 0.15, bh * 0.08, 0, Math.PI * 2)
      ctx.fill()

      const exhFlicker = 0.5 + Math.random() * 0.5
      ctx.shadowBlur = 18
      ctx.shadowColor = '#ff2200'
      ctx.fillStyle = `rgba(255, 34, 0, ${0.4 * exhFlicker})`
      ctx.beginPath()
      ctx.moveTo(-bw * 0.06, bh * 0.55)
      ctx.lineTo(bw * 0.06, bh * 0.55)
      ctx.lineTo(bw * 0.03, bh * 0.55 + bh * 0.6 * exhFlicker)
      ctx.lineTo(-bw * 0.03, bh * 0.55 + bh * 0.6 * exhFlicker)
      ctx.closePath()
      ctx.fill()

      break
    }
  }

  ctx.restore()
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, time: number) {
  const cx = boss.x
  const cy = boss.y
  const r = Math.max(boss.width, boss.height) * 0.4
  const t = time

  ctx.save()
  ctx.translate(cx, cy)

  if (boss.introTimer > 0) {
    const scale = Math.max(0.1, 1 - boss.introTimer / 2.5)
    ctx.scale(scale, scale)
  }

  const phaseColors = ['#ff6600', '#ff0044', '#cc00ff', '#ff0066']
  const phaseColor = phaseColors[boss.phase - 1] || '#ff6600'
  const { r: pr, g: pg, b: pb } = hexToRgb(phaseColor)

  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 30

  ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.3)`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.15)`
  ctx.lineWidth = 1
  ctx.setLineDash([8, 12])
  ctx.beginPath()
  ctx.arc(0, 0, r * 2.3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.shadowBlur = 20
  ctx.fillStyle = boss.phase === 1 ? '#1a0808' : boss.phase === 2 ? '#1a0408' : '#0e041a'

  ctx.beginPath()
  ctx.moveTo(0, -r * 1.5)
  ctx.lineTo(-r * 1.0, -r * 0.8)
  ctx.lineTo(-r * 1.3, -r * 0.3)
  ctx.lineTo(-r * 1.5, r * 0.2)
  ctx.lineTo(-r * 1.1, r * 0.6)
  ctx.lineTo(-r * 0.8, r * 1.0)
  ctx.lineTo(-r * 0.3, r * 1.2)
  ctx.lineTo(0, r * 1.3)
  ctx.lineTo(r * 0.3, r * 1.2)
  ctx.lineTo(r * 0.8, r * 1.0)
  ctx.lineTo(r * 1.1, r * 0.6)
  ctx.lineTo(r * 1.5, r * 0.2)
  ctx.lineTo(r * 1.3, -r * 0.3)
  ctx.lineTo(r * 1.0, -r * 0.8)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.3)`
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = boss.phase === 1 ? '#2a1010' : boss.phase === 2 ? '#2a0810' : '#1a0830'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.1)
  ctx.lineTo(-r * 0.7, -r * 0.5)
  ctx.lineTo(-r * 0.9, 0)
  ctx.lineTo(-r * 0.7, r * 0.5)
  ctx.lineTo(0, r * 0.7)
  ctx.lineTo(r * 0.7, r * 0.5)
  ctx.lineTo(r * 0.9, 0)
  ctx.lineTo(r * 0.7, -r * 0.5)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.2)`
  ctx.lineWidth = 1
  ctx.stroke()

  const ringRotation = t * 0.5 + boss.ringRotation
  const ringCount = boss.phase === 1 ? 8 : boss.phase === 2 ? 10 : 12
  ctx.shadowBlur = 0
  for (let i = 0; i < ringCount; i++) {
    const a = (i / ringCount) * Math.PI * 2 + ringRotation
    const r1 = i % 2 === 0 ? r * 1.1 : r * 0.85
    const px = Math.cos(a) * r1
    const py = Math.sin(a) * r1

    ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${0.2 + Math.sin(a + t) * 0.1})`
    ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.15)`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(px, py, r * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  const corePulse = r * 0.35 + Math.sin(t * 2.5) * r * 0.04
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, corePulse)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.2, phaseColor)
  grad.addColorStop(0.5, `rgba(${pr}, ${pg}, ${pb}, 0.5)`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 30
  ctx.beginPath()
  ctx.arc(0, 0, corePulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 14
  const eyeGlow = 0.6 + Math.sin(t * 2.5 + 1) * 0.25
  ctx.fillStyle = `rgba(255, 255, 100, ${eyeGlow})`
  ctx.shadowColor = '#ffff00'
  ctx.beginPath()
  ctx.arc(-r * 0.25, -r * 0.2, r * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.25, -r * 0.2, r * 0.07, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.arc(-r * 0.25, -r * 0.2, r * 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.25, -r * 0.2, r * 0.03, 0, Math.PI * 2)
  ctx.fill()

  const enginePulse = 0.5 + Math.sin(t * 3) * 0.3 + Math.sin(t * 7) * 0.15
  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 20
  ctx.fillStyle = `rgba(255, 120, 0, ${enginePulse})`
  ctx.beginPath()
  ctx.ellipse(-r * 0.35, r * 1.1, r * 0.08, r * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(r * 0.35, r * 1.1, r * 0.08, r * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255, 200, 50, ${enginePulse * 0.6})`
  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 25
  ctx.beginPath()
  ctx.ellipse(-r * 0.35, r * 1.1 + r * 0.06, r * 0.04, r * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(r * 0.35, r * 1.1 + r * 0.06, r * 0.04, r * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  const sideTurretRot = t * 0.3
  ctx.shadowBlur = 10
  ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.2)`
  ctx.lineWidth = 2
  const tl = r * 0.5
  ctx.beginPath()
  ctx.moveTo(-r * 1.1, 0)
  ctx.lineTo(-r * 1.1 - Math.cos(sideTurretRot) * tl, Math.sin(sideTurretRot) * tl)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(r * 1.1, 0)
  ctx.lineTo(r * 1.1 + Math.cos(sideTurretRot + Math.PI) * tl, Math.sin(sideTurretRot + Math.PI) * tl)
  ctx.stroke()

  ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.4)`
  ctx.beginPath()
  ctx.arc(-r * 1.1, 0, r * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 1.1, 0, r * 0.06, 0, Math.PI * 2)
  ctx.fill()

  if (boss.hp < boss.maxHp * 0.3 && boss.phase >= 2) {
    const warningFlash = Math.sin(t * 6) > 0
    if (warningFlash) {
      ctx.shadowBlur = 0
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.1)`
      ctx.beginPath()
      ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save()
  ctx.translate(b.x, b.y)

  if (b.isPlayer) {
    const len = Math.hypot(b.vx, b.vy) * 0.02 + 8
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle)

    ctx.shadowColor = '#00ccff'
    ctx.shadowBlur = 16
    ctx.fillStyle = '#00ccff'
    ctx.fillRect(-1.5, -len / 2, 3, len)

    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 20
    ctx.fillRect(-0.6, -len / 2 - 1, 1.2, len + 2)

    const glowGrad = ctx.createLinearGradient(0, -len / 2, 0, len / 2)
    glowGrad.addColorStop(0, 'rgba(0, 180, 255, 0.6)')
    glowGrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.3)')
    glowGrad.addColorStop(1, 'rgba(0, 180, 255, 0.6)')
    ctx.fillStyle = glowGrad
    ctx.shadowBlur = 24
    ctx.fillRect(-3, -len / 2, 6, len)
  } else {
    const glowSize = 3.5 + Math.sin(Date.now() * 0.01 + b.x * 0.1) * 0.5

    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 14
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ff8800'
    ctx.shadowBlur = 18
    ctx.shadowColor = '#ff8800'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize * 0.55, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 10
    ctx.shadowColor = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export function drawPowerupIcon(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, bobTimer: number) {
  ctx.save()
  ctx.translate(x, y)

  const bob = Math.sin(bobTimer * 3) * 3
  ctx.translate(0, bob)

  const pulse = 0.8 + Math.sin(bobTimer * 4) * 0.2

  let color1: string, color2: string, symbol: string
  switch (type) {
    case 'bomb':
      color1 = '#ff6600'
      color2 = '#ffaa00'
      symbol = 'B'
      break
    case 'homing':
      color1 = '#00ffcc'
      color2 = '#00ff88'
      symbol = 'H'
      break
    case 'slowmo':
      color1 = '#88bbff'
      color2 = '#4488ff'
      symbol = 'S'
      break
    default:
      color1 = '#ffffff'
      color2 = '#aaaaaa'
      symbol = '?'
  }

  ctx.shadowColor = color1
  ctx.shadowBlur = 15 * pulse

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12)
  grad.addColorStop(0, color2)
  grad.addColorStop(0.6, color1)
  grad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = grad

  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? 12 : 9
    i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = `rgba(255,255,255,0.3)`
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px "Inter", "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(symbol, 0, 0.5)

  ctx.restore()
}
