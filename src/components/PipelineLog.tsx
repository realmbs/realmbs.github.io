import { useEffect, useState } from 'react'
import { useInViewOnce, usePrefersReducedMotion } from '../hooks'

const LINES = [
  '$ pipeline run --feeds otx,abusech',
  '[collect]    otx ............... 412 indicators',
  '[collect]    abuse.ch .......... 187 indicators',
  '[normalize]  stix 2.1 .......... ok',
  '[dedup]      hash check ........ 38 duplicates skipped',
  '[archive]    s3 raw bucket ..... 2 objects stored',
  '[write]      dynamodb .......... 561 items · 200 OK',
  '[enrich]     shodan + whois .... geo, ports, org attached',
  '[done]       compute cost ...... fractions of a cent',
]

const FULL = LINES.join('\n')

/**
 * Typed terminal vignette — simulated (illustrative) collector output that
 * types itself the first time it scrolls into view.
 */
export default function PipelineLog() {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.35)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    const id = setInterval(() => {
      setCount((n) => {
        if (n >= FULL.length) {
          clearInterval(id)
          return n
        }
        return n + 3
      })
    }, 24)
    return () => clearInterval(id)
  }, [inView, reduced])

  const text = reduced ? FULL : FULL.slice(0, count)
  const done = reduced || count >= FULL.length

  return (
    <div ref={ref} className="border border-line">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="t-label">Pipeline log</p>
        <p className="t-label hidden sm:block">Illustrative output</p>
      </div>
      {/* Typing is decorative; screen readers get the full transcript once. */}
      <p className="sr-only">Simulated pipeline log: {FULL}</p>
      <pre
        aria-hidden
        className="min-h-[15.5rem] overflow-x-auto px-5 py-4 font-mono text-xs leading-[1.7] text-muted"
      >
        {text}
        <span
          className={`ml-0.5 inline-block h-3 w-[7px] translate-y-0.5 bg-acid ${done ? 'animate-pulse' : ''}`}
        />
      </pre>
    </div>
  )
}
