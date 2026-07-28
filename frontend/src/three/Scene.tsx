import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { NebulaBackground } from './NebulaBackground'
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

function MenuDecoration() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group position={[0, 0, 2]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.8}
          roughness={0.2}
          wireframe
          transparent
          opacity={0.4}
          emissive="#4488ff"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  )
}

function SceneContent({ engine }: GameSceneProps) {
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'
  const flashIntensity = useGameStore((s) => s.flashIntensity)
  const flashColor = useGameStore((s) => s.flashColor)

  return (
    <>
      <color attach="background" args={['#050510']} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.2} />
      <pointLight position={[0, 0, 10]} intensity={0.3} color="#4488ff" />

      <NebulaBackground />

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

      {!isPlaying && <MenuDecoration />}

      {flashIntensity > 0 && (
        <mesh scale={[100, 100, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            color={flashColor || '#ffffff'}
            transparent
            opacity={flashIntensity * 0.3}
            depthWrite={false}
          />
        </mesh>
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
        far: 2000,
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
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={0.6}
            mipmapBlur
          />
        </EffectComposer>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  )
}
