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

const enemyConfigs = {
  basic: {
    color: '#ff4444',
    emissive: '#ff2222',
    emissiveIntensity: 0.2,
    metalness: 0.3,
    roughness: 0.5,
    scale: 0.4,
    geom: 'tetrahedron' as const,
  },
  fast: {
    color: '#ff8800',
    emissive: '#ff6600',
    emissiveIntensity: 0.3,
    metalness: 0.4,
    roughness: 0.4,
    scale: 0.3,
    geom: 'cone' as const,
  },
  tank: {
    color: '#aa44ff',
    emissive: '#8822dd',
    emissiveIntensity: 0.2,
    metalness: 0.6,
    roughness: 0.3,
    scale: 0.55,
    geom: 'box' as const,
  },
  shooter: {
    color: '#ff44aa',
    emissive: '#ff2288',
    emissiveIntensity: 0.25,
    metalness: 0.4,
    roughness: 0.4,
    scale: 0.45,
    geom: 'octahedron' as const,
  },
  elite: {
    color: '#ff0044',
    emissive: '#ff0044',
    emissiveIntensity: 0.4,
    metalness: 0.7,
    roughness: 0.2,
    scale: 0.6,
    geom: 'dodecahedron' as const,
  },
}

function EnemyGeometry({ type, color, emissive, emissiveIntensity, metalness, roughness }: {
  type: Enemy['type']; color: string; emissive: string; emissiveIntensity: number; metalness: number; roughness: number
}) {
  const mat = <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} metalness={metalness} roughness={roughness} />

  switch (type) {
    case 'basic':
      return <mesh><tetrahedronGeometry args={[0.5, 0]} />{mat}</mesh>
    case 'fast':
      return <mesh rotation={[0, 0, Math.PI]}><coneGeometry args={[0.3, 0.6, 6]} />{mat}</mesh>
    case 'tank':
      return <mesh><boxGeometry args={[0.7, 0.7, 0.7]} />{mat}</mesh>
    case 'shooter':
      return <mesh><octahedronGeometry args={[0.5, 0]} />{mat}</mesh>
    case 'elite':
      return (
        <group>
          <mesh><dodecahedronGeometry args={[0.6, 0]} /><meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} metalness={metalness} roughness={roughness} /></mesh>
          <mesh><dodecahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} metalness={0.5} roughness={0.3} wireframe transparent opacity={0.3} /></mesh>
          <mesh position={[0, 0, 0.5]}><sphereGeometry args={[0.08, 6, 6]} /><meshBasicMaterial color="#ffff00" /></mesh>
        </group>
      )
  }
}

export const EnemyShip = memo(function EnemyShip({ enemy, engine }: EnemyShipProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !enemy.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (enemy.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(enemy.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x = worldX
    groupRef.current.position.y = worldY

    groupRef.current.rotation.z += 0.02

    const flash = enemy.flashTimer > 0
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = flash ? 1 : enemyConfigs[enemy.type]?.emissiveIntensity || 0.2
      }
    })
  })

  const cfg = enemyConfigs[enemy.type] || enemyConfigs.basic

  return (
    <group ref={groupRef} scale={cfg.scale}>
      <EnemyGeometry type={enemy.type} {...cfg} />
    </group>
  )
})
