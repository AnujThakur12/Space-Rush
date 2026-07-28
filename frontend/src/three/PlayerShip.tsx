import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

interface PlayerShipProps {
  engine: GameEngine
}

export function PlayerShip({ engine }: PlayerShipProps) {
  const groupRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)

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
    const maxRoll = 0.3
    const targetRoll = -clamp((p.vx / 400) * maxRoll, -maxRoll, maxRoll)
    const targetPitch = clamp((p.vy / 400) * 0.2, -0.2, 0.2)
    groupRef.current.rotation.z += (targetRoll - groupRef.current.rotation.z) * 0.1
    groupRef.current.rotation.x += (targetPitch - groupRef.current.rotation.x) * 0.1

    const hover = Math.sin(engine.gameTime * 2) * 0.05
    groupRef.current.position.z = hover

    if (p.invincible > 0) {
      const flash = Math.sin(engine.gameTime * 30) > 0
      groupRef.current.visible = flash
    } else {
      groupRef.current.visible = true
    }

    if (shieldRef.current) {
      shieldRef.current.visible = p.shield > 0
      if (p.shield > 0) {
        const s = 1 + Math.sin(engine.gameTime * 3) * 0.02
        shieldRef.current.scale.setScalar(s)
      }
    }
  })

  const bodyColor = '#4488ff'
  const accentColor = '#88bbff'

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.5, 1.2, 6]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.3]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.6, 0.08, 0.15]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.6, 0.08, 0.15]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={shieldRef} visible={false}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
