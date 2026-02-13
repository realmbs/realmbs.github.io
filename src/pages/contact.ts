import resume from '../data/resume.json'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Contact</h1>
      <p class="page-header__subtitle">Get in touch.</p>
    </div>
    <div class="contact">
      <p class="contact__text">${resume.summary}</p>
      <div class="contact__links">
        <a href="mailto:${resume.email}" class="contact__link">${resume.email}</a>
        <a href="${resume.github}" target="_blank" rel="noopener" class="contact__link">GitHub</a>
        <a href="${resume.linkedin}" target="_blank" rel="noopener" class="contact__link">LinkedIn</a>
        <a href="/resume.pdf" target="_blank" rel="noopener" class="btn btn--filled">Download Resume</a>
      </div>
    </div>
  `
}
