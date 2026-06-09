import { useEffect, useState } from 'react'

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
