import Nav from './components/Nav'
import Hero from './components/Hero'
import Bio from './components/Bio'
import Capstone from './components/Capstone'
import Resume from './components/Resume'
import Contact from './components/Contact'

export default function App() {
  return (
    <>
      <a
        href="#about"
        className="t-label fixed top-3 left-3 z-[70] -translate-y-20 rounded bg-acid px-3 py-2 !text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Bio />
        <Capstone />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
