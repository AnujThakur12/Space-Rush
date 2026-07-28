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
  basic: { hp: 1, speed: 120, score: 100, coins: 5, fireRate: 0, size: 28 },
  fast: { hp: 1, speed: 220, score: 150, coins: 7, fireRate: 0, size: 22 },
  tank: { hp: 4, speed: 80, score: 250, coins: 12, fireRate: 0, size: 34 },
  shooter: { hp: 2, speed: 100, score: 200, coins: 10, fireRate: 2, size: 30 },
  elite: { hp: 6, speed: 140, score: 500, coins: 25, fireRate: 1.5, size: 36 },
}

const UPGRADE_COST_BASE = 200
const PLANE_COSTS: Record<string, number> = {
  eagle: 500, raptor: 1500, phantom: 5000, 'stealth-x': 15000,
}

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

  private lastTime = 0
  private enemyTimer = 0
  private difficulty = 1
  private bossWarningShown = false

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
      x: this.canvasW / 2, y: this.canvasH - 80, z: 0,
      width: 40, height: 50,
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
    if (p.comboTimer > 0) {
      p.comboTimer -= dt
      if (p.comboTimer <= 0) {
        p.combo = 0
        p.comboMultiplier = 1
        useGameStore.getState().updateCombo(0, 1)
      }
    }

    let moveX = 0
    let moveY = 0
    const kLeft = input.keys.has('ArrowLeft') || input.keys.has('a') || input.keys.has('A')
    const kRight = input.keys.has('ArrowRight') || input.keys.has('d') || input.keys.has('D')
    const kUp = input.keys.has('ArrowUp') || input.keys.has('w') || input.keys.has('W')
    const kDown = input.keys.has('ArrowDown') || input.keys.has('s') || input.keys.has('S')
    const usingKeyboard = kLeft || kRight || kUp || kDown

    if (usingKeyboard) {
      if (kLeft) moveX = -1
      if (kRight) moveX = 1
      if (kUp) moveY = -1
      if (kDown) moveY = 1
      p.targetVx = moveX * p.speed
      p.targetVy = moveY * p.speed
    } else if (input.mouseActive) {
      const dx = input.mouseX - p.x
      const dy = input.mouseY - p.y
      const followStrength = 8
      p.targetVx = dx * followStrength
      p.targetVy = dy * followStrength
    } else if (input.touchActive) {
      p.targetVx = input.touchX * p.speed
      p.targetVy = input.touchY * p.speed
    } else {
      p.targetVx = 0
      p.targetVy = 0
    }

    const friction = 8
    p.vx += (p.targetVx - p.vx) * friction * dt
    p.vy += (p.targetVy - p.vy) * friction * dt

    p.x += p.vx * dt
    p.y += p.vy * dt

    p.x = clamp(p.x, p.width / 2, this.canvasW - p.width / 2)
    p.y = clamp(p.y, p.height / 2, this.canvasH - p.height / 2)

    p.fireTimer -= dt
    if (input.firing || input.keys.has(' ')) {
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

  private firePlayerWeapon(): void {
    const p = this.player
    const spread = p.weaponType
    const bx = p.x
    const by = p.y - p.height / 2 - 10

    const aimAngle = this.getAimAssistAngle()

    const volley = spread === 'spread' ? 3 : spread === 'rapid' ? 1 : spread === 'charged' ? 1 : 1
    const bulletSpeed = 600
    const damage = 10 + (p.weaponLevel - 1) * 2

    for (let i = 0; i < volley; i++) {
      let angle = -Math.PI / 2
      if (spread === 'spread') {
        angle += (i - 1) * 0.15 + aimAngle * 0.3
      } else {
        angle += aimAngle * 0.4
      }

      const b: Bullet = {
        x: bx, y: by, z: 0,
        width: 4, height: 12,
        speed: bulletSpeed,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        damage,
        isPlayer: true,
        alive: true,
        timer: 2,
        color: '#00ccff',
      }
      this.bullets.push(b)
    }

    this.muzzleFlashTimer = 0.08
    this.muzzleX = bx
    this.muzzleY = by
    audioManager.playSfxSynth('shoot')
  }

  private getAimAssistAngle(): number {
    const p = this.player
    const targets = this.bossActive && this.boss ? [this.boss] : this.enemies
    if (targets.length === 0) return 0

    const settings = useGameStore.getState().settings
    if (!settings.aimAssist) return 0

    let closest: { x: number; y: number } | null = null
    let closestDist = Infinity
    for (const e of targets) {
      if (!e.alive) continue
      const dx = e.x - p.x
      const dy = e.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < closestDist) {
        closestDist = dist
        closest = e
      }
    }
    if (!closest) return 0

    const dx = closest.x - p.x
    const dy = closest.y - p.y
    const angle = Math.atan2(dy, dx)
    const diff = angle - (-Math.PI / 2)
    return clamp(diff, -0.5, 0.5)
  }

  private activateBomb(): void {
    const p = this.player
    p.bombs--
    audioManager.playSfxSynth('bomb')

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (!e.alive) continue
      this.score += e.score
      this.emitExplosion(e.x, e.y, '#ff8800')
      e.alive = false
      this.enemies.splice(i, 1)
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.isPlayer) {
        b.alive = false
        this.bullets.splice(i, 1)
      }
    }

    this.screenShakeIntensity = 10
    this.addNotification('BOMB!', '#ff6600')
  }

  private emitEngineTrail(): void {
    const p = this.player
    if (!p.alive) return
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const count = Math.max(1, Math.floor(speed / 150))
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: p.x + rand(-5, 5),
        y: p.y + p.height / 2,
        z: 0,
        vx: rand(-10, 10),
        vy: rand(30, 80),
        life: rand(0.3, 0.6),
        maxLife: 0.6,
        size: rand(2, 5),
        color: '#ff6600',
        alpha: 1,
        type: 'trail',
      })
    }
  }

  private updateEnemies(dt: number): void {
    if (this.bossActive) return

    this.difficulty = 1 + (this.currentLevel - 1) * 0.15
    const spawnRate = Math.max(0.3, 1.2 / this.difficulty)

    this.enemyTimer -= dt
    if (this.enemyTimer <= 0) {
      this.spawnEnemy()
      this.enemyTimer = spawnRate + rand(-0.2, 0.2)
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (!e.alive) {
        this.enemies.splice(i, 1)
        continue
      }

      e.y += e.vy * dt
      e.x += e.vx * dt

      if (e.y > this.canvasH + 60) {
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
    const types: EnemyType[] = ['basic', 'basic', 'fast', 'tank', 'shooter']
    if (this.currentLevel >= 3) types.push('shooter', 'shooter')
    if (this.currentLevel >= 5) types.push('elite')
    if (this.currentLevel >= 8) types.push('elite', 'elite')

    const type = types[Math.floor(Math.random() * types.length)]
    const def = ENEMY_TYPES[type]
    const lvlMult = 1 + (this.currentLevel - 1) * 0.1

    const e: Enemy = {
      x: rand(50, this.canvasW - 50),
      y: -40,
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
      vx: rand(-20, 20),
      vy: def.speed * (0.5 + Math.random() * 0.5),
      shootAngle: Math.PI / 2,
      flashTimer: 0,
      score: def.score,
      coins: def.coins,
    }
    this.enemies.push(e)
  }

  private fireEnemyWeapon(e: Enemy): void {
    const b: Bullet = {
      x: e.x, y: e.y + e.height / 2, z: 0,
      width: 4, height: 8,
      speed: 200,
      vx: 0,
      vy: 200,
      damage: 1,
      isPlayer: false,
      alive: true,
      timer: 3,
      color: '#ff4444',
    }

    const dx = this.player.x - e.x
    const dy = this.player.y - e.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      b.vx = (dx / dist) * b.speed
      b.vy = (dy / dist) * b.speed
    }

    this.bullets.push(b)
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
        this.addNotification('BOSS INCOMING!', '#ff0000')
        audioManager.playSfxSynth('boss_hit')
        this.screenShakeIntensity = 5
      }
    }
  }

  private createBoss(level: number): Boss {
    const hp = 50 + level * 20
    return {
      x: this.canvasW / 2, y: -80,
      z: 0,
      width: 100, height: 80,
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

      if (b.timer <= 0 || b.x < -50 || b.x > this.canvasW + 50 || b.y < -50 || b.y > this.canvasH + 50) {
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
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.gravity) p.vy += p.gravity * dt
      p.life -= dt
      p.alpha = clamp(p.life / p.maxLife, 0, 1)

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }

    if (this.particles.length > 200) {
      this.particles.splice(0, this.particles.length - 200)
    }
  }

  private updateScreenShake(dt: number): void {
    if (this.screenShakeIntensity > 0) {
      this.screenShakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2
      this.screenShakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2
      this.screenShakeIntensity *= 0.9
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
      this.flashIntensity = this.flashTimer / 0.15
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

  // Collision detection
  private checkCollisions(): void {
    const p = this.player
    const comboMult = 1 + Math.min(p.combo, 20) * 0.1

    // Player bullets vs enemies/boss
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.alive || !b.isPlayer) continue

      // vs boss
      if (this.bossActive && this.boss && this.boss.alive && this.boss.deathTimer <= 0) {
        if (this.circleRect({ x: b.x, y: b.y, r: 4 }, { x: this.boss.x, y: this.boss.y, w: this.boss.width, h: this.boss.height })) {
          b.alive = false
          this.bullets.splice(i, 1)
          const dmg = Math.round(b.damage * comboMult)
          this.boss.hp -= dmg
          this.emitExplosion(b.x, b.y, '#ff8800')
          this.screenShakeIntensity = 2
          audioManager.playSfxSynth('boss_hit')

          if (this.boss.hp <= 0 && this.boss.deathTimer <= 0) {
            this.onBossDefeated()
          }
          continue
        }
      }

      // vs enemies
      let hit = false
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j]
        if (!e.alive) continue
        if (this.circleRect({ x: b.x, y: b.y, r: 4 }, { x: e.x, y: e.y, w: e.width, h: e.height })) {
          b.alive = false
          this.bullets.splice(i, 1)
          e.hp -= Math.round(b.damage * comboMult)
          e.flashTimer = 0.05

          this.emitExplosion(b.x, b.y, '#ff8800')
          this.addFloatingText(b.x, b.y - 10, Math.round(b.damage * comboMult).toString(), '#fff')

          if (e.hp <= 0) {
            this.onEnemyKilled(e, j)
          }
          hit = true
          break
        }
      }
      if (hit) continue
    }

    // Enemy bullets vs player
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      if (!b.alive || b.isPlayer) continue

      if (this.circleCircle({ x: b.x, y: b.y, r: 4 }, { x: p.x, y: p.y, r: 20 })) {
        b.alive = false
        this.bullets.splice(i, 1)

        if (p.alive && p.invincible <= 0) {
          const dmg = Math.max(1, b.damage - (this.player as any).armor || 0)
          if (p.shield > 0) {
            p.shield = Math.max(0, p.shield - dmg)
          } else {
            p.hp -= dmg
          }
          p.invincible = 0.5
          this.screenShakeIntensity = 4
          this.flashTimer = 0.15
          this.flashColor = '#ff0000'
          audioManager.playSfxSynth('hit')

          if (p.hp <= 0) {
            this.onPlayerDeath()
          }
        }
      }
    }

    // Enemy body vs player
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j]
      if (!e.alive) continue

      if (this.circleCircle({ x: p.x, y: p.y, r: 20 }, { x: e.x, y: e.y, r: e.width / 2 })) {
        if (p.alive && p.invincible <= 0) {
          p.hp -= 2
          p.invincible = 0.5
          this.emitExplosion(e.x, e.y, '#ff4400')
          this.screenShakeIntensity = 4
          e.alive = false
          this.enemies.splice(j, 1)
          audioManager.playSfxSynth('explosion')

          if (p.hp <= 0) this.onPlayerDeath()
        }
      }
    }

    // Boss body vs player
    if (this.bossActive && this.boss && this.boss.alive && this.boss.deathTimer <= 0) {
      if (this.circleCircle({ x: p.x, y: p.y, r: 20 }, { x: this.boss.x, y: this.boss.y, r: 50 })) {
        if (p.alive && p.invincible <= 0) {
          p.hp -= 3
          p.invincible = 0.5
          this.screenShakeIntensity = 8
          this.emitExplosion(p.x, p.y, '#ff0000')
          if (p.hp <= 0) this.onPlayerDeath()
        }
      }
    }

    // Powerups vs player
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i]
      if (!pu.alive) continue
      if (this.circleCircle({ x: p.x, y: p.y, r: 20 }, { x: pu.x, y: pu.y, r: 16 })) {
        pu.alive = false
        this.applyPowerup(pu)
        this.emitExplosion(pu.x, pu.y, '#00ff88')
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
    this.player.comboTimer = 2
    if (this.player.combo > this.player.maxCombo) this.player.maxCombo = this.player.combo

    const comboMult = 1 + Math.min(this.player.combo, 20) * 0.1
    const bonusScore = Math.floor(e.score * comboMult)
    this.score += bonusScore

    this.emitExplosion(e.x, e.y, '#ff8800', 15)
    this.screenShakeIntensity = 3
    this.addFloatingText(e.x, e.y - 20, `+${bonusScore}`, '#ffd700')

    if (this.player.combo >= 5) {
      this.addFloatingText(e.x, e.y - 40, `${this.player.combo}x COMBO!`, '#ffd700')
      audioManager.playSfxSynth('combo')
    }

    audioManager.playSfxSynth('explosion')
    e.alive = false
    this.enemies.splice(index, 1)

    this.maybeDropPowerup(e.x, e.y)
    audioManager.playSfxSynth('explosion')
  }

  private onBossDefeated(): void {
    if (!this.boss) return
    this.boss.deathTimer = 2
    this.score += this.boss.level * 500
    this.addNotification(`BOSS DEFEATED! +${this.boss.level * 500}pts`, '#ffd700')
    audioManager.playSfxSynth('bomb')
    this.screenShakeIntensity = 12

    setTimeout(() => {
      if (!this.boss) return
      this.emitExplosion(this.boss.x, this.boss.y, '#ff8800', 30)
      for (let i = 0; i < 5; i++) {
        this.spawnPowerupAt(
          this.boss.x + rand(-60, 60),
          this.boss.y + rand(-60, 60)
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
      this.addNotification(`Level ${this.currentLevel} - Go!`, '#88bbff')
    }, 2000)
  }

  private onPlayerDeath(): void {
    this.player.alive = false
    this.gameOver = true
    audioManager.playSfxSynth('explosion')
    this.screenShakeIntensity = 12
    this.emitExplosion(this.player.x, this.player.y, '#ff4400', 30)

    if (this.score > useGameStore.getState().highScore) {
      localStorage.setItem('spacerush_highscore', this.score.toString())
    }
  }

  private maybeDropPowerup(x: number, y: number): void {
    if (Math.random() < 0.08) {
      const types: PowerUpType[] = ['bomb', 'homing', 'slowmo']
      const type = types[Math.floor(Math.random() * types.length)]
      this.spawnPowerupAt(x, y, type)
    }
  }

  private spawnPowerupAt(x: number, y: number, type?: PowerUpType): void {
    const types: PowerUpType[] = ['bomb', 'homing', 'slowmo']
    const t = type || types[Math.floor(Math.random() * types.length)]
    this.powerups.push({
      x, y, z: 0,
      width: 24, height: 24,
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
      case 'bomb':
        p.bombs = Math.min(p.bombs + 1, 3)
        this.addNotification('+Bomb!', '#ff6600')
        break
      case 'homing':
        p.weaponType = 'homing'
        setTimeout(() => { p.weaponType = 'spread' }, 5000)
        this.addNotification('Homing Missiles!', '#00ffcc')
        break
      case 'slowmo':
        this.slowMotionTimer = 3
        this.addNotification('Slow Motion!', '#88bbff')
        break
    }
  }

  private emitExplosion(x: number, y: number, color: string, count = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, PI2)
      const speed = rand(30, 150)
      this.particles.push({
        x, y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.2, 0.6),
        maxLife: 0.6,
        size: rand(2, 6),
        color,
        alpha: 1,
        type: 'explosion',
      })
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string): void {
    this.particles.push({
      x, y, z: 0,
      vx: 0, vy: -60,
      life: 1, maxLife: 1,
      size: 0, color,
      alpha: 1,
      type: 'text',
      text,
      textSize: 16,
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
