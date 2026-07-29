import { useGameStore } from '../store/gameStore'
import { audioManager } from './AudioManager'
import { inputManager } from './InputManager'
import type {
  Player, Enemy, Bullet, Boss, PowerUp, Particle,
  EnemyType, PowerUpType, WeaponType, PlaneType, Vec2,
} from '../types/game'

const PI2 = Math.PI * 2
const rand = (min: number, max: number) => Math.random() * (max - min) + min
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const PLANE_STATS: Record<string, { speed: number; health: number; damage: number; fireRate: number; armor: number; label: string }> = {
  falcon: { speed: 300, health: 5, damage: 10, fireRate: 0.15, armor: 0, label: 'Falcon' },
  eagle: { speed: 340, health: 6, damage: 12, fireRate: 0.14, armor: 1, label: 'Eagle' },
  raptor: { speed: 320, health: 5.5, damage: 14, fireRate: 0.13, armor: 2, label: 'Raptor' },
  phantom: { speed: 360, health: 6.5, damage: 15, fireRate: 0.12, armor: 3, label: 'Phantom' },
  'stealth-x': { speed: 400, health: 5, damage: 18, fireRate: 0.10, armor: 2, label: 'Stealth-X' },
}

const ENEMY_TYPES: Record<EnemyType, { hp: number; speed: number; score: number; coins: number; fireRate: number; size: number }> = {
  basic: { hp: 4, speed: 120, score: 100, coins: 5, fireRate: 0, size: 56 },
  fast: { hp: 3, speed: 220, score: 150, coins: 7, fireRate: 0.8, size: 64 },
  tank: { hp: 18, speed: 80, score: 250, coins: 12, fireRate: 0, size: 100 },
  shooter: { hp: 6, speed: 100, score: 200, coins: 10, fireRate: 1.8, size: 64 },
  elite: { hp: 25, speed: 140, score: 500, coins: 25, fireRate: 1.2, size: 90 },
}

const PLAYER_COLLISION_RADIUS = 35

export class GameEngine {
  player!: Player
  enemies: Enemy[] = []
  bullets: Bullet[] = []
  boss: Boss | null = null
  powerups: PowerUp[] = []
  particles: Particle[] = []
  stars: { x: number; y: number; size: number; speed: number; brightness: number }[] = []

  canvasW = 1600
  canvasH = 900
  currentLevel = 1
  score = 0
  gameTime = 0
  paused = false
  gameOver = false
  bossActive = false
  bossSpawned = false
  bossLevel = false
  levelTransition = false
  levelTransitionTimer = 0
  slowMotionTimer = 0
  hitStopTimer = 0
  screenShakeX = 0
  screenShakeY = 0
  screenShakeIntensity = 0
  flashTimer = 0
  flashColor = ''
  flashIntensity = 0
  muzzleFlashTimer = 0
  muzzleX = 0
  muzzleY = 0
  muzzleAngle = -Math.PI / 2

  private lastTime = 0
  private enemyTimer = 0
  private difficulty = 1
  private bossWarningShown = false
  private sideSpawnTimer = 0

  init(): void {
    this.initCanvasSize()
    this.createStars()
    this.createPlayer()
    this.resetGame()
  }

  private initCanvasSize(): void {
    this.canvasW = window.innerWidth
    this.canvasH = window.innerHeight
    window.addEventListener('resize', () => {
      this.canvasW = window.innerWidth
      this.canvasH = window.innerHeight
    })
  }

