export const INTRO_KEY = 'mb-intro-seen'

/** Time until the intro curtain starts lifting; Hero begins its cascade just before. */
export const INTRO_MS = 1400

// Decided once at module load, before any component effects can write the
// flag — Intro and Hero read the same value so their timing stays in sync.
const willPlay =
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !sessionStorage.getItem(INTRO_KEY)

export const introWillPlay = () => willPlay
