import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Enemy } from '../types/game'
import type { GameEngine } from '../engine/GameEngine'
import { worldX, worldY } from './coords'

interface EnemyShipProps {
  enemy: Enemy
  engine: GameEngine
  index: number
}

const designs: Record<string, { color: string; emissive: string; scale: number }> = {
  basic: { color: '#cc4444', emissive: '#ff2222', scale: 0.6 },
  fast: { color: '#dd6622', emissive: '#ff6600', scale: 0.5 },
  tank: { color: '#8844aa', emissive: '#6622aa', scale: 0.9 },
  shooter: { color: '#dd2266', emissive: '#ff0044', scale: 0.7 },
  elite: { color: '#cc0033', emissive: '#ff0033', scale: 1.0 },
}

function BasicShip() {
  return (
    <group>
      <mesh><octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#cc4444" emissive="#ff2222" emissiveIntensity={0.15} metalness={0.3} roughness={0.6} /></mesh>
      <mesh position={[0, 0, -0.3]}><coneGeometry args={[0.06, 0.12, 6]} />
        <meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.5} /></mesh>
    </group>
  )
}

function FastShip() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh><coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color="#dd6622" emissive="#ff6600" emissiveIntensity={0.2} metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.25, 0.03, 0.06]} />
        <meshStandardMaterial color="#dd8833" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.25, 0.03, 0.06]} />
        <meshStandardMaterial color="#dd8833" metalness={0.3} roughness={0.5} /></mesh>
    </group>
  )
}

function TankShip() {
  return (
    <group>
      <mesh><boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#8844aa" emissive="#6622aa" emissiveIntensity={0.12} metalness={0.6} roughness={0.3} /></mesh>
      <mesh><boxGeometry args={[0.6, 0.08, 0.5]} />
        <meshStandardMaterial color="#664488" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[-0.2, 0, -0.3]}><cylinderGeometry args={[0.03, 0.05, 0.08, 6]} />
        <meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.5} /></mesh>
      <mesh position={[0.2, 0, -0.3]}><cylinderGeometry args={[0.03, 0.05, 0.08, 6]} />
        <meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.5} /></mesh>
    </group>
  )
}

function ShooterShip() {
  return (
    <group>
      <mesh><octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#dd2266" emissive="#ff0044" emissiveIntensity={0.2} metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.35, 0.03, 0.08]} />
        <meshStandardMaterial color="#cc3366" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0.35, 0, 0]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.35, 0.03, 0.08]} />
        <meshStandardMaterial color="#cc3366" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0, 0, -0.4]}><cylinderGeometry args={[0.03, 0.06, 0.12, 6]} />
        <meshBasicMaterial color="#ff0044" blending={THREE.AdditiveBlending} transparent opacity={0.6} /></mesh>
    </group>
  )
}

function EliteShip() {
  return (
    <group>
      <mesh><dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#cc0033" emissive="#ff0033" emissiveIntensity={0.3} metalness={0.7} roughness={0.2} /></mesh>
      <mesh><dodecahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#ff0033" emissive="#ff0033" emissiveIntensity={0.15} metalness={0.5} roughness={0.3} wireframe transparent opacity={0.2} /></mesh>
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.35]}><coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color="#aa3366" metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.35]}><coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color="#aa3366" metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[0, 0.1, 0.3]}><sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ffff00" /></mesh>
      <mesh position={[0, 0, -0.4]}><cylinderGeometry args={[0.04, 0.07, 0.12, 6]} />
        <meshBasicMaterial color="#ff4400" blending={THREE.AdditiveBlending} transparent opacity={0.6} /></mesh>
    </group>
  )
}

const shipComponents: Record<string, () => JSX.Element> = {
  basic: BasicShip, fast: FastShip, tank: TankShip, shooter: ShooterShip, elite: EliteShip,
}

export const EnemyShip = memo(function EnemyShip({ enemy, engine, index: _index }: EnemyShipProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !enemy.alive) return

    groupRef.current.position.x = worldX(engine.canvasW, enemy.x)
    groupRef.current.position.y = worldY(engine.canvasH, enemy.y)
    groupRef.current.rotation.z = Math.sin(engine.gameTime * 2 + enemy.x) * 0.08
  })

  const d = designs[enemy.type] || designs.basic
  const ShipComponent = shipComponents[enemy.type] || BasicShip

  return (
    <group ref={groupRef} scale={d.scale}>
      <ShipComponent />
    </group>
  )
})
