import { useGameStore } from '../store/gameStore'

const glassBg: React.CSSProperties = {
  background: 'rgba(5, 5, 16, 0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
}

const barOuter: React.CSSProperties = {
  height: 6,
  borderRadius: 3,
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.06)',
}

const innerBar = (pct: number, color: string): React.CSSProperties => ({
  width: `${pct}%`,
  height: '100%',
  background: color,
  borderRadius: 3,
  transition: 'width 0.2s ease',
  boxShadow: `0 0 6px ${color}`,
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
      padding: '10px 14px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none', zIndex: 10,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ ...glassBg, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: hpPct > 25 ? '#44ff88' : '#ff4444', fontSize: 10, fontWeight: 600, letterSpacing: '0.5px' }}>
          <span>HP</span>
          <span>{Math.ceil(hp)}/{maxHp}</span>
        </div>
        <div style={barOuter}>
          <div style={innerBar(hpPct, hpPct > 25 ? '#44ff88' : '#ff4444')} />
        </div>
        {maxShield > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#66bbff', fontSize: 10, fontWeight: 600, letterSpacing: '0.5px' }}>
              <span>SHIELD</span>
              <span>{Math.ceil(shield)}/{maxShield}</span>
            </div>
            <div style={barOuter}>
              <div style={innerBar(shieldPct, '#4488ff')} />
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 26, fontWeight: 800,
          color: '#fff',
          textShadow: '0 0 20px rgba(68,136,255,0.4), 0 0 40px rgba(68,136,255,0.2)',
          letterSpacing: '1px',
        }}>
          {score.toLocaleString()}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: '#88bbff', letterSpacing: '1.5px',
          textShadow: '0 0 10px rgba(68,136,255,0.3)',
        }}>
          LEVEL {level}
        </div>
      </div>

      {combo > 0 && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          color: '#ffd700', fontSize: combo >= 10 ? 22 : 16, fontWeight: 700,
          textShadow: '0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3)',
          pointerEvents: 'none',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {combo}x COMBO
          <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>x{comboMult.toFixed(1)}</span>
        </div>
      )}

      {bossActive && (
        <div style={{
          position: 'fixed', top: '50%', right: 14,
          transform: 'translateY(-50%)',
          width: 8, height: 'min(200px, 30vh)',
          background: 'rgba(255,0,0,0.08)',
          borderRadius: 4, overflow: 'hidden',
          border: '1px solid rgba(255,68,68,0.2)',
          boxShadow: '0 0 10px rgba(255,0,0,0.2)',
        }}>
          <div style={{
            width: '100%',
            height: `${bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0}%`,
            background: 'linear-gradient(to top, #ff2222, #ff8800)',
            borderRadius: 4,
            position: 'absolute',
            bottom: 0,
            transition: 'height 0.2s',
            boxShadow: '0 0 8px rgba(255,68,0,0.4)',
          }} />
        </div>
      )}
    </div>
  )
}
