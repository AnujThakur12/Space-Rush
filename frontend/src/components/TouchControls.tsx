import { useRef, useEffect, useState } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'

export function TouchControls() {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const isPlaying = screen === 'playing'

  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [joystickCenter, setJoystickCenter] = useState({ x: 0, y: 0 })
  const [joystickVisible, setJoystickVisible] = useState(false)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const joystickId = useRef<number | null>(null)
  const fireTouchId = useRef<number | null>(null)
  const touchStartPos = useRef({ x: 0, y: 0 })

  const JOYSTICK_SIZE = 80
  const KNOB_SIZE = 28
  const MAX_DIST = 35

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
        } else if (!isRightSide && joystickId.current === null) {
          joystickId.current = t.identifier
          touchStartPos.current = { x: t.clientX, y: t.clientY }
          setJoystickCenter({ x: t.clientX, y: t.clientY })
          setJoystickVisible(true)
          setKnobOffset({ x: 0, y: 0 })
          inputManager.state.touchActive = true
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]

        if (t.identifier === joystickId.current) {
          const dx = t.clientX - touchStartPos.current.x
          const dy = t.clientY - touchStartPos.current.y
          const dist = Math.hypot(dx, dy)
          const clamped = Math.min(dist, MAX_DIST)
          const angle = Math.atan2(dy, dx)

          const normDx = (Math.cos(angle) * clamped) / MAX_DIST
          const normDy = (Math.sin(angle) * clamped) / MAX_DIST

          setKnobOffset({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped })

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
          setJoystickVisible(false)
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
      {joystickVisible && (
        <div style={{
          position: 'absolute',
          left: joystickCenter.x - JOYSTICK_SIZE / 2,
          top: joystickCenter.y - JOYSTICK_SIZE / 2,
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,255,0.35), rgba(0,100,255,0.12))',
            border: '1.5px solid rgba(0,180,255,0.25)',
            transform: `translate(-50%, -50%) translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {fireTouchId.current !== null && (
        <div style={{
          position: 'fixed',
          right: 35,
          bottom: 100,
          width: 60, height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,50,50,0.35), rgba(200,0,0,0.12))',
          border: '1.5px solid rgba(255,50,50,0.25)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '1px',
        }}>
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
