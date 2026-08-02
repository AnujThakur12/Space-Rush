import { useCallback, useRef, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { GameEngine } from './engine/GameEngine'
import { audioManager } from './engine/AudioManager'
import { MenuBackground } from './renderer/MenuBackground'
import { LoadingScreen } from './components/LoadingScreen'
import { MainMenu } from './screens/MainMenu'
import { GameScreen } from './components/GameScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { PlaneSelectScreen } from './screens/PlaneSelectScreen'
import { UpgradesScreen } from './screens/UpgradesScreen'
import { AchievementsScreen } from './screens/AchievementsScreen'
import { LeaderboardsScreen } from './screens/LeaderboardsScreen'
import { AccountScreen } from './screens/AccountScreen'
import { storageManager } from './engine/StorageManager'
import { inputManager } from './engine/InputManager'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const engineRef = useRef<GameEngine | null>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new GameEngine()
      engineRef.current.init()
      audioManager.init()
    }
    return engineRef.current
  }, [])

  const hydrateStore = useCallback(() => {
    const store = useGameStore.getState()
    store.setUnlockedPlanes(storageManager.getUnlockedPlanes())
    store.setStats(storageManager.getStats())
    useGameStore.setState({ coins: storageManager.getCoins() })
    const hs = storageManager.getHighScore()
    if (hs > 0) useGameStore.setState({ highScore: hs })
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const startGame = useCallback(() => {
    stopLoop()
    const engine = getEngine()
    engine.resetGame()
    setScreen('playing')
    lastTimeRef.current = performance.now()

    const loop = (timestamp: number) => {
      if (!rafRef.current) return
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = timestamp
      const currentScreen = useGameStore.getState().screen

      if (currentScreen === 'playing') {
        engine.paused = false
        engine.tick(dt)
      }

      if (engine.gameOver && currentScreen !== 'gameover') {
        const finalScore = engine.score
        const hs = storageManager.getHighScore()
        const wasNewHigh = finalScore > hs
        if (wasNewHigh) {
          storageManager.setHighScore(finalScore)
          useGameStore.setState({ highScore: finalScore })
        }
        storageManager.addCoins(Math.floor(finalScore / 10))
        useGameStore.setState({ coins: storageManager.getCoins(), lastNewHigh: wasNewHigh })

        const plane = storageManager.getSelectedPlane()
        storageManager.addLocalLeaderboard({
          rank: 0,
          name: storageManager.getUsername() || 'Pilot',
          score: finalScore,
          level: engine.currentLevel,
          kills: engine.player.kills,
          plane,
          timestamp: new Date().toISOString(),
        })

        const stats = storageManager.getStats()
        stats.totalGames += 1
        stats.totalScore += finalScore
        stats.totalKills += engine.player.kills
        stats.totalDeaths += 1
        stats.totalPlayTime += engine.gameTime
        stats.bossesDefeated += engine.bossesDefeated
        stats.powerupsCollected += engine.powerupsCollected
        stats.maxCombo = Math.max(stats.maxCombo, engine.player.maxCombo)
        stats.highScore = Math.max(stats.highScore, finalScore)
        storageManager.saveStats(stats)
        useGameStore.getState().setStats(stats)

        if (storageManager.isLoggedIn()) storageManager.saveCloud()

        setScreen('gameover')
      }

      if (!engine.gameOver) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [getEngine, setScreen, stopLoop])

  const togglePause = useCallback(() => {
    const current = useGameStore.getState().screen
    if (current === 'playing') {
      setScreen('paused')
    } else if (current === 'paused') {
      setScreen('playing')
    }
  }, [setScreen])

  const quitToMenu = useCallback(() => {
    stopLoop()
    setScreen('menu')
  }, [setScreen, stopLoop])

  const handleLoaded = useCallback(() => {
    setScreen('menu')
  }, [setScreen])

  useEffect(() => {
    hydrateStore()
    return () => stopLoop()
  }, [hydrateStore, stopLoop])

  const isGameScreen = screen === 'playing' || screen === 'paused' || screen === 'gameover'
  const isMenu = screen === 'menu' || screen === 'settings' || screen === 'plane_select' ||
    screen === 'upgrades' || screen === 'achievements' || screen === 'leaderboards' || screen === 'account'

  return (
    <>
      <LoadingScreen onLoaded={handleLoaded} />

      {isGameScreen && (
        <GameScreen
          engine={getEngine()}
          onRestart={startGame}
          onMenu={quitToMenu}
          onTogglePause={togglePause}
        />
      )}

      {isMenu && <MenuBackground />}

      {screen === 'menu' && <MainMenu onStart={startGame} />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'plane_select' && <PlaneSelectScreen />}
      {screen === 'upgrades' && <UpgradesScreen />}
      {screen === 'achievements' && <AchievementsScreen />}
      {screen === 'leaderboards' && <LeaderboardsScreen />}
      {screen === 'account' && <AccountScreen />}
    </>
  )
}
