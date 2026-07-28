import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function makeSpriteTexture(colors: string[], size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2, cy = size / 2
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx)
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function makeNebulaTexture(): THREE.CanvasTexture {
  const size = 128
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
      const noise = Math.sin(x * 0.3 + y * 0.2) * Math.cos(x * 0.1 - y * 0.4) * 0.5 + 0.5
      const alpha = Math.max(0, 1 - d * 1.2) * (0.4 + noise * 0.6)
      imageData.data[i] = 255
      imageData.data[i + 1] = 255
      imageData.data[i + 2] = 255
      imageData.data[i + 3] = Math.floor(alpha * 255)
    }
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function createGlowTexture(): THREE.CanvasTexture {
  return makeSpriteTexture(['rgba(255,255,255,1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'], 64)
}

const STAR_COLORS = ['#ffffff', '#aaccff', '#ffdd88', '#ffaaff', '#88ddff']

interface PlanetDef {
  position: [number, number, number]
  radius: number
  color: string
  emissive: string
  speed: number
  ring?: boolean
  moon?: boolean
}

export function NebulaBackground() {
  const groupRef = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Points>(null)
  const shootingStarRef = useRef<THREE.Points>(null)
  const fogRef = useRef<THREE.Mesh>(null)

  const { gl } = useThree()

  const starLayers = useMemo(() => {
    const nebulaTex = makeNebulaTexture()
    return [
      {
        count: 3000, spread: 300, depth: 400, size: 0.3, speed: 0.03,
        colors: '#ffffff', opacity: 0.4, twinkle: true,
      },
      {
        count: 1500, spread: 200, depth: 200, size: 0.6, speed: 0.08,
        colors: '#aaccff', opacity: 0.6, twinkle: true,
      },
      {
        count: 500, spread: 120, depth: 80, size: 1.0, speed: 0.15,
        colors: '#ffdd88', opacity: 0.8, twinkle: true,
      },
      {
        count: 200, spread: 60, depth: 30, size: 1.8, speed: 0.3,
        colors: '#ffffff', opacity: 1.0, twinkle: false,
      },
    ].map((layer) => {
      const positions = new Float32Array(layer.count * 3)
      const sizes = new Float32Array(layer.count)
      const phases = new Float32Array(layer.count)
      const colors = new Float32Array(layer.count * 3)
      for (let i = 0; i < layer.count; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * layer.spread * 4
        positions[i3 + 1] = (Math.random() - 0.5) * layer.spread * 2.5
        positions[i3 + 2] = -Math.random() * layer.depth - 20
        sizes[i] = Math.random() * layer.size + layer.size * 0.3
        phases[i] = Math.random() * Math.PI * 2
        const c = new THREE.Color(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)])
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      return { geo, layer }
    })
  }, [])

  const nebulae = useMemo(() => {
    const nebulaTex = makeNebulaTexture()
    const configs = [
      { color: '#4422aa', pos: [-25, 5, -70], scale: 45, opacity: 0.12 },
      { color: '#2244aa', pos: [20, -10, -90], scale: 55, opacity: 0.10 },
      { color: '#882266', pos: [-30, -15, -60], scale: 35, opacity: 0.08 },
      { color: '#226688', pos: [15, 12, -80], scale: 40, opacity: 0.10 },
      { color: '#6644cc', pos: [0, -20, -100], scale: 50, opacity: 0.15 },
      { color: '#4488ff', pos: [-10, 8, -50], scale: 30, opacity: 0.08 },
    ]
    return configs.map((cfg) => {
      const mat = new THREE.SpriteMaterial({
        map: nebulaTex,
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2])
      sprite.scale.set(cfg.scale, cfg.scale, 1)
      return sprite
    })
  }, [])

  const galaxy = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const cx = 128, cy = 128
    for (let i = 0; i < 2000; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.pow(Math.random(), 1.5) * 100
      const spiral = dist * 0.3
      const x = cx + Math.cos(angle + spiral) * dist
      const y = cy + Math.sin(angle + spiral) * dist
      const size = Math.random() * 2 + 0.5
      const bright = Math.random() * 150 + 50
      ctx.fillStyle = `rgba(${bright},${bright},${bright * 0.7},${0.3 + Math.random() * 0.4})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.set(-40, 15, -120)
    sprite.scale.set(60, 60, 1)
    return sprite
  }, [])

  const planets = useMemo(() => {
    const defs: PlanetDef[] = [
      { position: [40, -20, -150], radius: 6, color: '#884422', emissive: '#442200', speed: 0.02, ring: false },
      { position: [-50, 25, -180], radius: 4, color: '#446688', emissive: '#223344', speed: 0.015, ring: true },
      { position: [30, 30, -120], radius: 2.5, color: '#88aacc', emissive: '#446688', speed: 0.03, moon: true },
    ]
    return defs.map((d) => {
      const group = new THREE.Group()
      group.position.set(...d.position)

      const geo = new THREE.SphereGeometry(d.radius, 24, 24)
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.emissive,
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.7,
      })
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)

      const glowMat = new THREE.SpriteMaterial({
        map: createGlowTexture(),
        color: d.color,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const glow = new THREE.Sprite(glowMat)
      glow.scale.set(d.radius * 8, d.radius * 8, 1)
      group.add(glow)

      if (d.ring) {
        const ringGeo = new THREE.RingGeometry(d.radius * 1.4, d.radius * 2.2, 32)
        const ringMat = new THREE.MeshBasicMaterial({
          color: '#6688aa',
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI * 0.4
        ring.rotation.z = 0.3
        group.add(ring)
      }

      if (d.moon) {
        const moonGeo = new THREE.SphereGeometry(d.radius * 0.3, 12, 12)
        const moonMat = new THREE.MeshStandardMaterial({ color: '#999999', roughness: 0.9 })
        const moon = new THREE.Mesh(moonGeo, moonMat)
        moon.position.set(d.radius * 2.5, d.radius * 1.5, 0)
        group.add(moon)
      }

      return { group, speed: d.speed, initialY: d.position[1] }
    })
  }, [])

  const asteroids = useMemo(() => {
    const count = 60
    const group = new THREE.Group()
    for (let i = 0; i < count; i++) {
      const size = 0.3 + Math.random() * 1.2
      const geo = new THREE.IcosahedronGeometry(size, 0)
      const mat = new THREE.MeshStandardMaterial({
        color: `hsl(${20 + Math.random() * 30}, ${10 + Math.random() * 20}%, ${30 + Math.random() * 30}%)`,
        roughness: 0.8,
        metalness: 0.2,
      })
      const mesh = new THREE.Mesh(geo, mat)
      const theta = Math.random() * Math.PI * 2
      const r = 15 + Math.random() * 25
      mesh.position.set(
        Math.cos(theta) * r,
        (Math.random() - 0.5) * 20,
        -35 - Math.random() * 30
      )
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
      mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.02, theta, r }
      group.add(mesh)
    }
    return group
  }, [])

  const dustCount = 1000
  const dustGeo = useMemo(() => {
    const pos = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60
      pos[i * 3 + 2] = -Math.random() * 60 - 5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  const shootingStarCount = 8
  const shootingStarData = useMemo(() => {
    const pos = new Float32Array(shootingStarCount * 3)
    const data: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean }[] = []
    for (let i = 0; i < shootingStarCount; i++) {
      const d = {
        x: (Math.random() - 0.5) * 80,
        y: Math.random() * 30 + 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 10 + 15),
        life: Math.random() * 8,
        maxLife: 3 + Math.random() * 5,
        active: true,
      }
      data.push(d)
      pos[i * 3] = d.x
      pos[i * 3 + 1] = d.y
      pos[i * 3 + 2] = -50
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { data, geo }
  }, [])

  useFrame((_, delta) => {
    const t = performance.now() / 1000

    if (groupRef.current) {
      for (let layerIdx = 0; layerIdx < starLayers.length; layerIdx++) {
        const points = groupRef.current.children[layerIdx] as THREE.Points
        if (!points) continue
        const pos = points.geometry.attributes.position.array as Float32Array
        const sizes = points.geometry.attributes.size.array as Float32Array
        const phases = points.geometry.attributes.phase?.array as Float32Array | undefined
        const count = starLayers[layerIdx].layer.count
        const speed = starLayers[layerIdx].layer.speed

        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          pos[i3 + 1] += speed * delta * 30 * (0.5 + sizes[i] * 0.5)
          if (pos[i3 + 1] > starLayers[layerIdx].layer.spread * 1.25) {
            pos[i3 + 1] = -starLayers[layerIdx].layer.spread * 1.25
            pos[i3] = (Math.random() - 0.5) * starLayers[layerIdx].layer.spread * 4
          }
        }
        points.geometry.attributes.position.needsUpdate = true
      }
    }

    for (const p of planets) {
      p.group.position.y = p.initialY + Math.sin(t * p.speed * 2) * 2
      p.group.rotation.y += delta * p.speed * 5
    }

    for (const child of asteroids.children) {
      child.rotation.x += child.userData.rotSpeed
      child.rotation.y += child.userData.rotSpeed * 0.7
      child.userData.theta += delta * 0.02
      child.position.x = Math.cos(child.userData.theta) * child.userData.r
      child.position.z = -35 - Math.random() * 30
    }

    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < dustCount; i++) {
        pos[i * 3 + 1] += delta * 2
        if (pos[i * 3 + 1] > 30) {
          pos[i * 3 + 1] = -30
          pos[i * 3] = (Math.random() - 0.5) * 80
        }
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (shootingStarRef.current) {
      const pos = shootingStarRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < shootingStarCount; i++) {
        const d = shootingStarData.data[i]
        d.life += delta
        if (d.life > d.maxLife) {
          d.x = (Math.random() - 0.5) * 80
          d.y = Math.random() * 20 + 20
          d.vx = (Math.random() - 0.5) * 3
          d.vy = -(Math.random() * 15 + 20)
          d.life = 0
          d.maxLife = 2 + Math.random() * 4
        }
        d.x += d.vx
        d.y += d.vy * delta * 10
        pos[i * 3] = d.x
        pos[i * 3 + 1] = d.y
        pos[i * 3 + 2] = -50
      }
      shootingStarRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (fogRef.current) {
      const mat = fogRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + Math.sin(t * 0.1) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      {starLayers.map(({ geo }, idx) => (
        <points key={idx} geometry={geo}>
          <pointsMaterial
            size={starLayers[idx].layer.size}
            vertexColors
            transparent
            opacity={starLayers[idx].layer.opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      {nebulae.map((sprite, idx) => (
        <primitive key={`nebula-${idx}`} object={sprite} />
      ))}

      <primitive object={galaxy} />

      {planets.map((p, idx) => (
        <primitive key={`planet-${idx}`} object={p.group} />
      ))}

      <primitive object={asteroids} />

      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          size={0.06}
          color="#88aaff"
          transparent
          opacity={0.15}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={shootingStarRef} geometry={shootingStarData.geo}>
        <pointsMaterial
          size={0.8}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh ref={fogRef} position={[0, 0, -60]}>
        <planeGeometry args={[120, 80]} />
        <meshBasicMaterial
          color="#4422aa"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
