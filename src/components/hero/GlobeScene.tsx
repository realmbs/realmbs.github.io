import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Theme } from '../../hooks'
import { CITIES, decodeLand } from './globeData'

type Vec3 = [number, number, number]

type Palette = {
  dotInk: string
  dotAccent: string
  bodyDark: string
  bodyLit: string
  bodyTerm: string
  atmos: string
  atmos2: string
  atmosStrength: number
  star: string
}

const PALETTES: Record<Theme, Palette> = {
  dark: {
    dotInk: '#48628a',
    dotAccent: '#86c5ff',
    bodyDark: '#0d1320',
    bodyLit: '#172131',
    bodyTerm: '#2f6098',
    atmos: '#56aaff',
    atmos2: '#74e0ff',
    atmosStrength: 0.55,
    star: '#9fb4d6',
  },
  light: {
    dotInk: '#64789a',
    dotAccent: '#2461c4',
    bodyDark: '#cdd8e6',
    bodyLit: '#eef3f9',
    bodyTerm: '#a9c6e8',
    atmos: '#3f7fd8',
    atmos2: '#79b8e8',
    atmosStrength: 0.32,
    star: '#c2cfe4',
  },
}

const SEVERITY: Record<Theme, string[]> = {
  dark: ['#56aaff', '#f5b448', '#f05c50'],
  light: ['#2f6fc8', '#d98a14', '#d83b2c'],
}

// world-space "sun" direction (upper-right-front) — the globe spins under it
const LIGHT_DIR: Vec3 = [0.55, 0.4, 0.72]
const SEG = 56
const MAX_ARCS = 14

// ── shaders ────────────────────────────────────────────────────────
const POINTS_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uLight;
  varying float vLit;
  void main(){
    vec3 wN = normalize(mat3(modelMatrix) * position);
    vLit = dot(wN, normalize(uLight));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const POINTS_FRAG = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vLit;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float soft = smoothstep(0.25, 0.05, d);
    float lit = smoothstep(-0.5, 0.8, vLit);
    vec3 col = mix(uInk, uAccent, lit);
    float a = soft * (0.44 + 0.56 * lit) * uOpacity;
    gl_FragColor = vec4(col, a);
  }
`
const BODY_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vN = normalize(mat3(modelMatrix) * normal);
    vP = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const BODY_FRAG = /* glsl */ `
  uniform vec3 uLight;
  uniform vec3 uDark;
  uniform vec3 uLit;
  uniform vec3 uTermCol;
  uniform float uTerm;
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vec3 N = normalize(vN);
    float d = dot(N, normalize(uLight));
    float lit = smoothstep(-0.5, 0.7, d);
    vec3 col = mix(uDark, uLit, lit);
    float term = smoothstep(-0.08, 0.12, d) * (1.0 - smoothstep(0.12, 0.55, d));
    col += uTermCol * term * uTerm;
    vec3 V = normalize(cameraPosition - vP);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    col = mix(col, uDark, fres * 0.25);
    gl_FragColor = vec4(col, 1.0);
  }
`
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
  uniform float uPower;
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vec3 V = normalize(cameraPosition - vP);
    float f = pow(1.0 - max(dot(normalize(vN), V), 0.0), uPower);
    gl_FragColor = vec4(uColor, f * uStrength);
  }
`
const ARC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ARC_FRAG = /* glsl */ `
  uniform float uHead;
  uniform float uTail;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main(){
    float t = vUv.x;
    if (t > uHead || t < uTail) discard;
    float span = max(uHead - uTail, 1e-4);
    float trail = clamp((t - uTail) / span, 0.0, 1.0);
    float a = pow(trail, 1.7);
    float edge = smoothstep(0.0, 0.55, 1.0 - abs(vUv.y - 0.5) * 2.0);
    a *= edge;
    vec3 col = uColor * (0.5 + 0.95 * trail);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`

// ── helpers ────────────────────────────────────────────────────────
function slerp(a: Vec3, b: Vec3, s: number, out: THREE.Vector3) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  dot = Math.max(-1, Math.min(1, dot))
  const om = Math.acos(dot)
  if (om < 1e-4) {
    out.set(a[0], a[1], a[2])
    return
  }
  const so = Math.sin(om)
  const k0 = Math.sin((1 - s) * om) / so
  const k1 = Math.sin(s * om) / so
  out.set(a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1)
}

