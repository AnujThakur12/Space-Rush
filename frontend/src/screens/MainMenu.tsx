import { useGameStore } from '../store/gameStore'

interface MainMenuProps {
  onStart: () => void
}

const menuItems = [
  { label: 'PLAY', action: 'start' },
  { label: 'PLANE SELECT', action: 'plane_select' },
  { label: 'UPGRADES', action: 'upgrades' },
  { label: 'LEADERBOARDS', action: 'leaderboards' },
  { label: 'SETTINGS', action: 'settings' },
  { label: 'ACCOUNT', action: 'account' },
  { label: 'ACHIEVEMENTS', action: 'achievements' },
]

export function MainMenu({ onStart }: MainMenuProps) {
  const setScreen = useGameStore((s) => s.setScreen)
  const highScore = useGameStore((s) => s.highScore)
  const coins = useGameStore((s) => s.stats.totalScore)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10, fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: 'rgba(0,0,0,0.85)',
    }}>
      <div style={{
        fontSize: 'clamp(2rem, 7vw, 4rem)',
        fontWeight: 700,
        color: '#4488ff',
        textShadow: '0 0 30px rgba(68,136,255,0.5)',
        letterSpacing: '0.15em',
        marginBottom: 4,
      }}>
        SPACE RUSH
      </div>
      <div style={{ color: '#88bbff', fontSize: '0.85rem', opacity: 0.7, marginBottom: 40 }}>
        Endless Space
      </div>

      {highScore > 0 && (
        <div style={{ color: '#ffd700', fontSize: 13, marginBottom: 16 }}>
          High Score: {highScore.toLocaleString()}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {menuItems.map((item) => (
          <button
            key={item.action}
            onClick={() => {
              if (item.action === 'start') onStart()
              else setScreen(item.action as any)
            }}
            style={menuBtnStyle}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const menuBtnStyle: React.CSSProperties = {
  padding: '10px 48px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, rgba(68,136,255,0.3), rgba(34,102,221,0.2))',
  border: '1px solid rgba(68,136,255,0.3)',
  borderRadius: 8,
  cursor: 'pointer',
  letterSpacing: '0.08em',
  transition: 'all 0.2s',
  textAlign: 'center',
  minWidth: 220,
}
