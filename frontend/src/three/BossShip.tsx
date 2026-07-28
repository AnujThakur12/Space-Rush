import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'
import { worldX, worldY } from './coords'

export function BossShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const boss = engine.boss
    if (!groupRef.current || !boss || !boss.alive) return

    groupRef.current.visible = boss.alive && boss.deathTimer <= 0

    const wx = worldX(engine.canvasW, boss.x)
    const wy = worldY(engine.canvasH, boss.y)

    groupRef.current.position.x += (wx - groupRef.current.position.x) * 0.06
    groupRef.current.position.y += (wy - groupRef.current.position.y) * 0.06

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += 0.006
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= 0.01
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(engine.gameTime * 3) * 0.05
      coreRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} visible={false} scale={1.0}>
      <mesh>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.3}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.8, 0.04, 8, 40]} />
        <meshStandardMaterial color="#ff6600" metalness={0.8} roughness={0.2}
          emissive="#ff4400" emissiveIntensity={0.4} />
      </mesh>

      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.3, 0.03, 8, 32]} />
        <meshStandardMaterial color="#ff4400" metalness={0.7} roughness={0.3}
          emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>

      <mesh>
        <dodecahedronGeometry args={[1.0, 0]} />
        <meshStandardMaterial color="#cc2222" metalness={0.8} roughness={0.2}
          emissive="#ff2200" emissiveIntensity={0.25} />
      </mesh>

      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#ff4444" metalness={0.9} roughness={0.1}
          emissive="#ff4400" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, 0.1, 1.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {[-0.25, 0.25].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.08, 1.1]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      ))}

      {[-0.5, -0.25, 0.25, 0.5].map((x, i) => (
        <mesh key={`turret-${i}`} position={[x, 0, -0.9]}>
          <cylinderGeometry args={[0.03, 0.06, 0.12, 6]} />
          <meshStandardMaterial color="#aa4444" emissive="#ff4400" emissiveIntensity={0.3} />
        </mesh>
      ))}

      <mesh position={[0, 0, -1.2]}>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.5}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
