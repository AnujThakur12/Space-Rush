import { useGameStore } from '../store/gameStore'
import type { WeaponType } from '../types/game'

const WEAPON_LABELS: Record<WeaponType, string[]> = {
  spread: ['SINGLE', 'DUAL', 'TRIPLE', 'SPREAD', 'WIDE SPREAD'],
  rapid: ['RAPID'],
  charged: ['CHARGED'],
  homing: ['HOMING'],
}

function getWeaponLabel(wt: WeaponType, wl: number): string {
  const labels = WEAPON_LABELS[wt]
  return labels[Math.min(wl - 1, labels.length - 1)] || wt.toUpperCase()
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginBottom: 3 }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        borderRadius: 3,
        transition: 'width 0.1s ease',
        boxShadow: `0 0 6px ${color}`,
      }} />
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
  const weaponLevel = useGameStore((s) => s.weaponLevel)
  const weaponType = useGameStore((s) => s.weaponType)
  const combo = useGameStore((s) => s.combo)
  const comboMult = useGameStore((s) => s.comboMultiplier)
  const bossActive = useGameStore((s) => s.bossActive)
  const bossHp = useGameStore((s) => s.bossHp)
  const bossMaxHp = useGameStore((s) => s.bossMaxHp)

  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 100
  const shieldPct = maxShield > 0 ? (shield / maxShield) * 100 : 0
  const hpColor = hpPct > 50 ? '#00ff88' : hpPct > 25 ? '#ffaa00' : '#ff2244'
  const bossPct = bossMaxHp > 0 ? (bossHp / bossMaxHp) * 100 : 0

  const glassPanel: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(0,4,20,0.8), rgba(0,2,10,0.6))',
    border: '1px solid rgba(0,180,255,0.12)',
    borderRadius: 8,
    padding: '8px 12px',
    minWidth: 170,
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    boxShadow: '0 0 20px rgba(0,80,255,0.05), inset 0 0 20px rgba(0,80,255,0.03)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", userSelect: 'none',
    }}>
      {/* Top-left: HP, Shield, Weapon */}
      <div style={{
        position: 'absolute',
        top: 'max(50px, env(safe-area-inset-top, 50px))',
        left: 'max(12px, env(safe-area-inset-left, 12px))',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        <div style={glassPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#00ff88' }}>HP</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{Math.ceil(hp)}</span>
          </div>
          <Bar pct={hpPct} color={hpColor} />
          {maxShield > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#00e5ff' }}>SHD</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{Math.ceil(shield)}</span>
              </div>
              <Bar pct={shieldPct} color="#00e5ff" />
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#ffcc00' }}>WPN</span>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '1px', padding: '2px 6px',
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,100,255,0.1))',
              color: '#00ccff', border: '1px solid rgba(0,200,255,0.25)',
            }}>
              LVL {weaponLevel} {getWeaponLabel(weaponType, weaponLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* Top-right: Score + Level */}
      <div style={{
        position: 'absolute',
        top: 'max(50px, env(safe-area-inset-top, 50px))',
        right: 'max(12px, env(safe-area-inset-right, 12px))',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3,
      }}>
        <div style={{
          ...glassPanel,
          padding: '6px 14px',
          minWidth: 'auto',
        }}>
          <div style={{
            fontSize: 'clamp(20px, 3.5vw, 28px)',
            fontWeight: 800, color: '#ffffff',
            textShadow: '0 0 15px rgba(0,180,255,0.3), 0 0 30px rgba(0,100,255,0.1)',
            letterSpacing: '0.5px',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            {score.toLocaleString()}
          </div>
          <div style={{
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px', textAlign: 'right', marginTop: 2,
          }}>
            LVL {level.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Center combo */}
      {combo > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: combo >= 10 ? 'clamp(18px, 3.5vw, 24px)' : 'clamp(15px, 3vw, 20px)',
            fontWeight: 900, color: '#ffd700',
            textShadow: '0 0 15px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2)',
            letterSpacing: '2px',
          }}>
            {combo}x COMBO
          </div>
          <div style={{
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 600, color: '#cc8800',
            opacity: 0.5, letterSpacing: '1px',
            marginTop: 2,
          }}>
            x{comboMult.toFixed(1)} score
          </div>
        </div>
      )}

      {/* Bottom center: Boss HP */}
      {bossActive && (
        <div style={{
          position: 'absolute',
          bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          width: 'min(400px, 60vw)',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 700, letterSpacing: '3px',
            color: '#ff4444',
            textShadow: '0 0 10px rgba(255,68,68,0.5)',
          }}>
            BOSS
          </div>
          <div style={{
            width: '100%', height: 5, borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,68,68,0.15)',
            boxShadow: '0 0 10px rgba(255,0,0,0.05)',
          }}>
            <div style={{
              width: `${bossPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff2222, #ff6600, #ffaa00)',
              borderRadius: 3,
              transition: 'width 0.1s ease',
              boxShadow: '0 0 8px rgba(255,68,0,0.4)',
            }} />
          </div>
          <div style={{
            width: '100%', display: 'flex', justifyContent: 'space-between',
            fontSize: 'clamp(7px, 1.2vw, 8px)',
            fontWeight: 600, color: 'rgba(255,68,68,0.35)',
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
