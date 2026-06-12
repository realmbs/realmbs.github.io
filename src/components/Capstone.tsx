import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useInViewOnce, usePrefersReducedMotion, useReveal } from '../hooks'
import PipelineLog from './PipelineLog'
import SectionHead from './SectionHead'

const ArchitectureDiagram = lazy(() => import('./architecture/ArchitectureDiagram'))

const stats = [
  { value: '32,000+', label: 'indicators of compromise ingested and normalized' },
  { value: '$0.82', label: 'total monthly AWS cost in steady-state operation' },
  { value: '0', label: 'servers to patch, manage, or pay for while idle' },
]

const tags = ['AWS', 'Serverless', 'Python', 'Threat Intelligence']

/** Stat figure that counts up from zero the first time it scrolls into view. */
function StatValue({ value }: { value: string }) {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInViewOnce<HTMLParagraphElement>(0.6)

  const parsed = useMemo(() => {
    const m = value.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!m) return null
    const decimals = (m[2].split('.')[1] ?? '').length
    return { prefix: m[1], target: parseFloat(m[2].replace(/,/g, '')), suffix: m[3], decimals }
  }, [value])

  const format = (n: number) =>
    parsed
      ? parsed.prefix +
        n.toLocaleString('en-US', {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals,
        }) +
        parsed.suffix
      : value

  const [display, setDisplay] = useState(() => (reduced || !parsed ? value : format(0)))

  useEffect(() => {
    if (!inView || reduced || !parsed) return
    let start = 0
    let raf = 0
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / 1500, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(format(parsed.target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, parsed])

  return (
    <p
      ref={ref}
      className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-semibold tracking-[-0.02em] text-acid tabular-nums"
    >
      {display}
    </p>
  )
}

export default function Capstone() {
  const titleRef = useReveal()
  const bodyRef = useReveal()
  const diagramRef = useReveal()
  const logRef = useReveal()
  const statsRef = useReveal()
  const ctaRef = useReveal()

  return (
    <section id="work" className="section">
      <div className="shell">
        <SectionHead index="02" title="Capstone" />
        <h3
          ref={titleRef}
          className="reveal max-w-4xl text-[clamp(2rem,5.2vw,3.9rem)] leading-[1.05] font-semibold tracking-[-0.02em]"
        >
          Serverless Threat Intelligence Platform
        </h3>
        <p ref={bodyRef} className="reveal mt-7 max-w-2xl leading-relaxed text-muted">
          An event-driven AWS pipeline that ingests open source threat feeds and normalizes them
          into a queryable indicator store - engineered to run on pocket change instead of a server
          bill. Built as the capstone for a BAT in Cybersecurity at Collin College.
        </p>
        <div ref={diagramRef} className="reveal mt-14">
          <p className="t-label mb-4">System architecture</p>
          <Suspense
            fallback={
              // Mirrors the loaded figure: stage (zoom floor ≈ 384px tall) + controls row.
              <div>
                <div className="aspect-[1480/616] min-h-96 border border-line" />
                <div className="h-[53px]" />
              </div>
            }
          >
            <ArchitectureDiagram />
          </Suspense>
        </div>
        <div ref={logRef} className="reveal mt-12">
          <PipelineLog />
        </div>
        <div ref={statsRef} className="reveal mt-16 grid gap-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.value} className="border-t border-line pt-6">
              <StatValue value={stat.value} />
              <p className="mt-2 font-mono text-xs leading-relaxed text-dim uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <div ref={ctaRef} className="reveal mt-14">
          <a
            href="/capstone.pdf"
            download
            className="t-label group inline-flex items-center gap-3 border border-line px-6 py-4 !text-fg transition-colors hover:border-acid/40 hover:!text-acid"
          >
            Download the capstone paper
            <span className="text-acid transition-transform group-hover:translate-y-0.5" aria-hidden>
              ↓
            </span>
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap gap-3" aria-label="Technologies">
          {tags.map((tag) => (
            <li
              key={tag}
              className="t-label rounded-full border border-line px-4 py-2 !text-muted transition-colors duration-300 hover:border-acid/40 hover:!text-acid"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
