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

export const Bullet3D = memo(function Bullet3D({ bullet, engine, index }: Bullet3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current || !bullet.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (bullet.x / engine.canvasW - 0.5) * 30 * scaleX
    const worldY = -(bullet.y / engine.canvasH - 0.5) * 20 * scaleY

    meshRef.current.position.x = worldX
    meshRef.current.position.y = worldY
  })

  const color = bullet.isPlayer ? '#00ccff' : '#ff4444'

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
})
