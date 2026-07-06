import { useState, type FormEvent } from 'react'
import { useReveal } from '../hooks'
import SectionHead from './SectionHead'

const FORM_ENDPOINT = 'https://formspree.io/f/mkgrlgvr'

const socials = [
  { label: 'GitHub', href: 'https://github.com/realmbs' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/markblaha/' },
]

const inputCls =
  'w-full border-b border-line bg-transparent py-3 font-mono text-sm text-fg transition-colors placeholder:text-dim focus:border-acid focus:outline-none'

type Status = 'idle' | 'sending' | 'sent' | 'error'

function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="flex min-h-72 flex-col justify-center border border-line p-10">
        <p className="text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.015em]">
          Message sent<span className="text-acid">.</span>
        </p>
        <p className="mt-3 font-mono text-sm leading-relaxed text-muted">
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} aria-label="Contact form">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="t-label mb-2 block">
            Name
          </label>
          <input
            id="cf-name"
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="t-label mb-2 block">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-8">
        <label htmlFor="cf-message" className="t-label mb-2 block">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="What can I help with?"
          className={`${inputCls} resize-y`}
        />
      </div>
      {/* Formspree spam honeypot - invisible to humans. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="_subject" value="New message from markblaha.dev contact form" />
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="t-label bg-acid px-8 py-4 !text-ink transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send message →'}
        </button>
        <p role="status" aria-live="polite" className="font-mono text-xs text-muted">
          {status === 'error' &&
            'Something went wrong. Please try again, or email me directly.'}
        </p>
      </div>
    </form>
  )
}

export default function Contact() {
  const headRef = useReveal()
  const bodyRef = useReveal()

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
        <div ref={bodyRef} className="reveal mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <ContactForm />
          <div className="flex flex-col gap-8 border-line max-lg:border-t max-lg:pt-10 lg:border-l lg:pl-12">
            <div>
              <p className="t-label mb-3">Direct</p>
              <a
                href="mailto:markblaha96@icloud.com"
                className="font-mono text-[clamp(0.95rem,2vw,1.1rem)] text-muted underline decoration-line underline-offset-8 transition-colors hover:text-acid hover:decoration-acid"
              >
                markblaha96@icloud.com
              </a>
            </div>
            <div>
              <p className="t-label mb-3">Elsewhere</p>
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
        </div>
      </div>
      <footer className="mt-28 border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">© 2026 Mark Blaha</p>
          <a href="#top" className="t-label transition-colors hover:!text-acid">
            Back to top ↑
          </a>
        </div>
      </footer>
    </section>
  )
}
