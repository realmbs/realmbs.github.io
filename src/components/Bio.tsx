import { useRef } from 'react'
import { usePrefersReducedMotion, useRafScroll, useReveal } from '../hooks'
import SectionHead from './SectionHead'

const LEDE: { w: string; acid?: boolean }[] = [
  ...'A builder-operator at the seam of'.split(' ').map((w) => ({ w })),
  { w: 'cybersecurity', acid: true },
  ...'and business development - I make secure systems, and the case that ships them.'
    .split(' ')
    .map((w) => ({ w })),
]

const facts = [
  {
    label: 'Focus',
    body: 'Offensive security, cloud-native architecture, and the automation that runs full cycle business development.',
  },
  {
    label: 'Toolkit',
    body: 'AWS · Serverless · Terraform · Python · STIX 2.1 · Zoho CRM & Microsoft 365 automation'
  },
  {
    label: 'Education',
    body: 'BAT in Cybersecurity, Collin College - NSA CAE-CD program. December 2025 · 4.0 GPA, summa cum laude.'
  },
]

/** Lede that lights up word by word as it scrolls through the viewport. */
function Lede() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = usePrefersReducedMotion()

  useRafScroll(
    () => {
      const el = ref.current
      if (!el) return
      const words = el.querySelectorAll<HTMLElement>('.word')
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(Math.max((vh * 0.88 - rect.top) / (vh * 0.5), 0), 1)
      const lit = Math.round(p * words.length)
      words.forEach((w, i) => w.classList.toggle('on', i < lit))
    },
    { resize: true, enabled: !reduced },
  )

  return (
    <p
      ref={ref}
      className="max-w-3xl text-[clamp(1.65rem,3.6vw,2.7rem)] leading-[1.18] font-medium tracking-[-0.015em] text-balance"
    >
      {LEDE.map((part, i) => (
        <span key={i} className={part.acid ? 'word text-acid' : 'word'}>
          {part.w}
          {i < LEDE.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}

export default function Bio() {
  const gridRef = useReveal()

  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead index="01" title="About" />
        <Lede />
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
