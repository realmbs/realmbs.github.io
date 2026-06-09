import type { Theme } from '../hooks'
import { useScrolledPast } from '../hooks'

type Props = {
  theme: Theme
  onToggleTheme: () => void
}

export default function TopBar({ theme, onToggleTheme }: Props) {
  const scrolled = useScrolledPast(0.6)
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
      <a className="brand" href="#top">
        <span className="dot" aria-hidden="true" />
        MARK BLAHA
      </a>
      <nav aria-label="Primary">
        <span className="nav-anchors">
          <a href="#profile">Profile</a>
          <a href="#capstone">Capstone</a>
          <a href="#contact">Contact</a>
        </span>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${next} theme`}
        >
          <span className="glyph" aria-hidden="true" />
          <span className="tt-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
        <a className="resume" href="/resume.pdf" target="_blank" rel="noopener">
          Resume ↗
        </a>
      </nav>
    </header>
  )
}
