import type { GameSettings, GameStats, PlaneType, LeaderboardEntry } from '../types/game'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export class StorageManager {
  private token: string | null = null
  private _loggedIn = false
  private _username = ''

  constructor() {
    this.token = localStorage.getItem('spacerush_token')
    this._username = localStorage.getItem('spacerush_username') || ''
    this._loggedIn = !!this.token
  }

  get(key: string): any {
    try {
      const raw = localStorage.getItem(`spacerush_${key}`)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  set(key: string, value: any): void {
    localStorage.setItem(`spacerush_${key}`, JSON.stringify(value))
  }

  getHighScore(): number {
    return this.get('highscore') || 0
  }

  setHighScore(score: number): void {
    const current = this.getHighScore()
    if (score > current) {
      this.set('highscore', score)
    }
  }

  getCoins(): number {
    return this.get('coins') || 0
  }

  addCoins(amount: number): void {
    this.set('coins', this.getCoins() + amount)
  }

  spendCoins(amount: number): boolean {
    const coins = this.getCoins()
    if (coins >= amount) {
      this.set('coins', coins - amount)
      return true
    }
    return false
  }

  getUpgradeLevel(key: string): number {
    return this.get(`upgrade_${key}`) || 0
  }

  setUpgradeLevel(key: string, level: number): void {
    this.set(`upgrade_${key}`, level)
  }

  getUpgrades(): Record<string, number> {
    const out: Record<string, number> = {}
    for (const k of ['health', 'damage', 'speed', 'fireRate', 'armor']) {
      const v = this.getUpgradeLevel(k)
      if (v > 0) out[k] = v
    }
    return out
  }

  getUnlockedPlanes(): PlaneType[] {
    return this.get('unlockedPlanes') || ['default']
  }

  unlockPlane(plane: PlaneType): void {
    const planes = this.getUnlockedPlanes()
    if (!planes.includes(plane)) {
      planes.push(plane)
      this.set('unlockedPlanes', planes)
    }
  }

  getSelectedPlane(): PlaneType {
    return this.get('selectedPlane') || 'default'
  }

  selectPlane(plane: PlaneType): void {
    this.set('selectedPlane', plane)
  }

  getSettings(): GameSettings {
    const raw = localStorage.getItem('spacerush_settings')
    if (raw) return JSON.parse(raw)
    return {
      musicVolume: 0.5, sfxVolume: 0.7,
      autoFire: true, vibration: true, quality: 'auto', touchControlMode: 'drag',
    }
  }

  saveSettings(s: GameSettings): void {
    localStorage.setItem('spacerush_settings', JSON.stringify(s))
  }

  getStats(): GameStats {
    return this.get('stats') || {
      totalGames: 0, totalScore: 0, highScore: 0,
      totalKills: 0, totalDeaths: 0, totalPlayTime: 0,
      bossesDefeated: 0, powerupsCollected: 0,
      maxCombo: 0, upgradesPurchased: 0,
    }
  }

  saveStats(s: GameStats): void {
    this.set('stats', s)
  }

  getAchievements(): { id: string; name: string; description: string; unlocked: boolean }[] {
    return this.get('achievements') || []
  }

  unlockAchievement(id: string, name: string, description: string): boolean {
    const achievements = this.getAchievements()
    if (achievements.find((a: any) => a.id === id)) return false
    achievements.push({ id, name, description, unlocked: true })
    this.set('achievements', achievements)
    return true
  }

  isLoggedIn(): boolean {
    return this._loggedIn
  }

  getUsername(): string {
    return this._username
  }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        this.token = data.token
        this._username = data.username || email
        this._loggedIn = true
        localStorage.setItem('spacerush_token', data.token)
        localStorage.setItem('spacerush_username', this._username)
        if (data.data) this.applyCloudData(data.data)
        return { ok: true }
      }
      return { ok: false, error: data.error || 'Login failed' }
    } catch {
      this._offlineSave()
      return { ok: false, error: 'Server unavailable - saved offline' }
    }
  }

  async register(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        this.token = data.token
        this._username = data.username || email
        this._loggedIn = true
        localStorage.setItem('spacerush_token', data.token)
        localStorage.setItem('spacerush_username', this._username)
        if (data.data) this.applyCloudData(data.data)
        return { ok: true }
      }
      return { ok: false, error: data.error || 'Registration failed' }
    } catch {
      return { ok: false, error: 'Server unavailable' }
    }
  }

  async logout(): Promise<void> {
    this.token = null
    this._loggedIn = false
    this._username = ''
    localStorage.removeItem('spacerush_token')
    localStorage.removeItem('spacerush_username')
  }

  async saveCloud(): Promise<boolean> {
    if (!this._loggedIn || !this.token) return false
    try {
      const data = {
        stats: this.getStats(),
        coins: this.getCoins(),
        unlockedPlanes: this.getUnlockedPlanes(),
        selectedPlane: this.getSelectedPlane(),
        upgrades: this.getUpgrades(),
      }
      const res = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
        body: JSON.stringify({ data }),
      })
      return res.ok
    } catch { return false }
  }

  async loadCloud(): Promise<boolean> {
    if (!this._loggedIn || !this.token) return false
    try {
      const res = await fetch(`${API_URL}/data`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      if (!res.ok) return false
      const json = await res.json()
      if (json.data) this.applyCloudData(json.data)
      return true
    } catch { return false }
  }

  async deleteAccount(): Promise<{ ok: boolean; error?: string }> {
    let serverOk = false
    try {
      const res = await fetch(`${API_URL}/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token || ''}` },
      })
      serverOk = res.ok
    } catch { serverOk = false }
    this.resetProgress()
    return serverOk ? { ok: true } : { ok: true, error: 'Server unreachable - local progress cleared' }
  }

  private applyCloudData(data: any): void {
    if (!data || typeof data !== 'object') return

    const stats = this.getStats()
    if (data.stats && typeof data.stats === 'object') Object.assign(stats, data.stats)
    if (typeof data.highScore === 'number' && data.highScore > stats.highScore) stats.highScore = data.highScore
    if (typeof data.totalKills === 'number' && data.totalKills > stats.totalKills) stats.totalKills = data.totalKills
    this.saveStats(stats)

    if (typeof data.coins === 'number') this.set('coins', data.coins)
    if (Array.isArray(data.unlockedPlanes) && data.unlockedPlanes.length) {
      this.set('unlockedPlanes', data.unlockedPlanes)
    }
    if (data.selectedPlane) this.selectPlane(data.selectedPlane)
    if (data.upgrades && typeof data.upgrades === 'object') {
      for (const [k, v] of Object.entries(data.upgrades)) {
        this.setUpgradeLevel(k, Number(v))
      }
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      return JSON.parse(localStorage.getItem('spacerush_leaderboard') || '[]')
    } catch {
      return []
    }
  }

  addLocalLeaderboard(entry: LeaderboardEntry): void {
    const lb = JSON.parse(localStorage.getItem('spacerush_leaderboard') || '[]')
    lb.push(entry)
    lb.sort((a: any, b: any) => b.score - a.score)
    if (lb.length > 100) lb.length = 100
    localStorage.setItem('spacerush_leaderboard', JSON.stringify(lb))
  }

  resetProgress(): void {
    const settings = this.getSettings()
    localStorage.clear()
    this.saveSettings(settings)
    this.token = null
    this._loggedIn = false
    this._username = ''
  }

  private _offlineSave(): void {
    this.set('pending_save', true)
  }
}

export const storageManager = new StorageManager()
