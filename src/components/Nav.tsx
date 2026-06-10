const links = [
  { href: '#about', label: 'About', desktopOnly: true },
  { href: '#work', label: 'Work', desktopOnly: true },
  { href: '#contact', label: 'Contact', desktopOnly: false },
]

export default function Nav() {
  return (
    // mix-blend-difference keeps the nav legible over the hero and content alike.
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <nav className="shell flex items-center justify-between py-5" aria-label="Primary">
        <a href="#top" className="t-label !text-white">
          Mark Blaha
        </a>
        <ul className="flex items-center gap-6 sm:gap-8">
          {links.map((link) => (
            <li key={link.href} className={link.desktopOnly ? 'hidden sm:block' : ''}>
              <a href={link.href} className="t-label !text-white/70 transition-colors hover:!text-white">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="t-label !text-acid transition-opacity hover:opacity-75"
            >
              Résumé ↗
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
