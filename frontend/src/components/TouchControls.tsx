import { useRef, useCallback, useEffect } from 'react'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'

export function TouchControls() {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const isPlaying = screen === 'playing'

  const containerRef = useRef<HTMLDivElement>(null)

  if (!isPlaying) return null

  return (
    <div
      ref={containerRef}
      id="touch-controls"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        touchAction: 'none',
        pointerEvents: 'auto',
      }}
    />
  )
}
