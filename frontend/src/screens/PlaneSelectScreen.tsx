import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'
import type { PlaneType } from '../types/game'

const PLANES: { id: PlaneType; label: string; desc: string; speed: number; health: number; damage: number; cost: number }[] = [
  { id: 'default', label: 'Falcon', desc: 'Balanced all-rounder', speed: 300, health: 5, damage: 10, cost: 0 },
  { id: 'eagle', label: 'Eagle', desc: 'Extra health and armor', speed: 340, health: 6, damage: 12, cost: 500 },
  { id: 'raptor', label: 'Raptor', desc: 'High damage output', speed: 320, health: 5.5, damage: 14, cost: 1500 },
  { id: 'phantom', label: 'Phantom', desc: 'Fast and durable', speed: 360, health: 6.5, damage: 15, cost: 5000 },
  { id: 'stealth-x', label: 'Stealth-X', desc: 'Extreme speed and power', speed: 400, health: 5, damage: 18, cost: 15000 },
]

export function PlaneSelectScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const unlockedPlanes = useGameStore((s) => s.unlockedPlanes)
  const coins = storageManager.getCoins()
  const [selected, setSelected] = useState(storageManager.getSelectedPlane())
  const [msg, setMsg] = useState('')

  const handleSelect = (plane: (typeof PLANES)[0]) => {
    if (unlockedPlanes.includes(plane.id) || plane.cost === 0) {
      storageManager.selectPlane(plane.id)
      setSelected(plane.id)
      setMsg(`${plane.label} equipped!`)
    } else if (storageManager.spendCoins(plane.cost)) {
      storageManager.unlockPlane(plane.id)
      storageManager.selectPlane(plane.id)
      useGameStore.getState().setUnlockedPlanes(storageManager.getUnlockedPlanes())
      useGameStore.setState({ coins: storageManager.getCoins() })
      setSelected(plane.id)
      setMsg(`${plane.label} unlocked!`)
    } else {
      setMsg(`Not enough coins! Need ${plane.cost}`)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '0.05em' }}>
        PLANE SELECT
      </div>
      <div style={{ color: '#ffd700', fontSize: 13, marginBottom: 16 }}>
        Coins: {coins.toLocaleString()}
      </div>
      {msg && (
        <div style={{ color: msg.includes('Not') ? '#ff4444' : '#44ff44', fontSize: 13, marginBottom: 12 }}>
          {msg}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 'min(400px, 85vw)' }}>
        {PLANES.map((plane) => {
          const owned = unlockedPlanes.includes(plane.id) || plane.cost === 0
          const isSelected = selected === plane.id
          return (
            <button
              key={plane.id}
              onClick={() => handleSelect(plane)}
              style={{
                ...planeBtnStyle,
                border: isSelected ? '2px solid #4488ff' : '1px solid rgba(255,255,255,0.15)',
                background: isSelected ? 'rgba(68,136,255,0.15)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{plane.label}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>{plane.desc}</div>
                  <div style={{ color: '#88bbff', fontSize: 10, marginTop: 4 }}>
                    SPD:{plane.speed} HP:{plane.health} DMG:{plane.damage}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {owned ? (
                    <span style={{ color: isSelected ? '#4488ff' : '#44ff44', fontSize: 12 }}>
                      {isSelected ? 'EQUIPPED' : 'OWNED'}
                    </span>
                  ) : (
                    <span style={{ color: '#ffd700', fontSize: 12 }}>
                      {plane.cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
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

const planeBtnStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
}

const backBtnStyle: React.CSSProperties = {
  marginTop: 20,
  padding: '10px 48px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  cursor: 'pointer',
}
