import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

interface BossShipProps {
  engine: GameEngine
}

export function BossShip({ engine }: BossShipProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const boss = engine.boss
    if (!groupRef.current || !boss || !boss.alive) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }

    groupRef.current.visible = boss.alive && boss.deathTimer <= 0

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (boss.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(boss.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x += (worldX - groupRef.current.position.x) * 0.1
    groupRef.current.position.y += (worldY - groupRef.current.position.y) * 0.1

    groupRef.current.rotation.z = Math.sin(engine.gameTime * 0.5) * 0.1
    groupRef.current.position.z = Math.sin(engine.gameTime * 0.8) * 0.3

    if (ringRef.current) {
      ringRef.current.rotation.x += 0.02
      ringRef.current.rotation.y += 0.01
    }

    const flash = boss.flashTimer > 0
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        ;(child.material as THREE.MeshStandardMaterial).emissiveIntensity = flash ? 1 : 0
      }
    })
  })

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#ff4444" metalness={0.7} roughness={0.2} emissive="#ff0000" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.6, 0.08, 8, 24]} />
        <meshStandardMaterial color="#ff8800" metalness={0.8} roughness={0.2} emissive="#ff4400" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
