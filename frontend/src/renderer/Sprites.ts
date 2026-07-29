import type { Player, Enemy, Boss, Bullet } from '../types/game'
import { spriteManager } from '../engine/SpriteManager'

function playerSpriteKey(plane: string): string {
  switch (plane) {
    case 'eagle': return 'player_eagle'
    case 'raptor': return 'player_raptor'
    case 'phantom': return 'player_phantom'
    case 'stealth-x': return 'player_stealth_x'
    default: return 'player_falcon'
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

function bossSpriteKey(level: number): string {
  if (level >= 20) return 'boss_air_carrier'
  if (level >= 15) return 'boss_stealth_titan'
  if (level >= 10) return 'boss_fortress_bomber'
  return 'boss_missile_commander'
}

function powerupSpriteKey(type: string): string {
  switch (type) {
    case 'bomb': return 'powerup_double_damage'
    case 'homing': return 'powerup_rapid_fire'
    case 'slowmo': return 'powerup_shield'
    default: return 'powerup_coins'
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, time: number) {
  ctx.save()
  ctx.translate(p.x, p.y)

  const roll = Math.min(Math.max(p.vx / 250, -0.2), 0.2)
  const hover = Math.sin(time * 2) * 1.5
  ctx.translate(0, hover)
  ctx.rotate(roll)

  let spriteKey = playerSpriteKey(p.plane)
  if (p.hp < p.maxHp * 0.3) {
    spriteKey = 'player_damaged'
  } else if (p.vx < -30) {
    spriteKey = 'player_left'
  } else if (p.vx > 30) {
    spriteKey = 'player_right'
  }

  const img = spriteManager.get(spriteKey)
  if (img) {
    const drawW = 55
    const drawH = 55 * (img.height / img.width)
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
  }

  const enginePulse = 0.5 + Math.sin(time * 6) * 0.25 + Math.sin(time * 13) * 0.1
  const exhLen = 8 + Math.random() * 6 * enginePulse

  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 18
  ctx.fillStyle = `rgba(255, 140, 0, ${0.45 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-8, 24)
  ctx.lineTo(8, 24)
  ctx.lineTo(5, 24 + exhLen)
  ctx.lineTo(-5, 24 + exhLen)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 22
  ctx.fillStyle = `rgba(255, 200, 50, ${0.3 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-4, 24)
  ctx.lineTo(4, 24)
  ctx.lineTo(2.5, 24 + exhLen * 0.6)
  ctx.lineTo(-2.5, 24 + exhLen * 0.6)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 14
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-1.5, 24)
  ctx.lineTo(1.5, 24)
  ctx.lineTo(0, 24 + exhLen * 0.35)
  ctx.closePath()
  ctx.fill()

  if (p.invincible > 0 && Math.sin(time * 30) > 0) {
    ctx.shadowBlur = 0
    const shieldAlpha = 0.3 + Math.sin(time * 8) * 0.15
    ctx.strokeStyle = `rgba(100, 180, 255, ${shieldAlpha})`
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.arc(0, 0, 32, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore()
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)

  const flash = e.flashTimer > 0
  const spriteKey = enemySpriteKey(e.type)
  const img = spriteManager.get(spriteKey)

  if (flash && img) {
    ctx.globalAlpha = 0.8
    ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height)

    ctx.globalAlpha = 1
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 16
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(e.width, e.height) * 0.5, 0, Math.PI * 2)
    ctx.stroke()
  } else if (img) {
    const bob = Math.sin(time * 2 + e.x * 0.01) * 2
    ctx.translate(0, bob)

    ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height)

    const typeColor = hitColorForEnemy(e.type)
    ctx.shadowColor = typeColor
    ctx.shadowBlur = 8
    ctx.strokeStyle = `rgba(255,255,255,0.08)`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(e.width, e.height) * 0.48, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function hitColorForEnemy(type: string): string {
  switch (type) {
    case 'basic': return '#00ddcc'
    case 'fast': return '#ff8800'
    case 'tank': return '#9933ff'
    case 'shooter': return '#ff2266'
    case 'elite': return '#ff0033'
    default: return '#ff8800'
  }
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, time: number) {
  ctx.save()
  ctx.translate(boss.x, boss.y)

  if (boss.introTimer > 0) {
    const scale = Math.max(0.1, 1 - boss.introTimer / 2.5)
    ctx.scale(scale, scale)
  }

  const spriteKey = bossSpriteKey(boss.level)
  const phaseColors = ['#ff6600', '#ff0044', '#cc00ff']
  const phaseColor = phaseColors[boss.phase - 1] || '#ff6600'

  const img = spriteManager.get(spriteKey)
  if (img) {
    const bw = img.width
    const bh = img.height
    const scale = 1.2
    const drawW = bw * scale
    const drawH = bh * scale

    ctx.shadowColor = phaseColor
    ctx.shadowBlur = 24
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

    ctx.shadowColor = phaseColor
    ctx.shadowBlur = 35
    ctx.strokeStyle = `rgba(255,255,255,0.06)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(drawW, drawH) * 0.5 + 5, 0, Math.PI * 2)
    ctx.stroke()
  }

  const sideTurretRot = time * 0.3
  ctx.shadowBlur = 10
  ctx.strokeStyle = `rgba(255, 100, 0, 0.15)`
  ctx.lineWidth = 2
  const turretLen = 25
  ctx.beginPath()
  ctx.moveTo(-50, 0)
  ctx.lineTo(-50 - Math.cos(sideTurretRot) * turretLen, Math.sin(sideTurretRot) * turretLen)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(50, 0)
  ctx.lineTo(50 + Math.cos(sideTurretRot + Math.PI) * turretLen, Math.sin(sideTurretRot + Math.PI) * turretLen)
  ctx.stroke()

  if (boss.hp < boss.maxHp * 0.3 && boss.phase >= 2) {
    const warningFlash = Math.sin(time * 6) > 0
    if (warningFlash) {
      ctx.shadowBlur = 0
      ctx.fillStyle = `rgba(255, 0, 0, ${0.06 + Math.sin(time * 8) * 0.03})`
      ctx.beginPath()
      ctx.arc(0, 0, 100, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save()
  ctx.translate(b.x, b.y)

  if (b.isPlayer) {
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle + Math.PI / 2)

    const img = spriteManager.get('laser_green')
    if (img) {
      ctx.shadowColor = '#00ff88'
      ctx.shadowBlur = 14
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
    }
  } else {
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle + Math.PI / 2)

    const img = spriteManager.get('laser_red')
    if (img) {
      ctx.shadowColor = '#ff3333'
      ctx.shadowBlur = 12
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
    }
  }

  ctx.restore()
}

export function drawPowerupIcon(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, bobTimer: number) {
  ctx.save()
  ctx.translate(x, y)

  const bob = Math.sin(bobTimer * 3) * 3
  ctx.translate(0, bob)

  const spriteKey = powerupSpriteKey(type)
  const img = spriteManager.get(spriteKey)

  let glowColor: string
  switch (type) {
    case 'bomb': glowColor = '#ff6600'; break
    case 'homing': glowColor = '#00ffcc'; break
    case 'slowmo': glowColor = '#88bbff'; break
    default: glowColor = '#ffffff'
  }

  if (img) {
    const pulse = 0.8 + Math.sin(bobTimer * 4) * 0.2
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 18 * pulse
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
  }

  ctx.restore()
}

export function drawMeteor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  const img = spriteManager.get(size > 8 ? 'bg_star_big' : 'bg_star_small')
  if (!img) return

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = 0.15
  ctx.drawImage(img, -img.width / 2, -img.height / 2)
  ctx.restore()
}
