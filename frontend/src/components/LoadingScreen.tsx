import { useEffect, useState } from 'react'

export function LoadingScreen({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 15, 100)
        return next
      })
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setVisible(false)
        onLoaded()
      }, 500)
    }, 2500)

    return () => clearInterval(interval)
  }, [onLoaded])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: '#000', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      transition: 'opacity 0.5s', opacity: visible ? 1 : 0,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 6vw, 4rem)',
        color: '#4488ff',
        textShadow: '0 0 20px rgba(68,136,255,0.5)',
        margin: 0,
        letterSpacing: '0.2em',
        fontWeight: 700,
      }}>
        SPACE STRIKE
      </h1>
      <div style={{ color: '#88bbff', fontSize: '0.9rem', marginTop: 8, opacity: 0.7 }}>
        Endless Space
      </div>
      <div style={{
        width: 'min(60%, 300px)', height: 4,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 2, marginTop: 32, overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: 'linear-gradient(90deg, #4488ff, #88bbff)',
          borderRadius: 2, transition: 'width 0.3s ease-out',
        }} />
      </div>
    </div>
  )
}
