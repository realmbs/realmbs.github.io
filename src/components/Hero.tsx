import { lazy, Suspense, useRef } from 'react'
import type { Theme } from '../hooks'
import { useInView, usePrefersReducedMotion } from '../hooks'
import GlobeErrorBoundary from './hero/GlobeErrorBoundary'

// Lazy island — three + r3f are dynamically imported, so they're code-split
// out of the initial bundle and only fetched when the hero needs them.
const GlobeCanvas = lazy(() => import('./hero/GlobeCanvas'))

function HeroPoster() {
  return <div className="hero-poster" aria-hidden="true" />
}

export default function Hero({ theme }: { theme: Theme }) {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section className="hero" id="top" aria-label="Introduction" ref={sectionRef}>
      <div className="hero-canvas">
        {reducedMotion ? (
          <HeroPoster />
        ) : (
          <GlobeErrorBoundary fallback={<HeroPoster />}>
            <Suspense fallback={<HeroPoster />}>
              <GlobeCanvas theme={theme} active={inView} />
            </Suspense>
          </GlobeErrorBoundary>
        )}
      </div>
      <div className="vignette" aria-hidden="true" />

      <div className="hero-overlay">
        <p className="hero-kicker">
          <span className="rule" aria-hidden="true" />
          <span className="label">Cybersecurity × Business Development</span>
        </p>
        <h1 className="hero-name">
          <span className="ln">
            <span>Mark</span>
          </span>
          <span className="ln">
            <span>Blaha</span>
          </span>
        </h1>
        <p className="hero-tagline">
          I build <b>cloud-native security systems</b> — and the business case
          that gets them shipped, funded, and actually adopted.
        </p>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="bar" />
      </div>
    </section>
  )
}
