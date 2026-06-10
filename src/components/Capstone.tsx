import { Suspense, lazy } from 'react'
import { useReveal } from '../hooks'
import SectionHead from './SectionHead'

const ArchitectureDiagram = lazy(() => import('./architecture/ArchitectureDiagram'))

const stats = [
  { value: '32,000+', label: 'indicators of compromise ingested and normalized' },
  { value: '$0.82', label: 'total monthly AWS cost in steady-state operation' },
  { value: '0', label: 'servers to patch, manage, or pay for while idle' },
]

const tags = ['AWS', 'Serverless', 'Python', 'Threat Intelligence']

export default function Capstone() {
  const titleRef = useReveal()
  const bodyRef = useReveal()
  const diagramRef = useReveal()
  const statsRef = useReveal()

  return (
    <section id="work" className="section">
      <div className="shell">
        <SectionHead index="02" title="Capstone" />
        <h3
          ref={titleRef}
          className="reveal max-w-4xl text-[clamp(2rem,5.2vw,3.9rem)] leading-[1.05] font-semibold tracking-[-0.02em]"
        >
          Serverless threat-intelligence platform
        </h3>
        <p ref={bodyRef} className="reveal mt-7 max-w-2xl leading-relaxed text-muted">
          An event-driven AWS pipeline that ingests open-source threat feeds and normalizes them
          into a queryable indicator store — engineered to run on pocket change instead of a server
          bill. Built as the capstone for a BAT in Cybersecurity at Collin College.
        </p>
        <div ref={diagramRef} className="reveal mt-14">
          <p className="t-label mb-4">System architecture — interactive</p>
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
        <div ref={statsRef} className="reveal mt-16 grid gap-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.value} className="border-t border-line pt-6">
              <p className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-semibold tracking-[-0.02em] text-acid">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-dim uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-14 flex flex-wrap gap-3" aria-label="Technologies">
          {tags.map((tag) => (
            <li
              key={tag}
              className="t-label rounded-full border border-line px-4 py-2 !text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
