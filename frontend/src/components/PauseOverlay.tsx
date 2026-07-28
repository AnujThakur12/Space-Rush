interface PauseOverlayProps {
  onResume: () => void
  onQuit: () => void
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 30, fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
        color: '#fff', marginBottom: 24,
        textShadow: '0 0 20px rgba(255,255,255,0.3)',
      }}>
        PAUSED
      </div>
      <button
        onClick={onResume}
        style={btnStyle}
      >
        RESUME
      </button>
      <button
        onClick={onQuit}
        style={{ ...btnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        QUIT TO MENU
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
