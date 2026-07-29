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
  panelLeft: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  panelTopRight: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
    gap: 2,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 800,
    color: '#ffffff',
    textShadow: '0 0 15px rgba(0,180,255,0.3), 0 0 30px rgba(0,100,255,0.1)',
    letterSpacing: '0.5px',
    fontVariantNumeric: 'tabular-nums' as const,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '2px',
    textAlign: 'right' as const,
  },
  glassPanel: {
    background: 'linear-gradient(180deg, rgba(0,4,20,0.75), rgba(0,2,10,0.55))',
    border: '1px solid rgba(0,180,255,0.12)',
    borderRadius: 6,
    padding: '6px 10px',
    minWidth: 145,
    backdropFilter: 'blur(4px)',
    boxShadow: '0 0 20px rgba(0,80,255,0.05), inset 0 0 20px rgba(0,80,255,0.03)',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '1.5px',
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
    alignItems: 'center',
  },
  weaponTag: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '1px 5px',
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,100,255,0.08))',
    color: '#00ccff',
    border: '1px solid rgba(0,200,255,0.2)',
  },
  comboArea: {
    position: 'absolute' as const,
    bottom: '28%',
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
    gap: 4,
    width: 'min(360px, 55vw)',
    pointerEvents: 'none' as const,
  },
}

function Bar({ pct, color, label }: { pct: number; color: string; label?: string }) {
  return (
    <div style={styles.barOuter}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        borderRadius: 2,
        transition: 'width 0.1s ease',
        boxShadow: `0 0 4px ${color}`,
      }} />
    </div>
  )
}

function BombDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: active ? 'linear-gradient(135deg, #ff8800, #ff4400)' : 'rgba(255,255,255,0.06)',
      boxShadow: active ? '0 0 6px rgba(255,136,0,0.5)' : 'none',
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
      <div style={styles.panelLeft}>
        <div style={styles.glassPanel}>
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
            <span style={styles.weaponTag}>SPREAD</span>
          </div>
          <div style={styles.bombsRow}>
            <span style={{
              fontSize: 7,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '1px',
              marginRight: 2,
            }}>
              BMB
            </span>
            <BombDot active />
            <BombDot active />
            <BombDot active={false} />
          </div>
        </div>
      </div>

      <div style={styles.panelTopRight}>
        <div style={{
          ...styles.glassPanel,
          padding: '4px 12px',
          minWidth: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          <div style={styles.scoreText}>
            {score.toLocaleString()}
          </div>
          <div style={styles.scoreLabel}>
            LVL {level.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {combo > 0 && (
        <div style={styles.comboArea}>
          <div style={{
            fontSize: combo >= 10 ? 20 : 16,
            fontWeight: 900,
            color: '#ffd700',
            textShadow: '0 0 15px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2)',
            letterSpacing: '2px',
            animation: 'pulse 0.5s ease-in-out',
          }}>
            {combo}x COMBO
          </div>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            color: '#cc8800',
            opacity: 0.5,
            letterSpacing: '1px',
            marginTop: 1,
          }}>
            x{comboMult.toFixed(1)} score
          </div>
        </div>
      )}

      {bossActive && (
        <div style={styles.bossArea}>
          <div style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '3px',
            color: '#ff4444',
            textShadow: '0 0 10px rgba(255,68,68,0.5)',
          }}>
            BOSS
          </div>
          <div style={{
            width: '100%',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            background: 'rgba(255,0,0,0.05)',
            border: '1px solid rgba(255,68,68,0.15)',
            boxShadow: '0 0 10px rgba(255,0,0,0.05)',
          }}>
            <div style={{
              width: `${bossPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff2222, #ff6600, #ffaa00)',
              borderRadius: 2,
              transition: 'width 0.1s ease',
              boxShadow: '0 0 6px rgba(255,68,0,0.4)',
            }} />
          </div>
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 7,
            fontWeight: 600,
            color: 'rgba(255,68,68,0.3)',
            letterSpacing: '0.5px',
          }}>
            <span>CAPITAL SIGNAL</span>
            <span>{Math.ceil(bossHp)}/{Math.ceil(bossMaxHp)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
