import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'

const MAX_PARTICLES = 300

export function Effects3D({ engine }: { engine: GameEngine }) {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3)
    const colors = new Float32Array(MAX_PARTICLES * 3)
    const sizes = new Float32Array(MAX_PARTICLES)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return { geometry: geo }
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const col = pointsRef.current.geometry.attributes.color.array as Float32Array
    const siz = pointsRef.current.geometry.attributes.size.array as Float32Array

    const alive = engine.particles.slice(0, MAX_PARTICLES)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3
      if (i < alive.length) {
        const p = alive[i]
        const scaleX = engine.canvasW / 1600
        const scaleY = engine.canvasH / 900
        pos[i3] = (p.x / engine.canvasW - 0.5) * 14 * scaleX
        pos[i3 + 1] = -(p.y / engine.canvasH - 0.5) * 8 * scaleY
        pos[i3 + 2] = (Math.random() - 0.5) * 0.5

        const c = new THREE.Color(p.color || '#ffffff')
        col[i3] = c.r * p.alpha
        col[i3 + 1] = c.g * p.alpha
        col[i3 + 2] = c.b * p.alpha
        siz[i] = (p.size || 2) * p.alpha * 0.04
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

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
    pointsRef.current.geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
