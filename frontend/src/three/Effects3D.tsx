import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

interface Effects3DProps {
  engine: GameEngine
}

const MAX_PARTICLES = 100

export function Effects3D({ engine }: Effects3DProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, sizes } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3)
    const colors = new Float32Array(MAX_PARTICLES * 3)
    const siz = new Float32Array(MAX_PARTICLES)
    return {
      geometry: new THREE.BufferGeometry(),
      sizes: siz,
    }
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const col = pointsRef.current.geometry.attributes.color?.array as Float32Array || new Float32Array(MAX_PARTICLES * 3)
    const siz = pointsRef.current.geometry.attributes.size?.array as Float32Array || new Float32Array(MAX_PARTICLES)

    const alive = engine.particles.filter(p => p.type === 'explosion' || p.type === 'trail').slice(0, MAX_PARTICLES)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3
      if (i < alive.length) {
        const p = alive[i]
        const scaleX = engine.canvasW / 1600
        const scaleY = engine.canvasH / 900
        pos[i3] = (p.x / engine.canvasW - 0.5) * 14 * scaleX
        pos[i3 + 1] = -(p.y / engine.canvasH - 0.5) * 8 * scaleY
        pos[i3 + 2] = 0

        const c = new THREE.Color(p.color)
        col[i3] = c.r * p.alpha
        col[i3 + 1] = c.g * p.alpha
        col[i3 + 2] = c.b * p.alpha
        siz[i] = p.size * p.alpha * 0.05
      } else {
        pos[i3] = 0
        pos[i3 + 1] = 0
        pos[i3 + 2] = -100
        col[i3] = 0
        col[i3 + 1] = 0
        col[i3 + 2] = 0
        siz[i] = 0
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(col, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(siz, 1))
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
