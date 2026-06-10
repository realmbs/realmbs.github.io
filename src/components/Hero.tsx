import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../hooks'

const HeroScene = lazy(() => import('./hero/HeroScene'))

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const delay = (s: string) => ({ '--reveal-delay': s }) as CSSProperties

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  // Drive the canvas only while the hero is on screen.
  const [active, setActive] = useState(true)
  // Entrance animation: flip on after first paint so the transition runs.
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.05,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const enter = entered ? 'reveal is-visible' : 'reveal'
  const poster = <div className="hero-poster" aria-hidden />

  return (
    <section id="top" ref={sectionRef} className="relative flex min-h-svh flex-col justify-end">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {reducedMotion ? (
          poster
        ) : (
          <SceneErrorBoundary fallback={poster}>
            <Suspense fallback={poster}>
              <HeroScene active={active} />
            </Suspense>
          </SceneErrorBoundary>
        )}
        {/* Blend the scene into the page below. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="shell relative pb-24 sm:pb-28">
        <p className={`t-label mb-5 !text-acid ${enter}`} style={delay('0.1s')}>
          Cybersecurity × Business Development
        </p>
        <h1 className="font-display text-[clamp(3.2rem,min(12vw,17svh),9.5rem)] leading-[0.92] font-semibold tracking-[-0.03em] uppercase">
          <span className={`block ${enter}`} style={delay('0.2s')}>
            Mark
          </span>
          <span className={`stroke-text block ${enter}`} style={delay('0.32s')}>
            Blaha
          </span>
        </h1>
        <p
          className={`mt-7 max-w-md font-mono text-sm leading-relaxed text-muted ${enter}`}
          style={delay('0.45s')}
        >
          I build secure, serverless systems on AWS — and the business case that ships them.
        </p>
      </div>

      <div className={`shell relative flex items-center justify-between pb-7 ${enter}`} style={delay('0.6s')}>
        <p className="t-label" aria-hidden>
          Scroll ↓
        </p>
        <p className="t-label hidden sm:block">BAT Cybersecurity — NSA CAE-CD</p>
      </div>
    </section>
  )
}