  private createStars(): void {
    this.stars = []
    const count = 100
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: rand(0, this.canvasW),
        y: rand(0, this.canvasH),
        size: rand(0.5, 2),
        speed: rand(20, 80),
        brightness: rand(0.3, 1),
      })
    }
  }

  private createPlayer(): void {
    this.player = {
      x: this.canvasW / 2, y: this.canvasH - 120, z: 0,
      width: 90, height: 105,
      speed: 300, hp: 5, maxHp: 5, shield: 0, maxShield: 3,
      weaponLevel: 1, weaponType: 'spread',
      fireTimer: 0, fireRate: 0.15,
      invincible: 0,
      combo: 0, maxCombo: 0, comboMultiplier: 1, comboTimer: 0,
      score: 0, xp: 0, level: 1, kills: 0,
      vx: 0, vy: 0, targetVx: 0, targetVy: 0,
      alive: true,
      plane: 'default' as PlaneType,
      upgradeLevels: {},
      activePowerups: {},
      bombs: 1,
    }
  }

  resetGame(): void {
    this.score = 0
    this.currentLevel = 1
    this.gameOver = false
    this.bossActive = false
    this.bossSpawned = false
    this.bossLevel = false
    this.levelTransition = false
    this.slowMotionTimer = 0
    this.hitStopTimer = 0
    this.enemyTimer = 0
    this.difficulty = 1
    this.bossWarningShown = false
    this.muzzleFlashTimer = 0

    this.createPlayer()
    this.enemies = []
    this.bullets = []
    this.boss = null
    this.powerups = []
    this.particles = []

    this.startLevelTransition()

    const store = useGameStore.getState()
    store.reset()
    store.updatePlayerHUD(this.player)
    store.updateBossHUD(null)
  }

  startLevelTransition(): void {
    this.levelTransition = true
    this.levelTransitionTimer = 2.5
  }

  start(dt: number): void {
    this.lastTime = performance.now()
    this.tick(dt)
  }

  tick(dt: number): void {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt
      if (this.hitStopTimer <= 0) this.hitStopTimer = 0
      return
    }

    dt = Math.min(dt, 0.05)

    if (this.slowMotionTimer > 0) {
      this.slowMotionTimer -= dt
      dt *= 0.4
      if (this.slowMotionTimer <= 0) this.slowMotionTimer = 0
    }

    this.gameTime += dt
    this.updateStars(dt)

    if (this.levelTransition) {
      this.levelTransitionTimer -= dt
      if (this.levelTransitionTimer <= 0) this.levelTransition = false
      return
    }

    if (!this.gameOver && !this.paused) {
      this.updatePlayer(dt)
      this.updateEnemies(dt)
      this.checkBossSpawn()
      this.updateBoss(dt)
      this.updateBullets(dt)
      this.updatePowerups(dt)
      this.checkCollisions()
      this.updateParticles(dt)
    }

    this.updateScreenShake(dt)
    this.updateFlash(dt)
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt
    this.updateStore()
  }

  private updateStars(dt: number): void {
    for (const s of this.stars) {
      s.y += s.speed * dt
      if (s.y > this.canvasH) {
        s.y = -2
        s.x = rand(0, this.canvasW)
      }
    }
  }

  private updatePlayer(dt: number): void {
    const p = this.player
    const input = inputManager.state

    if (!p.alive) return

    if (p.invincible > 0) p.invincible -= dt

    this.updateCombo(dt)

    let moveX = 0
    let moveY = 0
    const kLeft = input.keys.has('ArrowLeft') || input.keys.has('a') || input.keys.has('A')
    const kRight = input.keys.has('ArrowRight') || input.keys.has('d') || input.keys.has('D')
    const kUp = input.keys.has('ArrowUp') || input.keys.has('w') || input.keys.has('W')
    const kDown = input.keys.has('ArrowDown') || input.keys.has('s') || input.keys.has('S')

    if (kLeft) moveX = -1
    if (kRight) moveX = 1
    if (kUp) moveY = -1
    if (kDown) moveY = 1

    if (moveX === 0 && moveY === 0 && input.touchActive) {
      moveX = input.touchX
      moveY = input.touchY
    }

    p.targetVx = moveX * p.speed
    p.targetVy = moveY * p.speed

    const friction = 8
    p.vx += (p.targetVx - p.vx) * friction * dt
    p.vy += (p.targetVy - p.vy) * friction * dt

    p.x += p.vx * dt
    p.y += p.vy * dt

    p.x = clamp(p.x, p.width / 2, this.canvasW - p.width / 2)
    p.y = clamp(p.y, p.height / 2, this.canvasH - p.height / 2)

    p.fireTimer -= dt
    const autoFire = useGameStore.getState().settings.autoFire
    if (input.firing || input.keys.has(' ') || autoFire) {
      if (p.fireTimer <= 0) {
        this.firePlayerWeapon()
        p.fireTimer = p.fireRate
      }
    }

    if (inputManager.readBomb() && p.bombs > 0) {
      this.activateBomb()
    }

    this.emitEngineTrail()
  }

  private updateCombo(dt: number): void {
    const p = this.player
    if (p.comboTimer > 0) {
      p.comboTimer -= dt
      if (p.comboTimer <= 0) {
        if (p.combo >= 5) {
          this.addNotification(`COMBO LOST! ${p.combo}x`, '#ff4444')
        }
        p.combo = 0
        p.comboMultiplier = 1
        useGameStore.getState().updateCombo(0, 1)
      }
    }
  }

  private firePlayerWeapon(): void {
    const p = this.player
    const bx = p.x
    const by = p.y - p.height / 2 - 10

    const bulletSpeed = 650
    const damage = 10 + (p.weaponLevel - 1) * 2

    const bulletCount = this.getWeaponBulletCount()
    const spreadAngle = this.getWeaponSpread()

    for (let i = 0; i < bulletCount; i++) {
      const spread = bulletCount > 1 ? (i - (bulletCount - 1) / 2) * spreadAngle : 0
      const angle = -Math.PI / 2 + spread

      const b: Bullet = {
        x: bx, y: by, z: 0,
        width: 6, height: 16,
        speed: bulletSpeed,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        damage,
        isPlayer: true,
        alive: true,
        timer: 2,
        color: this.getWeaponColor(),
      }
      this.bullets.push(b)
    }

    this.muzzleFlashTimer = 0.1
    this.muzzleX = bx
    this.muzzleY = by
    this.muzzleAngle = -Math.PI / 2
    audioManager.playSfxSynth('shoot')
  }

  private getWeaponBulletCount(): number {
    const wl = this.player.weaponLevel
    switch (this.player.weaponType) {
      case 'spread': return wl >= 4 ? 5 : wl >= 3 ? 3 : wl >= 2 ? 2 : 1
      case 'rapid': return 1
      case 'charged': return 1
      case 'homing': return 3
      default: return 1
    }
  }

  private getWeaponSpread(): number {
    const wl = this.player.weaponLevel
    switch (this.player.weaponType) {
      case 'spread': return wl >= 4 ? 0.08 : wl >= 3 ? 0.06 : 0.04
      case 'rapid': return 0
      case 'charged': return 0
      case 'homing': return 0.06
      default: return 0
    }
  }

  private getWeaponColor(): string {
    switch (this.player.weaponType) {
      case 'spread': return '#00ccff'
      case 'rapid': return '#ffcc00'
      case 'charged': return '#ff66ff'
      case 'homing': return '#00ff88'
      default: return '#00ccff'
    }
  }

  private activateBomb(): void {
    const p = this.player
    p.bombs--
    audioManager.playSfxSynth('bomb')

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (!e.alive) continue
      this.score += e.score
      this.emitBigExplosion(e.x, e.y, '#ff8800')
      e.alive = false
      this.enemies.splice(i, 1)
    }

    if (this.bossActive && this.boss && this.boss.alive) {
      this.boss.hp -= 20
      this.emitBigExplosion(this.boss.x, this.boss.y, '#ff6600')
      this.screenShakeIntensity = 25
      if (this.boss.hp <= 0 && this.boss.deathTimer <= 0) {
        this.onBossDefeated()
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.isPlayer) {
        b.alive = false
        this.bullets.splice(i, 1)
      }
    }

    this.screenShakeIntensity = 20
    this.flashTimer = 0.3
    this.flashColor = '#ff8800'
    this.hitStopTimer = 0.08
    this.addNotification('💥 BOMB! 💥', '#ff6600')
  }

  private emitEngineTrail(): void {
    const p = this.player
    if (!p.alive) return
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const count = Math.max(1, Math.floor(speed / 120))
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: p.x + rand(-8, 8),
        y: p.y + p.height / 2 + rand(-4, 4),
        z: 0,
        vx: rand(-15, 15),
        vy: rand(60, 160),
        life: rand(0.3, 0.7),
        maxLife: 0.7,
        size: rand(2, 6),
        color: `hsl(${20 + Math.random() * 20}, 100%, ${50 + Math.random() * 30}%)`,
        alpha: 1,
        type: 'trail',
      })
    }
  }

  private updateEnemies(dt: number): void {
    if (this.bossActive) return

    this.difficulty = 1 + (this.currentLevel - 1) * 0.2
    const spawnRate = Math.max(0.08, 0.6 / this.difficulty)

    this.enemyTimer -= dt
    this.sideSpawnTimer -= dt

    if (this.enemyTimer <= 0) {
      const burst = Math.random() < 0.4 ? 2 + Math.floor(Math.random() * 2) : 1
      for (let i = 0; i < burst; i++) {
        setTimeout(() => this.spawnEnemy(), i * 80)
      }
      this.enemyTimer = spawnRate + rand(-0.1, 0.1)
    }

    if (this.sideSpawnTimer <= 0 && this.currentLevel >= 3) {
      this.spawnSideEnemy()
      this.sideSpawnTimer = 2 + Math.random() * 2
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (!e.alive) {
        this.enemies.splice(i, 1)
        continue
      }

      e.y += e.vy * dt
      e.x += e.vx * dt

      if (e.type === 'fast') {
        e.vx += Math.sin(this.gameTime * 3 + e.y * 0.01) * (80 + this.currentLevel * 5) * dt
        e.vx *= 0.99
        if (e.y < this.canvasH * 0.3) e.vy += 20 * dt
        else if (e.y > this.canvasH * 0.7) e.vy -= 20 * dt
      } else if (e.type === 'tank') {
        e.vx = Math.sin(this.gameTime * 0.5 + e.x * 0.01) * (50 + this.currentLevel * 3)
        if (e.y < this.canvasH * 0.15) e.vy += 30 * dt
      } else if (e.type === 'shooter') {
        if (e.y > this.canvasH * 0.2 && e.y < this.canvasH * 0.4) {
          e.vy *= 0.97
        }
        if (e.y > this.canvasH * 0.5) e.vy -= 50 * dt
      } else if (e.type === 'elite') {
        e.vx += Math.sin(this.gameTime * 2 + e.y * 0.01) * (50 + this.currentLevel * 4) * dt
        if (e.y > this.canvasH * 0.45) e.vy -= 30 * dt
        if (e.y < this.canvasH * 0.15) e.vy += 20 * dt
      }

      if (e.y > this.canvasH + 80) {
        e.alive = false
        this.enemies.splice(i, 1)
        continue
      }

      if (e.x < -80 || e.x > this.canvasW + 80) {
        e.alive = false
        this.enemies.splice(i, 1)
        continue
      }

      if (e.fireTimer > 0) e.fireTimer -= dt
      if (e.fireTimer <= 0 && e.fireRate > 0) {
        this.fireEnemyWeapon(e)
        e.fireTimer = e.fireRate + rand(-0.3, 0.3)
      }

      if (e.flashTimer > 0) e.flashTimer -= dt
    }
  }

  private spawnEnemy(): void {
    const lvl = this.currentLevel
    const types: EnemyType[] = ['basic', 'basic']
    if (lvl >= 2) types.push('fast')
    if (lvl >= 3) types.push('tank', 'shooter')
    if (lvl >= 4) types.push('shooter', 'shooter')
    if (lvl >= 6) types.push('elite')
    if (lvl >= 8) types.push('elite', 'elite', 'fast', 'fast')
    if (lvl >= 10) types.push('elite', 'shooter', 'shooter', 'tank')

    const fromSide = Math.random() < 0.15 && lvl >= 3
    const type = types[Math.floor(Math.random() * types.length)]
    const def = ENEMY_TYPES[type]
    const lvlMult = 1 + (lvl - 1) * 0.1

    const x = fromSide
      ? (Math.random() < 0.5 ? -40 : this.canvasW + 40)
      : rand(60, this.canvasW - 60)
    const y = fromSide ? rand(50, this.canvasH * 0.35) : -40

    const speed = def.speed + rand(-15, 15)

    const e: Enemy = {
      x,
      y,
      z: 0,
      width: def.size,
      height: def.size,
      hp: Math.round(def.hp * lvlMult),
      maxHp: Math.round(def.hp * lvlMult),
      speed,
      type,
      alive: true,
      fireTimer: rand(0, def.fireRate),
      fireRate: def.fireRate,
      vx: fromSide ? (x < 0 ? rand(80, 150) : rand(-150, -80)) : rand(-20, 20),
      vy: fromSide ? rand(15, 50) : speed * (0.5 + Math.random() * 0.5),
      shootAngle: Math.PI / 2,
      flashTimer: 0,
      score: def.score,
      coins: def.coins,
    }
    this.enemies.push(e)
  }

  private spawnSideEnemy(): void {
    const side = Math.random() < 0.5 ? 'left' : 'right'
    const x = side === 'left' ? -50 : this.canvasW + 50
    const types: EnemyType[] = ['fast', 'shooter', 'elite']
    const type = types[Math.floor(Math.random() * types.length)]
    const def = ENEMY_TYPES[type]
    const lvlMult = 1 + (this.currentLevel - 1) * 0.12

    this.enemies.push({
      x,
      y: rand(50, this.canvasH * 0.4),
      z: 0,
      width: def.size,
      height: def.size,
      hp: Math.round(def.hp * lvlMult),
      maxHp: Math.round(def.hp * lvlMult),
      speed: def.speed + rand(-20, 20),
      type,
      alive: true,
      fireTimer: rand(0, def.fireRate),
      fireRate: def.fireRate,
      vx: side === 'left' ? rand(120, 200) : rand(-200, -120),
      vy: rand(10, 40),
      shootAngle: Math.PI / 2,
      flashTimer: 0,
      score: def.score,
      coins: def.coins,
    })
  }

  private fireEnemyWeapon(e: Enemy): void {
    const bulletCount = e.type === 'shooter' ? 3 : e.type === 'elite' ? 2 : 1

    for (let i = 0; i < bulletCount; i++) {
      const spread = bulletCount > 1 ? (i - (bulletCount - 1) / 2) * 0.12 : 0
      const dx = this.player.x - e.x
      const dy = this.player.y - e.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= 0) continue

      const baseAngle = Math.atan2(dy, dx)
      const angle = baseAngle + spread
      const bonusSpeed = e.type === 'elite' ? 50 : 0
      const bulletSpeed = 220 + bonusSpeed

      const b: Bullet = {
        x: e.x, y: e.y + e.height / 2, z: 0,
        width: 8, height: 16,
        speed: bulletSpeed,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        damage: 1,
        isPlayer: false,
        alive: true,
        timer: 3,
        color: '#ff4444',
      }
      this.bullets.push(b)
    }
  }

  private updateBoss(dt: number): void {
    if (!this.boss || !this.boss.alive) return

    const b = this.boss

    if (b.spawnTimer > 0) {
      b.spawnTimer -= dt
      if (b.spawnTimer <= 0) b.spawnTimer = 0
      b.y += 50 * dt
      b.y = Math.min(b.y, 120)
      return
    }

    if (b.deathTimer > 0) {
      b.deathTimer -= dt
      return
    }

    b.moveTimer += dt
    b.ringRotation += dt * 0.3

    if (b.introTimer > 0) b.introTimer -= dt

    b.targetX = this.canvasW / 2 + Math.sin(b.moveTimer * 0.3) * (this.canvasW * 0.3)
    b.targetY = 100 + Math.sin(b.moveTimer * 0.2) * 50

    const dx = b.targetX - b.x
    const dy = b.targetY - b.y
    b.vx += dx * 0.8 * dt
    b.vy += dy * 0.8 * dt
    b.vx *= 0.97
    b.vy *= 0.97
    b.x += b.vx * dt * 60
    b.y += b.vy * dt * 60

    b.x = clamp(b.x, this.canvasW * 0.1, this.canvasW * 0.9)
    b.y = clamp(b.y, 50, 180)

    b.attackTimer += dt
    const fireRate = Math.max(0.3, 1.5 - b.phase * 0.3)
    if (b.attackTimer >= fireRate) {
      b.attackTimer = 0
      this.fireBossWeapon()
    }

    if (b.phase >= 2 && Math.random() < 0.02) {
      this.emitSparks(b.x + rand(-80, 80), b.y + rand(-50, 50), '#ff0044')
    }
  }

  private fireBossWeapon(): void {
    if (!this.boss) return

    const b = this.boss
    const count = b.phase + 1
    const angleStep = Math.PI * 2 / count

    for (let i = 0; i < count; i++) {
      const baseAngle = -Math.PI / 2 + i * angleStep + Math.sin(this.gameTime * 2 + i) * 0.3
      const speed = 180 + b.phase * 30

      const bullet: Bullet = {
        x: b.x + Math.cos(baseAngle) * 50,
        y: b.y + Math.sin(baseAngle) * 50,
        z: 0,
        width: 8,
        height: 16,
        speed,
        vx: Math.cos(baseAngle) * speed,
        vy: Math.sin(baseAngle) * speed,
        damage: 1 + b.phase,
        isPlayer: false,
        alive: true,
        timer: 4,
        color: '#ff4444',
      }
      this.bullets.push(bullet)
    }

    if (b.phase >= 2) {
      const dx = this.player.x - b.x
      const dy = this.player.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0) {
        const speed = 280
        const bullet: Bullet = {
          x: b.x, y: b.y + 40,
          z: 0,
          width: 8,
          height: 16,
          speed,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          damage: 2,
          isPlayer: false,
          alive: true,
          timer: 3,
          color: '#ff6600',
        }
        this.bullets.push(bullet)
      }
    }
  }

  private checkBossSpawn(): void {
    if (this.bossSpawned) return
    if (this.currentLevel % 5 === 0 && !this.bossLevel) {
      this.bossLevel = true
      this.bossSpawned = true
      this.enemies = []
      this.boss = this.createBoss(this.currentLevel)
      this.bossActive = true

      if (!this.bossWarningShown) {
        this.bossWarningShown = true
        this.addNotification('⚠ BOSS INCOMING ⚠', '#ff0000')
        audioManager.playSfxSynth('boss_hit')
        this.screenShakeIntensity = 12
        this.flashTimer = 0.4
        this.flashColor = '#ff0000'
      }
    }
  }

  private createBoss(level: number): Boss {
    const hp = 80 + level * 30
    return {
      x: this.canvasW / 2, y: -80,
      z: 0,
      width: 160, height: 140,
      hp, maxHp: hp,
      alive: true,
      phase: 1, maxPhase: 3,
      fireTimer: 0,
      moveTimer: 0,
      movePattern: 0,
      vx: 0, vy: 0,
      spawnTimer: 2,
      deathTimer: 0,
      flashTimer: 0,
      introTimer: 2,
      level,
      attackTimer: 0,
      ringRotation: 0,
      targetX: this.canvasW / 2,
      targetY: 100,
    }
  }

  private updateBullets(dt: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.alive) {
        this.bullets.splice(i, 1)
        continue
      }

      b.x += b.vx * dt
      b.y += b.vy * dt
      b.timer -= dt

      if (b.timer <= 0 || b.x < -80 || b.x > this.canvasW + 80 || b.y < -80 || b.y > this.canvasH + 80) {
        b.alive = false
        this.bullets.splice(i, 1)
      }
    }
  }

  private updatePowerups(dt: number): void {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i]
      if (!p.alive) {
        this.powerups.splice(i, 1)
        continue
      }
      p.y += p.vy * dt
      p.bobTimer += dt

      if (p.y > this.canvasH + 40) {
        p.alive = false
        this.powerups.splice(i, 1)
      }
    }
  }

  private updateParticles(dt: number): void {
    const maxParticles = this.bossActive ? 300 : 200
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.97
      p.vy *= 0.97
      if (p.gravity) p.vy += p.gravity * dt
      p.life -= dt
      p.alpha = clamp(p.life / p.maxLife, 0, 1)

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }

    if (this.particles.length > maxParticles) {
      this.particles.splice(0, this.particles.length - maxParticles)
    }
  }

  private updateScreenShake(dt: number): void {
    if (this.screenShakeIntensity > 0) {
      this.screenShakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2
      this.screenShakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2
      this.screenShakeIntensity *= 0.85
      if (this.screenShakeIntensity < 0.5) {
        this.screenShakeIntensity = 0
        this.screenShakeX = 0
        this.screenShakeY = 0
      }
    }
  }

  private updateFlash(dt: number): void {
    if (this.flashTimer > 0) {
      this.flashTimer -= dt
      this.flashIntensity = clamp(this.flashTimer / 0.2, 0, 1)
    } else {
      this.flashIntensity = 0
    }
  }

  private updateStore(): void {
    const store = useGameStore.getState()
    store.updatePlayerHUD(this.player)
    store.updateBossHUD(this.boss)
    store.updateScore(this.score, this.currentLevel)
    store.updateCombo(this.player.combo, this.player.comboMultiplier)
    store.setFlash(this.flashIntensity, this.flashColor)
  }

  private checkCollisions(): void {
    const p = this.player
    const comboMult = 1 + Math.min(p.combo, 30) * 0.1

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.alive || !b.isPlayer) continue

      if (this.bossActive && this.boss && this.boss.alive && this.boss.deathTimer <= 0) {
        if (this.circleRect({ x: b.x, y: b.y, r: 6 }, { x: this.boss.x, y: this.boss.y, w: this.boss.width, h: this.boss.height })) {
          b.alive = false
          this.bullets.splice(i, 1)
          const dmg = Math.round(b.damage * comboMult)
          this.boss.hp -= dmg

          this.emitSparks(b.x, b.y, phaseColorForBoss(this.boss))
          this.emitExplosion(b.x, b.y, '#ff8800', 5)
          this.screenShakeIntensity = 3
          audioManager.playSfxSynth('boss_hit')

          if (this.boss.hp <= 0 && this.boss.deathTimer <= 0) {
            this.onBossDefeated()
          } else if (this.boss.hp <= this.boss.maxHp * 0.66 && this.boss.phase === 1) {
            this.boss.phase = 2
            this.addNotification('⚠ PHASE 2 ⚠', '#ff4400')
            this.screenShakeIntensity = 10
            this.flashTimer = 0.3
            this.flashColor = '#ff4400'
          } else if (this.boss.hp <= this.boss.maxHp * 0.33 && this.boss.phase === 2) {
            this.boss.phase = 3
            this.addNotification('⚠ FINAL PHASE ⚠', '#cc00ff')
            this.screenShakeIntensity = 12
            this.flashTimer = 0.3
            this.flashColor = '#cc00ff'
          }
          continue
        }
      }

      let hit = false
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j]
        if (!e.alive) continue
        if (this.circleRect({ x: b.x, y: b.y, r: 6 }, { x: e.x, y: e.y, w: e.width, h: e.height })) {
          b.alive = false
          this.bullets.splice(i, 1)
          e.hp -= Math.round(b.damage * comboMult)
          e.flashTimer = 0.08

          this.emitSparks(b.x, b.y, '#ffcc00')
          this.addFloatingText(b.x, b.y - 15, Math.round(b.damage * comboMult).toString(), '#fff')

          if (e.hp <= 0) {
            this.onEnemyKilled(e, j)
          }
          hit = true
          break
        }
      }
      if (hit) continue
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.alive || b.isPlayer) continue

      if (this.circleCircle({ x: b.x, y: b.y, r: 6 }, { x: p.x, y: p.y, r: PLAYER_COLLISION_RADIUS })) {
        b.alive = false
        this.bullets.splice(i, 1)

        if (p.alive && p.invincible <= 0) {
          const dmg = Math.max(1, b.damage)
          if (p.shield > 0) {
            p.shield = Math.max(0, p.shield - dmg)
            this.emitShieldHit(p.x, p.y)
          } else {
            p.hp -= dmg
          }
          p.invincible = 0.5
          this.screenShakeIntensity = 10
          this.flashTimer = 0.25
          this.flashColor = '#ff0000'
          this.hitStopTimer = 0.05
          audioManager.playSfxSynth('hit')

          this.emitSparks(b.x, b.y, p.shield > 0 ? '#00ccff' : '#ff4400')
          this.emitExplosion(p.x, p.y, '#ff4400', 8)

          if (p.hp <= 0) {
            this.onPlayerDeath()
          }
        }
      }
    }

    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j]
      if (!e.alive) continue

      const enemyR = e.width / 2
      if (this.circleCircle({ x: p.x, y: p.y, r: PLAYER_COLLISION_RADIUS }, { x: e.x, y: e.y, r: enemyR })) {
        if (p.alive && p.invincible <= 0) {
          p.hp -= 2
          p.invincible = 0.5
          this.emitBigExplosion(e.x, e.y, '#ff4400')
          this.screenShakeIntensity = 12
          this.flashTimer = 0.2
          this.flashColor = '#ff4400'
          this.hitStopTimer = 0.06
          e.alive = false
          this.enemies.splice(j, 1)
          audioManager.playSfxSynth('explosion')

          if (p.hp <= 0) this.onPlayerDeath()
        }
      }
    }

    if (this.bossActive && this.boss && this.boss.alive && this.boss.deathTimer <= 0) {
      if (this.circleCircle({ x: p.x, y: p.y, r: PLAYER_COLLISION_RADIUS }, { x: this.boss.x, y: this.boss.y, r: 70 })) {
        if (p.alive && p.invincible <= 0) {
          p.hp -= 3
          p.invincible = 0.5
          this.screenShakeIntensity = 15
          this.flashTimer = 0.3
          this.flashColor = '#ff0000'
          this.hitStopTimer = 0.08
          this.emitBigExplosion(p.x, p.y, '#ff0000')
          if (p.hp <= 0) this.onPlayerDeath()
        }
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i]
      if (!pu.alive) continue
      if (this.circleCircle({ x: p.x, y: p.y, r: PLAYER_COLLISION_RADIUS }, { x: pu.x, y: pu.y, r: 20 })) {
        pu.alive = false
        this.applyPowerup(pu)
        this.emitCollectEffect(pu.x, pu.y, '#00ff88')
        this.powerups.splice(i, 1)
        audioManager.playSfxSynth('powerup')
      }
    }
  }

  private circleRect(c: { x: number; y: number; r: number }, r: { x: number; y: number; w: number; h: number }): boolean {
    const cx = clamp(c.x, r.x - r.w / 2, r.x + r.w / 2)
    const cy = clamp(c.y, r.y - r.h / 2, r.y + r.h / 2)
    const dx = c.x - cx
    const dy = c.y - cy
    return dx * dx + dy * dy < c.r * c.r
  }

  private circleCircle(a: { x: number; y: number; r: number }, b: { x: number; y: number; r: number }): boolean {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dist = dx * dx + dy * dy
    const rad = a.r + b.r
    return dist < rad * rad
  }

  private onEnemyKilled(e: Enemy, index: number): void {
    this.player.kills++
    this.player.combo++
    this.player.comboTimer = 2.5
    if (this.player.combo > this.player.maxCombo) this.player.maxCombo = this.player.combo

    const comboMult = 1 + Math.min(this.player.combo, 30) * 0.1
    const bonusScore = Math.floor(e.score * comboMult)
    this.score += bonusScore

    this.emitBigExplosion(e.x, e.y, enemyExplosionColor(e.type))
    this.screenShakeIntensity = 6
    this.addFloatingText(e.x, e.y - 25, `+${bonusScore}`, '#ffd700')

    if (this.player.combo >= 5) {
      this.addFloatingText(e.x, e.y - 50, `🔥 ${this.player.combo}x COMBO! 🔥`, '#ffd700')
    }

    if (this.player.combo === 10) {
      this.addNotification('🔥 10x COMBO! 🔥', '#ff8800')
      this.screenShakeIntensity = 8
    } else if (this.player.combo === 25) {
      this.addNotification('⚡ 25x COMBO! ⚡', '#ff4400')
      this.screenShakeIntensity = 10
      this.flashTimer = 0.15
      this.flashColor = '#ff4400'
    } else if (this.player.combo === 50) {
      this.addNotification('💀 50x COMBO! 💀', '#ff0000')
      this.screenShakeIntensity = 15
      this.flashTimer = 0.25
      this.flashColor = '#ff0000'
    }

    audioManager.playSfxSynth('explosion')
    e.alive = false
    this.enemies.splice(index, 1)

    this.maybeDropPowerup(e.x, e.y)
  }

  private onBossDefeated(): void {
    if (!this.boss) return
    this.boss.deathTimer = 3
    this.score += this.boss.level * 500

    const bossNames = ['', '', '', '', 'DESTROYER', '', '', '', '', 'TITAN', '', '', '', '', 'OVERLORD', '', '', '', '', 'ANNIHILATOR']
    const bossName = bossNames[this.boss.level] || 'WARLORD'

    this.addNotification(`💀 ${bossName} DEFEATED! +${this.boss.level * 500}pts 💀`, '#ffd700')
    audioManager.playSfxSynth('bomb')
    this.screenShakeIntensity = 25
    this.flashTimer = 0.5
    this.flashColor = '#ffd700'
    this.hitStopTimer = 0.2

    if (this.boss) {
      this.emitBigExplosion(this.boss.x, this.boss.y, '#ff8800')
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (this.boss) {
            this.emitBigExplosion(
              this.boss.x + rand(-100, 100),
              this.boss.y + rand(-100, 100),
              '#ff4400'
            )
          }
        }, i * 250)
      }
    }

    setTimeout(() => {
      if (!this.boss) return
      for (let i = 0; i < 8; i++) {
        this.emitBigExplosion(
          this.boss.x + rand(-120, 120),
          this.boss.y + rand(-120, 120),
          '#ff8800'
        )
      }
      for (let i = 0; i < 6; i++) {
        this.spawnPowerupAt(
          this.boss.x + rand(-70, 70),
          this.boss.y + rand(-70, 70)
        )
      }
      this.bossActive = false
      this.boss = null
      this.bossWarningShown = false

      this.currentLevel++
      this.bossSpawned = false
      this.bossLevel = false
      this.enemies = []
      this.startLevelTransition()
      this.addNotification(`🌀 Level ${this.currentLevel} - Engage! 🌀`, '#88bbff')
    }, 2500)
  }

  private onPlayerDeath(): void {
    this.player.alive = false
    this.gameOver = true
    audioManager.playSfxSynth('explosion')
    this.screenShakeIntensity = 20
    this.flashTimer = 0.4
    this.flashColor = '#ff0000'
    this.hitStopTimer = 0.15
    this.emitBigExplosion(this.player.x, this.player.y, '#ff4400')

    setTimeout(() => {
      this.emitBigExplosion(this.player.x + rand(-40, 40), this.player.y + rand(-40, 40), '#ff8800')
    }, 200)
    setTimeout(() => {
      this.emitBigExplosion(this.player.x + rand(-30, 30), this.player.y + rand(-30, 30), '#ffcc00')
    }, 400)

    if (this.score > useGameStore.getState().highScore) {
      localStorage.setItem('spacerush_highscore', this.score.toString())
    }
  }

  private maybeDropPowerup(x: number, y: number): void {
    if (Math.random() < 0.12) {
      const weights = [35, 20, 15, 10, 10, 10]
      const total = weights.reduce((a, b) => a + b)
      let r = Math.random() * total
      let type: PowerUpType = 'weapon'
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i]
        if (r <= 0) {
          type = (['weapon', 'shield', 'bomb', 'homing', 'rapid', 'slowmo'] as PowerUpType[])[i]
          break
        }
      }
      if (type === 'weapon') {
        const p = this.player
        if (p.weaponLevel >= 5) type = Math.random() < 0.5 ? 'shield' : 'bomb'
      }
      this.spawnPowerupAt(x, y, type)
    }
  }

  private spawnPowerupAt(x: number, y: number, type?: PowerUpType): void {
    const t = type || 'bomb'
    this.powerups.push({
      x, y, z: 0,
      width: 30, height: 30,
      type: t,
      alive: true,
      vy: 60,
      bobTimer: rand(0, PI2),
      glowIntensity: 0,
    })
  }

  private applyPowerup(pu: PowerUp): void {
    const p = this.player
    switch (pu.type) {
      case 'weapon':
        if (p.weaponLevel < 5) {
          p.weaponLevel++
          const names = ['', 'DUAL SHOT', 'TRIPLE SHOT', 'SPREAD SHOT', 'WIDE SPREAD']
          this.addNotification(`+${names[p.weaponLevel] || 'MAX'}`, '#00ccff')
        } else {
          p.weaponLevel = Math.min(p.weaponLevel + 1, 8)
          this.addNotification('+WEAPON DMG', '#00ccff')
        }
        break
      case 'shield':
        p.shield = Math.min(p.shield + 1, p.maxShield)
        this.addNotification('+SHIELD', '#00e5ff')
        break
      case 'bomb':
        p.bombs = Math.min(p.bombs + 1, 5)
        this.addNotification('+BOMB', '#ff6600')
        break
      case 'homing':
        p.weaponType = 'homing'
        setTimeout(() => { if (p.weaponType === 'homing') p.weaponType = 'spread' }, 8000)
        this.addNotification('HOMING MISSILES', '#00ffcc')
        break
      case 'rapid':
        p.weaponType = 'rapid'
        p.fireRate = 0.07
        setTimeout(() => { if (p.weaponType === 'rapid') { p.weaponType = 'spread'; p.fireRate = 0.15 } }, 8000)
        this.addNotification('RAPID FIRE', '#ffcc00')
        break
      case 'slowmo':
        this.slowMotionTimer = 4
        this.addNotification('SLOW MOTION', '#88bbff')
        break
    }
  }

  private emitExplosion(x: number, y: number, color: string, count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, PI2)
      const speed = rand(40, 220)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.2, 0.6),
        maxLife: 0.6,
        size: rand(2, 7),
        color,
        alpha: 1,
        type: 'explosion',
      })
    }
  }

  private emitBigExplosion(x: number, y: number, color: string): void {
    const colors = [color, '#ffffff', '#ffd700', '#ff4400', '#ffaa00']
    for (let i = 0; i < 16; i++) {
      const angle = rand(0, PI2)
      const speed = rand(50, 300)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.3, 0.9),
        maxLife: 0.9,
        size: rand(3, 10),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        type: 'explosion',
      })
    }
    for (let i = 0; i < 6; i++) {
      const angle = rand(0, PI2)
      const speed = rand(20, 120)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.6, 1.5),
        maxLife: 1.5,
        size: rand(5, 14),
        color: 'rgba(100, 100, 120, 0.5)',
        alpha: 0.5,
        type: 'smoke',
        gravity: 25,
      })
    }
  }

  private emitSparks(x: number, y: number, color: string): void {
    for (let i = 0; i < 5; i++) {
      const angle = rand(0, PI2)
      const speed = rand(80, 280)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.1, 0.35),
        maxLife: 0.35,
        size: rand(1.5, 4),
        color,
        alpha: 1,
        type: 'spark',
      })
    }
  }

  private emitShieldHit(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = rand(0, PI2)
      const speed = rand(60, 200)
      this.particles.push({
        x: x + rand(-15, 15), y: y + rand(-15, 15), z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.2, 0.5),
        maxLife: 0.5,
        size: rand(2, 5),
        color: '#00ccff',
        alpha: 1,
        type: 'spark',
      })
    }
  }

  private emitCollectEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 10; i++) {
      const angle = rand(0, PI2)
      const speed = rand(40, 130)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: rand(0.3, 0.7),
        maxLife: 0.7,
        size: rand(1.5, 5),
        color,
        alpha: 1,
        type: 'explosion',
      })
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string): void {
    this.particles.push({
      x, y, z: 0,
      vx: 0, vy: -90,
      life: 1.2, maxLife: 1.2,
      size: 0, color,
      alpha: 1,
      type: 'text',
      text,
      textSize: 22,
    })
  }

  private addNotification(text: string, color: string): void {
    useGameStore.getState().addNotification(text, color)
  }

  pause(): void {
    this.paused = true
  }

  resume(): void {
    this.paused = false
  }

  dispose(): void {
    this.enemies = []
    this.bullets = []
    this.powerups = []
    this.particles = []
    this.boss = null
  }
}

function enemyExplosionColor(type: EnemyType): string {
  switch (type) {
    case 'basic': return '#00ddcc'
    case 'fast': return '#ff8800'
    case 'tank': return '#9933ff'
    case 'shooter': return '#ff2266'
    case 'elite': return '#ff0033'
    default: return '#ff8800'
  }
}

function phaseColorForBoss(boss: Boss): string {
  switch (boss.phase) {
    case 1: return '#ff6600'
    case 2: return '#ff0044'
    case 3: return '#cc00ff'
    default: return '#ff6600'
  }
}
