import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Html } from '@react-three/drei'
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
import { WORLD_W, WORLD_H, worldX, worldY } from './coords'

interface GameSceneProps {
  engine: GameEngine
}

function MenuDecoration() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4
      ref.current.rotation.x += delta * 0.15
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ref} scale={2.5}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.8}
          roughness={0.2}
          wireframe
          transparent
          opacity={0.4}
          emissive="#4488ff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

function CameraRig({ engine }: { engine: GameEngine }) {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  const basePos = useRef(new THREE.Vector3(0, 12, 2))
  const targetOffset = useRef(new THREE.Vector3(0, 0, 0))
  const currentOffset = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    if (!isPlaying) {
      basePos.current.set(0, 12, 2)
      cam.position.lerp(basePos.current, 0.05)
      cam.lookAt(0, 0, 0)
      cam.fov += (50 - cam.fov) * 0.05
      cam.updateProjectionMatrix()
      return
    }

    const p = engine.player
    if (!p.alive) return

    const wx = worldX(engine.canvasW, p.x)
    const wy = worldY(engine.canvasH, p.y)

    const tiltX = -clamp(p.vy / 300, -0.08, 0.08)
    const tiltZ = clamp(p.vx / 300, -0.12, 0.12)

    const shakeX = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity * 0.008 : 0
    const shakeY = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity * 0.008 : 0

    targetOffset.current.set(wx * 0.2 + shakeX, wy * 0.2 + shakeY, 0)
    currentOffset.current.lerp(targetOffset.current, 0.08)

    const bossZoom = engine.boss && engine.boss.alive ? 1.2 : 0
    const targetHeight = 12 + bossZoom * -2

    basePos.current.set(currentOffset.current.x, targetHeight, 2 + currentOffset.current.y * -0.1)
    cam.position.lerp(basePos.current, 0.06)
    cam.lookAt(currentOffset.current.x * 0.5, currentOffset.current.y * 0.5, 0)
    cam.rotation.z += (tiltZ - cam.rotation.z) * 0.08

    const targetFov = engine.boss && engine.boss.alive ? 45 : 50
    cam.fov += (targetFov - cam.fov) * 0.05
    cam.updateProjectionMatrix()
  })

  return null
}

function SceneContent({ engine }: GameSceneProps) {
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'
  const flashIntensity = useGameStore((s) => s.flashIntensity)
  const flashColor = useGameStore((s) => s.flashColor)

  return (
    <>
      <color attach="background" args={['#010005']} />

      <NebulaBackground />

      <ambientLight intensity={0.25} color="#2233aa" />
      <directionalLight position={[5, 15, 8]} intensity={0.6} color="#ffeedd" />
      <directionalLight position={[-5, 10, -5]} intensity={0.2} color="#4488ff" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#4488ff" distance={20} decay={2} />

      <CameraRig engine={engine} />

      {isPlaying && (
        <group>
          <PlayerShip engine={engine} />
          {engine.enemies.map((e, i) =>
            e.alive ? <EnemyShip key={i} enemy={e} engine={engine} index={i} /> : null
          )}
          {engine.boss && engine.boss.alive && <BossShip engine={engine} />}
          {engine.bullets.map((b, i) =>
            b.alive ? <Bullet3D key={i} bullet={b} engine={engine} index={i} /> : null
          )}
          <Effects3D engine={engine} />
        </group>
      )}

      {!isPlaying && <MenuDecoration />}

      {flashIntensity > 0 && (
        <mesh scale={[40, 40, 1]}>
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
  return (
    <Canvas
      camera={{
        position: [0, 12, 2],
        fov: 50,
        near: 0.1,
        far: 500,
      }}
      dpr={[1, window.innerWidth < 768 ? 1 : 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
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
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            intensity={0.5}
            mipmapBlur
          />
        </EffectComposer>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
