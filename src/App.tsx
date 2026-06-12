import Cursor from './components/Cursor'
import Intro from './components/Intro'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
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
      <Intro />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Bio />
        <Capstone />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
