import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameEngine } from '../engine/GameEngine'
import { worldX, worldY } from './coords'

const MAX = 400

export function Effects3D({ engine }: { engine: GameEngine }) {
  const pointsRef = useRef<THREE.Points>(null)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(MAX), 1))
    return g
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const col = pointsRef.current.geometry.attributes.color.array as Float32Array
    const siz = pointsRef.current.geometry.attributes.size.array as Float32Array
    const particles = engine.particles.slice(0, MAX)

    for (let i = 0; i < MAX; i++) {
      const i3 = i * 3
      if (i < particles.length) {
        const p = particles[i]
        pos[i3] = worldX(engine.canvasW, p.x)
        pos[i3 + 1] = worldY(engine.canvasH, p.y)
        pos[i3 + 2] = (Math.random() - 0.5) * 0.1
        const c = new THREE.Color(p.color || '#ffffff')
        col[i3] = c.r * p.alpha
        col[i3 + 1] = c.g * p.alpha
        col[i3 + 2] = c.b * p.alpha
        siz[i] = (p.size || 2) * p.alpha * 0.035
      } else {
        pos[i3] = 0; pos[i3 + 1] = 0; pos[i3 + 2] = -100
        col[i3] = 0; col[i3 + 1] = 0; col[i3 + 2] = 0
        siz[i] = 0
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
    pointsRef.current.geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={0.25}
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
