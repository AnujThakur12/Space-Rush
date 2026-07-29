import { useRef, useEffect, useState } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'
import type { GameEngine } from '../engine/GameEngine'

interface TouchControlsProps {
  engine: GameEngine
}

const SHIP_TOUCH_RADIUS = 55

export function TouchControls({ engine }: TouchControlsProps) {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const isPlaying = screen === 'playing'

  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const moveTouchId = useRef<number | null>(null)
  const fireTouchId = useRef<number | null>(null)
  const touchOffset = useRef({ x: 0, y: 0 })
  const fireButtonTouch = useRef(false)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  useEffect(() => {
    if (!isTouchDevice) return
    const el = containerRef.current
    if (!el) return

    const getCanvasScale = () => {
      const cw = engine.canvasW || window.innerWidth
      const ch = engine.canvasH || window.innerHeight
      return { cw, ch }
    }

    const screenToGame = (cx: number, cy: number) => {
      const { cw, ch } = getCanvasScale()
      const gameX = (cx / window.innerWidth) * cw
      const gameY = (cy / window.innerHeight) * ch
      return { x: gameX, y: gameY }
    }

    const isOnShip = (gx: number, gy: number) => {
      const p = engine.player
      if (!p) return false
      const dx = gx - p.x
      const dy = gy - p.y
      return Math.sqrt(dx * dx + dy * dy) <= SHIP_TOUCH_RADIUS
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const mode = useGameStore.getState().settings.touchControlMode

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const isRightSide = t.clientX > window.innerWidth / 2

        if (isRightSide && fireTouchId.current === null) {
          fireTouchId.current = t.identifier
          inputManager.state.firing = true
          continue
        }

        if (moveTouchId.current !== null) continue

        if (mode === 'drag') {
          const gp = screenToGame(t.clientX, t.clientY)
          if (!isOnShip(gp.x, gp.y)) continue
          touchOffset.current = {
            x: gp.x - engine.player.x,
            y: gp.y - engine.player.y,
          }
          moveTouchId.current = t.identifier
          inputManager.state.touchActive = true
          const target = screenToGame(t.clientX, t.clientY)
          inputManager.state.touchTargetX = target.x - touchOffset.current.x
          inputManager.state.touchTargetY = target.y - touchOffset.current.y
        } else {
          const gp = screenToGame(t.clientX, t.clientY)
          touchOffset.current = { x: 0, y: -60 }
          moveTouchId.current = t.identifier
          inputManager.state.touchActive = true
          inputManager.state.touchTargetX = gp.x + touchOffset.current.x
          inputManager.state.touchTargetY = gp.y + touchOffset.current.y
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === moveTouchId.current) {
          const gp = screenToGame(t.clientX, t.clientY)
          const { cw, ch } = getCanvasScale()
          const pw2 = engine.player.width / 2
          const ph2 = engine.player.height / 2
          inputManager.state.touchTargetX = clamp(gp.x - touchOffset.current.x, pw2, cw - pw2)
          inputManager.state.touchTargetY = clamp(gp.y - touchOffset.current.y, ph2, ch - ph2)
          inputManager.state.touchActive = true
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === moveTouchId.current) {
          moveTouchId.current = null
          inputManager.state.touchActive = false
          inputManager.state.touchTargetX = null
          inputManager.state.touchTargetY = null
          touchOffset.current = { x: 0, y: 0 }
        }

        if (t.identifier === fireTouchId.current) {
          fireTouchId.current = null
          const settings = useGameStore.getState().settings
          if (!settings.autoFire) {
            inputManager.state.firing = false
          }
        }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    el.addEventListener('touchcancel', onTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isTouchDevice, engine])

  if (!isPlaying || !isTouchDevice) return null

  const showFireButton = !settings.autoFire

  return (
    <div
      ref={containerRef}
      id="touch-controls"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 20, touchAction: 'none', pointerEvents: 'auto',
        userSelect: 'none', WebkitUserSelect: 'none',
      }}
    >
      {showFireButton && (
        <div
          onTouchStart={(e) => { e.preventDefault(); inputManager.state.firing = true; fireButtonTouch.current = true }}
          onTouchEnd={(e) => { e.preventDefault(); fireButtonTouch.current = false; inputManager.state.firing = false }}
          style={{
            position: 'fixed',
            right: 30,
            bottom: 30,
            width: 70, height: 70,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,50,50,0.3), rgba(200,0,0,0.1))',
            border: '2px solid rgba(255,50,50,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
            zIndex: 25,
          }}
        >
          FIRE
        </div>
      )}

      <button
        onClick={() => setSettings({ autoFire: !settings.autoFire })}
        style={{
          position: 'fixed',
          right: 'max(10px, env(safe-area-inset-right, 10px))',
          bottom: 'max(50px, env(safe-area-inset-bottom, 50px))',
          width: 36, height: 36,
          borderRadius: 6,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: settings.autoFire ? '#00ff88' : 'rgba(255,255,255,0.35)',
          fontSize: 8,
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 25,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        aria-label="Toggle auto-fire"
      >
        AF
      </button>
    </div>
  )
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}
