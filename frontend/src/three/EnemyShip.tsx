import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Enemy } from '../types/game'
import type { GameEngine } from '../engine/GameEngine'

interface EnemyShipProps {
  enemy: Enemy
  engine: GameEngine
  index: number
}

export const EnemyShip = memo(function EnemyShip({ enemy, engine, index }: EnemyShipProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !enemy.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (enemy.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(enemy.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x = worldX
    groupRef.current.position.y = worldY

    const flash = enemy.flashTimer > 0
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        ;(child.material as THREE.MeshStandardMaterial).emissiveIntensity = flash ? 1 : 0
      }
    })
  })

  const color = enemy.type === 'basic' ? '#ff4444'
    : enemy.type === 'fast' ? '#ff8800'
    : enemy.type === 'tank' ? '#aa44ff'
    : enemy.type === 'shooter' ? '#ff44aa'
    : '#ff0044'

  return (
    <group ref={groupRef}>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {enemy.type === 'elite' && (
        <mesh>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#ff0044" metalness={0.5} roughness={0.3} wireframe />
        </mesh>
      )}
    </group>
  )
})
