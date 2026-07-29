import { useRef, useEffect, useState } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'

export function TouchControls() {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const isPlaying = screen === 'playing'

  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [joystickCenter, setJoystickCenter] = useState({ x: 100, y: 0 })
  const [joystickActive, setJoystickActive] = useState(false)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const joystickId = useRef<number | null>(null)
  const fireTouchId = useRef<number | null>(null)

  const JOYSTICK_SIZE = 120
  const KNOB_SIZE = 44
  const MAX_DIST = 55

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
    if (isTouch) {
      setJoystickCenter({ x: 100, y: window.innerHeight - 100 })
    }
  }, [])

  useEffect(() => {
    if (!isTouchDevice) return
    const el = containerRef.current
    if (!el) return

    const getJoystickCenter = () => ({ x: 100, y: window.innerHeight - 100 })

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (joystickId.current !== null) return

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const isRightSide = t.clientX > window.innerWidth / 2

        if (isRightSide && fireTouchId.current === null) {
          fireTouchId.current = t.identifier
          inputManager.state.firing = true
        } else if (!isRightSide && joystickId.current === null) {
          joystickId.current = t.identifier
          const center = getJoystickCenter()
          setJoystickCenter(center)
          setJoystickActive(true)
          inputManager.state.touchActive = true
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === joystickId.current) {
          const center = getJoystickCenter()
          const dx = t.clientX - center.x
          const dy = t.clientY - center.y
          const dist = Math.hypot(dx, dy)
          const clamped = Math.min(dist, MAX_DIST)
          const angle = Math.atan2(dy, dx)

          const normDx = (Math.cos(angle) * clamped) / MAX_DIST
          const normDy = (Math.sin(angle) * clamped) / MAX_DIST

          setKnobOffset({ x: normDx * MAX_DIST, y: normDy * MAX_DIST })

          inputManager.state.touchX = normDx
          inputManager.state.touchY = -normDy
          inputManager.state.joystickAngle = angle
          inputManager.state.joystickMagnitude = clamped / MAX_DIST
          inputManager.state.touchActive = true
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === joystickId.current) {
          joystickId.current = null
          setJoystickActive(false)
          setKnobOffset({ x: 0, y: 0 })

          inputManager.state.touchX = 0
          inputManager.state.touchY = 0
          inputManager.state.joystickAngle = 0
          inputManager.state.joystickMagnitude = 0
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
      {/* Joystick base */}
      {joystickActive && (
        <div style={{
          position: 'absolute',
          left: joystickCenter.x - JOYSTICK_SIZE / 2,
          top: joystickCenter.y - JOYSTICK_SIZE / 2,
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.12)',
          pointerEvents: 'none',
        }}>
          {/* Knob */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,255,0.4), rgba(0,100,255,0.15))',
            border: '2px solid rgba(0,180,255,0.3)',
            transform: `translate(-50%, -50%) translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* Fire button indicator */}
      {fireTouchId.current !== null && (
        <div style={{
          position: 'fixed',
          right: 40,
          bottom: 120,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,50,50,0.4), rgba(200,0,0,0.15))',
          border: '2px solid rgba(255,50,50,0.3)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1px',
        }}>
          FIRE
        </div>
      )}

      {/* Auto-fire toggle */}
      <button
        onClick={() => setSettings({ autoFire: !settings.autoFire })}
        style={{
          position: 'fixed',
          right: 'max(12px, env(safe-area-inset-right, 12px))',
          bottom: 'max(60px, env(safe-area-inset-bottom, 60px))',
          width: 40, height: 40,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: settings.autoFire ? '#00ff88' : 'rgba(255,255,255,0.4)',
          fontSize: 9,
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
