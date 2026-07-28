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
  const bulletRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!bulletRef.current || !bullet.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (bullet.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(bullet.y / engine.canvasH - 0.5) * 8 * scaleY

    bulletRef.current.position.x = worldX
    bulletRef.current.position.y = worldY

    if (bullet.isPlayer) {
      const pulse = 1 + Math.sin(engine.gameTime * 25 + bullet.x) * 0.2
      bulletRef.current.scale.y = pulse
      const angle = Math.atan2(bullet.vy, bullet.vx)
      bulletRef.current.rotation.z = angle + Math.PI / 2
    }

    if (glowRef.current) {
      glowRef.current.position.x = worldX
      glowRef.current.position.y = worldY
      const pulse = 0.8 + Math.sin(engine.gameTime * 30 + bullet.x + bullet.y) * 0.2
      glowRef.current.scale.setScalar(pulse)
    }

    if (trailRef.current) {
      trailRef.current.position.x = worldX
      trailRef.current.position.y = worldY
    }
  })

  const isPlayer = bullet.isPlayer
  const color = isPlayer ? '#00ccff' : '#ff4444'
  const glowColor = isPlayer ? '#0088ff' : '#ff2200'

  return (
    <group>
      <mesh ref={bulletRef}>
        {isPlayer ? (
          <boxGeometry args={[0.03, 0.2, 0.03]} />
        ) : (
          <sphereGeometry args={[0.06, 6, 6]} />
        )}
        <meshBasicMaterial color={color} />
      </mesh>

      {isPlayer && (
        <mesh ref={trailRef}>
          <planeGeometry args={[0.04, 0.4]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      <mesh ref={glowRef}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {!isPlayer && (
        <mesh>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial
            color="#ff4444"
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
})
