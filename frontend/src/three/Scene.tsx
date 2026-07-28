import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import * as THREE from 'three'
import { Starfield } from './Starfield'
import { PlayerShip } from './PlayerShip'
import { EnemyShip } from './EnemyShip'
import { BossShip } from './BossShip'
import { Bullet3D } from './Bullet3D'
import { Effects3D } from './Effects3D'
import type { GameEngine } from '../engine/GameEngine'
import { useGameStore } from '../store/gameStore'

interface GameSceneProps {
  engine: GameEngine
}

function SceneContent({ engine }: GameSceneProps) {
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#4488ff" />

      <Starfield count={window.innerWidth < 768 ? 500 : 2000} />

      {isPlaying && (
        <>
          <PlayerShip engine={engine} />
          {engine.enemies.map((e, i) =>
            e.alive ? <EnemyShip key={i} enemy={e} engine={engine} index={i} /> : null
          )}
          {engine.boss && engine.boss.alive && <BossShip engine={engine} />}
          {engine.bullets.map((b, i) =>
            b.alive ? <Bullet3D key={i} bullet={b} engine={engine} index={i} /> : null
          )}
          <Effects3D engine={engine} />
        </>
      )}

      {!isPlaying && (
        <group>
          <mesh rotation={[0.5, 0.8, 0]} position={[0, 0, 0]}>
            <icosahedronGeometry args={[2, 0]} />
            <meshStandardMaterial color="#4488ff" metalness={0.6} roughness={0.3} wireframe />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[1.6, 0]} />
            <meshStandardMaterial color="#4488ff" metalness={0.8} roughness={0.2} transparent opacity={0.15} />
          </mesh>
        </group>
      )}
    </>
  )
}

export function GameScene({ engine }: GameSceneProps) {
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  return (
    <Canvas
      camera={{
        position: [0, 0, isPlaying ? 12 : 10],
        fov: isPlaying ? 70 : 60,
        near: 0.1,
        far: 1000,
      }}
      dpr={[1, window.innerWidth < 768 ? 1.2 : 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <Suspense fallback={null}>
        <SceneContent engine={engine} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  )
}
