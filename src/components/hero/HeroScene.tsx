import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const WIDTH = 18
const DEPTH = 13

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
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
    pos.y += (h - 0.5) * 2.2 + swell * 0.25;

    vElev = h;
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
      uColorA: { value: new THREE.Color('#2e5a5e') },
      uColorB: { value: new THREE.Color('#d7ff3f') },
    }),
    [],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    if (material.current) {
      material.current.uniforms.uTime.value += Math.min(delta, 0.05)
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
