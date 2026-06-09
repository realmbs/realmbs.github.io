import type { FormEvent } from 'react'
import { useState } from 'react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkgrlgvr'

type StatusKind = 'idle' | 'sending' | 'ok' | 'err'

export default function Contact() {
  const [status, setStatus] = useState<{ kind: StatusKind; msg: string }>({
    kind: 'idle',
    msg: '',
  })
  const sending = status.kind === 'sending'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus({ kind: 'sending', msg: 'Sending…' })
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('bad response')
      form.reset()
      setStatus({ kind: 'ok', msg: "Message sent — thanks. I'll be in touch." })
    } catch {
      setStatus({
        kind: 'err',
        msg: 'Something went wrong — reach me on LinkedIn instead.',
      })
    }
  }

  const statusClass =
    status.kind === 'ok'
      ? 'form-status ok'
      : status.kind === 'err'
        ? 'form-status err'
        : 'form-status'

  return (
    <section className="section" id="contact" aria-labelledby="contact-h">
      <div className="section-head reveal">
        <span className="num" aria-hidden="true">
          04
        </span>
        <h2 id="contact-h">Contact</h2>
      </div>

      <div className="contact-cols">
        <form className="contact-form reveal" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="cf-name">Name</label>
            <input
              id="cf-name"
              type="text"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              type="email"
              name="email"
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cf-msg">Message</label>
            <textarea
              id="cf-msg"
              name="message"
              placeholder="A line or two…"
              required
            />
          </div>
          <button className="form-submit" type="submit" disabled={sending}>
            Send message{' '}
            <span aria-hidden="true">→</span>
          </button>
          <p className={statusClass} role="status" aria-live="polite">
            {status.msg}
          </p>
        </form>

        <div className="contact-links reveal">
          <a
            className="contact-item"
            href="https://www.linkedin.com/in/mark-blaha-314982334/"
            target="_blank"
            rel="noopener"
          >
            <span className="ci-k">LinkedIn</span>
            <span className="ci-v">in/mark-blaha</span>
            <span className="ci-x" aria-hidden="true">
              ↗
            </span>
          </a>
          <a
            className="contact-item"
            href="https://github.com/realmbs"
            target="_blank"
            rel="noopener"
          >
            <span className="ci-k">GitHub</span>
            <span className="ci-v">@realmbs</span>
            <span className="ci-x" aria-hidden="true">
              ↗
            </span>
          </a>
          <a
            className="contact-item"
            href="/resume.pdf"
            target="_blank"
            rel="noopener"
          >
            <span className="ci-k">Resume</span>
            <span className="ci-v">Download PDF</span>
            <span className="ci-x" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
