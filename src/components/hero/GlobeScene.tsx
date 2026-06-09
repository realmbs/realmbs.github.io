import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Theme } from '../../hooks'
import { CITIES, decodeLand } from './globeData'

type Vec3 = [number, number, number]

type Palette = {
  land: string
  body: string
  grat: string
  atmos: string
  atmosStrength: number
}

const PALETTES: Record<Theme, Palette> = {
  dark: {
    land: '#6f93bb',
    body: '#0c0d11',
    grat: '#41506a',
    atmos: '#56aaff',
    atmosStrength: 0.65,
  },
  light: {
    land: '#5a7596',
    body: '#dfe5ec',
    grat: '#9fb0c4',
    atmos: '#266cd8',
    atmosStrength: 0.4,
  },
}

const SEVERITY = ['#56aaff', '#f5b448', '#f05c50'] // routine / elevated / critical
const SEVERITY_LIGHT = ['#266cd8', '#d98a14', '#d83b2c']

const SEG = 50
const MAX_ARCS = 14

function slerp(a: Vec3, b: Vec3, s: number, out: Vec3) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  dot = Math.max(-1, Math.min(1, dot))
  const om = Math.acos(dot)
  if (om < 1e-4) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return
  }
  const so = Math.sin(om)
  const k0 = Math.sin((1 - s) * om) / so
  const k1 = Math.sin(s * om) / so
  out[0] = a[0] * k0 + b[0] * k1
  out[1] = a[1] * k0 + b[1] * k1
  out[2] = a[2] * k0 + b[2] * k1
}

