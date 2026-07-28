import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarfieldProps {
  count?: number
}

export function Starfield({ count = 2000 }: StarfieldProps) {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, sizes, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const pha = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 2000
      pos[i3 + 1] = (Math.random() - 0.5) * 2000
      pos[i3 + 2] = -Math.random() * 500 - 100
      siz[i] = Math.random() * 2 + 0.5
      pha[i] = Math.random() * Math.PI * 2
    }
    return { positions: pos, sizes: siz, phases: pha }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, sizes])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array as Float32Array
      const t = clock.getElapsedTime() * 5
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3 + 1] += 0.3 + sizes[i] * 0.2
        if (pos[i3 + 1] > 1000) pos[i3 + 1] = -1000
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={1.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
