import { useReveal } from '../hooks'
import SectionHead from './SectionHead'

const socials = [
  { label: 'GitHub', href: 'https://github.com/realmbs' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mark-blaha-314982334/' },
]

export default function Contact() {
  const headRef = useReveal()
  const linksRef = useReveal()

  return (
    <section id="contact" className="section !pb-0">
      <div className="shell">
        <SectionHead index="03" title="Contact" />
        <h3
          ref={headRef}
          className="reveal text-[clamp(2.6rem,9vw,6.5rem)] leading-none font-semibold tracking-[-0.03em]"
        >
          Get in touch<span className="text-acid">.</span>
        </h3>
        <div ref={linksRef} className="reveal mt-12 flex flex-col gap-6 sm:flex-row sm:items-baseline sm:gap-12">
          <a
            href="mailto:markblaha96@icloud.com"
            className="font-mono text-[clamp(0.95rem,2.4vw,1.35rem)] text-muted underline decoration-line underline-offset-8 transition-colors hover:text-acid hover:decoration-acid"
          >
            markblaha96@icloud.com
          </a>
          <ul className="flex gap-8">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="t-label !text-muted transition-colors hover:!text-fg"
                >
                  {social.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="mt-28 border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">© 2026 Mark Blaha</p>
        </div>
      </footer>
    </section>
  )
}
