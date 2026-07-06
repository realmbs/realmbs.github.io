import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Returns a callback ref. Attach it (plus the `reveal` class) to any element
 * and it gains `is-visible` the first time it scrolls into view.
 */
export function useReveal() {
  return useCallback((node: HTMLElement | null) => {
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
  }, [])
}

/** Ref + boolean that flips true (once) when the element first enters the viewport. */
export function useInViewOnce<T extends Element>(threshold = 0.4): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

/**
 * Continuous in-view flag for an existing ref — unlike `useInViewOnce`, it
 * flips back off when the element leaves the viewport.
 */
export function useInView(
  ref: RefObject<Element | null>,
  threshold = 0.05,
  initialInView = false,
): boolean {
  const [inView, setInView] = useState(initialInView)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}

/**
 * rAF-throttled passive window scroll listener. Calls `update` once on attach,
 * then at most once per frame on scroll (and resize when enabled). Reads the
 * latest callback through a ref, so `update` may close over fresh state.
 */
export function useRafScroll(
  update: () => void,
  { resize = false, enabled = true }: { resize?: boolean; enabled?: boolean } = {},
): void {
  const cb = useRef(update)
  useEffect(() => {
    cb.current = update
  })

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const run = () => {
      raf = 0
      cb.current()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    run()
    window.addEventListener('scroll', onScroll, { passive: true })
    if (resize) window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      if (resize) window.removeEventListener('resize', onScroll)
    }
  }, [resize, enabled])
}
