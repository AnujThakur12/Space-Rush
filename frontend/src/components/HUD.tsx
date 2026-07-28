import { useGameStore } from '../store/gameStore'

const neonCyan = '#00e5ff'
const neonGreen = '#00ff88'
const neonRed = '#ff2244'
const neonGold = '#ffd700'
const neonOrange = '#ff8800'

const glassBg: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,10,30,0.7), rgba(0,5,20,0.5))',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(0,229,255,0.15)',
  borderRadius: 6,
  boxShadow: '0 0 20px rgba(0,229,255,0.05), inset 0 0 20px rgba(0,229,255,0.02)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '1.5px',
  color: neonCyan,
  opacity: 0.7,
}

const barOuter: React.CSSProperties = {
  height: 5,
  borderRadius: 3,
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.04)',
}

function innerBar(pct: number, color: string, glow: string): React.CSSProperties {
  const safePct = Math.max(0, Math.min(100, pct))
  return {
    width: `${safePct}%`,
    height: '100%',
    background: `linear-gradient(90deg, ${color}, ${glow})`,
    borderRadius: 3,
    transition: 'width 0.15s ease',
    boxShadow: `0 0 6px ${color}`,
  }
}

function PulseDot({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: color,
      marginRight: 4,
      boxShadow: `0 0 6px ${color}`,
      animation: 'pulse 1s ease-in-out infinite',
    }} />
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
  const hpColor = hpPct > 50 ? neonGreen : hpPct > 25 ? neonGold : neonRed
  const hpGlow = hpPct > 50 ? '#00ff44' : hpPct > 25 ? '#ffaa00' : '#ff0044'

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'none',
    zIndex: 10,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  }

  return (
    <div style={containerStyle}>
      <div style={{ ...glassBg, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={labelStyle}>
            <PulseDot color={hpPct > 25 ? neonGreen : neonRed} />
            HP
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {Math.ceil(hp)}<span style={{ opacity: 0.4, margin: '0 1px' }}>/</span>{maxHp}
          </span>
        </div>
        <div style={barOuter}>
          <div style={innerBar(hpPct, hpColor, hpGlow)} />
        </div>

        {maxShield > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>
                <PulseDot color={neonCyan} />
                SHD
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: neonCyan, fontVariantNumeric: 'tabular-nums' }}>
                {Math.ceil(shield)}<span style={{ opacity: 0.4, margin: '0 1px' }}>/</span>{maxShield}
              </span>
            </div>
            <div style={barOuter}>
              <div style={innerBar(shieldPct, neonCyan, '#00ffff')} />
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#fff',
          textShadow: `0 0 30px ${neonCyan}44, 0 0 60px ${neonCyan}22`,
          letterSpacing: '1px',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {score.toLocaleString()}
        </div>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: neonCyan,
          letterSpacing: '2px',
          textShadow: `0 0 10px ${neonCyan}44`,
          opacity: 0.8,
        }}>
          LVL {level.toString().padStart(2, '0')}
        </div>
      </div>

      {combo > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: combo >= 10 ? 24 : 18,
            fontWeight: 900,
            color: neonGold,
            textShadow: `0 0 20px ${neonGold}88, 0 0 40px ${neonGold}44`,
            letterSpacing: '2px',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}>
            {combo}x COMBO
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: neonOrange,
            opacity: 0.7,
            letterSpacing: '1px',
            marginTop: 2,
          }}>
            x{comboMult.toFixed(1)} score
          </div>
        </div>
      )}

      {bossActive && (
        <div style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          right: 14,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 8,
              fontWeight: 700,
              color: neonRed,
              letterSpacing: '1.5px',
              textShadow: `0 0 10px ${neonRed}66`,
            }}>
              BOSS
            </div>
            <div style={{
              fontSize: 8,
              fontWeight: 600,
              color: '#fff',
              opacity: 0.6,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {Math.ceil(bossHp)}/{bossMaxHp}
            </div>
          </div>
          <div style={{
            width: 6,
            height: 'min(180px, 25vh)',
            background: 'rgba(255,0,0,0.06)',
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${neonRed}22`,
            boxShadow: `0 0 10px ${neonRed}22`,
          }}>
            <div style={{
              width: '100%',
              height: `${bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0}%`,
              background: `linear-gradient(to top, ${neonRed}, ${neonOrange})`,
              borderRadius: 3,
              position: 'absolute',
              bottom: 0,
              transition: 'height 0.15s ease',
              boxShadow: `0 0 8px ${neonRed}66`,
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