function makeGlowTexture() {
  const s = 64
  const c = document.createElement('canvas')
  c.width = s
  c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeStars(palette: Palette) {
  const N = 380
  const pos = new Float32Array(N * 3)
  const seed = (i: number) => {
    // deterministic pseudo-random (no Math.random — keeps frames reproducible)
    const x = Math.sin(i * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  for (let i = 0; i < N; i++) {
    const x = (seed(i) - 0.5) * 14
    const y = (seed(i + 101) - 0.5) * 9
    const z = -4 - seed(i + 211) * 10 // always behind the globe
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(palette.star),
    size: 0.03,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })
  return new THREE.Points(geo, mat)
}

type Arc = {
  active: boolean
  a: Vec3
  b: Vec3
  t: number
  speed: number
  sev: number
  pts: THREE.Vector3[]
  mesh: THREE.Mesh
  mat: THREE.ShaderMaterial
  head: THREE.Sprite
  flash: THREE.Sprite
}

function arcRadius(sev: number) {
  return sev === 2 ? 0.011 : sev === 1 ? 0.0085 : 0.0065
}

/** Pool of premium tube-based "comet" threat arcs added to a THREE.Group. */
function createThreats(glow: THREE.Texture) {
  const group = new THREE.Group()
  const arcs: Arc[] = []
  const tmp = new THREE.Vector3()

  for (let i = 0; i < MAX_ARCS; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: ARC_VERT,
      fragmentShader: ARC_FRAG,
      uniforms: {
        uHead: { value: 0 },
        uTail: { value: 0 },
        uOpacity: { value: 1 },
        uColor: { value: new THREE.Color('#56aaff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat)
    mesh.frustumCulled = false
    mesh.visible = false

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

    group.add(mesh, head, flash)
    arcs.push({
      active: false,
      a: [0, 0, 0],
      b: [0, 0, 0],
      t: 0,
      speed: 0,
      sev: 0,
      pts: [],
      mesh,
      mat,
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

    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= SEG; i++) {
      const f = i / SEG
      slerp(a.v, b.v, f, tmp)
      const r = 1 + lift * Math.sin(Math.PI * f)
      pts.push(new THREE.Vector3(tmp.x * r, tmp.y * r, tmp.z * r))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const geo = new THREE.TubeGeometry(curve, SEG, arcRadius(sev), 8, false)
    slot.mesh.geometry.dispose()
    slot.mesh.geometry = geo

    const col = new THREE.Color(severityColors[sev])
    slot.mat.uniforms.uColor.value.copy(col)
    ;(slot.head.material as THREE.SpriteMaterial).color.copy(col)
    ;(slot.flash.material as THREE.SpriteMaterial).color.copy(col)

    slot.a = a.v
    slot.b = b.v
    slot.t = 0
    slot.speed = 0.007 + Math.random() * 0.011
    slot.sev = sev
    slot.pts = pts
    slot.active = true
    slot.mesh.visible = true
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
        s.mesh.visible = false
        s.head.visible = false
        s.flash.visible = false
        continue
      }
      const head = Math.min(s.t, 1)
      const tail = Math.max(0, s.t - 0.46)
      s.mat.uniforms.uHead.value = head
      s.mat.uniforms.uTail.value = tail
      s.mat.uniforms.uOpacity.value = s.sev === 2 ? 0.95 : 0.82

      if (head < 1) {
        const p = s.pts[Math.min(SEG, Math.round(head * SEG))]
        s.head.position.copy(p)
        s.head.scale.setScalar(s.sev === 2 ? 0.08 : 0.06)
        ;(s.head.material as THREE.SpriteMaterial).opacity = 0.95
        s.head.visible = true
      } else {
        s.head.visible = false
      }

      if (s.t < 0.5) {
        s.flash.position.set(s.a[0], s.a[1], s.a[2])
        s.flash.scale.setScalar(0.055)
        ;(s.flash.material as THREE.SpriteMaterial).opacity = 0.8 * (1 - s.t * 1.6)
        s.flash.visible = true
      } else if (s.t >= 1) {
        const fade = 1 - (s.t - 1) / 0.3
        if (fade > 0) {
          s.flash.position.set(s.b[0], s.b[1], s.b[2])
          s.flash.scale.setScalar(0.055 + (1 - fade) * 0.15)
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
      s.mesh.geometry.dispose()
      s.mat.dispose()
      ;(s.head.material as THREE.Material).dispose()
      ;(s.flash.material as THREE.Material).dispose()
    }
  }

  return { group, update, dispose }
}

export default function GlobeScene({ theme }: { theme: Theme }) {
  const palette = PALETTES[theme]
  const severityColors = SEVERITY[theme]
  const { gl, size, viewport } = useThree()
  const spinRef = useRef<THREE.Group>(null)

  const glow = useMemo(() => makeGlowTexture(), [])
  const landGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(decodeLand(), 3))
    return g
  }, [])
  const threats = useMemo(() => createThreats(glow), [glow])
  const stars = useMemo(() => makeStars(palette), [palette])

  // materials are created once; their uniforms are updated on theme change
  const mats = useMemo(() => {
    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      uniforms: {
        uSize: { value: 4.6 },
        uPixelRatio: { value: 1 },
        uLight: { value: new THREE.Vector3(...LIGHT_DIR) },
        uInk: { value: new THREE.Color() },
        uAccent: { value: new THREE.Color() },
        uOpacity: { value: 0.95 },
      },
      transparent: true,
      depthWrite: false,
    })
    const bodyMat = new THREE.ShaderMaterial({
      vertexShader: BODY_VERT,
      fragmentShader: BODY_FRAG,
      uniforms: {
        uLight: { value: new THREE.Vector3(...LIGHT_DIR) },
        uDark: { value: new THREE.Color() },
        uLit: { value: new THREE.Color() },
        uTermCol: { value: new THREE.Color() },
        uTerm: { value: 0.5 },
      },
    })
    const makeAtmos = (power: number) =>
      new THREE.ShaderMaterial({
        vertexShader: ATMOS_VERT,
        fragmentShader: ATMOS_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uStrength: { value: 0.5 },
          uPower: { value: power },
        },
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    return { pointsMat, bodyMat, atmosInner: makeAtmos(3.4), atmosOuter: makeAtmos(2.0) }
  }, [])

  // apply palette → uniforms (runs on mount + theme change)
  useEffect(() => {
    mats.pointsMat.uniforms.uPixelRatio.value = gl.getPixelRatio()
    mats.pointsMat.uniforms.uInk.value.set(palette.dotInk)
    mats.pointsMat.uniforms.uAccent.value.set(palette.dotAccent)
    mats.bodyMat.uniforms.uDark.value.set(palette.bodyDark)
    mats.bodyMat.uniforms.uLit.value.set(palette.bodyLit)
    mats.bodyMat.uniforms.uTermCol.value.set(palette.bodyTerm)
    mats.atmosInner.uniforms.uColor.value.set(palette.atmos)
    mats.atmosInner.uniforms.uStrength.value = palette.atmosStrength
    mats.atmosOuter.uniforms.uColor.value.set(palette.atmos2)
    mats.atmosOuter.uniforms.uStrength.value = palette.atmosStrength * 0.6
    ;(stars.material as THREE.PointsMaterial).color.set(palette.star)
  }, [palette, gl, mats, stars])

  // attach the imperative threats group to the spinning globe
  useEffect(() => {
    const node = spinRef.current
    node?.add(threats.group)
    return () => {
      node?.remove(threats.group)
    }
  }, [threats])

  useEffect(
    () => () => {
      threats.dispose()
      landGeo.dispose()
      glow.dispose()
      stars.geometry.dispose()
      ;(stars.material as THREE.Material).dispose()
      mats.pointsMat.dispose()
      mats.bodyMat.dispose()
      mats.atmosInner.dispose()
      mats.atmosOuter.dispose()
    },
    [threats, landGeo, glow, stars, mats],
  )

  // ── drag-to-spin (static when idle, flick momentum) ──
  const rot = useRef({ y: -2.4, x: -0.32, momentum: 0, dragging: false, lx: 0, ly: 0 })
  useEffect(() => {
    const el = gl.domElement
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
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

  // responsive placement
  const isWide = size.width > 760
  const radius = viewport.height * (isWide ? 0.42 : 0.32)
  const offX = isWide ? viewport.width * 0.2 : 0
  const offY = isWide ? 0 : viewport.height * 0.05

  return (
    <>
      <primitive object={stars} />

      {/* ambient accent glow pooled behind the globe */}
      <sprite
        position={[offX, offY, -radius * 0.6]}
        scale={[radius * 3.4, radius * 3.4, 1]}
      >
        <spriteMaterial
          map={glow}
          color={palette.atmos}
          transparent
          opacity={theme === 'light' ? 0.09 : 0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <group position={[offX, offY, 0]} scale={radius}>
        <group ref={spinRef}>
          {/* day/terminator-lit body — writes depth so the back is occluded */}
          <mesh material={mats.bodyMat}>
            <sphereGeometry args={[0.992, 64, 64]} />
          </mesh>
          {/* dotted continents (round, depth-shaded) */}
          <points geometry={landGeo} material={mats.pointsMat} />
        </group>

        {/* layered atmosphere (does not spin) */}
        <mesh scale={1.025} material={mats.atmosInner}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
        <mesh scale={1.13} material={mats.atmosOuter}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
      </group>
    </>
  )
}