function makeGlowTexture() {
  const s = 64
  const c = document.createElement('canvas')
  c.width = s
  c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

type Arc = {
  active: boolean
  a: Vec3
  b: Vec3
  t: number
  speed: number
  sev: number
  positions: Float32Array
  line: THREE.Line
  head: THREE.Sprite
  flash: THREE.Sprite
}

/** Self-contained pool of threat arcs added to a THREE.Group. */
function createThreats(glow: THREE.Texture) {
  const group = new THREE.Group()
  const arcs: Arc[] = []
  const tmp: Vec3 = [0, 0, 0]

  for (let i = 0; i < MAX_ARCS; i++) {
    const positions = new Float32Array((SEG + 1) * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const lineMat = new THREE.LineBasicMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const line = new THREE.Line(geo, lineMat)
    line.frustumCulled = false
    line.visible = false

    const headMat = new THREE.SpriteMaterial({
      map: glow,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const head = new THREE.Sprite(headMat)
    head.visible = false

    const flash = new THREE.Sprite(headMat.clone())
    flash.visible = false

    group.add(line, head, flash)
    arcs.push({
      active: false,
      a: [0, 0, 0],
      b: [0, 0, 0],
      t: 0,
      speed: 0,
      sev: 0,
      positions,
      line,
      head,
      flash,
    })
  }

  function spawn(severityColors: string[]) {
    const slot = arcs.find((s) => !s.active)
    if (!slot) return
    const a = CITIES[(Math.random() * CITIES.length) | 0]
    let b = CITIES[(Math.random() * CITIES.length) | 0]
    let guard = 0
    while (b === a && guard++ < 5) b = CITIES[(Math.random() * CITIES.length) | 0]

    const dot = Math.max(
      -1,
      Math.min(1, a.v[0] * b.v[0] + a.v[1] * b.v[1] + a.v[2] * b.v[2]),
    )
    const ang = Math.acos(dot)
    const lift = 0.12 + 0.62 * (ang / Math.PI) + Math.random() * 0.05
    const roll = Math.random()
    const sev = roll > 0.88 ? 2 : roll > 0.6 ? 1 : 0

    // bake the lifted great-circle path into the geometry (local space; the
    // parent group handles rotation, so points stay fixed once spawned)
    const pos = slot.positions
    for (let i = 0; i <= SEG; i++) {
      const f = i / SEG
      slerp(a.v, b.v, f, tmp)
      const r = 1 + lift * Math.sin(Math.PI * f)
      pos[i * 3] = tmp[0] * r
      pos[i * 3 + 1] = tmp[1] * r
      pos[i * 3 + 2] = tmp[2] * r
    }
    slot.line.geometry.attributes.position.needsUpdate = true

    const col = new THREE.Color(severityColors[sev])
    ;(slot.line.material as THREE.LineBasicMaterial).color = col
    ;(slot.head.material as THREE.SpriteMaterial).color = col
    ;(slot.flash.material as THREE.SpriteMaterial).color = col

    slot.a = a.v
    slot.b = b.v
    slot.t = 0
    slot.speed = 0.007 + Math.random() * 0.011
    slot.sev = sev
    slot.active = true
    slot.line.visible = true
  }

  function update(dtFrames: number, intensity: number, severityColors: string[]) {
    let activeCount = 0
    for (const s of arcs) if (s.active) activeCount++

    const target = 4 + Math.round(intensity * 9)
    if (activeCount < target && Math.random() < 0.09 * dtFrames) {
      spawn(severityColors)
    }

    for (const s of arcs) {
      if (!s.active) continue
      s.t += s.speed * dtFrames
      if (s.t >= 1.3) {
        s.active = false
        s.line.visible = false
        s.head.visible = false
        s.flash.visible = false
        continue
      }
      const head = Math.min(s.t, 1)
      const tail = Math.max(0, s.t - 0.46)
      const start = Math.floor(tail * SEG)
      const end = Math.ceil(head * SEG)
      s.line.geometry.setDrawRange(start, Math.max(0, end - start + 1))
      ;(s.line.material as THREE.LineBasicMaterial).opacity =
        s.sev === 2 ? 0.75 : 0.6

      // travelling head sprite — read the baked path position for an exact match
      if (head < 1) {
        const i = Math.min(SEG, Math.round(head * SEG))
        s.head.position.set(
          s.positions[i * 3],
          s.positions[i * 3 + 1],
          s.positions[i * 3 + 2],
        )
        s.head.scale.setScalar(s.sev === 2 ? 0.07 : 0.055)
        ;(s.head.material as THREE.SpriteMaterial).opacity = 0.95
        s.head.visible = true
      } else {
        s.head.visible = false
      }

      // origin ping (early) then impact flash (on arrival) reuse one sprite
      if (s.t < 0.5) {
        s.flash.position.set(s.a[0], s.a[1], s.a[2])
        s.flash.scale.setScalar(0.05)
        ;(s.flash.material as THREE.SpriteMaterial).opacity =
          0.8 * (1 - s.t * 1.6)
        s.flash.visible = s.t < 0.5
      } else if (s.t >= 1) {
        const fade = 1 - (s.t - 1) / 0.3
        if (fade > 0) {
          s.flash.position.set(s.b[0], s.b[1], s.b[2])
          s.flash.scale.setScalar(0.05 + (1 - fade) * 0.13)
          ;(s.flash.material as THREE.SpriteMaterial).opacity = fade * 0.85
          s.flash.visible = true
        } else {
          s.flash.visible = false
        }
      } else {
        s.flash.visible = false
      }
    }
  }

  function dispose() {
    for (const s of arcs) {
      s.line.geometry.dispose()
      ;(s.line.material as THREE.Material).dispose()
      ;(s.head.material as THREE.Material).dispose()
      ;(s.flash.material as THREE.Material).dispose()
    }
  }

  return { group, update, dispose }
}

const ATMOS_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vN = normalize(mat3(modelMatrix) * normal);
    vP = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ATMOS_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vec3 viewDir = normalize(cameraPosition - vP);
    float f = pow(1.0 - max(dot(normalize(vN), viewDir), 0.0), 3.0);
    gl_FragColor = vec4(uColor, f * uStrength);
  }
`

export default function GlobeScene({ theme }: { theme: Theme }) {
  const palette = PALETTES[theme]
  const severityColors = theme === 'light' ? SEVERITY_LIGHT : SEVERITY
  const { gl, size, viewport } = useThree()

  const spinRef = useRef<THREE.Group>(null)

  // --- static geometry/materials (built once) ---
  const glow = useMemo(() => makeGlowTexture(), [])
  const landGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(decodeLand(), 3))
    return g
  }, [])
  const graticuleGeo = useMemo(() => buildGraticule(), [])
  const threats = useMemo(() => createThreats(glow), [glow])

  const atmosUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(palette.atmos) },
      uStrength: { value: palette.atmosStrength },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // recolor on theme change
  useEffect(() => {
    atmosUniforms.uColor.value.set(palette.atmos)
    atmosUniforms.uStrength.value = palette.atmosStrength
  }, [palette, atmosUniforms])

  useEffect(() => {
    spinRef.current?.add(threats.group)
    const node = spinRef.current
    return () => {
      node?.remove(threats.group)
    }
  }, [threats])

  useEffect(() => () => {
    threats.dispose()
    landGeo.dispose()
    graticuleGeo.dispose()
    glow.dispose()
  }, [threats, landGeo, graticuleGeo, glow])

  // --- drag-to-spin (static when idle, flick momentum) ---
  const rot = useRef({
    y: -2.4,
    x: -0.32,
    momentum: 0,
    dragging: false,
    lx: 0,
    ly: 0,
  })

  useEffect(() => {
    const el = gl.domElement
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v))
    el.style.cursor = 'grab'
    el.style.touchAction = 'pan-y'

    const onDown = (e: PointerEvent) => {
      rot.current.dragging = true
      rot.current.lx = e.clientX
      rot.current.ly = e.clientY
      rot.current.momentum = 0
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      const r = rot.current
      if (!r.dragging) return
      const dx = e.clientX - r.lx
      const dy = e.clientY - r.ly
      r.y += dx * 0.006
      if (e.pointerType !== 'touch') r.x = clamp(r.x + dy * 0.006, -1.15, 1.15)
      r.momentum = dx * 0.006
      r.lx = e.clientX
      r.ly = e.clientY
    }
    const onUp = () => {
      if (!rot.current.dragging) return
      rot.current.dragging = false
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  useFrame((_, delta) => {
    const dtFrames = Math.min(delta * 60, 3)
    const r = rot.current
    if (!r.dragging) {
      r.y += r.momentum
      r.momentum *= 0.95
      if (Math.abs(r.momentum) < 0.00004) r.momentum = 0
    }
    if (spinRef.current) {
      spinRef.current.rotation.order = 'YXZ'
      spinRef.current.rotation.y = r.y
      spinRef.current.rotation.x = r.x
    }
    threats.update(dtFrames, 0.6, severityColors)
  })

  // --- responsive placement ---
  const isWide = size.width > 760
  const radius = viewport.height * (isWide ? 0.42 : 0.32)
  const offX = isWide ? viewport.width * 0.2 : 0
  const offY = isWide ? 0 : viewport.height * 0.05

  return (
    <>
      {/* ambient accent glow behind the globe */}
      <sprite
        position={[offX, offY, -radius * 0.6]}
        scale={[radius * 3.2, radius * 3.2, 1]}
      >
        <spriteMaterial
          map={glow}
          color={palette.atmos}
          transparent
          opacity={theme === 'light' ? 0.1 : 0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <group position={[offX, offY, 0]} scale={radius}>
        <group ref={spinRef}>
          {/* opaque body — writes depth so the back hemisphere is occluded */}
          <mesh>
            <sphereGeometry args={[0.992, 64, 64]} />
            <meshBasicMaterial color={palette.body} />
          </mesh>

          {/* faint graticule for sphere volume */}
          <lineSegments geometry={graticuleGeo}>
            <lineBasicMaterial
              color={palette.grat}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </lineSegments>

          {/* dotted continents */}
          <points geometry={landGeo}>
            <pointsMaterial
              color={palette.land}
              size={0.013}
              sizeAttenuation
              transparent
              opacity={0.92}
              depthWrite={false}
            />
          </points>

          {/* threat arcs are added imperatively to spinRef in an effect */}
        </group>

        {/* atmosphere rim (does not spin) */}
        <mesh scale={1.045}>
          <sphereGeometry args={[1, 48, 48]} />
          <shaderMaterial
            vertexShader={ATMOS_VERT}
            fragmentShader={ATMOS_FRAG}
            uniforms={atmosUniforms}
            transparent
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </>
  )
}

/** Faint meridians + parallels as a single LineSegments geometry (radius ~1). */
function buildGraticule() {
  const R = 0.995
  const DEG = Math.PI / 180
  const pts: number[] = []
  const push = (lat: number, lon: number) => {
    const cl = Math.cos(lat * DEG)
    pts.push(
      R * cl * Math.cos(lon * DEG),
      R * Math.sin(lat * DEG),
      -R * cl * Math.sin(lon * DEG),
    )
  }
  // meridians every 30°
  for (let lon = 0; lon < 360; lon += 30) {
    for (let lat = -80; lat < 80; lat += 4) {
      push(lat, lon)
      push(lat + 4, lon)
    }
  }
  // parallels every 30°
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 4) {
      push(lat, lon)
      push(lat, lon + 4)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
  return g
}
