import { useRef, useEffect, useCallback } from 'react'
import type { GameEngine } from '../engine/GameEngine'
import { useGameStore } from '../store/gameStore'
import { drawBackground } from './Background'
import { drawPlayer, drawEnemy, drawBoss, drawBullet } from './Sprites'
import { drawParticles } from './Particles'
import { drawFlash, drawEngineTrail } from './effects'

interface GameCanvasProps {
  engine: GameEngine
}

export function GameCanvas({ engine }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const screenRef = useRef(engine)

  screenRef.current = engine

  const render = useCallback((timestamp: number) => {
    const engine = screenRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    const dt = lastTimeRef.current === 0 ? 0.016 : Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
    lastTimeRef.current = timestamp

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height

    engine.canvasW = cw
    engine.canvasH = ch

    ctx.save()

    const shakeX = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity : 0
    const shakeY = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity : 0
    ctx.translate(shakeX, shakeY)

    drawBackground(ctx, cw, ch, dt)

    drawParticles(ctx, engine.particles.filter(p => p.type === 'trail'))

    for (const b of engine.bullets) {
      if (b.alive) drawBullet(ctx, b)
    }

    for (const e of engine.enemies) {
      if (e.alive) drawEnemy(ctx, e, engine.gameTime)
    }

    if (engine.boss && engine.boss.alive) {
      drawBoss(ctx, engine.boss, engine.gameTime)
    }

    if (engine.player.alive) {
      drawPlayer(ctx, engine.player, engine.gameTime)
      drawEngineTrail(ctx, engine.player.x, engine.player.y + engine.player.height / 2, engine.player.vx, engine.player.vy)
    }

    drawParticles(ctx, engine.particles.filter(p => p.type !== 'trail'))

    ctx.restore()

    drawFlash(ctx, engine.flashIntensity, engine.flashColor, cw, ch)

    rafRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      engine.canvasW = w
      engine.canvasH = h
    }

    resize()
    window.addEventListener('resize', resize)
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [engine, render])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        display: 'block',
      }}
    />
  )
}
