import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'

export function AchievementsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const achievements = storageManager.getAchievements()

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '0.05em' }}>
        ACHIEVEMENTS
      </div>
      {achievements.length === 0 ? (
        <div style={{ color: '#666', fontSize: 14 }}>
          No achievements yet. Keep playing!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 'min(400px, 85vw)' }}>
          {achievements.map((a: any) => (
            <div key={a.id} style={achieveRowStyle}>
              <div style={{ fontSize: 18, marginRight: 12 }}>🏆</div>
              <div>
                <div style={{ color: '#ffd700', fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setScreen('menu')} style={backBtnStyle}>
        BACK
      </button>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  zIndex: 10, fontFamily: "'Segoe UI', system-ui, sans-serif",
  background: 'rgba(0,0,0,0.8)',
}

const achieveRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 8,
}

const backBtnStyle: React.CSSProperties = {
  marginTop: 24,
  padding: '10px 48px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  cursor: 'pointer',
}
