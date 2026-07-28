import { useEffect, useRef } from 'react'
import { GameEngine } from '../engine/GameEngine'
import { GameScene } from '../three/Scene'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      inputManager.init(canvasRef.current, onTogglePause)
    }
    return () => {
      inputManager.dispose()
    }
  }, [onTogglePause])

  const isPlaying = screen === 'playing' || screen === 'paused'
  if (!isPlaying && screen !== 'gameover') return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
      <GameScene engine={engine} />
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 2, pointerEvents: 'auto', touchAction: 'none',
        }}
      />
      <HUD />
      <Notifications />
      <TouchControls />
      <button
        onClick={onTogglePause}
        style={{
          position: 'fixed', top: 8, right: 8, zIndex: 15,
          width: 44, height: 44,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        aria-label="Pause"
      >
        ⏸
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
