import { useRef, useEffect, useState } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'

export function TouchControls() {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const isPlaying = screen === 'playing'

  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const moveTouchId = useRef<number | null>(null)
  const fireTouchId = useRef<number | null>(null)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  useEffect(() => {
    if (!isTouchDevice) return
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const isRightSide = t.clientX > window.innerWidth / 2

        if (isRightSide && fireTouchId.current === null) {
          fireTouchId.current = t.identifier
          inputManager.state.firing = true
        } else if (!isRightSide && moveTouchId.current === null) {
          moveTouchId.current = t.identifier
          inputManager.state.touchActive = true
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === moveTouchId.current) {
          const screenW = window.innerWidth
          const screenH = window.innerHeight
          const touchX = (t.clientX / screenW) * 2 - 1
          const touchY = (t.clientY / screenH) * 2 - 1

          inputManager.state.touchX = touchX
          inputManager.state.touchY = touchY
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
          inputManager.state.touchX = 0
          inputManager.state.touchY = 0
          inputManager.state.touchActive = false
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
  }, [isTouchDevice])

  if (!isPlaying || !isTouchDevice) return null

  return (
    <div
      ref={containerRef}
      id="touch-controls"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 20, touchAction: 'none', pointerEvents: 'auto',
      }}
    >
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
