import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function createSprite(color: string, opacity: number, size: number): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.3, color)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(size * 10, size * 10, 1)
  return sprite
}

export function NebulaBackground() {
  const groupRef = useRef<THREE.Group>(null)
  const cometRef = useRef<THREE.Points>(null)

  const starLayers = useMemo(() => {
    const layers = [
      { count: 800, spread: 2000, depth: -500, size: 0.5, speed: 0.08, color: '#ffffff', opacity: 0.6 },
      { count: 400, spread: 1500, depth: -300, size: 1.0, speed: 0.2, color: '#aaccff', opacity: 0.8 },
      { count: 100, spread: 1000, depth: -150, size: 1.5, speed: 0.4, color: '#ffdd88', opacity: 1.0 },
    ]
    return layers.map((layer) => {
      const positions = new Float32Array(layer.count * 3)
      const sizes = new Float32Array(layer.count)
      const phases = new Float32Array(layer.count)
      for (let i = 0; i < layer.count; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * layer.spread
        positions[i3 + 1] = (Math.random() - 0.5) * layer.spread
        positions[i3 + 2] = -Math.random() * layer.depth - 50
        sizes[i] = Math.random() * layer.size + 0.3
        phases[i] = Math.random() * Math.PI * 2
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      return { geo, layer }
    })
  }, [])

  const nebulaSprites = useMemo(() => {
    const colors = ['#4422aa', '#2244aa', '#882266', '#226688', '#6644cc']
    return colors.map((color) => {
      const sprite = createSprite(color, 0.15 + Math.random() * 0.1, 20 + Math.random() * 30)
      const x = (Math.random() - 0.5) * 60
      const y = (Math.random() - 0.5) * 40
      const z = -50 - Math.random() * 100
      sprite.position.set(x, y, z)
      return sprite
    })
  }, [])

  const cometData = useMemo(() => {
    const count = 5
    const data: { x: number; y: number; z: number; vx: number; vy: number; life: number; maxLife: number }[] = []
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const c = {
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 30 + 10,
        z: -40,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 8 + 5),
        life: Math.random() * 5,
        maxLife: 5 + Math.random() * 5,
      }
      data.push(c)
      positions[i * 3] = c.x
      positions[i * 3 + 1] = c.y
      positions[i * 3 + 2] = c.z
      sizes[i] = 0.3
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return { data, geo }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      const children = groupRef.current.children
      for (let layerIdx = 0; layerIdx < starLayers.length; layerIdx++) {
        const points = children[layerIdx] as THREE.Points
        if (!points) continue
        const pos = points.geometry.attributes.position.array as Float32Array
        const sizes = points.geometry.attributes.size.array as Float32Array
        const count = starLayers[layerIdx].layer.count
        const speed = starLayers[layerIdx].layer.speed
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          pos[i3 + 1] += speed * delta * 30 * (0.5 + sizes[i])
          if (pos[i3 + 1] > starLayers[layerIdx].layer.spread / 2) {
            pos[i3 + 1] = -starLayers[layerIdx].layer.spread / 2
            pos[i3] = (Math.random() - 0.5) * starLayers[layerIdx].layer.spread
          }
        }
        points.geometry.attributes.position.needsUpdate = true
      }
    }

    if (cometRef.current) {
      const pos = cometRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < cometData.data.length; i++) {
        const c = cometData.data[i]
        c.life += delta
        if (c.life > c.maxLife) {
          c.x = (Math.random() - 0.5) * 40
          c.y = Math.random() * 20 + 15
          c.vx = (Math.random() - 0.5) * 5
          c.vy = -(Math.random() * 10 + 8)
          c.life = 0
          c.maxLife = 3 + Math.random() * 5
        }
        c.x += c.vx * delta
        c.y += c.vy * delta
        pos[i * 3] = c.x
        pos[i * 3 + 1] = c.y
        pos[i * 3 + 2] = c.z
      }
      cometRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const refs = useRef<(THREE.Points | null)[]>([])

  return (
    <group ref={groupRef}>
      {starLayers.map(({ geo, layer }, idx) => (
        <points
          key={idx}
          ref={(el) => { refs.current[idx] = el }}
          geometry={geo}
        >
          <pointsMaterial
            size={layer.size}
            color={layer.color}
            transparent
            opacity={layer.opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      {nebulaSprites.map((sprite, idx) => (
        <primitive key={`nebula-${idx}`} object={sprite} />
      ))}

      <points ref={cometRef} geometry={cometData.geo}>
        <pointsMaterial
          size={0.5}
          color="#ffffff"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
