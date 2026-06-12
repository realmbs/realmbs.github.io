import { useEffect, useState } from 'react'

const links = [
  { href: '#about', label: 'About', desktopOnly: true },
  { href: '#work', label: 'Work', desktopOnly: true },
  { href: '#contact', label: 'Contact', desktopOnly: false },
]

const underline =
  'relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100'

export default function Nav() {
  // Slide away on scroll-down, return on scroll-up (focus-within overrides).
  const [hidden, setHidden] = useState(false)
  const [section, setSection] = useState('')

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      setHidden(y > 160 && y > lastY)
      lastY = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => !!el)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(`#${entry.target.id}`)
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    // Translucent ink bar + hairline: keeps the nav legible without
    // backdrop-filter (known GPU compositing bug on this machine).
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/75 transition-transform duration-300 focus-within:translate-y-0 ${
        hidden ? '-translate-y-full' : ''
      }`}
    >
      <nav className="shell flex items-center justify-between py-5" aria-label="Primary">
        <a href="#top" className="t-label !text-fg">
          Mark Blaha
        </a>
        <ul className="flex items-center gap-6 sm:gap-8">
          {links.map((link) => {
            const current = section === link.href
            return (
              <li key={link.href} className={link.desktopOnly ? 'hidden sm:block' : ''}>
                <a
                  href={link.href}
                  aria-current={current ? 'true' : undefined}
                  className={`t-label transition-colors ${underline} ${
                    current
                      ? '!text-acid after:scale-x-100'
                      : '!text-muted hover:!text-fg'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            )
          })}
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className={`t-label !text-acid ${underline}`}
            >
              Resume ↗
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
