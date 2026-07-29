import type { Player, Enemy, Boss, Bullet } from '../types/game'
import { spriteManager } from '../engine/SpriteManager'

const SCALE = 2.2

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

  ctx.imageSmoothingEnabled = false

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
    const drawW = Math.round(img.width * SCALE * 0.55)
    const drawH = Math.round(img.height * SCALE * 0.55)
    ctx.shadowColor = '#0088ff'
    ctx.shadowBlur = 25
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
  }

  const enginePulse = 0.5 + Math.sin(time * 6) * 0.25 + Math.sin(time * 13) * 0.1
  const exhLen = (16 + Math.random() * 12) * enginePulse

  ctx.shadowColor = '#ff6600'
  ctx.shadowBlur = 30
  ctx.fillStyle = `rgba(255, 140, 0, ${0.5 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-18, 38)
  ctx.lineTo(18, 38)
  ctx.lineTo(12, 38 + exhLen)
  ctx.lineTo(-12, 38 + exhLen)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffaa00'
  ctx.shadowBlur = 35
  ctx.fillStyle = `rgba(255, 200, 50, ${0.35 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-10, 38)
  ctx.lineTo(10, 38)
  ctx.lineTo(6, 38 + exhLen * 0.65)
  ctx.lineTo(-6, 38 + exhLen * 0.65)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 20
  ctx.fillStyle = `rgba(255, 255, 255, ${0.18 * enginePulse})`
  ctx.beginPath()
  ctx.moveTo(-4, 38)
  ctx.lineTo(4, 38)
  ctx.lineTo(0, 38 + exhLen * 0.4)
  ctx.closePath()
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 12
  ctx.fillStyle = `rgba(255, 68, 0, ${0.4 + Math.sin(time * 3) * 0.2})`
  ctx.beginPath()
  ctx.arc(-50, 12, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(50, 12, 3, 0, Math.PI * 2)
  ctx.fill()

  if (p.invincible > 0 && Math.sin(time * 30) > 0) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = `rgba(100, 180, 255, ${0.3 + Math.sin(time * 8) * 0.15})`
    ctx.lineWidth = 2
    ctx.setLineDash([6, 8])
    ctx.beginPath()
    ctx.arc(0, 0, 70, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.imageSmoothingEnabled = true
  ctx.restore()
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)

  ctx.imageSmoothingEnabled = false

  const flash = e.flashTimer > 0
  const spriteKey = enemySpriteKey(e.type)
  const img = spriteManager.get(spriteKey)

  if (img) {
    const bob = Math.sin(time * 2 + e.x * 0.01) * 2
    ctx.translate(0, bob)

    if (flash) {
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 20
      ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height)

      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(e.width, e.height) * 0.5, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      const typeColor = hitColorForEnemy(e.type)
      ctx.shadowColor = typeColor
      ctx.shadowBlur = 12
      ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height)
    }
  }

  ctx.imageSmoothingEnabled = true
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

  ctx.imageSmoothingEnabled = false

  if (boss.introTimer > 0) {
    const scale = Math.max(0.1, 1 - boss.introTimer / 2.5)
    ctx.scale(scale, scale)
  }

  const spriteKey = bossSpriteKey(boss.level)
  const phaseColors = ['#ff6600', '#ff0044', '#cc00ff']
  const phaseColor = phaseColors[boss.phase - 1] || '#ff6600'

  const img = spriteManager.get(spriteKey)
  if (img) {
    const drawW = img.width * SCALE * 0.6
    const drawH = img.height * SCALE * 0.6

    ctx.shadowColor = phaseColor
    ctx.shadowBlur = 35

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

    ctx.shadowBlur = 40
    ctx.strokeStyle = `rgba(255,255,255,0.05)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(drawW, drawH) * 0.5 + 10, 0, Math.PI * 2)
    ctx.stroke()
  }

  const sideTurretRot = time * 0.3
  ctx.shadowBlur = 12
  ctx.strokeStyle = `rgba(255, 100, 0, 0.2)`
  ctx.lineWidth = 3
  const turretLen = 40
  ctx.beginPath()
  ctx.moveTo(-70, 0)
  ctx.lineTo(-70 - Math.cos(sideTurretRot) * turretLen, Math.sin(sideTurretRot) * turretLen)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(70, 0)
  ctx.lineTo(70 + Math.cos(sideTurretRot + Math.PI) * turretLen, Math.sin(sideTurretRot + Math.PI) * turretLen)
  ctx.stroke()

  if (boss.hp < boss.maxHp * 0.3 && boss.phase >= 2) {
    if (Math.sin(time * 6) > 0) {
      ctx.shadowBlur = 0
      ctx.fillStyle = `rgba(255, 0, 0, ${0.08 + Math.sin(time * 8) * 0.04})`
      ctx.beginPath()
      ctx.arc(0, 0, 160, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.imageSmoothingEnabled = true
  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save()
  ctx.translate(b.x, b.y)

  ctx.imageSmoothingEnabled = false

  if (b.isPlayer) {
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle + Math.PI / 2)

    const img = spriteManager.get('laser_green')
    if (img) {
      const w = img.width * 2.5
      const h = img.height * 2.5

      ctx.shadowColor = '#00ff88'
      ctx.shadowBlur = 25
      ctx.drawImage(img, -w / 2, -h / 2, w, h)

      ctx.shadowBlur = 35
      ctx.globalAlpha = 0.3
      ctx.drawImage(img, -w / 2 - 2, -h / 2, w + 4, h)
      ctx.globalAlpha = 1
    }
  } else {
    const angle = Math.atan2(b.vy, b.vx)
    ctx.rotate(angle + Math.PI / 2)

    const img = spriteManager.get('laser_red')
    if (img) {
      const w = img.width * 2.5
      const h = img.height * 2.5

      ctx.shadowColor = '#ff3333'
      ctx.shadowBlur = 22
      ctx.drawImage(img, -w / 2, -h / 2, w, h)

      ctx.shadowBlur = 30
      ctx.globalAlpha = 0.3
      ctx.drawImage(img, -w / 2 - 2, -h / 2, w + 4, h)
      ctx.globalAlpha = 1
    }
  }

  ctx.imageSmoothingEnabled = true
  ctx.restore()
}

export function drawPowerupIcon(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, bobTimer: number) {
  ctx.save()
  ctx.translate(x, y)

  ctx.imageSmoothingEnabled = false

  const bob = Math.sin(bobTimer * 3) * 4
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
    const w = img.width * 2.0
    const h = img.height * 2.0
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 25 * pulse
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
  }

  ctx.imageSmoothingEnabled = true
  ctx.restore()
}
