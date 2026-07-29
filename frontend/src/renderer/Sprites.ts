import type { Player, Enemy, Boss, Bullet } from '../types/game'
import { spriteManager } from '../engine/SpriteManager'

const SCALE = 2.0

function playerSpriteKey(plane: string): string {
  switch (plane) {
    case 'eagle': return 'player_eagle'
    case 'raptor': return 'player_raptor'
    case 'phantom': return 'player_phantom'
    case 'stealth-x': return 'player_stealth_x'
    default: return 'player_falcon'
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, time: number) {
  const img = spriteManager.get(playerSpriteKey(p.plane))
  if (!img) return

  ctx.save()
  ctx.translate(p.x, p.y)

  const roll = Math.min(Math.max(p.vx / 250, -0.15), 0.15)
  const hover = Math.sin(time * 2) * 1.5
  ctx.translate(0, hover)
  ctx.rotate(roll)

  const drawW = Math.round(img.width * SCALE * 0.55)
  const drawH = Math.round(img.height * SCALE * 0.55)

  if (p.invincible > 0 && Math.sin(time * 30) > 0) {
    ctx.restore()
    return
  }

  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
  const engineGlow = 0.7 + Math.sin(time * 8) * 0.2 + Math.sin(time * 17) * 0.1
  const flameLen = (20 + speed * 0.04) * engineGlow

  ctx.shadowColor = '#0088ff'
  ctx.shadowBlur = 10
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

  if (p.shield > 0) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.2 + Math.sin(time * 3) * 0.1})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(drawW, drawH) * 0.55, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = `rgba(0, 200, 255, ${0.04 + Math.sin(time * 2) * 0.02})`
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(drawW, drawH) * 0.55, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.shadowBlur = 0
  const flameGrad = ctx.createLinearGradient(0, drawH / 2, 0, drawH / 2 + flameLen)
  flameGrad.addColorStop(0, `rgba(255, 180, 50, ${0.9 * engineGlow})`)
  flameGrad.addColorStop(0.3, `rgba(255, 100, 20, ${0.6 * engineGlow})`)
  flameGrad.addColorStop(0.6, `rgba(255, 50, 10, ${0.3 * engineGlow})`)
  flameGrad.addColorStop(1, `rgba(255, 20, 0, 0)`)
  ctx.fillStyle = flameGrad
  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 12

  const flameW = drawW * 0.2
  ctx.beginPath()
  ctx.moveTo(-flameW, drawH / 2)
  ctx.quadraticCurveTo(-flameW * 0.5, drawH / 2 + flameLen * 0.7, 0, drawH / 2 + flameLen)
  ctx.quadraticCurveTo(flameW * 0.5, drawH / 2 + flameLen * 0.7, flameW, drawH / 2)
  ctx.closePath()
  ctx.fill()

  const innerFlame = flameLen * 0.5
  ctx.shadowColor = '#ffcc00'
  ctx.shadowBlur = 15
  const innerGrad = ctx.createLinearGradient(0, drawH / 2, 0, drawH / 2 + innerFlame)
  innerGrad.addColorStop(0, `rgba(255, 220, 100, ${0.8 * engineGlow})`)
  innerGrad.addColorStop(0.5, `rgba(255, 180, 50, ${0.4 * engineGlow})`)
  innerGrad.addColorStop(1, `rgba(255, 150, 30, 0)`)
  ctx.fillStyle = innerGrad
  const innerW = flameW * 0.5
  ctx.beginPath()
  ctx.moveTo(-innerW, drawH / 2)
  ctx.quadraticCurveTo(0, drawH / 2 + innerFlame, innerW, drawH / 2)
  ctx.closePath()
  ctx.fill()

  if (p.hp <= p.maxHp * 0.3) {
    ctx.shadowBlur = 0
    ctx.fillStyle = `rgba(255, 0, 0, ${0.08 + Math.sin(time * 4) * 0.04})`
    ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH)
  }

  ctx.restore()
}

function enemyGlowColor(type: string): string {
  switch (type) {
    case 'basic': return '#00ddcc'
    case 'fast': return '#ff8800'
    case 'tank': return '#9933ff'
    case 'shooter': return '#ff2266'
    case 'elite': return '#ff0033'
    default: return '#ff8800'
  }
}

