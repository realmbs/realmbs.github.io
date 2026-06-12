declare global {
  interface Window {
    __introT0?: number
  }
}

export const INTRO_KEY = 'mb-intro-seen'

/** Curtain dwell time, measured from the boot curtain's first paint. */
export const INTRO_MS = 1100

/** Milliseconds since the boot curtain painted (0 if it never did). */
export const introElapsed = () =>
  typeof window !== 'undefined' && window.__introT0 != null
    ? performance.now() - window.__introT0
    : 0

// Decided once at module load, before any component effects can write the
// flag — Intro and Hero read the same value so their timing stays in sync.
// Phones skip the curtain entirely: straight to the hero (and a faster LCP).
const willPlay =
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(min-width: 768px)').matches &&
  !sessionStorage.getItem(INTRO_KEY)

export const introWillPlay = () => willPlay
