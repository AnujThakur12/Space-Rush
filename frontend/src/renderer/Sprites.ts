import type { Player, Enemy, Boss, Bullet } from '../types/game'

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, time: number) {
  const cx = p.x
  const cy = p.y
  const s = p.width * 0.5
  const t = time

  ctx.save()
  ctx.translate(cx, cy)

  const roll = Math.min(Math.max(p.vx / 250, -0.2), 0.2)
  const hover = Math.sin(t * 2) * 2
  ctx.translate(0, hover)
  ctx.rotate(roll)

  const exhFlicker = 0.7 + Math.random() * 0.3

  ctx.shadowColor = '#0088ff'
  ctx.shadowBlur = 15

  ctx.strokeStyle = '#4488ff'
  ctx.lineWidth = 1.5

  ctx.fillStyle = '#121c3a'
  ctx.beginPath()
  ctx.moveTo(0, -s * 1.2)
  ctx.lineTo(-s * 0.12, -s * 0.7)
  ctx.lineTo(-s * 0.08, -s * 0.35)
  ctx.lineTo(-s * 0.2, -s * 0.1)
  ctx.lineTo(-s * 0.16, s * 0.05)
  ctx.lineTo(-s * 0.7, s * 0.3)
  ctx.lineTo(-s * 0.65, s * 0.4)
  ctx.lineTo(-s * 0.4, s * 0.38)
  ctx.lineTo(-s * 0.35, s * 0.55)
  ctx.lineTo(-s * 0.15, s * 0.55)
  ctx.lineTo(-s * 0.12, s * 0.4)
  ctx.lineTo(-s * 0.08, s * 0.4)
  ctx.lineTo(-s * 0.05, s * 0.65)
  ctx.lineTo(s * 0.05, s * 0.65)
  ctx.lineTo(s * 0.08, s * 0.4)
  ctx.lineTo(s * 0.12, s * 0.4)
  ctx.lineTo(s * 0.15, s * 0.55)
  ctx.lineTo(s * 0.35, s * 0.55)
  ctx.lineTo(s * 0.4, s * 0.38)
  ctx.lineTo(s * 0.65, s * 0.4)
  ctx.lineTo(s * 0.7, s * 0.3)
  ctx.lineTo(s * 0.16, s * 0.05)
  ctx.lineTo(s * 0.2, -s * 0.1)
  ctx.lineTo(s * 0.08, -s * 0.35)
  ctx.lineTo(s * 0.12, -s * 0.7)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.moveTo(-s * 0.06, -s * 0.65)
  ctx.lineTo(-s * 0.08, -s * 0.35)
  ctx.lineTo(s * 0.08, -s * 0.35)
  ctx.lineTo(s * 0.06, -s * 0.65)
  ctx.closePath()
  ctx.fillStyle = 'rgba(60, 120, 255, 0.25)'
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)'
  ctx.lineWidth = 0.5
  ctx.fill()
  ctx.stroke()

  ctx.shadowColor = '#00aaff'
  ctx.shadowBlur = 6
  ctx.fillStyle = '#0055aa'
  ctx.beginPath()
  ctx.ellipse(0, s * 0.18, s * 0.04, s * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()

  const wingTipGlow = 0.3 + Math.sin(t * 4 + p.hp) * 0.15
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 4
  ctx.fillStyle = `rgba(255, 68, 0, ${wingTipGlow})`
  ctx.beginPath()
  ctx.arc(-s * 0.7, s * 0.3, s * 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(s * 0.7, s * 0.3, s * 0.03, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#4488ff'
  ctx.beginPath()
  ctx.arc(-s * 0.27, s * 0.15, s * 0.015, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(s * 0.27, s * 0.15, s * 0.015, 0, Math.PI * 2)
  ctx.fill()

  const exhLen = s * (0.35 + Math.random() * 0.2) * exhFlicker
  const exhW = s * 0.08
  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 18
  ctx.fillStyle = `rgba(255, 140, 0, ${0.6 * exhFlicker})`
  ctx.beginPath()
  ctx.moveTo(-s * 0.10, s * 0.55)
  ctx.lineTo(s * 0.10, s * 0.55)
  ctx.lineTo(s * 0.05, s * 0.55 + exhLen)
  ctx.lineTo(-s * 0.05, s * 0.55 + exhLen)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = `rgba(255, 200, 50, ${0.4 * exhFlicker})`
  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 22
  ctx.beginPath()
  ctx.moveTo(-s * 0.05, s * 0.55)
  ctx.lineTo(s * 0.05, s * 0.55)
  ctx.lineTo(s * 0.025, s * 0.55 + exhLen * 0.6)
  ctx.lineTo(-s * 0.025, s * 0.55 + exhLen * 0.6)
  ctx.closePath()
  ctx.fill()

  ctx.shadowBlur = 12
  ctx.fillStyle = `rgba(255, 100, 0, ${0.3 * exhFlicker})`
  ctx.beginPath()
  ctx.moveTo(-s * 0.06, s * 0.4)
  ctx.lineTo(s * 0.06, s * 0.4)
  ctx.lineTo(s * 0.03, s * 0.4 + exhLen * 0.3)
  ctx.lineTo(-s * 0.03, s * 0.4 + exhLen * 0.3)
  ctx.closePath()
  ctx.fill()

  if (p.invincible > 0 && Math.sin(t * 30) > 0) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 5])
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore()
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)

  const flash = e.flashTimer > 0
  const bw = e.width * 0.5
  const bh = e.height * 0.5
  const t = time

  switch (e.type) {
    case 'basic': {
      const bob = Math.sin(t * 3 + e.x) * 2
      ctx.translate(0, bob)
      ctx.shadowBlur = flash ? 14 : 6
      ctx.fillStyle = flash ? '#ffffff' : '#cc3333'
      ctx.shadowColor = flash ? '#ffffff' : '#ff3333'
      ctx.beginPath()
      ctx.moveTo(0, -bh - 4)
      ctx.lineTo(-bw * 0.6, -bh * 0.2)
      ctx.lineTo(-bw * 0.5, bh * 0.1)
      ctx.lineTo(-bw * 0.7, bh + 2)
      ctx.lineTo(-bw * 0.3, bh * 0.7)
      ctx.lineTo(-bw * 0.1, bh * 0.3)
      ctx.lineTo(bw * 0.1, bh * 0.3)
      ctx.lineTo(bw * 0.3, bh * 0.7)
      ctx.lineTo(bw * 0.7, bh + 2)
      ctx.lineTo(bw * 0.5, bh * 0.1)
      ctx.lineTo(bw * 0.6, -bh * 0.2)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = flash ? '#ffffff' : '#aa2222'
      ctx.beginPath()
      ctx.arc(0, -bh * 0.1, bh * 0.15, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'fast': {
      const rot = Math.sin(t * 2) * 0.05
      ctx.rotate(rot)
      ctx.shadowBlur = flash ? 14 : 6
      ctx.fillStyle = flash ? '#ffffff' : '#dd6622'
      ctx.shadowColor = flash ? '#ffffff' : '#ff6600'
      ctx.beginPath()
      ctx.moveTo(0, -bh - 6)
      ctx.lineTo(-bw * 0.5, 0)
      ctx.lineTo(-bw * 0.15, bh * 0.2)
      ctx.lineTo(-bw * 0.3, bh + 2)
      ctx.lineTo(0, bh * 0.5)
      ctx.lineTo(bw * 0.3, bh + 2)
      ctx.lineTo(bw * 0.15, bh * 0.2)
      ctx.lineTo(bw * 0.5, 0)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 8
      ctx.fillStyle = '#ff8800'
      ctx.beginPath()
      ctx.arc(0, bh * 0.15, bh * 0.08, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'tank': {
      ctx.shadowBlur = flash ? 16 : 8
      ctx.fillStyle = flash ? '#ffffff' : '#6633aa'
      ctx.shadowColor = flash ? '#ffffff' : '#8833ff'
      ctx.beginPath()
      const hw = bw * 0.9
      const hh = bh * 0.7
      ctx.moveTo(0, -hh - 4)
      ctx.lineTo(-hw * 0.6, -hh * 0.3)
      ctx.lineTo(-hw, 0)
      ctx.lineTo(-hw * 0.8, hh * 0.3)
      ctx.lineTo(-hw * 0.4, hh)
      ctx.lineTo(-hw * 0.1, hh * 0.7)
      ctx.lineTo(hw * 0.1, hh * 0.7)
      ctx.lineTo(hw * 0.4, hh)
      ctx.lineTo(hw * 0.8, hh * 0.3)
      ctx.lineTo(hw, 0)
      ctx.lineTo(hw * 0.6, -hh * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = flash ? '#ffffff' : '#8855cc'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.shadowBlur = 6
      ctx.fillStyle = '#aa66ff'
      ctx.beginPath()
      ctx.arc(0, 0, bh * 0.12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = flash ? '#ffffff' : '#442288'
      ctx.beginPath()
      ctx.arc(-bw * 0.35, -bh * 0.2, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bw * 0.35, -bh * 0.2, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'shooter': {
      const bob = Math.sin(t * 2 + e.x) * 1.5
      ctx.translate(0, bob)
      ctx.shadowBlur = flash ? 14 : 6
      ctx.fillStyle = flash ? '#ffffff' : '#cc1166'
      ctx.shadowColor = flash ? '#ffffff' : '#ff0055'
      ctx.beginPath()
      ctx.moveTo(0, -bh - 4)
      ctx.lineTo(-bw * 0.4, -bh * 0.1)
      ctx.lineTo(-bw * 0.7, bh * 0.2)
      ctx.lineTo(-bw * 0.5, bh * 0.4)
      ctx.lineTo(-bw * 0.6, bh + 3)
      ctx.lineTo(-bw * 0.25, bh * 0.5)
      ctx.lineTo(bw * 0.25, bh * 0.5)
      ctx.lineTo(bw * 0.6, bh + 3)
      ctx.lineTo(bw * 0.5, bh * 0.4)
      ctx.lineTo(bw * 0.7, bh * 0.2)
      ctx.lineTo(bw * 0.4, -bh * 0.1)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 10
      ctx.fillStyle = '#ff1166'
      ctx.beginPath()
      ctx.arc(0, bh * 0.25, bh * 0.14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ff4488'
      ctx.beginPath()
      ctx.arc(0, bh * 0.25, bh * 0.06, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'elite': {
      const rot = Math.sin(t * 1.5) * 0.08
      ctx.rotate(rot)
      ctx.shadowColor = flash ? '#ffffff' : '#ff0033'
      ctx.shadowBlur = flash ? 18 : 8
      ctx.fillStyle = flash ? '#ffffff' : '#bb0033'
      ctx.beginPath()
      const ew = bw * 0.95
      const eh = bh * 0.95
      ctx.moveTo(0, -eh - 6)
      ctx.lineTo(-ew * 0.35, -eh * 0.4)
      ctx.lineTo(-ew * 0.7, -eh * 0.1)
      ctx.lineTo(-ew * 0.5, eh * 0.2)
      ctx.lineTo(-ew * 0.8, eh * 0.5)
      ctx.lineTo(-ew * 0.4, eh * 0.7)
      ctx.lineTo(-ew * 0.1, eh * 0.4)
      ctx.lineTo(ew * 0.1, eh * 0.4)
      ctx.lineTo(ew * 0.4, eh * 0.7)
      ctx.lineTo(ew * 0.8, eh * 0.5)
      ctx.lineTo(ew * 0.5, eh * 0.2)
      ctx.lineTo(ew * 0.7, -eh * 0.1)
      ctx.lineTo(ew * 0.35, -eh * 0.4)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = flash ? '#ffffff' : '#dd0044'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#ff2222'
      ctx.shadowColor = '#ff2222'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(0, -eh * 0.15, eh * 0.1, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ff8800'
      ctx.shadowColor = '#ff8800'
      ctx.beginPath()
      ctx.arc(-ew * 0.3, eh * 0.2, eh * 0.04, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ew * 0.3, eh * 0.2, eh * 0.04, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 6
      ctx.fillStyle = `rgba(255, 68, 0, ${0.3 + Math.sin(t * 5) * 0.2})`
      ctx.beginPath()
      ctx.arc(0, eh * 0.6, eh * 0.06, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, eh * 0.6, eh * 0.03, 0, Math.PI * 2)
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
  const dt = 1 / 60

  ctx.save()
  ctx.translate(cx, cy)

  if (boss.introTimer > 0) {
    const scale = Math.max(0.1, 1 - boss.introTimer / 2)
    ctx.scale(scale, scale)
  }

  const phaseColor = boss.phase === 1 ? '#ff6600' : boss.phase === 2 ? '#ff0044' : '#cc00ff'
  const engineGlow = 0.4 + Math.sin(t * 3) * 0.3

  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 25

  ctx.strokeStyle = phaseColor
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(255,100,0,${0.3 + Math.sin(t * 2) * 0.15})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2)
  ctx.stroke()

  ctx.shadowBlur = 18
  ctx.fillStyle = boss.phase === 1 ? '#881111' : boss.phase === 2 ? '#aa0022' : '#660066'
  ctx.beginPath()
  const spikeCount = boss.phase === 1 ? 10 : boss.phase === 2 ? 12 : 14
  for (let i = 0; i < spikeCount; i++) {
    const a = (i / spikeCount) * Math.PI * 2 - Math.PI / 2
    const r2 = i % 2 === 0 ? r * 1.1 : r * 0.75
    const px = Math.cos(a) * r2
    const py = Math.sin(a) * r2
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = boss.phase === 1 ? '#cc2222' : boss.phase === 2 ? '#ff0044' : '#8822cc'
  ctx.beginPath()
  const innerCount = boss.phase === 1 ? 8 : boss.phase === 2 ? 10 : 12
  for (let i = 0; i < innerCount; i++) {
    const a = (i / innerCount) * Math.PI * 2 - Math.PI / 2
    const r2 = i % 2 === 0 ? r * 0.8 : r * 0.55
    const px = Math.cos(a) * r2
    const py = Math.sin(a) * r2
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  const corePulse = r * 0.4 + Math.sin(t * 3) * r * 0.04
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, corePulse)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.3, phaseColor)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 25
  ctx.beginPath()
  ctx.arc(0, 0, corePulse, 0, Math.PI * 2)
  ctx.fill()

  const eyeGlow = 0.5 + Math.sin(t * 2) * 0.3
  ctx.fillStyle = `rgba(255, 255, 100, ${eyeGlow})`
  ctx.shadowColor = '#ffff00'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(-r * 0.22, -r * 0.1, r * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.22, -r * 0.1, r * 0.07, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.shadowBlur = 4
  ctx.beginPath()
  ctx.arc(-r * 0.22, -r * 0.1, r * 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.22, -r * 0.1, r * 0.03, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255, 68, 0, ${engineGlow})`
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(0, r * 0.95, r * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255, 150, 0, ${engineGlow * 0.7})`
  ctx.beginPath()
  ctx.arc(0, r * 0.95 + r * 0.12, r * 0.05, 0, Math.PI * 2)
  ctx.fill()

  if (boss.hp < boss.maxHp * 0.3 && boss.phase >= 2) {
    const warningFlash = Math.sin(t * 8) > 0
    if (warningFlash) {
      ctx.fillStyle = 'rgba(255,0,0,0.15)'
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2)
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
    ctx.shadowBlur = 14
    ctx.fillStyle = '#00ccff'
    ctx.fillRect(-1.5, -len / 2, 3, len)

    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 18
    ctx.fillRect(-0.8, -len / 2 - 1, 1.6, len + 2)

    ctx.fillStyle = 'rgba(0, 200, 255, 0.4)'
    ctx.shadowBlur = 20
    ctx.fillRect(-3, -len / 2, 6, len)
  } else {
    const glowSize = 3 + Math.sin(Date.now() * 0.01 + b.x) * 0.5

    ctx.shadowColor = '#ff3333'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#ff3333'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ff8800'
    ctx.shadowBlur = 16
    ctx.shadowColor = '#ff8800'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize * 0.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 8
    ctx.shadowColor = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, glowSize * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
