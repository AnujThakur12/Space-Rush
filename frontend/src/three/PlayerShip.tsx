import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'
import { worldX, worldY } from './coords'

export function PlayerShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const cockpitRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const p = engine.player
    if (!groupRef.current || !p.alive) return

    const wx = worldX(engine.canvasW, p.x)
    const wy = worldY(engine.canvasH, p.y)

    groupRef.current.position.x += (wx - groupRef.current.position.x) * 0.12
    groupRef.current.position.y += (wy - groupRef.current.position.y) * 0.12

    const roll = clamp(p.vx / 300, -0.3, 0.3)
    const pitch = clamp(p.vy / 300, -0.2, 0.2)
    groupRef.current.rotation.z += (-roll - groupRef.current.rotation.z) * 0.1
    groupRef.current.rotation.x += (pitch * 0.3 - groupRef.current.rotation.x) * 0.1

    const t = performance.now() / 1000

    if (flameRef.current) {
      const flicker = 0.6 + Math.random() * 0.4
      flameRef.current.scale.z = flicker * 1.2
      flameRef.current.position.y = -1.05 - Math.random() * 0.1
    }

    if (cockpitRef.current) {
      const mat = cockpitRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.5 + Math.sin(t * 4) * 0.3
    }

    if (p.invincible > 0) {
      groupRef.current.visible = Math.sin(engine.gameTime * 30) > 0
    } else {
      groupRef.current.visible = true
    }

    if (shieldRef.current) {
      shieldRef.current.visible = p.shield > 0
      if (p.shield > 0) {
        const s = 1 + Math.sin(t * 3) * 0.03
        shieldRef.current.scale.setScalar(s)
      }
    }
  })

  return (
    <group ref={groupRef}>
      <pointLight position={[0, -0.8, 0.5]} intensity={0.4} color="#ff6600" distance={6} decay={2} />

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.6]} />
        <meshStandardMaterial color="#1a2244" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.05, 0.8]}>
        <boxGeometry args={[0.9, 0.06, 0.5]} />
        <meshStandardMaterial color="#2233aa" metalness={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.1, 1.3]}>
        <coneGeometry args={[0.3, 0.4, 8]} />
        <meshStandardMaterial color="#3355cc" metalness={0.6} roughness={0.3}
          emissive="#4488ff" emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[-0.7, 0, 0.1]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.9, 0.04, 0.2]} />
        <meshStandardMaterial color="#2a3a77" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0, 0.1]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.9, 0.04, 0.2]} />
        <meshStandardMaterial color="#2a3a77" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-0.4, 0, 0.25]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.35, 0.03, 0.12]} />
        <meshStandardMaterial color="#3355aa" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 0, 0.25]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.35, 0.03, 0.12]} />
        <meshStandardMaterial color="#3355aa" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-0.95, 0, 0.1]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 0.02, 0.08]} />
        <meshStandardMaterial color="#4466cc" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.95, 0, 0.1]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.15, 0.02, 0.08]} />
        <meshStandardMaterial color="#4466cc" metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[-0.5, -0.05, -0.3]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.3, 0.06, 0.15]} />
        <meshStandardMaterial color="#1a2244" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, -0.05, -0.3]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.3, 0.06, 0.15]} />
        <meshStandardMaterial color="#1a2244" metalness={0.5} roughness={0.4} />
      </mesh>

      <mesh ref={cockpitRef} position={[0, 0.12, 1.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.7} />
      </mesh>

      <mesh position={[-0.35, -0.05, -0.7]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.35, -0.05, -0.7]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.5} />
      </mesh>

      <mesh ref={flameRef} position={[0, -0.1, -1.05]}>
        <coneGeometry args={[0.12, 0.4, 6]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.7}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0, -1.1]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.1}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh position={[-0.35, 0, -0.9]}>
        <planeGeometry args={[0.15, 0.12]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.12}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.35, 0, -0.9]}>
        <planeGeometry args={[0.15, 0.12]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.12}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={shieldRef} visible={false}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff" transparent opacity={0.06}
          wireframe depthWrite={false}
          emissive="#00ffff" emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
