import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'

type AccountView = 'login' | 'register' | 'profile'

export function AccountScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  const [view, setView] = useState<AccountView>(
    storageManager.isLoggedIn() ? 'profile' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [msgColor, setMsgColor] = useState('#fff')
  const [isLoggedIn, setIsLoggedIn] = useState(storageManager.isLoggedIn())
  const [username, setUsername] = useState(storageManager.getUsername())

  const syncStore = () => {
    const store = useGameStore.getState()
    store.setUnlockedPlanes(storageManager.getUnlockedPlanes())
    store.setStats(storageManager.getStats())
    useGameStore.setState({ coins: storageManager.getCoins(), highScore: storageManager.getHighScore() })
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Enter email and password')
      setMsgColor('#ff4444')
      return
    }
    setMessage('Logging in...')
    setMsgColor('#88bbff')
    const result = await storageManager.login(email, password)
    setMessage(result.error || 'Logged in!')
    setMsgColor(result.ok ? '#44ff44' : '#ff4444')
    if (result.ok) {
      syncStore()
      setIsLoggedIn(true)
      setUsername(storageManager.getUsername())
      setView('profile')
    }
  }

  const handleRegister = async () => {
    if (!email || !password) {
      setMessage('Enter email and password')
      setMsgColor('#ff4444')
      return
    }
    setMessage('Creating account...')
    setMsgColor('#88bbff')
    const result = await storageManager.register(email, password)
    setMessage(result.error || 'Account created!')
    setMsgColor(result.ok ? '#44ff44' : '#ff4444')
    if (result.ok) {
      syncStore()
      setIsLoggedIn(true)
      setUsername(storageManager.getUsername())
      setView('profile')
    }
  }

  const handleLogout = async () => {
    await storageManager.logout()
    setIsLoggedIn(false)
    setUsername('')
    setView('login')
    setMessage('Logged out')
    setMsgColor('#88bbff')
  }

  const handleDelete = async () => {
    if (window.confirm('Delete account? All progress will be lost!')) {
      setMessage('Deleting account...')
      setMsgColor('#ff4444')
      const result = await storageManager.deleteAccount()
      syncStore()
      setIsLoggedIn(false)
      setUsername('')
      setView('login')
      setMessage(result.error || 'Account deleted')
      setMsgColor('#ff4444')
    }
  }

  if (isLoggedIn) {
    return (
      <div style={overlayStyle}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '0.05em' }}>
          ACCOUNT
        </div>
        <div style={{ color: '#88bbff', fontSize: 14, marginBottom: 24 }}>
          Welcome, {username}!
        </div>
        {message && (
          <div style={{ color: msgColor, fontSize: 13, marginBottom: 12 }}>{message}</div>
        )}
        <button onClick={handleLogout} style={actionBtnStyle}>LOGOUT</button>
        <button onClick={handleDelete} style={{ ...actionBtnStyle, background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', color: '#ff4444' }}>
          DELETE ACCOUNT
        </button>
        <button onClick={() => setScreen('menu')} style={backBtnStyle}>
          BACK
        </button>
      </div>
    )
  }

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '0.05em' }}>
        {view === 'login' ? 'LOGIN' : 'REGISTER'}
      </div>

      {view === 'login' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'min(320px, 80vw)' }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            type="email"
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            type="password"
          />
          <button onClick={handleLogin} style={actionBtnStyle}>
            LOGIN
          </button>
          <button
            onClick={() => { setView('register'); setMessage(''); }}
            style={{ ...linkBtnStyle }}
          >
            Create Account
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'min(320px, 80vw)' }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            type="email"
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            type="password"
          />
          <button onClick={handleRegister} style={actionBtnStyle}>
            REGISTER
          </button>
          <button
            onClick={() => { setView('login'); setMessage(''); }}
            style={linkBtnStyle}
          >
            Back to Login
          </button>
        </div>
      )}

      {message && (
        <div style={{ color: msgColor, fontSize: 13, marginTop: 12 }}>{message}</div>
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

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 14,
  color: '#fff',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  outline: 'none',
}

const actionBtnStyle: React.CSSProperties = {
  padding: '10px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, #4488ff, #2266dd)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  marginTop: 4,
}

const linkBtnStyle: React.CSSProperties = {
  padding: '8px',
  fontSize: 12,
  color: '#88bbff',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
}

const backBtnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 48px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  cursor: 'pointer',
}
