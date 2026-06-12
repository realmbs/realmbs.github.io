import { useEffect, useRef, useState } from 'react'

const INTERACTIVE = 'a, button, [role="button"]'

/**
 * Difference-blended cursor: a dot that tracks the pointer exactly and a ring
 * that trails it, swelling over interactive elements. Mounts only for fine
 * pointers without reduced motion; the native cursor is hidden via
 * `html.has-cursor` while active.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled] = useState(
    () =>
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-cursor')

    let x = -100
    let y = -100
    let ringX = -100
    let ringY = -100
    let scale = 1
    let targetScale = 1
    let shown = false
    let raf = 0

    const loop = () => {
      ringX += (x - ringX) * 0.16
      ringY += (y - ringY) * 0.16
      scale += (targetScale - scale) * 0.18
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!shown) {
        shown = true
        ringX = x
        ringY = y
        dot.classList.add('shown')
        ring.classList.add('shown')
      }
    }
    const onOver = (e: PointerEvent) => {
      targetScale = (e.target as Element).closest?.(INTERACTIVE) ? 1.8 : 1
    }
    const onDown = () => {
      targetScale = 0.75
    }
    const onUp = (e: PointerEvent) => {
      targetScale = (e.target as Element).closest?.(INTERACTIVE) ? 1.8 : 1
    }
    const onLeave = () => {
      dot.classList.remove('shown')
      ring.classList.remove('shown')
      shown = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  )
}
