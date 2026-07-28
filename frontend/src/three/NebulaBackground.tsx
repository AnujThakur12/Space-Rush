import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COLORS = ['#ffffff', '#aabbff', '#ffddaa', '#ffaacc']
const MAX_STARS = 6000

export function NebulaBackground() {
  const groupRef = useRef<THREE.Group>(null)
  const shootingStarRef = useRef<THREE.Points>(null)
  const prevTime = useRef(0)

  const layerDefs = useMemo(() => [
    { count: 3500, spread: 60, depth: 300, size: 0.08, speed: 0.4, opacity: 0.5 },
    { count: 1500, spread: 50, depth: 150, size: 0.15, speed: 0.8, opacity: 0.6 },
    { count: 600, spread: 40, depth: 60, size: 0.3, speed: 1.5, opacity: 0.7 },
    { count: 150, spread: 35, depth: 20, size: 0.5, speed: 3.0, opacity: 0.9 },
  ], [])

  const layers = useMemo(() => layerDefs.map((def) => {
    const positions = new Float32Array(def.count * 3)
    const sizes = new Float32Array(def.count)
    const colors = new Float32Array(def.count * 3)
    for (let i = 0; i < def.count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * def.spread * 2
      positions[i3 + 1] = (Math.random() - 0.5) * def.spread
      positions[i3 + 2] = -Math.random() * def.depth - 15
      sizes[i] = Math.random() * def.size + def.size * 0.2
      const c = new THREE.Color(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)])
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { geo, def }
  }), [layerDefs])

  const nebulae = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const dx = (x - size / 2) / (size / 2)
        const dy = (y - size / 2) / (size / 2)
        const d = Math.sqrt(dx * dx + dy * dy)
        const noise = Math.sin(x * 0.4 + y * 0.3) * Math.cos(x * 0.15 - y * 0.35) * 0.4 + 0.5
        const alpha = Math.max(0, 1 - d * 1.1) * (0.3 + noise * 0.7)
        imageData.data[i] = 255
        imageData.data[i + 1] = 255
        imageData.data[i + 2] = 255
        imageData.data[i + 3] = Math.floor(alpha * 200)
      }
    }
    ctx.putImageData(imageData, 0, 0)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true

    const configs = [
      { color: '#331188', pos: [-18, 5, -120], scale: [35, 35], opacity: 0.06 },
      { color: '#114488', pos: [22, -8, -140], scale: [40, 40], opacity: 0.05 },
      { color: '#661144', pos: [-20, -12, -90], scale: [25, 25], opacity: 0.04 },
      { color: '#115566', pos: [15, 10, -110], scale: [30, 30], opacity: 0.05 },
      { color: '#442288', pos: [5, -15, -150], scale: [35, 35], opacity: 0.06 },
    ]

    return configs.map((cfg) => {
      const mat = new THREE.SpriteMaterial({
        map: tex, color: cfg.color,
        transparent: true, opacity: cfg.opacity,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2])
      sprite.scale.set(cfg.scale[0], cfg.scale[1], 1)
      return sprite
    })
  }, [])

  const shootingStarCount = 4
  const shootingStarData = useMemo(() => {
    const pos = new Float32Array(shootingStarCount * 3)
    const data = Array.from({ length: shootingStarCount }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: Math.random() * 15 + 10,
      vy: -(Math.random() * 20 + 25),
      life: Math.random() * 10,
      maxLife: 2 + Math.random() * 3,
    }))
    return { data, geo: new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)) }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    for (let li = 0; li < layers.length; li++) {
      const points = groupRef.current.children[li] as THREE.Points
      if (!points) continue
      const pos = points.geometry.attributes.position.array as Float32Array
      const sizesArr = points.geometry.attributes.size.array as Float32Array
      const def = layers[li].def

      for (let i = 0; i < def.count; i++) {
        const i3 = i * 3
        pos[i3 + 1] += def.speed * delta * (0.3 + sizesArr[i] * 0.7)
        if (pos[i3 + 1] > def.spread * 0.5) {
          pos[i3 + 1] = -def.spread * 0.5
          pos[i3] = (Math.random() - 0.5) * def.spread * 2
        }
      }
      points.geometry.attributes.position.needsUpdate = true
    }

    if (shootingStarRef.current) {
      const pos = shootingStarRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < shootingStarCount; i++) {
        const d = shootingStarData.data[i]
        d.life += delta
        if (d.life > d.maxLife) {
          d.x = (Math.random() - 0.5) * 50
          d.y = Math.random() * 10 + 15
          d.vy = -(Math.random() * 20 + 25)
          d.life = 0
          d.maxLife = 1.5 + Math.random() * 3
        }
        d.y += d.vy * delta
        pos[i * 3] = d.x
        pos[i * 3 + 1] = d.y
        pos[i * 3 + 2] = -40
      }
      shootingStarRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {layers.map(({ geo }, idx) => (
        <points key={idx} geometry={geo}>
          <pointsMaterial
            size={layers[idx].def.size * 0.5}
            vertexColors
            transparent
            opacity={layers[idx].def.opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      {nebulae.map((sprite, idx) => (
        <primitive key={`neb-${idx}`} object={sprite} />
      ))}

      <points ref={shootingStarRef} geometry={shootingStarData.geo}>
        <pointsMaterial
          size={0.3}
          color="#ffffff"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
