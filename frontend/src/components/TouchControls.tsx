import { useRef, useEffect, useState } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'
import type { GameEngine } from '../engine/GameEngine'

interface TouchControlsProps {
  engine: GameEngine
}

const SHIP_TOUCH_RADIUS = 70
const ANYWHERE_OFFSET_Y = -60

export function TouchControls({ engine }: TouchControlsProps) {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const isPlaying = screen === 'playing'

  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const moveTouchId = useRef<number | null>(null)
  const fireTouchId = useRef<number | null>(null)
  const touchOffset = useRef({ x: 0, y: 0 })
  const engineRef = useRef(engine)
  engineRef.current = engine

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  useEffect(() => {
    if (!isTouchDevice) return

    const screenToGame = (cx: number, cy: number) => {
      const eng = engineRef.current
      const cw = eng.canvasW || window.innerWidth
      const ch = eng.canvasH || window.innerHeight
      return {
        x: (cx / window.innerWidth) * cw,
        y: (cy / window.innerHeight) * ch,
      }
    }

    const isOnShip = (gx: number, gy: number) => {
      const p = engineRef.current.player
      if (!p) return false
      const dx = gx - p.x
      const dy = gy - p.y
      return Math.sqrt(dx * dx + dy * dy) <= SHIP_TOUCH_RADIUS
    }

    const isUiElement = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null
      if (!el || !el.closest) return false
      return !!el.closest('button, input, select, [data-ui]')
    }

    const setMoveTarget = (gx: number, gy: number) => {
      const eng = engineRef.current
      const pw2 = eng.player.width / 2
      const ph2 = eng.player.height / 2
      const cw = eng.canvasW || window.innerWidth
      const ch = eng.canvasH || window.innerHeight
      inputManager.state.touchTargetX = clamp(gx - touchOffset.current.x, pw2, cw - pw2)
      inputManager.state.touchTargetY = clamp(gy - touchOffset.current.y, ph2, ch - ph2)
      inputManager.state.touchActive = true
    }

    const onTouchStart = (e: TouchEvent) => {
      if (isUiElement(e.target)) return
      e.preventDefault()
      const mode = useGameStore.getState().settings.touchControlMode

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const isRightSide = t.clientX > window.innerWidth / 2

        if (moveTouchId.current === null) {
          if (mode === 'drag') {
            const gp = screenToGame(t.clientX, t.clientY)
            if (!isOnShip(gp.x, gp.y)) continue
            touchOffset.current = {
              x: gp.x - engineRef.current.player.x,
              y: gp.y - engineRef.current.player.y,
            }
          } else {
            touchOffset.current = { x: 0, y: ANYWHERE_OFFSET_Y }
          }
          moveTouchId.current = t.identifier
          const gp = screenToGame(t.clientX, t.clientY)
          setMoveTarget(gp.x, gp.y)
          continue
        }

        if (fireTouchId.current === null && isRightSide) {
          fireTouchId.current = t.identifier
          inputManager.state.firing = true
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        if (t.identifier === moveTouchId.current) {
          const gp = screenToGame(t.clientX, t.clientY)
          setMoveTarget(gp.x, gp.y)
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
          if (!useGameStore.getState().settings.autoFire) {
            inputManager.state.firing = false
          }
        }
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: false })
    document.addEventListener('touchcancel', onTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isTouchDevice])

  if (!isPlaying || !isTouchDevice) return null

  const showFireButton = !settings.autoFire

  return (
    <>
      {showFireButton && (
        <div
          data-ui
          onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); inputManager.state.firing = true }}
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); inputManager.state.firing = false }}
          style={{
            position: 'fixed',
            right: 30,
            bottom: 30,
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,50,50,0.35), rgba(200,0,0,0.12))',
            border: '2px solid rgba(255,50,50,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
            zIndex: 25,
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          FIRE
        </div>
      )}

      <button
        data-ui
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
    </>
  )
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}
