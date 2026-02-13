import { getWriteup } from '../markdown.ts'

export function render(container: HTMLElement, params: Record<string, string>): void {
  const writeup = getWriteup(params.slug)

  if (!writeup) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-header__title">Not Found</h1>
        <p class="page-header__subtitle">This writeup doesn't exist.</p>
      </div>
      <a href="#/writeups" class="btn">Back to Writeups</a>
    `
    return
  }

  const tags = writeup.tags
    .map(tag => `<span class="card__tag">${tag}</span>`)
    .join('')

  const difficulty = writeup.difficulty
    ? `<span class="writeup__difficulty">${writeup.difficulty}</span>`
    : ''

  container.innerHTML = `
    <article class="writeup">
      <a href="#/writeups" class="writeup__back">&larr; Back to Writeups</a>
      <header class="writeup__header">
        <h1 class="writeup__title">${writeup.title}</h1>
        <div class="writeup__meta">
          <span class="writeup__date">${writeup.date}</span>
          ${difficulty}
        </div>
        <div class="card__tags">${tags}</div>
      </header>
      <div class="prose">
        ${writeup.html}
      </div>
    </article>
  `
}
