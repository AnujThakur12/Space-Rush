import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'

const UPGRADES = [
  { key: 'health', label: 'Health', desc: '+1 HP per level', max: 10, cost: 100 },
  { key: 'damage', label: 'Damage', desc: '+1 DMG per level', max: 10, cost: 150 },
  { key: 'speed', label: 'Speed', desc: '+10 SPD per level', max: 10, cost: 120 },
  { key: 'fireRate', label: 'Fire Rate', desc: 'Faster shooting', max: 10, cost: 200 },
  { key: 'armor', label: 'Armor', desc: 'Damage reduction', max: 10, cost: 180 },
]

export function UpgradesScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [coins, setCoins] = useState(storageManager.getCoins())
  const [levels, setLevels] = useState(() =>
    Object.fromEntries(UPGRADES.map((u) => [u.key, storageManager.getUpgradeLevel(u.key)]))
  )
  const [msg, setMsg] = useState('')

  const handleBuy = (upg: (typeof UPGRADES)[0]) => {
    const current = levels[upg.key] || 0
    if (current >= upg.max) {
      setMsg(`${upg.label} is max level!`)
      return
    }
    const cost = upg.cost * (current + 1)
    if (storageManager.spendCoins(cost)) {
      storageManager.setUpgradeLevel(upg.key, current + 1)
      const stats = storageManager.getStats()
      stats.upgradesPurchased += 1
      storageManager.saveStats(stats)
      useGameStore.setState({ coins: storageManager.getCoins() })
      useGameStore.getState().setStats(stats)
      setLevels((prev) => ({ ...prev, [upg.key]: current + 1 }))
      setCoins(storageManager.getCoins())
      setMsg(`${upg.label} upgraded to level ${current + 1}!`)
    } else {
      setMsg(`Not enough coins! Need ${cost}`)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '0.05em' }}>
        UPGRADES
      </div>
      <div style={{ color: '#ffd700', fontSize: 13, marginBottom: 16 }}>
        Coins: {coins.toLocaleString()}
      </div>
      {msg && (
        <div style={{ color: msg.includes('Not') || msg.includes('max') ? '#ff4444' : '#44ff44', fontSize: 13, marginBottom: 12 }}>
          {msg}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 'min(400px, 85vw)' }}>
        {UPGRADES.map((upg) => {
          const current = levels[upg.key] || 0
          const levelCost = upg.cost * (current + 1)
          const isMax = current >= upg.max
          return (
            <div key={upg.key} style={upgradeRowStyle}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{upg.label}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{upg.desc}</div>
                <div style={{ color: '#88bbff', fontSize: 11 }}>
                  Level {current}/{upg.max}
                </div>
              </div>
              <button
                onClick={() => handleBuy(upg)}
                disabled={isMax}
                style={{
                  ...buyBtnStyle,
                  opacity: isMax ? 0.3 : 1,
                  cursor: isMax ? 'default' : 'pointer',
                }}
              >
                {isMax ? 'MAX' : levelCost.toLocaleString()}
              </button>
            </div>
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

const upgradeRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 8,
  gap: 12,
}

const buyBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  fontSize: 12,
  fontWeight: 600,
  color: '#ffd700',
  background: 'rgba(255,215,0,0.1)',
  border: '1px solid rgba(255,215,0,0.3)',
  borderRadius: 6,
  whiteSpace: 'nowrap',
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
