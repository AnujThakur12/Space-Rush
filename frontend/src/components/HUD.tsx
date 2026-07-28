import { useGameStore } from '../store/gameStore'

const neonInactive = '#ffffff15'
const glassBg: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(0,5,20,0.75), rgba(0,2,10,0.55))',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(0,229,255,0.1)',
  borderRadius: 4,
}

function barOuter(color = 'rgba(255,255,255,0.04)') {
  return {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden' as const,
    background: color,
  }
}

function barInner(pct: number, color: string): React.CSSProperties {
  return {
    width: `${Math.max(0, Math.min(100, pct))}%`,
    height: '100%',
    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
    borderRadius: 2,
    transition: 'width 0.15s ease',
    boxShadow: `0 0 4px ${color}`,
  }
}

function Dot({ active, color }: { active: boolean; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 4, height: 4,
      borderRadius: '50%',
      background: active ? color : neonInactive,
      boxShadow: active ? `0 0 4px ${color}` : 'none',
      marginRight: 5,
      transition: 'all 0.3s',
    }} />
  )
}

function StatLabel({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.2px', color, opacity: 0.6 }}>{label}</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

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
  const hpColor = hpPct > 50 ? '#00ff88' : hpPct > 25 ? '#ffaa00' : '#ff2244'

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      padding: '8px 12px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none', zIndex: 10,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ ...glassBg, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
        <StatLabel label="HP" value={`${Math.ceil(hp)}/${maxHp}`} color="#00ff88" />
        <div style={barOuter()}>
          <div style={barInner(hpPct, hpColor)} />
        </div>
        {maxShield > 0 && (
          <>
            <StatLabel label="SHD" value={`${Math.ceil(shield)}/${maxShield}`} color="#00e5ff" />
            <div style={barOuter()}>
              <div style={barInner(shieldPct, '#00e5ff')} />
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{
          fontSize: 24, fontWeight: 800,
          color: '#fff',
          textShadow: '0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.15)',
          letterSpacing: '0.5px',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {score.toLocaleString()}
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700,
          color: '#00e5ff', letterSpacing: '1.5px',
          textShadow: '0 0 8px rgba(0,229,255,0.3)',
          opacity: 0.7,
        }}>
          LVL {level.toString().padStart(2, '0')}
        </div>
      </div>

      {combo > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          textAlign: 'center',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{
            fontSize: combo >= 10 ? 20 : 16,
            fontWeight: 900,
            color: '#ffd700',
            textShadow: '0 0 15px rgba(255,215,0,0.6), 0 0 30px rgba(255,215,0,0.3)',
            letterSpacing: '1.5px',
          }}>
            {combo}x COMBO
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600, color: '#ff8800',
            opacity: 0.6, letterSpacing: '1px', marginTop: 1,
          }}>
            x{comboMult.toFixed(1)} score
          </div>
        </div>
      )}

      {bossActive && (
        <div style={{
          position: 'fixed',
          bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'none',
          width: 'min(300px, 60vw)',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: '#ff4444', textShadow: '0 0 10px rgba(255,68,68,0.5)',
          }}>
            BOSS
          </div>
          <div style={{
            width: '100%', height: 4, borderRadius: 2,
            overflow: 'hidden', background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,68,68,0.15)',
          }}>
            <div style={{
              width: `${bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff2222, #ff8800)',
              borderRadius: 2,
              transition: 'width 0.15s ease',
              boxShadow: '0 0 6px rgba(255,68,0,0.5)',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
