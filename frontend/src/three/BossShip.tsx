import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

export function BossShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const auraRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const boss = engine.boss
    if (!groupRef.current || !boss || !boss.alive) return

    groupRef.current.visible = boss.alive && boss.deathTimer <= 0

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (boss.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(boss.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x += (worldX - groupRef.current.position.x) * 0.06
    groupRef.current.position.y += (worldY - groupRef.current.position.y) * 0.06

    groupRef.current.rotation.z = Math.sin(engine.gameTime * 0.2) * 0.03

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += 0.01
      outerRingRef.current.rotation.y += 0.008
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x -= 0.008
      innerRingRef.current.rotation.z += 0.012
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(engine.gameTime * 3) * 0.06
      coreRef.current.scale.setScalar(pulse)
    }
    if (auraRef.current) {
      const pulse = 1 + Math.sin(engine.gameTime * 2) * 0.08
      auraRef.current.scale.setScalar(pulse)
      const mat = auraRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + Math.sin(engine.gameTime * 1.5) * 0.03
    }
  })

  return (
    <group ref={groupRef} visible={false} scale={1.3}>
      <mesh ref={auraRef}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial
          color="#ff2200"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.6, 0.05, 8, 32]} />
        <meshStandardMaterial
          color="#ff6600"
          metalness={0.8}
          roughness={0.2}
          emissive="#ff4400"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.1, 0.03, 8, 24]} />
        <meshStandardMaterial
          color="#ff4400"
          metalness={0.7}
          roughness={0.3}
          emissive="#ff2200"
          emissiveIntensity={0.4}
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

      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ff4444"
          metalness={0.9}
          roughness={0.1}
          emissive="#ff4400"
          emissiveIntensity={0.6}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.4, 0, 0]} rotation={[0, 0, side * 0.5]}>
          <coneGeometry args={[0.25, 0.6, 6]} />
          <meshStandardMaterial
            color="#dd3333"
            metalness={0.6}
            roughness={0.3}
            emissive="#ff2200"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {[-0.6, -0.3, 0.3, 0.6].map((x, i) => (
        <mesh key={`turret-${i}`} position={[x, -0.7, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.07, 0.15, 6]} />
          <meshStandardMaterial color="#aa4444" emissive="#ff4400" emissiveIntensity={0.3} />
        </mesh>
      ))}

      <mesh position={[0, 0.2, 1.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      <mesh position={[-0.3, 0.4, 1.0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.3, 0.4, 1.0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}
