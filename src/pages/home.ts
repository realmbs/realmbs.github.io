export function render(container: HTMLElement, _params: Record<string, string>): void {
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
  `
}
