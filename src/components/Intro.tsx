import { useEffect, useState } from 'react'
import { INTRO_KEY, INTRO_MS, introWillPlay } from '../introState'
import Scramble from './Scramble'

/**
 * One-time ink curtain: a mono label decodes over an acid rule, then the
 * curtain lifts into the hero. Plays once per session; never under reduced
 * motion.
 */
export default function Intro() {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!introWillPlay()) return
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // private mode — intro simply plays again next load
    }
    const t = setTimeout(() => setLeaving(true), INTRO_MS)
    return () => clearTimeout(t)
  }, [])

  if (!introWillPlay() || gone) return null

  return (
    <div
      className={`intro${leaving ? ' intro-leave' : ''}`}
      aria-hidden
      onTransitionEnd={() => setGone(true)}
    >
      <div className="intro-inner">
        <Scramble text="MB — PORTFOLIO / 2026" className="t-label !text-fg" />
        <span className="intro-rule" />
      </div>
    </div>
  )
}
