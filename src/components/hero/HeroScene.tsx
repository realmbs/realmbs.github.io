import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const WIDTH = 18
const DEPTH = 13

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScroll;
  uniform vec3 uRipple; // xy = impact point (x,z), z = age in seconds (<0 = idle)
  attribute float aSeed;
  varying float vElev;
  varying float vFade;
  varying float vSeed;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = position;
    float t = uTime * 0.18;
    float h = fbm(pos.xz * 0.45 + vec2(t, -t * 0.7));
    float swell = sin(pos.x * 0.35 + uTime * 0.4) * cos(pos.z * 0.3 - uTime * 0.3);
    // Terrain calms as the visitor scrolls out of the hero.
    pos.y += ((h - 0.5) * 2.2 + swell * 0.25) * (1.0 - uScroll * 0.55);

    // Click ripple: an expanding, decaying ring from the impact point.
    float ring = 0.0;
    if (uRipple.z >= 0.0) {
      float d = distance(position.xz, uRipple.xy);
      ring = sin(d * 3.2 - uRipple.z * 7.0)
        * exp(-d * 0.42)
        * exp(-uRipple.z * 1.5)
        * smoothstep(0.0, 0.12, uRipple.z);
      pos.y += ring * 0.85;
    }

    vElev = h + max(ring, 0.0) * 0.9;
    vSeed = aSeed;

    // Fade out toward the edges so the field doesn't end in a hard line.
    float fx = smoothstep(9.0, 6.0, abs(position.x));
    float fz = smoothstep(-6.5, -3.0, position.z) * smoothstep(6.5, 5.0, position.z);
    vFade = fx * fz;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    vFade *= mix(0.35, 1.0, smoothstep(16.0, 4.0, -mv.z));
    gl_PointSize = uSize * uPixelRatio * (0.55 + 0.9 * h) / -mv.z;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vElev;
  varying float vFade;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.12, d);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.25, 0.95, vElev));
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.6 + vSeed * 6.2831);
    float alpha = disc * vFade * twinkle * 0.9;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(color, alpha);
  }
`

function Field() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  const grid = useMemo(
    () => (window.matchMedia('(max-width: 768px)').matches ? { x: 110, z: 80 } : { x: 170, z: 120 }),
    [],
  )

  const { positions, seeds } = useMemo(() => {
    const count = grid.x * grid.z
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    let i = 0
    for (let ix = 0; ix < grid.x; ix++) {
      for (let iz = 0; iz < grid.z; iz++) {
        positions[i * 3] = (ix / (grid.x - 1) - 0.5) * WIDTH
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = (iz / (grid.z - 1) - 0.5) * DEPTH
        seeds[i] = Math.abs((Math.sin(i + 1) * 43758.5453) % 1)
        i++
      }
    }
    return { positions, seeds }
  }, [grid])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 15 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uScroll: { value: 0 },
      uRipple: { value: new THREE.Vector3(0, 0, -1) },
      uColorA: { value: new THREE.Color('#2e5a5e') },
      uColorB: { value: new THREE.Color('#d7ff3f') },
    }),
    [],
  )

  const { gl, camera } = useThree()

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Click ripple: cast the tap onto the terrain plane and restart the ring.
  useEffect(() => {
    const el = gl.domElement
    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.4) // terrain rest plane (group y = -0.4)
    const ndc = new THREE.Vector2()
    const hit = new THREE.Vector3()
    const onDown = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        uniforms.uRipple.value.set(hit.x, hit.z, 0)
      }
    }
    el.addEventListener('pointerdown', onDown)
    return () => el.removeEventListener('pointerdown', onDown)
  }, [gl, camera, uniforms])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (material.current) {
      const u = material.current.uniforms
      u.uTime.value += dt
      // Age the ripple; park it once fully decayed.
      const rip = u.uRipple.value as THREE.Vector3
      if (rip.z >= 0) {
        rip.z += dt
        if (rip.z > 5) rip.z = -1
      }
      // Ease toward scroll progress; lift the camera as the hero scrolls out.
      const target = Math.min(window.scrollY / window.innerHeight, 1)
      const s = u.uScroll.value + (target - u.uScroll.value) * 0.08
      u.uScroll.value = s
      state.camera.position.y = 2 + s * 1.7
      state.camera.position.z = 5.6 + s * 1.3
      state.camera.lookAt(0, 0.2 - s * 0.6, -2)
    }
    const g = group.current
    if (g) {
      g.rotation.y += (pointer.current.x * 0.06 - g.rotation.y) * 0.04
      g.rotation.x += (pointer.current.y * 0.03 - g.rotation.x) * 0.04
    }
  })

  return (
    <group ref={group} position={[0, -0.4, 0]}>
      <points key={`${grid.x}x${grid.z}`}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default function HeroScene({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 2, 5.6], fov: 58, near: 0.1, far: 40 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.2, -2)}
    >
      <Field />
    </Canvas>
  )
}
