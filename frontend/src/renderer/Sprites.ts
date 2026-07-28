import type { Player, Enemy, Boss, Bullet } from '../types/game'

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, time: number) {
  const cx = p.x
  const cy = p.y
  const s = p.width * 0.5
  const t = time

  ctx.save()
  ctx.translate(cx, cy)

  const vx = p.vx * 0.3
  const vy = p.vy * 0.3
  const roll = Math.min(Math.max(vx / 200, -0.15), 0.15)
  ctx.rotate(roll)

  const engineFlicker = 0.7 + Math.random() * 0.3

  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 12

  ctx.fillStyle = '#1a2244'
  ctx.strokeStyle = '#4488ff'
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.moveTo(0, -s * 1.1)
  ctx.lineTo(-s * 0.6, -s * 0.1)
  ctx.lineTo(-s * 0.4, s * 0.3)
  ctx.lineTo(-s * 0.7, s * 0.5)
  ctx.lineTo(-s * 0.5, s * 0.7)
  ctx.lineTo(-s * 0.15, s * 0.5)
  ctx.lineTo(0, s * 0.6)
  ctx.lineTo(s * 0.15, s * 0.5)
  ctx.lineTo(s * 0.5, s * 0.7)
  ctx.lineTo(s * 0.7, s * 0.5)
  ctx.lineTo(s * 0.4, s * 0.3)
  ctx.lineTo(s * 0.6, -s * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, -s * 0.9)
  ctx.lineTo(-s * 0.3, -s * 0.15)
  ctx.lineTo(s * 0.3, -s * 0.15)
  ctx.closePath()
  ctx.fillStyle = '#3355cc'
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, -s * 0.1, s * 0.06, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0, 220, 255, ${0.4 + Math.sin(t * 5) * 0.3})`
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur = 8
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.arc(-s * 0.25, s * 0.4, s * 0.06, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6600'
  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 6
  ctx.fill()

  ctx.beginPath()
  ctx.arc(s * 0.25, s * 0.4, s * 0.06, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6600'
  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 6
  ctx.fill()

  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(0, s * 0.55)
  ctx.lineTo(-s * 0.06, s * 0.4)
  ctx.lineTo(s * 0.06, s * 0.4)
  ctx.closePath()
  ctx.fillStyle = `rgba(255, 136, 0, ${0.5 * engineFlicker})`
  ctx.shadowColor = '#ff8800'
  ctx.fill()

  if (p.invincible > 0 && Math.sin(time * 30) > 0) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.2, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)

  const flash = e.flashTimer > 0
  const bw = e.width * 0.5
  const bh = e.height * 0.5

  ctx.shadowBlur = flash ? 12 : 4

  switch (e.type) {
    case 'basic': {
      ctx.beginPath()
      ctx.moveTo(0, -bw)
      ctx.lineTo(-bw, 0)
      ctx.lineTo(0, bh)
      ctx.lineTo(bw, 0)
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#cc4444'
      ctx.shadowColor = flash ? '#ffffff' : '#ff4444'
      ctx.fill()
      break
    }
    case 'fast': {
      ctx.beginPath()
      ctx.moveTo(0, bh)
      ctx.lineTo(-bw * 0.7, -bh * 0.5)
      ctx.lineTo(-bw * 0.4, -bh * 0.5)
      ctx.lineTo(0, -bh)
      ctx.lineTo(bw * 0.4, -bh * 0.5)
      ctx.lineTo(bw * 0.7, -bh * 0.5)
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#dd6622'
      ctx.shadowColor = flash ? '#ffffff' : '#ff6600'
      ctx.fill()
      break
    }
    case 'tank': {
      const r = bw * 0.6
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#8844aa'
      ctx.shadowColor = flash ? '#ffffff' : '#aa44ff'
      ctx.fill()

      ctx.strokeStyle = '#664488'
      ctx.lineWidth = 2
      ctx.strokeRect(-bw, -bh * 0.1, bw * 2, bh * 0.2)
      break
    }
    case 'shooter': {
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2
        const r2 = i % 2 === 0 ? bw : bw * 0.6
        const px = Math.cos(a) * r2
        const py = Math.sin(a) * r2
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#dd2266'
      ctx.shadowColor = flash ? '#ffffff' : '#ff0044'
      ctx.fill()

      ctx.shadowBlur = 6
      ctx.fillStyle = '#ff0044'
      ctx.beginPath()
      ctx.arc(0, bh * 0.6, bh * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'elite': {
      ctx.shadowColor = flash ? '#ffffff' : '#ff0033'

      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const r2 = i % 2 === 0 ? bw * 0.9 : bw * 0.5
        const px = Math.cos(a) * r2
        const py = Math.sin(a) * r2
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#cc0033'
      ctx.fill()

      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const r2 = i % 2 === 0 ? bw * 0.7 : bw * 0.4
        const px = Math.cos(a) * r2
        const py = Math.sin(a) * r2
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = flash ? '#ffffff' : '#aa0022'
      ctx.fill()

      ctx.fillStyle = '#ffff00'
      ctx.shadowColor = '#ffff00'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(0, -bh * 0.1, bh * 0.06, 0, Math.PI * 2)
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

  ctx.save()
  ctx.translate(cx, cy)

  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 20

  ctx.strokeStyle = '#ff6600'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#ff4400'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2)
  ctx.stroke()

  ctx.shadowBlur = 15
  ctx.fillStyle = '#cc2222'
  ctx.beginPath()
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r2 = i % 2 === 0 ? r : r * 0.7
    const px = Math.cos(a) * r2
    const py = Math.sin(a) * r2
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  const pulseR = r * 0.45 + Math.sin(time * 3) * r * 0.03
  ctx.fillStyle = '#ff4444'
  ctx.shadowColor = '#ff4400'
  ctx.beginPath()
  ctx.arc(0, 0, pulseR, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffff00'
  ctx.shadowColor = '#ffff00'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(0, -r * 0.15, r * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ff0000'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.arc(-r * 0.25, -r * 0.05, r * 0.035, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.25, -r * 0.05, r * 0.035, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 8
  ctx.fillStyle = '#ff4400'
  ctx.beginPath()
  ctx.arc(0, r * 0.8, r * 0.07, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save()
  ctx.translate(b.x, b.y)

  if (b.isPlayer) {
    ctx.shadowColor = '#00ccff'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#00ccff'
    const len = Math.hypot(b.vx, b.vy) * 0.015 + 6
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillRect(-1.5, -len / 2, 3, len)

    ctx.fillStyle = '#00ffff'
    ctx.shadowBlur = 15
    ctx.fillRect(-0.5, -len / 2 - 2, 1, len + 4)
  } else {
    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ff6666'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
