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

const enemyDesigns: Record<string, { color: string; emissive: string; metalness: number; roughness: number; scale: number }> = {
  basic: { color: '#cc4444', emissive: '#ff2222', metalness: 0.3, roughness: 0.6, scale: 0.35 },
  fast: { color: '#dd6622', emissive: '#ff6600', metalness: 0.3, roughness: 0.5, scale: 0.28 },
  tank: { color: '#8844aa', emissive: '#6622aa', metalness: 0.6, roughness: 0.3, scale: 0.5 },
  shooter: { color: '#dd2266', emissive: '#ff0044', metalness: 0.4, roughness: 0.4, scale: 0.4 },
  elite: { color: '#cc0033', emissive: '#ff0033', metalness: 0.7, roughness: 0.2, scale: 0.55 },
}

export const EnemyShip = memo(function EnemyShip({ enemy, engine }: EnemyShipProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!groupRef.current || !enemy.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (enemy.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(enemy.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x = worldX
    groupRef.current.position.y = worldY

    groupRef.current.rotation.z = Math.sin(engine.gameTime * 2 + enemy.x) * 0.1
    groupRef.current.rotation.x = Math.sin(engine.gameTime * 1.5 + enemy.y) * 0.05
    groupRef.current.rotation.y += 0.015

    if (glowRef.current) {
      glowRef.current.visible = enemy.flashTimer > 0
      if (enemy.flashTimer > 0) {
        const s = 1 + Math.sin(engine.gameTime * 40) * 0.1
        glowRef.current.scale.setScalar(s)
      }
    }
  })

  const d = enemyDesigns[enemy.type] || enemyDesigns.basic

  const body = () => {
    switch (enemy.type) {
      case 'basic':
        return (
          <group>
            <mesh><tetrahedronGeometry args={[0.5, 0]} /><meshStandardMaterial color={d.color} emissive={d.emissive} emissiveIntensity={0.15} metalness={d.metalness} roughness={d.roughness} /></mesh>
            <mesh position={[0, -0.3, 0]}><coneGeometry args={[0.08, 0.15, 6]} /><meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.6} /></mesh>
          </group>
        )
      case 'fast':
        return (
          <group>
            <mesh rotation={[0, 0, Math.PI]}><coneGeometry args={[0.25, 0.55, 6]} /><meshStandardMaterial color={d.color} emissive={d.emissive} emissiveIntensity={0.2} metalness={d.metalness} roughness={d.roughness} /></mesh>
            <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.3, 0.03, 0.06]} /><meshStandardMaterial color="#dd8833" metalness={0.3} roughness={0.5} /></mesh>
            <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.3, 0.03, 0.06]} /><meshStandardMaterial color="#dd8833" metalness={0.3} roughness={0.5} /></mesh>
          </group>
        )
      case 'tank':
        return (
          <group>
            <mesh><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color={d.color} emissive={d.emissive} emissiveIntensity={0.12} metalness={d.metalness} roughness={d.roughness} /></mesh>
            <mesh><boxGeometry args={[0.7, 0.1, 0.7]} /><meshStandardMaterial color="#664488" metalness={0.5} roughness={0.4} /></mesh>
            {[-0.25, 0.25].map((x) => (
              <mesh key={`g-${x}`} position={[x, -0.3, 0]}><cylinderGeometry args={[0.04, 0.06, 0.1, 6]} /><meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.5} /></mesh>
            ))}
          </group>
        )
      case 'shooter':
        return (
          <group>
            <mesh><octahedronGeometry args={[0.45, 0]} /><meshStandardMaterial color={d.color} emissive={d.emissive} emissiveIntensity={0.2} metalness={d.metalness} roughness={d.roughness} /></mesh>
            <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.04, 0.08, 0.15, 6]} /><meshBasicMaterial color="#ff0044" blending={THREE.AdditiveBlending} transparent opacity={0.6} /></mesh>
            <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.06, 0.12, 6]} /><meshBasicMaterial color="#ff0088" blending={THREE.AdditiveBlending} transparent opacity={0.4} /></mesh>
          </group>
        )
      case 'elite':
        return (
          <group>
            <mesh><dodecahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color={d.color} emissive={d.emissive} emissiveIntensity={0.3} metalness={d.metalness} roughness={d.roughness} /></mesh>
            <mesh><dodecahedronGeometry args={[0.75, 0]} /><meshStandardMaterial color={d.emissive} emissive={d.emissive} emissiveIntensity={0.2} metalness={0.5} roughness={0.3} wireframe transparent opacity={0.2} /></mesh>
            {[-0.3, 0.3].map((x) => (
              <mesh key={`w-${x}`} position={[x, 0, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}><coneGeometry args={[0.1, 0.25, 6]} /><meshStandardMaterial color="#aa3366" metalness={0.4} roughness={0.4} /></mesh>
            ))}
            <mesh position={[0, 0.4, 0]}><sphereGeometry args={[0.06, 6, 6]} /><meshBasicMaterial color="#ffff00" /></mesh>
          </group>
        )
    }
  }

  return (
    <group ref={groupRef} scale={d.scale}>
      {body()}
      <mesh ref={glowRef} visible={false} scale={3}>
        <sphereGeometry />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
})
