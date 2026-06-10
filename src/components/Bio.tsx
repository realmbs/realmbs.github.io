import { useReveal } from '../hooks'
import SectionHead from './SectionHead'

const facts = [
  {
    label: 'Focus',
    body: 'Offensive security, cloud-native architecture, and full-cycle business development.',
  },
  {
    label: 'Toolkit',
    body: 'AWS · Serverless · Python',
  },
  {
    label: 'Education',
    body: 'BAT in Cybersecurity, Collin College — NSA CAE-CD program. December 2025, 4.0 GPA.',
  },
]

export default function Bio() {
  const ledeRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead index="01" title="About" />
        <p
          ref={ledeRef}
          className="reveal max-w-3xl text-[clamp(1.65rem,3.6vw,2.7rem)] leading-[1.18] font-medium tracking-[-0.015em] text-balance"
        >
          A builder-operator at the seam of <span className="text-acid">cybersecurity</span> and
          business development — I make secure systems, and the case that ships them.
        </p>
        <div ref={gridRef} className="reveal mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <h3 className="t-label mb-3">{fact.label}</h3>
              <p className="text-sm leading-relaxed text-muted">{fact.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
