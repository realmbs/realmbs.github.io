import resume from '../data/resume.json'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Contact</h1>
      <p class="page-header__subtitle">Contact me</p>
    </div>
    <div class="contact">
      <p class="contact__text">${resume.summary}</p>
      <div class="contact__links">
        <a href="mailto:${resume.email}" class="contact__link">${resume.email}</a>
        <a href="${resume.github}" target="_blank" rel="noopener" class="contact__link">GitHub</a>
        <a href="${resume.linkedin}" target="_blank" rel="noopener" class="contact__link">LinkedIn</a>
        <a href="/resume.pdf" target="_blank" rel="noopener" class="btn btn--filled">Download Resume</a>
      </div>
      <form class="contact__form" action="https://formspree.io/f/mkgrlgvr" method="POST">
        <h2 class="contact__form-title">Send a Message</h2>
        <label class="contact__label" for="contact-name">Name</label>
        <input class="contact__input" type="text" id="contact-name" name="name" required />
        <label class="contact__label" for="contact-email">Email</label>
        <input class="contact__input" type="email" id="contact-email" name="email" required />
        <label class="contact__label" for="contact-message">Message</label>
        <textarea class="contact__input contact__input--textarea" id="contact-message" name="message" rows="5" required></textarea>
        <button class="btn btn--filled" type="submit">Send</button>
      </form>
    </div>
  `
}
