import { useEffect, useRef } from 'react'
import { GameEngine } from '../engine/GameEngine'
import { GameCanvas } from '../renderer/GameCanvas'
import { HUD } from './HUD'
import { Notifications } from './Notifications'
import { GameOverOverlay } from './GameOverOverlay'
import { PauseOverlay } from './PauseOverlay'
import { TouchControls } from './TouchControls'
import { inputManager } from '../engine/InputManager'
import { useGameStore } from '../store/gameStore'

interface GameScreenProps {
  engine: GameEngine
  onRestart: () => void
  onMenu: () => void
  onTogglePause: () => void
}

export function GameScreen({ engine, onRestart, onMenu, onTogglePause }: GameScreenProps) {
  const screen = useGameStore((s) => s.screen)
  const touchCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (touchCanvasRef.current) {
      inputManager.init(touchCanvasRef.current, onTogglePause)
    }
    return () => { inputManager.dispose() }
  }, [onTogglePause])

  const isPlaying = screen === 'playing' || screen === 'paused'
  if (!isPlaying && screen !== 'gameover') return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
      <GameCanvas engine={engine} />
      <canvas
        ref={touchCanvasRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 3, pointerEvents: 'auto', touchAction: 'none',
        }}
      />
      <HUD />
      <Notifications />
      <TouchControls />
      {/* Pause button: top-center, clear of corner panels */}
      <button
        onClick={onTogglePause}
        style={{
          position: 'fixed',
          top: 'max(8px, env(safe-area-inset-top, 8px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          width: 44,
          height: 34,
          borderRadius: 6,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: '1px',
        }}
        aria-label="Pause"
      >
        II PAUSE
      </button>

      {screen === 'gameover' && engine.gameOver && (
        <GameOverOverlay onRestart={onRestart} onMenu={onMenu} />
      )}
      {screen === 'paused' && (
        <PauseOverlay onResume={onTogglePause} onQuit={onMenu} />
      )}
    </div>
  )
}
