export type GameState =
  | 'loading'
  | 'menu'
  | 'playing'
  | 'paused'
  | 'gameover'
  | 'settings'
  | 'achievements'
  | 'leaderboards'
  | 'plane_select'
  | 'upgrades'
  | 'account'

export type PlaneType = 'default' | 'falcon' | 'eagle' | 'raptor' | 'phantom' | 'stealth' | 'stealth-x'

export type WeaponType = 'spread' | 'rapid' | 'charged' | 'homing'

export type PowerUpType = 'bomb' | 'homing' | 'slowmo'

export type EnemyType = 'basic' | 'fast' | 'tank' | 'shooter' | 'elite'

export interface Vec2 {
  x: number
  y: number
}

export interface Player {
  x: number
  y: number
  z: number
  width: number
  height: number
  speed: number
  hp: number
  maxHp: number
  shield: number
  maxShield: number
  weaponLevel: number
  weaponType: WeaponType
  fireTimer: number
  fireRate: number
  invincible: number
  combo: number
  maxCombo: number
  comboMultiplier: number
  comboTimer: number
  score: number
  xp: number
  level: number
  kills: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  alive: boolean
  plane: PlaneType
  upgradeLevels: Record<string, number>
  activePowerups: Partial<Record<PowerUpType, number>>
  bombs: number
}

export interface Enemy {
  x: number
  y: number
  z: number
  width: number
  height: number
  hp: number
  maxHp: number
  speed: number
  type: EnemyType
  alive: boolean
  fireTimer: number
  fireRate: number
  vx: number
  vy: number
  shootAngle: number
  flashTimer: number
  eliteType?: number
  variant?: number
  spawnY?: number
  targetY?: number
  score: number
  coins: number
}

export interface Bullet {
  x: number
  y: number
  z: number
  width: number
  height: number
  speed: number
  vx: number
  vy: number
  damage: number
  isPlayer: boolean
  alive: boolean
  timer: number
  isHoming?: boolean
  homingTarget?: Enemy | null
  color?: string
  hit?: boolean
}

export interface Boss {
  x: number
  y: number
  z: number
  width: number
  height: number
  hp: number
  maxHp: number
  alive: boolean
  phase: number
  maxPhase: number
  fireTimer: number
  moveTimer: number
  movePattern: number
  vx: number
  vy: number
  spawnTimer: number
  deathTimer: number
  flashTimer: number
  introTimer: number
  level: number
  attackTimer: number
  ringRotation: number
  targetX: number
  targetY: number
}

export interface PowerUp {
  x: number
  y: number
  z: number
  width: number
  height: number
  type: PowerUpType
  alive: boolean
  vy: number
  bobTimer: number
  glowIntensity: number
}

export interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
  type: 'spark' | 'explosion' | 'trail' | 'text'
  text?: string
  textSize?: number
  gravity?: number
}

export interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  phase: number
}

export interface GameSettings {
  musicVolume: number
  sfxVolume: number
  joystickSize: number
  joystickOpacity: number
  joystickSensitivity: number
  autoFire: boolean
  aimAssist: boolean
  vibration: boolean
  quality: 'auto' | 'high' | 'low'
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  icon: string
}

export interface GameStats {
  totalGames: number
  totalScore: number
  highScore: number
  totalKills: number
  totalDeaths: number
  totalPlayTime: number
  bossesDefeated: number
  powerupsCollected: number
  maxCombo: number
  upgradesPurchased: number
}

export interface InputState {
  touchX: number
  touchY: number
  touchActive: boolean
  firing: boolean
  bombPressed: boolean
  pausePressed: boolean
  keys: Set<string>
  joystickAngle: number
  joystickMagnitude: number
  mouseX: number
  mouseY: number
  mouseActive: boolean
}

export interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  level: number
  kills: number
  plane: PlaneType
  timestamp: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  stats: GameStats
  settings: Partial<GameSettings>
  unlockedPlanes: PlaneType[]
  achievements: string[]
  totalScore: number
  createdAt: string
}
