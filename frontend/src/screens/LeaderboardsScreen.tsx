import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'
import type { LeaderboardEntry } from '../types/game'

export function LeaderboardsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storageManager.getLeaderboard().then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const localLB: LeaderboardEntry[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('skystrike_leaderboard') || '[]')
    } catch { return [] }
  })()

  const combined = entries.length > 0 ? entries : localLB

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '0.05em' }}>
        LEADERBOARDS
      </div>
      {loading ? (
        <div style={{ color: '#666', fontSize: 14 }}>Loading...</div>
      ) : combined.length === 0 ? (
        <div style={{ color: '#666', fontSize: 14 }}>
          No scores yet. Play a game!
        </div>
      ) : (
        <div style={{ width: 'min(450px, 90vw)', maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 80px 60px 50px',
            gap: 8,
            padding: '8px 12px',
            color: '#88bbff',
            fontSize: 11,
            fontWeight: 600,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span>#</span>
            <span>Name</span>
            <span style={{ textAlign: 'right' }}>Score</span>
            <span style={{ textAlign: 'right' }}>Level</span>
            <span style={{ textAlign: 'right' }}>Kills</span>
          </div>
          {combined.slice(0, 50).map((entry, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 80px 60px 50px',
                gap: 8,
                padding: '6px 12px',
                color: i < 3 ? '#ffd700' : '#ccc',
                fontSize: 13,
                background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}
            >
              <span>{i + 1}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.name || 'Pilot'}
              </span>
              <span style={{ textAlign: 'right', fontWeight: 600 }}>
                {entry.score.toLocaleString()}
              </span>
              <span style={{ textAlign: 'right' }}>{entry.level}</span>
              <span style={{ textAlign: 'right' }}>{entry.kills}</span>
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
