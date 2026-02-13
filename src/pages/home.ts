import { getWriteups } from '../markdown.ts'
import { renderWriteupCard } from '../components/writeup-card.ts'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  const writeups = getWriteups()
  const latest = writeups[0]

  const latestSection = latest
    ? `
    <section class="home-latest">
      <h2 class="home-latest__heading">Latest Writeup</h2>
      ${renderWriteupCard(latest)}
    </section>`
    : ''

  container.innerHTML = `
    <section class="hero">
      <p class="hero__greeting">$ whoami</p>
      <h1 class="hero__name">Mark Blaha</h1>
      <p class="hero__tagline">
        Cybersecurity Professional. Recent Graduate. Actively preparing for OSCP certification.
      </p>
      <div class="hero__cta">
        <a href="#/projects" class="btn btn--filled">View Projects</a>
        <a href="#/writeups" class="btn">Read Writeups</a>
      </div>
    </section>
    ${latestSection}
  `
}
