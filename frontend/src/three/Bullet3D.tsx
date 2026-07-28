import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Bullet } from '../types/game'
import type { GameEngine } from '../engine/GameEngine'
import { worldX, worldY } from './coords'

export const Bullet3D = memo(function Bullet3D({ bullet, engine }: { bullet: Bullet; engine: GameEngine; index: number }) {
  const bulletRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!bulletRef.current || !bullet.alive) return

    const wx = worldX(engine.canvasW, bullet.x)
    const wy = worldY(engine.canvasH, bullet.y)

    bulletRef.current.position.x = wx
    bulletRef.current.position.y = wy

    if (bullet.isPlayer) {
      const angle = Math.atan2(bullet.vy, bullet.vx)
      bulletRef.current.rotation.z = angle + Math.PI / 2
    }

    if (glowRef.current) {
      glowRef.current.position.x = wx
      glowRef.current.position.y = wy
      const pulse = 0.8 + Math.sin(engine.gameTime * 30 + bullet.x) * 0.2
      glowRef.current.scale.setScalar(pulse)
    }
  })

  const isPlayer = bullet.isPlayer
  const color = isPlayer ? '#00ccff' : '#ff4444'
  const glowColor = isPlayer ? '#0088ff' : '#ff2200'

  return (
    <group>
      <mesh ref={bulletRef}>
        {isPlayer ? (
          <boxGeometry args={[0.04, 0.3, 0.04]} />
        ) : (
          <sphereGeometry args={[0.07, 6, 6]} />
        )}
        <meshBasicMaterial color={color} />
      </mesh>

      {isPlayer && (
        <mesh>
          <planeGeometry args={[0.05, 0.5]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.15}
            depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      <mesh ref={glowRef}>
        <planeGeometry args={[0.25, 0.25]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.08}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
})
