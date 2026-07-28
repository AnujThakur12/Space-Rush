import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
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
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15
      meshRef.current.rotation.y += delta * 0.3
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(performance.now() / 1000 * 2) * 0.05
      glowRef.current.scale.setScalar(s)
    }
  })

  return (
    <group position={[0, 0, 1]}>
      <mesh ref={glowRef} scale={4}>
        <sphereGeometry />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.9}
          roughness={0.1}
          wireframe
          transparent
          opacity={0.5}
          emissive="#4488ff"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.15}
          emissive="#4488ff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

function CameraRig({ engine }: { engine: GameEngine }) {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const screen = useGameStore((s) => s.screen)
  const isPlaying = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  const targetPos = useRef(new THREE.Vector3(0, 0, 10))
  const currentPos = useRef(new THREE.Vector3(0, 0, 10))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const p = engine.player
    if (!isPlaying) {
      targetPos.current.set(0, 0, 10)
      currentPos.current.lerp(targetPos.current, 0.05)
      cam.position.copy(currentPos.current)
      cam.lookAt(0, 0, 0)
      cam.fov += (60 - cam.fov) * 0.05
      cam.updateProjectionMatrix()
      return
    }

    if (!p.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (p.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(p.y / engine.canvasH - 0.5) * 8 * scaleY

    const bossDist = engine.boss && engine.boss.alive ? 1 : 0
    const zoom = bossDist > 0 ? 9 : 7.5
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)

    const tiltX = -clamp(p.vy / 300, -0.15, 0.15)
    const tiltY = clamp(p.vx / 300, -0.2, 0.2)

    const shakeX = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity * 0.02 : 0
    const shakeY = engine.screenShakeIntensity > 0 ? (Math.random() - 0.5) * engine.screenShakeIntensity * 0.02 : 0

    targetPos.current.set(
      worldX * 0.3 + tiltY * 2 + shakeX,
      worldY * 0.3 + tiltX * 2 + shakeY,
      zoom
    )

    targetLook.current.set(worldX * 0.1, worldY * 0.1 + tiltX, 0)

    currentPos.current.lerp(targetPos.current, 0.08)
    cam.position.copy(currentPos.current)

    const lookTarget = new THREE.Vector3().lerp(targetLook.current, 0.1)
    cam.lookAt(lookTarget)

    const targetFov = engine.boss && engine.boss.alive ? 65 : 72
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
      <color attach="background" args={['#020008']} />

      <NebulaBackground />

      <ambientLight intensity={0.3} color="#2244aa" />
      <directionalLight position={[10, 15, 8]} intensity={0.8} color="#ffeedd" />
      <directionalLight position={[-8, -5, -10]} intensity={0.3} color="#4488ff" />
      <directionalLight position={[0, -10, -5]} intensity={0.2} color="#ff4488" />

      <pointLight position={[0, 0, 5]} intensity={0.4} color="#4488ff" distance={30} decay={2} />

      <CameraRig engine={engine} />

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
            opacity={flashIntensity * 0.4}
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
        position: [0, 0, 10],
        fov: 60,
        near: 0.1,
        far: 2000,
      }}
      dpr={[1, window.innerWidth < 768 ? 1.2 : 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
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
            luminanceThreshold={0.1}
            luminanceSmoothing={0.8}
            intensity={0.8}
            mipmapBlur
          />
          <ToneMapping
            adaptive
            resolution={256}
            middleGrey={0.6}
            averageLuminance={1.0}
            maxLuminance={16.0}
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
