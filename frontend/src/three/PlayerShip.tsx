import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

export function PlayerShip({ engine }: { engine: GameEngine }) {
  const groupRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)
  const thrusterRef = useRef<THREE.Points>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const trailPositions = useRef<Float32Array>(new Float32Array(60 * 3))
  const trailIndex = useRef(0)

  useFrame(() => {
    const p = engine.player
    if (!groupRef.current || !p.alive) return

    const scaleX = engine.canvasW / 1600
    const scaleY = engine.canvasH / 900
    const worldX = (p.x / engine.canvasW - 0.5) * 14 * scaleX
    const worldY = -(p.y / engine.canvasH - 0.5) * 8 * scaleY

    groupRef.current.position.x += (worldX - groupRef.current.position.x) * 0.15
    groupRef.current.position.y += (worldY - groupRef.current.position.y) * 0.15

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const maxRoll = 0.4
    const targetRoll = -clamp((p.vx / 300) * maxRoll, -maxRoll, maxRoll)
    const targetPitch = clamp((p.vy / 300) * 0.3, -0.3, 0.3)
    const targetYaw = clamp((p.vx / 300) * 0.2, -0.2, 0.2)
    groupRef.current.rotation.z += (targetRoll - groupRef.current.rotation.z) * 0.12
    groupRef.current.rotation.x += (targetPitch - groupRef.current.rotation.x) * 0.12
    groupRef.current.rotation.y += (targetYaw - groupRef.current.rotation.y) * 0.12

    const hover = Math.sin(engine.gameTime * 2.5) * 0.08
    groupRef.current.position.z = hover

    if (glowRef.current) {
      const glowScale = 1 + Math.sin(engine.gameTime * 4) * 0.05
      glowRef.current.scale.setScalar(glowScale)
      glowRef.current.position.y = -0.6 + Math.sin(engine.gameTime * 6) * 0.02
    }

    if (thrusterRef.current) {
      const positions = thrusterRef.current.geometry.attributes.position.array as Float32Array
      const opacities = thrusterRef.current.geometry.attributes.opacity?.array as Float32Array
      for (let i = 59; i >= 1; i--) {
        positions[i * 3] = positions[(i - 1) * 3] + (Math.random() - 0.5) * 0.05
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1] - 0.04 * (1 + i * 0.02)
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2]
        if (opacities) opacities[i] = opacities[i - 1] * 0.92
      }
      const thrust = p.fireTimer < 0.05 ? 0.5 : 0.2
      positions[0] = (Math.random() - 0.5) * 0.15
      positions[1] = -0.1 - Math.random() * 0.15 * thrust
      positions[2] = 0
      if (opacities) {
        opacities[0] = 0.6
        thrusterRef.current.geometry.attributes.opacity.needsUpdate = true
      }
      thrusterRef.current.geometry.attributes.position.needsUpdate = true
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
        const s = 1 + Math.sin(engine.gameTime * 3) * 0.03
        shieldRef.current.scale.setScalar(s)
      }
    }
  })

  const bodyColor = '#4488ff'
  const accentColor = '#66aaff'
  const darkColor = '#1a3366'

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.35, 0.6, 8]} />
        <meshStandardMaterial color={darkColor} metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.2} emissive={bodyColor} emissiveIntensity={0.15} />
      </mesh>

      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-0.35, 0.05, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.35, 0.06, 0.12]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.05, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.35, 0.06, 0.12]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff4400" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, 0.5, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1} />
      </mesh>

      <mesh ref={glowRef} position={[0, -0.6, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={thrusterRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={60}
            array={new Float32Array(60 * 3)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-opacity"
            count={60}
            array={new Float32Array(60).fill(0)}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ff8800"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <mesh ref={shieldRef} visible={false}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          transparent
          opacity={0.12}
          wireframe
          depthWrite={false}
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
