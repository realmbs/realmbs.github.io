import TopBar from './components/TopBar'
import Hero from './components/Hero'
import Bio from './components/Bio'
import Capstone from './components/Capstone'
import Resume from './components/Resume'
import Contact from './components/Contact'
import { useScrollReveal, useTheme } from './hooks'

export default function App() {
  const { theme, toggle } = useTheme()
  useScrollReveal()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar theme={theme} onToggleTheme={toggle} />
      <Hero theme={theme} />
      <main className="wrap" id="main">
        <Bio />
        <Capstone />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
