import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

export function BossShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const boss = engine.boss
    if (!groupRef.current || !boss || !boss.alive) return

    groupRef.current.visible = boss.alive && boss.deathTimer <= 0

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (boss.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(boss.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x += (worldX - groupRef.current.position.x) * 0.08
    groupRef.current.position.y += (worldY - groupRef.current.position.y) * 0.08

    groupRef.current.rotation.z = Math.sin(engine.gameTime * 0.3) * 0.05

    if (ringRef.current) {
      ringRef.current.rotation.x += 0.015
      ringRef.current.rotation.y += 0.01
    }

    if (innerRef.current) {
      innerRef.current.rotation.x -= 0.01
      innerRef.current.rotation.z += 0.02
    }

    if (glowRef.current) {
      const pulse = 1 + Math.sin(engine.gameTime * 2) * 0.1
      glowRef.current.scale.setScalar(pulse)
    }

    const flash = boss.flashTimer > 0
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.emissive) mat.emissiveIntensity = flash ? 1 : 0.3
      }
    })
  })

  return (
    <group ref={groupRef} visible={false} scale={1.5}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <dodecahedronGeometry args={[1.0, 0]} />
        <meshStandardMaterial
          color="#cc2222"
          metalness={0.8}
          roughness={0.2}
          emissive="#ff2200"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#ff4444"
          metalness={0.9}
          roughness={0.1}
          emissive="#ff4400"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[1.4, 0.06, 8, 32]} />
        <meshStandardMaterial
          color="#ff8800"
          metalness={0.8}
          roughness={0.2}
          emissive="#ff4400"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, 0, 0.1]}>
        <torusGeometry args={[0.9, 0.03, 8, 24]} />
        <meshStandardMaterial
          color="#ff6600"
          metalness={0.7}
          roughness={0.3}
          emissive="#ff4400"
          emissiveIntensity={0.3}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.1, 0, 0]} rotation={[0, 0, side * 0.5]}>
          <coneGeometry args={[0.2, 0.5, 6]} />
          <meshStandardMaterial
            color="#ff4444"
            metalness={0.6}
            roughness={0.3}
            emissive="#ff2200"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, 1.0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {[-0.5, 0.5].map((x) => (
        <mesh key={`eye-${x}`} position={[x * 0.4, 0.3, 0.9]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      ))}
    </group>
  )
}
