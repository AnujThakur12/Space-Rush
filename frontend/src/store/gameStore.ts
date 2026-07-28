import { create } from 'zustand'
import type {
  GameState,
  GameSettings,
  GameStats,
  Achievement,
  Player,
  Enemy,
  Bullet,
  Boss,
  PowerUp,
  InputState,
  UserProfile,
  PlaneType,
} from '../types/game'

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  joystickSize: 0.5,
  joystickOpacity: 0.5,
  joystickSensitivity: 1,
  autoFire: true,
  aimAssist: true,
  vibration: true,
  quality: 'auto',
}

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  totalScore: 0,
  highScore: 0,
  totalKills: 0,
  totalDeaths: 0,
  totalPlayTime: 0,
  bossesDefeated: 0,
  powerupsCollected: 0,
  maxCombo: 0,
  upgradesPurchased: 0,
}

export interface Notification {
  id: number
  text: string
  color: string
  timer: number
}

export interface GameStore {
  screen: GameState
  settings: GameSettings
  stats: GameStats
  achievements: Achievement[]
  profile: UserProfile | null
  score: number
  highScore: number
  level: number
  playerHp: number
  playerMaxHp: number
  playerShield: number
  playerMaxShield: number
  combo: number
  comboMultiplier: number
  bossHp: number
  bossMaxHp: number
  bossActive: boolean
  notifications: Notification[]
  notificationIdCounter: number
  fadeTransition: boolean
  unlockedPlanes: PlaneType[]
  isLoading: boolean
  flashIntensity: number
  flashColor: string

  setScreen: (screen: GameState) => void
  updatePlayerHUD: (p: Player) => void
  updateBossHUD: (b: Boss | null) => void
  updateScore: (score: number, level: number) => void
  updateCombo: (combo: number, multiplier: number) => void
  addNotification: (text: string, color?: string) => void
  setSettings: (s: Partial<GameSettings>) => void
  setStats: (s: Partial<GameStats>) => void
  setAchievements: (a: Achievement[]) => void
  setProfile: (p: UserProfile | null) => void
  setFadeTransition: (v: boolean) => void
  setUnlockedPlanes: (p: PlaneType[]) => void
  setLoading: (v: boolean) => void
  setFlash: (intensity: number, color: string) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'loading',
  settings: loadSettings(),
  stats: { ...DEFAULT_STATS },
  achievements: [],
  profile: null,
  score: 0,
  highScore: loadHighScore(),
  level: 1,
  playerHp: 5,
  playerMaxHp: 5,
  playerShield: 0,
  playerMaxShield: 3,
  combo: 0,
  comboMultiplier: 1,
  bossHp: 0,
  bossMaxHp: 0,
  bossActive: false,
  notifications: [],
  notificationIdCounter: 0,
  fadeTransition: false,
  unlockedPlanes: ['default'],
  isLoading: true,
  flashIntensity: 0,
  flashColor: '#ffffff',

  setScreen: (screen) => set({ screen }),

  updatePlayerHUD: (p) =>
    set({
      playerHp: p.hp,
      playerMaxHp: p.maxHp,
      playerShield: p.shield,
      playerMaxShield: p.maxShield,
    }),

  updateBossHUD: (b) =>
    set({
      bossActive: b !== null && b.alive,
      bossHp: b?.hp ?? 0,
      bossMaxHp: b?.maxHp ?? 0,
    }),

  updateScore: (score, level) =>
    set({ score, level }),

  updateCombo: (combo, multiplier) =>
    set({ combo, comboMultiplier: multiplier }),

  addNotification: (text, color = '#fff') => {
    const id = get().notificationIdCounter + 1
    const notif: Notification = { id, text, color, timer: 2 }
    set((s) => ({
      notifications: [...s.notifications, notif],
      notificationIdCounter: id,
    }))
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      }))
    }, 2000)
  },

  setSettings: (s) => {
    const updated = { ...get().settings, ...s }
    localStorage.setItem('spacerush_settings', JSON.stringify(updated))
    set({ settings: updated })
  },

  setStats: (s) => set((st) => ({ stats: { ...st.stats, ...s } })),

  setAchievements: (a) => set({ achievements: a }),

  setProfile: (p) => set({ profile: p }),

  setFadeTransition: (v) => set({ fadeTransition: v }),

  setUnlockedPlanes: (p) => set({ unlockedPlanes: p }),

  setLoading: (v) => set({ isLoading: v }),
  setFlash: (intensity, color) => set({ flashIntensity: intensity, flashColor: color }),

  reset: () =>
    set({
      score: 0,
      level: 1,
      playerHp: 5,
      playerMaxHp: 5,
      playerShield: 0,
      playerMaxShield: 3,
      combo: 0,
      comboMultiplier: 1,
      bossHp: 0,
      bossMaxHp: 0,
      bossActive: false,
      notifications: [],
    }),
}))

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem('spacerush_settings')
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

function loadHighScore(): number {
  try {
    const raw = localStorage.getItem('spacerush_highscore')
    return raw ? parseInt(raw) || 0 : 0
  } catch {
    return 0
  }
}