function enemySpriteKey(type: string): string {
  switch (type) {
    case 'basic': return 'enemy_drone'
    case 'fast': return 'enemy_fighter'
    case 'tank': return 'enemy_bomber'
    case 'shooter': return 'enemy_stealth'
    case 'elite': return 'enemy_elite'
    default: return 'enemy_drone'
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  const img = spriteManager.get(enemySpriteKey(e.type))
  if (!img) return

  ctx.save()
  ctx.translate(e.x, e.y)

  const bob = Math.sin(time * (e.type === 'basic' ? 3 : e.type === 'fast' ? 5 : 2) + e.x * 0.01) * 2
  ctx.translate(0, bob)

  const flash = e.flashTimer > 0
  const glowColor = enemyGlowColor(e.type)
  const pulse = 0.85 + Math.sin(time * 2 + e.x * 0.02) * 0.15

  if (flash) {
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 12
  } else {
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 6 * pulse
  }

  ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height)

  if (flash) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(e.width, e.height) * 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function bossSpriteKey(level: number): string {
  if (level >= 20) return 'boss_air_carrier'
  if (level >= 15) return 'boss_stealth_titan'
  if (level >= 10) return 'boss_fortress_bomber'
  return 'boss_missile_commander'
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, time: number) {
  const img = spriteManager.get(bossSpriteKey(boss.level))
  if (!img) return

  ctx.save()
  ctx.translate(boss.x, boss.y)

  if (boss.introTimer > 0) {
    const scale = Math.max(0.1, 1 - boss.introTimer / 2.5)
    ctx.scale(scale, scale)
  }

  const phaseColors = ['#ff6600', '#ff0044', '#cc00ff']
  const phaseColor = phaseColors[boss.phase - 1] || '#ff6600'
  const drawW = img.width * SCALE * 0.6
  const drawH = img.height * SCALE * 0.6

  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 12
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

  const chargePulse = 0.08 + Math.sin(time * 3) * 0.04
  ctx.shadowBlur = 0
  ctx.strokeStyle = `rgba(255,255,255,${chargePulse})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, Math.max(drawW, drawH) * 0.5 + 10, 0, Math.PI * 2)
  ctx.stroke()

  if (boss.hp < boss.maxHp * 0.3) {
    ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + Math.sin(time * 6) * 0.03})`
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(drawW, drawH) * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save()
  ctx.translate(b.x, b.y)
  const angle = Math.atan2(b.vy, b.vx)
  ctx.rotate(angle + Math.PI / 2)

  const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
  const stretch = Math.min(speed / 500, 1.5)

  if (b.isPlayer) {
    if (b.isHoming) {
      const img = spriteManager.get('laser_green_shot')
      if (img) {
        ctx.shadowColor = '#00ff88'
        ctx.shadowBlur = 10
        ctx.drawImage(img, -12, -16, 24, 32)
        ctx.shadowBlur = 0
        ctx.fillRect(-4, -20, 8, 40)
      }
    } else {
      ctx.shadowColor = '#00ccff'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#00ccff'
      const bw = 3
      const bh = 10 * stretch
      ctx.fillRect(-bw / 2, -bh, bw, bh)
      ctx.globalAlpha = 0.3
      ctx.fillRect(-bw / 2 - 1, -bh - 2, bw + 2, bh + 4)
      ctx.globalAlpha = 1
    }
  } else {
    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 5
    ctx.fillStyle = '#ff4444'
    const bw = 4
    const bh = 8 * stretch
    ctx.fillRect(-bw / 2, -bh, bw, bh)
    ctx.globalAlpha = 0.3
    ctx.fillRect(-bw / 2, -bh - 1, bw, bh + 2)
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function powerupSpriteKey(type: string): string {
  switch (type) {
    case 'weapon': return 'powerup_rapid_fire'
    case 'shield': return 'powerup_shield'
    case 'bomb': return 'powerup_double_damage'
    case 'homing': return 'powerup_coin_magnet'
    case 'rapid': return 'powerup_rapid_fire'
    case 'slowmo': return 'powerup_health'
    default: return 'powerup_coins'
  }
}

function powerupGlowColor(type: string): string {
  switch (type) {
    case 'weapon': return '#00ccff'
    case 'shield': return '#00e5ff'
    case 'bomb': return '#ff6600'
    case 'homing': return '#00ff88'
    case 'rapid': return '#ffcc00'
    case 'slowmo': return '#88bbff'
    default: return '#ffffff'
  }
}

export function drawPowerupIcon(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, bobTimer: number) {
  const img = spriteManager.get(powerupSpriteKey(type))
  if (!img) return

  ctx.save()
  ctx.translate(x, y)
  const bob = Math.sin(bobTimer * 3) * 4
  ctx.translate(0, bob)

  const glowColor = powerupGlowColor(type)
  const pulse = 0.8 + Math.sin(bobTimer * 4) * 0.2

  ctx.shadowColor = glowColor
  ctx.shadowBlur = 10 * pulse

  const w = img.width * 1.8
  const h = img.height * 1.8
  ctx.drawImage(img, -w / 2, -h / 2, w, h)

  ctx.shadowBlur = 0
  ctx.fillStyle = `rgba(255,255,255,${0.05 * pulse})`
  ctx.beginPath()
  ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawMuzzleFlash(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, intensity: number) {
  if (intensity <= 0.01) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  const r = 14 * intensity
  const grad = ctx.createRadialGradient(0, -r * 2, 0, 0, -r * 2, r * 4)
  grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`)
  grad.addColorStop(0.3, `rgba(0, 200, 255, ${intensity * 0.5})`)
  grad.addColorStop(1, 'rgba(0, 200, 255, 0)')
  ctx.fillStyle = grad
  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(0, -r * 2, r * 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.25
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.lineTo(Math.cos(a - 0.15) * r * 0.5, -r + Math.sin(a - 0.15) * r * 0.5)
    ctx.lineTo(Math.cos(a + 0.15) * r * 0.5, -r + Math.sin(a + 0.15) * r * 0.5)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

export function drawEngineTrail(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 10) return
  const len = Math.min(speed * 0.04, 20)

  ctx.save()
  ctx.globalAlpha = 0.12
  const grad = ctx.createLinearGradient(0, 0, 0, len)
  grad.addColorStop(0, 'rgba(255, 140, 0, 0.6)')
  grad.addColorStop(1, 'rgba(255, 60, 0, 0)')
  ctx.fillStyle = grad
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.moveTo(x - 8, y)
  ctx.lineTo(x + 8, y)
  ctx.lineTo(x, y + len)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
