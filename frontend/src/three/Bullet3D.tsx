import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Bullet } from '../types/game'
import type { GameEngine } from '../engine/GameEngine'

interface Bullet3DProps {
  bullet: Bullet
  engine: GameEngine
  index: number
}

export const Bullet3D = memo(function Bullet3D({ bullet, engine }: Bullet3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current || !bullet.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (bullet.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(bullet.y / engine.canvasH - 0.5) * 8 * scaleY

    meshRef.current.position.x = worldX
    meshRef.current.position.y = worldY

    if (bullet.isPlayer) {
      meshRef.current.scale.y = 1 + Math.sin(engine.gameTime * 20 + bullet.x) * 0.2
    }

    if (glowRef.current) {
      glowRef.current.position.x = worldX
      glowRef.current.position.y = worldY
    }
  })

  const isPlayer = bullet.isPlayer
  const color = isPlayer ? '#00ccff' : '#ff4444'
  const glowColor = isPlayer ? '#0088ff' : '#ff2200'

  return (
    <group>
      <mesh ref={meshRef}>
        {isPlayer ? (
          <boxGeometry args={[0.04, 0.15, 0.04]} />
        ) : (
          <sphereGeometry args={[0.06, 6, 6]} />
        )}
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
})
