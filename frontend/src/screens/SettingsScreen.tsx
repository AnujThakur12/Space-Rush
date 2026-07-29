import { useGameStore } from '../store/gameStore'

export function SettingsScreen() {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '0.05em' }}>
        SETTINGS
      </div>

      <SettingSlider
        label="Music Volume"
        value={settings.musicVolume}
        onChange={(v) => setSettings({ musicVolume: v })}
      />
      <SettingSlider
        label="SFX Volume"
        value={settings.sfxVolume}
        onChange={(v) => setSettings({ sfxVolume: v })}
      />
      <SettingToggle
        label="Auto Fire"
        value={settings.autoFire}
        onChange={(v) => setSettings({ autoFire: v })}
      />
      <SettingSlider
        label="Joystick Size"
        value={settings.joystickSize}
        onChange={(v) => setSettings({ joystickSize: v })}
      />
      <SettingSlider
        label="Joystick Opacity"
        value={settings.joystickOpacity}
        onChange={(v) => setSettings({ joystickOpacity: v })}
      />
      <SettingSlider
        label="Joystick Sensitivity"
        value={settings.joystickSensitivity}
        onChange={(v) => setSettings({ joystickSensitivity: v })}
      />
      <SettingToggle
        label="Vibration"
        value={settings.vibration}
        onChange={(v) => setSettings({ vibration: v })}
      />

      <button onClick={() => setScreen('menu')} style={backBtnStyle}>
        BACK
      </button>
    </div>
  )
}

function SettingSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={settingRowStyle}>
      <span style={{ color: '#ccc', fontSize: 13, minWidth: 140 }}>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, maxWidth: 200, accentColor: '#4488ff' }}
      />
      <span style={{ color: '#88bbff', fontSize: 12, minWidth: 30, textAlign: 'right' }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={settingRowStyle}>
      <span style={{ color: '#ccc', fontSize: 13, minWidth: 140 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          padding: '4px 16px',
          fontSize: 12,
          fontWeight: 600,
          color: value ? '#44ff44' : '#ff4444',
          background: value ? 'rgba(68,255,68,0.1)' : 'rgba(255,68,68,0.1)',
          border: `1px solid ${value ? '#44ff44' : '#ff4444'}`,
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  zIndex: 10, fontFamily: "'Segoe UI', system-ui, sans-serif",
  background: 'rgba(0,0,0,0.7)',
}

const settingRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  gap: 12, marginBottom: 8, width: 'min(400px, 80vw)',
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
  letterSpacing: '0.08em',
}
