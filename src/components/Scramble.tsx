import { useEffect, useState } from 'react'
import { useInViewOnce, usePrefersReducedMotion } from '../hooks'

const GLYPHS = '#$%&*+=/<>0123456789'

/**
 * Mono-label decode effect: characters churn through glyphs and lock in
 * left to right the first time the element scrolls into view.
 */
export default function Scramble({ text, className }: { text: string; className?: string }) {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInViewOnce<HTMLSpanElement>(0.2)
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!inView || reduced) return
    const ticks = Math.max(12, Math.round(text.length * 1.6))
    let frame = 0
    const id = setInterval(() => {
      frame++
      const locked = Math.floor((frame / ticks) * text.length)
      setOut(
        text
          .split('')
          .map((c, i) =>
            i < locked || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(''),
      )
      if (locked >= text.length) clearInterval(id)
    }, 32)
    return () => clearInterval(id)
  }, [inView, reduced, text])

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  )
}
