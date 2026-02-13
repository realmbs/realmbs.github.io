import type { WriteupMeta } from '../types/index.ts'

export function renderWriteupCard(meta: WriteupMeta): string {
  const tags = meta.tags
    .map(tag => `<span class="card__tag">${tag}</span>`)
    .join('')

  const difficulty = meta.difficulty
    ? `<span class="card__difficulty">${meta.difficulty}</span>`
    : ''

  return `
    <a href="#/writeups/${meta.slug}" class="card card--clickable">
      <div class="card__header">
        <h3 class="card__title">${meta.title}</h3>
        ${difficulty}
      </div>
      <p class="card__description">${meta.description}</p>
      <div class="card__footer">
        <div class="card__tags">${tags}</div>
        <span class="card__date">${meta.date}</span>
      </div>
    </a>
  `
}
