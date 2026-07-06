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
import { useInView, usePrefersReducedMotion, useRafScroll } from '../hooks'
import { introWillPlay } from '../introState'
import Scramble from './Scramble'

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

function Letters({ word, base, step }: { word: string; base: number; step: number }) {
  return (
    <>
      {word.split('').map((c, i) => (
        <span key={i} className="hl-mask">
          <span className="hl" style={{ '--hl-delay': `${base + i * step}s` } as CSSProperties}>
            {c}
          </span>
        </span>
      ))}
    </>
  )
}

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Drive the canvas only while the hero is on screen.
  const active = useInView(sectionRef, 0.05, true)
  // Entrance animation. The hero renders fully composed when the intro
  // curtain plays (the wipe is the entrance) and on phones (which paint a
  // static hero shell from index.html for instant LCP - the React render
  // must match it). The letter cascade runs on wide curtain-less visits.
  const [entered, setEntered] = useState(
    () => introWillPlay() || !window.matchMedia('(min-width: 768px)').matches,
  )

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Parallax exit: content drifts down-screen and fades as the hero scrolls out.
  useRafScroll(
    () => {
      const content = contentRef.current
      const scene = sceneRef.current
      if (!content || !scene) return
      const y = window.scrollY
      const p = Math.min(y / window.innerHeight, 1)
      content.style.transform = `translate3d(0, ${y * 0.3}px, 0)`
      content.style.opacity = String(Math.max(1 - p * 1.3, 0))
      scene.style.opacity = String(Math.max(1 - p * 0.75, 0))
    },
    { enabled: !reducedMotion },
  )

  // Clear the parallax inline styles if reduced motion turns on mid-session.
  useEffect(() => {
    if (reducedMotion) return
    const content = contentRef.current
    const scene = sceneRef.current
    return () => {
      if (content) {
        content.style.transform = ''
        content.style.opacity = ''
      }
      if (scene) scene.style.opacity = ''
    }
  }, [reducedMotion])

  const enter = entered ? 'reveal is-visible' : 'reveal'
  const poster = <div className="hero-poster" aria-hidden />

  return (
    <section id="top" ref={sectionRef} className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <div ref={sceneRef} className="absolute inset-0 overflow-hidden" aria-hidden>
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

      {/* Copy below must stay byte-identical to the static hero ghost in
          index.html - update both together or phones see an LCP text swap. */}
      <div ref={contentRef} className="relative will-change-transform">
        <div className="shell pb-24 sm:pb-28">
          <p className={`t-label mb-5 !text-acid ${enter}`} style={delay('0.1s')}>
            <Scramble text="Cybersecurity × Business Development" />
          </p>
          <h1
            aria-label="Mark Blaha"
            className={`font-display text-[clamp(3.2rem,min(12vw,17svh),9.5rem)] leading-[0.92] font-semibold tracking-[-0.03em] uppercase ${entered ? 'is-entered' : ''}`}
          >
            <span className="block" aria-hidden>
              <Letters word="Mark" base={0.15} step={0.045} />
            </span>
            <span className="stroke-text block" aria-hidden>
              <Letters word="Blaha" base={0.3} step={0.045} />
            </span>
          </h1>
          <p
            className={`mt-7 max-w-md font-mono text-sm leading-relaxed text-muted ${enter}`}
            style={delay('0.5s')}
          >
            I build secure, serverless systems on AWS - and make the business case that ships them.
          </p>
        </div>

        <div className={`shell flex items-center justify-between pb-7 ${enter}`} style={delay('0.65s')}>
          <p className="t-label" aria-hidden>
            Scroll ↓
          </p>
          <p className="t-label hidden sm:block">BAT CYBERSECURITY · SUMMA CUM LAUDE · NSA CAE-CD</p>
        </div>
      </div>
    </section>
  )
}
