import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export type Theme = 'dark' | 'light'

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark'
}

/** Dark/light theme with a `data-theme` attribute + localStorage persistence.
 *  The initial value is read from the attribute set by the inline no-flash
 *  script in index.html, so this stays in sync on first paint. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('site.theme', theme)
    } catch {
      /* storage unavailable — ignore */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggle }
}

/** Reveal `.reveal` elements once they scroll into view. Honors
 *  prefers-reduced-motion by showing everything immediately. */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!els.length) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      els.forEach((el) => el.classList.add('in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Tracks the prefers-reduced-motion media query (reactive to changes). */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** True while `ref` intersects the viewport — used to pause the WebGL loop
 *  when the hero scrolls out of view. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.02) {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return inView
}

/** True once the user has scrolled past `fraction` of the viewport height. */
export function useScrolledPast(fraction = 0.6) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * fraction)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [fraction])
  return scrolled
}
