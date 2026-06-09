import { Canvas } from '@react-three/fiber'
import type { Theme } from '../../hooks'
import GlobeScene from './GlobeScene'

// Default export so it can be React.lazy()-imported — this is the module that
// pulls in three + @react-three/fiber, keeping them out of the main bundle.
export default function GlobeCanvas({
  theme,
  active,
}: {
  theme: Theme
  active: boolean
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 3.4], fov: 30 }}
      style={{ width: '100%', height: '100%' }}
    >
      <GlobeScene theme={theme} />
    </Canvas>
  )
}
