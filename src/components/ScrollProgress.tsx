import { useRef } from 'react'
import { useRafScroll } from '../hooks'

/** Acid hairline along the top edge tracking scroll position. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useRafScroll(
    () => {
      const el = ref.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    },
    { resize: true },
  )

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left scale-x-0 bg-acid"
      aria-hidden
    />
  )
}
