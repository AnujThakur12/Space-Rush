import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

export function PlayerShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)
  const engineGlowRef = useRef<THREE.Mesh>(null)
  const leftFlameRef = useRef<THREE.Mesh>(null)
  const rightFlameRef = useRef<THREE.Mesh>(null)
  const cockpitRef = useRef<THREE.Mesh>(null)
  const engineLightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const p = engine.player
    if (!groupRef.current || !p.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (p.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(p.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x += (worldX - groupRef.current.position.x) * 0.12
    groupRef.current.position.y += (worldY - groupRef.current.position.y) * 0.12

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const maxRoll = 0.5
    const targetRoll = -clamp((p.vx / 250) * maxRoll, -maxRoll, maxRoll)
    const targetPitch = clamp((p.vy / 250) * 0.4, -0.4, 0.4)
    const targetYaw = clamp((p.vx / 250) * 0.25, -0.25, 0.25)
    groupRef.current.rotation.z += (targetRoll - groupRef.current.rotation.z) * 0.1
    groupRef.current.rotation.x += (targetPitch - groupRef.current.rotation.x) * 0.1
    groupRef.current.rotation.y += (targetYaw - groupRef.current.rotation.y) * 0.1

    const hover = Math.sin(engine.gameTime * 3) * 0.06
    groupRef.current.position.z = hover

    const t = performance.now() / 1000

    if (engineGlowRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.08
      engineGlowRef.current.scale.setScalar(pulse)
    }

    if (leftFlameRef.current && rightFlameRef.current) {
      const flicker = 0.7 + Math.random() * 0.3
      leftFlameRef.current.scale.set(1, flicker, 1)
      rightFlameRef.current.scale.set(1, flicker * (0.8 + Math.random() * 0.2), 1)
    }

    if (cockpitRef.current) {
      const mat = cockpitRef.current.material as THREE.MeshBasicMaterial
      const glow = 0.6 + Math.sin(t * 5) * 0.4
      mat.opacity = glow
    }

    if (engineLightRef.current) {
      const flicker = 0.5 + Math.random() * 0.2
      engineLightRef.current.intensity = flicker
    }

    if (p.invincible > 0) {
      const flash = Math.sin(engine.gameTime * 30) > 0
      groupRef.current.visible = flash
    } else {
      groupRef.current.visible = true
    }

    if (shieldRef.current) {
      shieldRef.current.visible = p.shield > 0
      if (p.shield > 0) {
        const s = 1 + Math.sin(t * 3) * 0.04
        shieldRef.current.scale.setScalar(s)
      }
    }
  })

  return (
    <group ref={groupRef} scale={0.9}>
      <pointLight ref={engineLightRef} position={[0, -1.2, 0]} intensity={0.6} color="#ff6600" distance={8} decay={2} />

      <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.25, 0.45, 6, 12]} />
        <meshStandardMaterial color="#1a2244" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 8]} />
        <meshStandardMaterial color="#3344aa" metalness={0.7} roughness={0.2} emissive="#2244aa" emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.18, 0.35, 8]} />
        <meshStandardMaterial color="#4488ff" metalness={0.6} roughness={0.3} emissive="#4488ff" emissiveIntensity={0.15} />
      </mesh>

      <mesh position={[-0.55, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 0.04, 0.18]} />
        <meshStandardMaterial color="#3355aa" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 0.1, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.5, 0.04, 0.18]} />
        <meshStandardMaterial color="#3355aa" metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.4, 0.03, 0.12]} />
        <meshStandardMaterial color="#4466cc" metalness={0.5} roughness={0.3} emissive="#4466cc" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.4, 0.03, 0.12]} />
        <meshStandardMaterial color="#4466cc" metalness={0.5} roughness={0.3} emissive="#4466cc" emissiveIntensity={0.05} />
      </mesh>

      <mesh position={[-0.65, 0.12, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.2, 0.02, 0.08]} />
        <meshStandardMaterial color="#5577dd" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.65, 0.12, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.2, 0.02, 0.08]} />
        <meshStandardMaterial color="#5577dd" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-0.5, -0.2, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.25, 0.1, 0.08]} />
        <meshStandardMaterial color="#223366" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.25, 0.1, 0.08]} />
        <meshStandardMaterial color="#223366" metalness={0.5} roughness={0.4} />
      </mesh>

      <mesh ref={cockpitRef} position={[0, 0.45, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.8} />
      </mesh>

      <mesh position={[0, 0.35, -0.2]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      <mesh position={[-0.28, -0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.12, 6]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.28, -0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.12, 6]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} />
      </mesh>

      <mesh ref={leftFlameRef} position={[-0.28, -0.5, 0]}>
        <coneGeometry args={[0.07, 0.25, 6]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={rightFlameRef} position={[0.28, -0.5, 0]}>
        <coneGeometry args={[0.07, 0.25, 6]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh ref={engineGlowRef} position={[0, -0.55, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh position={[-0.28, -0.55, 0]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.28, -0.55, 0]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {[-0.5, 0.5].map((x) => (
        <mesh key={`wingtip-${x}`} position={[x * 1.0, 0.1, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      <mesh ref={shieldRef} visible={false}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          transparent
          opacity={0.08}
          wireframe
          depthWrite={false}
          emissive="#00ffff"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
