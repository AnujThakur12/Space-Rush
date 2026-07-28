import { useGameStore } from '../store/gameStore'

const styles = {
  container: {
    position: 'fixed' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    zIndex: 10,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    userSelect: 'none' as const,
  },
  topLeft: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  topRight: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
    gap: 2,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 800,
    color: '#ffffff',
    textShadow: '0 0 12px rgba(0,200,255,0.4)',
    letterSpacing: '0.5px',
    fontVariantNumeric: 'tabular-nums' as const,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '1.5px',
    textAlign: 'right' as const,
  },
  barGroup: {
    background: 'linear-gradient(180deg, rgba(0,4,16,0.7), rgba(0,2,8,0.5))',
    border: '1px solid rgba(0,200,255,0.08)',
    borderRadius: 4,
    padding: '3px 6px',
    minWidth: 130,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '1px',
    opacity: 0.5,
  },
  statValue: {
    fontSize: 9,
    fontWeight: 600,
    color: '#fff',
    fontVariantNumeric: 'tabular-nums' as const,
  },
  barOuter: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    marginBottom: 2,
  },
  bombsRow: {
    display: 'flex',
    gap: 4,
    marginTop: 2,
  },
  weaponTag: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '1px 4px',
    borderRadius: 2,
    background: 'rgba(0,200,255,0.15)',
    color: '#00ccff',
    border: '1px solid rgba(0,200,255,0.2)',
  },
  comboArea: {
    position: 'absolute' as const,
    bottom: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center' as const,
    pointerEvents: 'none' as const,
  },
  bossArea: {
    position: 'absolute' as const,
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 3,
    width: 'min(320px, 50vw)',
    pointerEvents: 'none' as const,
  },
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={styles.barOuter}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        borderRadius: 2,
        transition: 'width 0.12s ease',
        boxShadow: `0 0 3px ${color}`,
      }} />
    </div>
  )
}

function Dot({ active, color }: { active: boolean; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 5, height: 5,
      borderRadius: '50%',
      background: active ? color : 'rgba(255,255,255,0.08)',
      boxShadow: active ? `0 0 4px ${color}` : 'none',
      transition: 'all 0.2s',
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
  const hpColor = hpPct > 50 ? '#00ff88' : hpPct > 25 ? '#ffaa00' : '#ff2244'
  const bossPct = bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0

  return (
    <div style={styles.container}>
      <div style={styles.topLeft}>
        <div style={styles.barGroup}>
          <div style={styles.statRow}>
            <span style={{ ...styles.statLabel, color: '#00ff88' }}>HP</span>
            <span style={styles.statValue}>{Math.ceil(hp)}</span>
          </div>
          <Bar pct={hpPct} color={hpColor} />
          {maxShield > 0 && (
            <>
              <div style={styles.statRow}>
                <span style={{ ...styles.statLabel, color: '#00e5ff' }}>SHD</span>
                <span style={styles.statValue}>{Math.ceil(shield)}</span>
              </div>
              <Bar pct={shieldPct} color="#00e5ff" />
            </>
          )}
          <div style={styles.statRow}>
            <span style={{ ...styles.statLabel, color: '#ffcc00' }}>WPN</span>
            <span style={styles.weaponTag}>SPREAD LV.1</span>
          </div>
          <div style={styles.bombsRow}>
            <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginRight: 2 }}>BMB</span>
            <Dot active color="#ff6600" />
            <Dot active color="#ff6600" />
            <Dot active={false} color="#ff6600" />
          </div>
        </div>
      </div>

      <div style={styles.topRight}>
        <div style={styles.scoreText}>
          {score.toLocaleString()}
        </div>
        <div style={styles.scoreLabel}>
          LVL {level.toString().padStart(2, '0')}
        </div>
      </div>

      {combo > 0 && (
        <div style={styles.comboArea}>
          <div style={{
            fontSize: combo >= 10 ? 18 : 14,
            fontWeight: 900,
            color: '#ffd700',
            textShadow: '0 0 12px rgba(255,215,0,0.5), 0 0 24px rgba(255,215,0,0.2)',
            letterSpacing: '1.5px',
          }}>
            {combo}x COMBO
          </div>
          <div style={{
            fontSize: 9, fontWeight: 600, color: '#cc8800',
            opacity: 0.5, letterSpacing: '1px', marginTop: 1,
          }}>
            x{comboMult.toFixed(1)} score
          </div>
        </div>
      )}

      {bossActive && (
        <div style={styles.bossArea}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '2px',
            color: '#ff4444', textShadow: '0 0 8px rgba(255,68,68,0.4)',
          }}>
            BOSS
          </div>
          <div style={{
            width: '100%', height: 3, borderRadius: 2,
            overflow: 'hidden', background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,68,68,0.12)',
          }}>
            <div style={{
              width: `${bossPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff2222, #ff8800)',
              borderRadius: 2,
              transition: 'width 0.12s ease',
              boxShadow: '0 0 4px rgba(255,68,0,0.4)',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}