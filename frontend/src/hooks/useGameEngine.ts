import { useRef, useEffect, useCallback } from 'react'
import { GameEngine } from '../engine/GameEngine'
import { inputManager } from '../engine/InputManager'
import { audioManager } from '../engine/AudioManager'
import { useGameStore } from '../store/gameStore'
import { storageManager } from '../engine/StorageManager'

export function useGameEngine() {
  const engineRef = useRef<GameEngine | null>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const startGame = useCallback(() => {
    const store = useGameStore.getState()
    if (!engineRef.current) {
      engineRef.current = new GameEngine()
      engineRef.current.init()
      audioManager.init()
    }

    const engine = engineRef.current
    engine.resetGame()
    store.setScreen('playing')

    lastTimeRef.current = performance.now()

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      const currentScreen = useGameStore.getState().screen

      if (currentScreen === 'playing') {
        engine.paused = false
        engine.tick(dt)
      } else if (currentScreen === 'paused') {
        engine.paused = true
      }

      if (engine.gameOver) {
        const finalScore = engine.score
        const hs = storageManager.getHighScore()
        if (finalScore > hs) {
          storageManager.setHighScore(finalScore)
          useGameStore.setState({ highScore: finalScore })
        }
        storageManager.addCoins(Math.floor(finalScore / 10))
        storageManager.addLocalLeaderboard({
          rank: 0,
          name: storageManager.getUsername() || 'Pilot',
          score: finalScore,
          level: engine.currentLevel,
          kills: engine.player.kills,
          plane: 'default',
          timestamp: new Date().toISOString(),
        })
        storageManager.submitScore(finalScore, engine.currentLevel, engine.player.kills, 'default')
        useGameStore.setState({ screen: 'gameover' })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const togglePause = useCallback(() => {
    const store = useGameStore.getState()
    if (store.screen === 'playing') {
      store.setScreen('paused')
    } else if (store.screen === 'paused') {
      store.setScreen('playing')
    }
  }, [])

  const quitToMenu = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    useGameStore.getState().setScreen('menu')
  }, [])

  const selectPlane = useCallback((planeId: string) => {
    storageManager.selectPlane(planeId as any)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return {
    engine: engineRef,
    startGame,
    togglePause,
    quitToMenu,
    selectPlane,
  }
}
