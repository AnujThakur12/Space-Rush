const ASSET_PATH = '/assets/images'

const SPRITE_MAP: Record<string, string> = {
  player_falcon: `${ASSET_PATH}/player_falcon.png`,
  player_eagle: `${ASSET_PATH}/player_eagle.png`,
  player_raptor: `${ASSET_PATH}/player_raptor.png`,
  player_phantom: `${ASSET_PATH}/player_phantom.png`,
  player_stealth_x: `${ASSET_PATH}/player_stealth-x.png`,
  player_damaged: `${ASSET_PATH}/playerDamaged.png`,
  player_left: `${ASSET_PATH}/playerLeft.png`,
  player_right: `${ASSET_PATH}/playerRight.png`,

  enemy_drone: `${ASSET_PATH}/enemy_drone.png`,
  enemy_fighter: `${ASSET_PATH}/enemy_fighter.png`,
  enemy_bomber: `${ASSET_PATH}/enemy_bomber.png`,
  enemy_elite: `${ASSET_PATH}/enemy_elite.png`,
  enemy_stealth: `${ASSET_PATH}/enemy_stealth.png`,
  enemy_ship: `${ASSET_PATH}/enemyShip.png`,
  enemy_ufo: `${ASSET_PATH}/enemyUFO.png`,

  boss_missile_commander: `${ASSET_PATH}/boss_missile_commander.png`,
  boss_fortress_bomber: `${ASSET_PATH}/boss_fortress_bomber.png`,
  boss_stealth_titan: `${ASSET_PATH}/boss_stealth_titan.png`,
  boss_air_carrier: `${ASSET_PATH}/boss_air_carrier.png`,

  laser_green: `${ASSET_PATH}/laserGreen.png`,
  laser_red: `${ASSET_PATH}/laserRed.png`,
  laser_green_shot: `${ASSET_PATH}/laserGreenShot.png`,
  laser_red_shot: `${ASSET_PATH}/laserRedShot.png`,
  bullet_enemy: `${ASSET_PATH}/bullet_enemy.png`,

  powerup_health: `${ASSET_PATH}/powerup_health.png`,
  powerup_shield: `${ASSET_PATH}/powerup_shield.png`,
  powerup_extra_life: `${ASSET_PATH}/powerup_extra_life.png`,
  powerup_coins: `${ASSET_PATH}/powerup_coins.png`,
  powerup_double_damage: `${ASSET_PATH}/powerup_double_damage.png`,
  powerup_rapid_fire: `${ASSET_PATH}/powerup_rapid_fire.png`,
  powerup_coin_magnet: `${ASSET_PATH}/powerup_coin_magnet.png`,

  ui_shield: `${ASSET_PATH}/ui_shield.png`,
  ui_life: `${ASSET_PATH}/ui_life.png`,

  bg_stars: `${ASSET_PATH}/Background/starBackground.png`,
  bg_nebula: `${ASSET_PATH}/Background/nebula.png`,
  bg_star_big: `${ASSET_PATH}/Background/starBig.png`,
  bg_star_small: `${ASSET_PATH}/Background/starSmall.png`,
  bg_speed_line: `${ASSET_PATH}/Background/speedLine.png`,
}

class SpriteManager {
  private cache = new Map<string, HTMLImageElement>()
  private loaded = false
  private loadPromise: Promise<void> | null = null

  get(key: string): HTMLImageElement | undefined {
    return this.cache.get(key)
  }

  isLoading(): boolean {
    return !this.loaded
  }

  async loadAll(): Promise<void> {
    if (this.loadPromise) return this.loadPromise
    if (this.loaded) return

    this.loadPromise = new Promise<void>((resolve) => {
      const entries = Object.entries(SPRITE_MAP)
      let loaded = 0
      const total = entries.length

      if (total === 0) {
        this.loaded = true
        resolve()
        return
      }

      for (const [key, url] of entries) {
        const img = new Image()
        img.onload = () => {
          this.cache.set(key, img)
          loaded++
          if (loaded >= total) {
            this.loaded = true
            resolve()
          }
        }
        img.onerror = () => {
          loaded++
          if (loaded >= total) {
            this.loaded = true
            resolve()
          }
        }
        img.src = url
      }
    })

    return this.loadPromise
  }
}

export const spriteManager = new SpriteManager()
