import { useGameStore } from '../store/gameStore'

const barStyle: React.CSSProperties = {
  height: 8,
  borderRadius: 4,
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.1)',
}

const innerBar = (pct: number, color: string): React.CSSProperties => ({
  width: `${pct}%`,
  height: '100%',
  background: color,
  borderRadius: 4,
  transition: 'width 0.2s',
})

export function HUD() {
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const hp = useGameStore((s) => s.playerHp)
  const maxHp = useGameStore((s) => s.playerMaxHp)
  const shield = useGameStore((s) => s.playerShield)
  const maxShield = useGameStore((s) => s.playerMaxShield)
  const combo = useGameStore((s) => s.combo)
  const comboMult = useGameStore((s) => s.comboMultiplier)
  const bossActive = useGameStore((s) => s.bossActive)
  const bossHp = useGameStore((s) => s.bossHp)
  const bossMaxHp = useGameStore((s) => s.bossMaxHp)

  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 100
  const shieldPct = maxShield > 0 ? (shield / maxShield) * 100 : 0

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none', zIndex: 10,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 11 }}>
          <span>HP</span>
          <span>{Math.ceil(hp)}/{maxHp}</span>
        </div>
        <div style={barStyle}>
          <div style={innerBar(hpPct, hpPct > 25 ? '#44ff44' : '#ff4444')} />
        </div>
        {maxShield > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#88bbff', fontSize: 11 }}>
              <span>SHIELD</span>
              <span>{Math.ceil(shield)}/{maxShield}</span>
            </div>
            <div style={barStyle}>
              <div style={innerBar(shieldPct, '#4488ff')} />
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'right', color: '#fff' }}>
        <div style={{ fontSize: 24, fontWeight: 700, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          {score.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: '#88bbff' }}>
          LEVEL {level}
        </div>
      </div>

      {combo > 0 && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          color: '#ffd700', fontSize: combo >= 10 ? 22 : 16, fontWeight: 700,
          textShadow: '0 0 15px rgba(255,215,0,0.5)',
          pointerEvents: 'none',
        }}>
          {combo}x COMBO (x{comboMult.toFixed(1)})
        </div>
      )}

      {bossActive && (
        <div style={{
          position: 'fixed', top: '50%', right: 12,
          transform: 'translateY(-50%)',
          width: 8, height: 'min(200px, 30vh)',
          background: 'rgba(255,0,0,0.1)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            width: '100%',
            height: `${bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0}%`,
            background: 'linear-gradient(to top, #ff4444, #ff8800)',
            borderRadius: 4,
            position: 'absolute',
            bottom: 0,
            transition: 'height 0.2s',
          }} />
        </div>
      )}
    </div>
  )
}
