import { useRef, useEffect } from 'react'

export function MenuBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stars = useRef<{ x: number; y: number; s: number; sp: number; b: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const count = 80
    stars.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      s: Math.random() * 1.2 + 0.3,
      sp: Math.random() * 0.3 + 0.1,
      b: Math.random() * 0.4 + 0.3,
    }))

    let raf = 0
    const render = () => {
      const c = canvas!
      const ctx = c.getContext('2d')
      if (!ctx) return

      const w = c.width
      const h = c.height

      ctx.fillStyle = '#010005'
      ctx.fillRect(0, 0, w, h)

      for (const s of stars.current) {
        s.y += s.sp
        if (s.y > h) { s.y = -2; s.x = Math.random() * w }
        ctx.fillStyle = `rgba(255,255,255,${s.b})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, display: 'block',
      }}
    />
  )
}
