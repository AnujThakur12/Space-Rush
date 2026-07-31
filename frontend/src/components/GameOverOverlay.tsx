import { useGameStore } from '../store/gameStore'

interface GameOverOverlayProps {
  onRestart: () => void
  onMenu: () => void
}

export function GameOverOverlay({ onRestart, onMenu }: GameOverOverlayProps) {
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const isNewHigh = useGameStore((s) => s.lastNewHigh)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 30, fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#ff4444', marginBottom: 16 }}>
        GAME OVER
      </div>
      {isNewHigh && (
        <div style={{ fontSize: 14, color: '#ffd700', marginBottom: 8, fontWeight: 700 }}>
          NEW HIGH SCORE!
        </div>
      )}
      <div style={{ fontSize: 16, color: '#fff', marginBottom: 4 }}>
        Score: <span style={{ color: '#ffd700', fontWeight: 700 }}>{score.toLocaleString()}</span>
      </div>
      <div style={{ fontSize: 14, color: '#88bbff', marginBottom: 24 }}>
        Level Reached: {level}
      </div>
      <button
        onClick={onRestart}
        style={btnStyle}
      >
        PLAY AGAIN
      </button>
      <button
        onClick={onMenu}
        style={{ ...btnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        MAIN MENU
      </button>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '12px 40px',
  margin: 4,
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, #4488ff, #2266dd)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  letterSpacing: '0.05em',
}
